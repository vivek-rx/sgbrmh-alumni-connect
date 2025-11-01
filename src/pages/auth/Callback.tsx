import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('📧 Auth callback triggered');
        console.log('🌐 Full URL:', window.location.href);
        console.log('❓ Search params:', window.location.search);
        console.log('# Hash params:', window.location.hash);

        // Handle both URL search params and hash params
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));

        // Try to get tokens from either source
        const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token');
        const type = urlParams.get('type') || hashParams.get('type');
        const tokenHash = urlParams.get('token_hash') || hashParams.get('token_hash');

        // FIRST: try to detect an active session (this covers OAuth redirects where
        // Supabase has already set the session). If a user object exists, proceed
        // to update verification/redirect logic immediately. This avoids falling
        // through to the token parsing branches which can be brittle across flows.
        try {
          const { data: sessionData } = await supabase.auth.getUser();
          const sessionUser = sessionData?.user;
          if (sessionUser) {
            console.log('🔁 Detected active supabase user session in callback:', { id: sessionUser.id, email: sessionUser.email, email_confirmed_at: sessionUser.email_confirmed_at });
            // If email is confirmed or provider-based login, continue with profile update
            await updateUserVerificationStatus(sessionUser.id);
            return;
          }
        } catch (sessionErr) {
          console.warn('⚠️ Could not get current session in callback (will try token handling):', sessionErr);
        }

        // If no session is available via getUser, but the URL contains an access
        // token (common in OAuth redirects), try to set the session using the
        // returned tokens. This catches flows where refresh token may be absent.
        if (accessToken) {
          try {
            console.log('🔁 Attempting to set session from URL access token');
            // Use `any` to call setSession when refresh token may be absent
            const { data: sessionData, error: setErr } = await (supabase.auth as any).setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (setErr) {
              console.warn('⚠️ setSession returned error:', setErr);
            } else if (sessionData?.user) {
              console.log('✅ Session set from URL tokens, user:', sessionData.user.id);
              await updateUserVerificationStatus(sessionData.user.id);
              return;
            }
          } catch (sErr) {
            console.warn('⚠️ Error while calling setSession from URL tokens:', sErr);
          }
        }
        
        console.log('🔑 Extracted tokens:', { 
          accessToken: accessToken ? accessToken.substring(0, 20) + '...' : null, 
          refreshToken: !!refreshToken,
          tokenHash: !!tokenHash,
          type: type 
        });

        // Check if this is an email confirmation
        if (type === 'signup' || type === 'email' || accessToken || refreshToken || tokenHash) {
          console.log('✅ Processing verification - type:', type);
          
          // For modern Supabase email verification with token_hash
          if (tokenHash && type === 'email') {
            console.log('🔄 Using OTP verification method');
            const { data, error } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: 'email',
            });
            
            console.log('✅ OTP verification result:', { data, error });
            
            if (error) {
              console.error('❌ OTP verification error:', error);
              throw error;
            }
            
            if (data.user) {
              console.log('👤 User verified via OTP:', data.user.id);
              await updateUserVerificationStatus(data.user.id);
            }
          }
          // For legacy token-based verification (including signup type)
          else if (accessToken && refreshToken) {
            console.log('🔄 Using setSession method');
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            console.log('✅ Session set result:', { 
              user: data?.user ? { id: data.user.id, email: data.user.email, verified: data.user.email_confirmed_at } : null, 
              error 
            });
            
            if (error) {
              console.error('❌ Session error:', error);
              throw error;
            }
            
            if (data.user) {
              console.log('👤 User verified via session:', data.user.id);
              console.log('📧 Email confirmed at:', data.user.email_confirmed_at);
              await updateUserVerificationStatus(data.user.id);
            } else {
              console.error('❌ No user in session data');
              throw new Error('No user returned from session');
            }
          }
          // Check current session
          else {
            const { data: { user } } = await supabase.auth.getUser();
            console.log('👤 Current user check:', user);
            
            if (user && user.email_confirmed_at) {
              console.log('✅ User already verified');
              await updateUserVerificationStatus(user.id);
            } else {
              throw new Error('No verification tokens found and user not verified');
            }
          }
        } else {
          throw new Error('Invalid verification request');
        }
      } catch (error: any) {
        console.error('💥 Email verification error:', error);
        setStatus('error');
        setMessage('Email verification failed. Please try again or contact support.');
        toast.error('Email verification failed: ' + (error.message || 'Unknown error'));

        // Redirect to login after error
        setTimeout(() => {
          navigate('/auth/login');
        }, 4000);
      }
    };

    const updateUserVerificationStatus = async (userId: string) => {
      try {
        console.log('🔄 Updating verification status for user:', userId);
        
        // First check if user exists in alumni table
        const { data: existingUser, error: selectError } = await supabase
          .from('alumni')
          .select('id, email, verified')
          .eq('id', userId)
          .single();
        
        console.log('👤 Existing user data:', { existingUser, selectError });
        
        if (selectError && selectError.code !== 'PGRST116') {
          console.error('❌ Error checking user:', selectError);
          throw selectError;
        }

        // If the user doesn't exist in alumni (no data returned), create a minimal profile
        if (!existingUser) {
          console.warn('⚠️ User not found in alumni table, creating minimal profile');

          try {
            const { data: { user } } = await supabase.auth.getUser();
            const email = user?.email ?? null;
            const name = (user as any)?.user_metadata?.full_name || (user as any)?.user_metadata?.name || '';

            const { data: inserted, error: insertError } = await supabase
              .from('alumni')
              .insert([{ id: userId, email, name, verified: true, role: 'user', profile_completed: false, created_at: new Date().toISOString() }])
              .select();

            if (insertError) {
              console.error('❌ Failed to create minimal alumni profile:', insertError);
              throw insertError;
            }

            console.log('✅ Minimal alumni profile created:', inserted);
            setStatus('success');
            setMessage('Email verified! Redirecting to profile completion...');
            toast.success('Email verified! Please complete your profile.');

            setTimeout(() => navigate('/profile/complete'), 1200);
            return;
          } catch (createErr) {
            console.error('❌ Error creating alumni profile:', createErr);
            throw createErr;
          }
        }

        // Update user verification status in alumni table
        const { data: updateData, error: updateError } = await supabase
          .from('alumni')
          .update({ 
            verified: true, 
            last_active: new Date().toISOString() 
          })
          .eq('id', userId)
          .select();

        console.log('💾 Database update result:', { updateData, updateError });

        if (updateError) {
          console.error('❌ Database update error:', updateError);
          console.log('⚠️ Verification succeeded but database update failed');

          // Still show success since email verification worked
          setStatus('success');
          setMessage('Email verified! You can now continue.');
          toast.success('Email verified! You can now continue.');
        } else {
          console.log('✅ User verification status updated in database');
          setStatus('success');
          setMessage('Email verified successfully! Redirecting...');
          toast.success('Email verified! Redirecting...');
        }

        // Decide redirect based on profile completion
        try {
          const { data: alumniProfile } = await supabase
            .from('alumni')
            .select('id, profile_completed')
            .eq('id', userId)
            .single();

          if (alumniProfile) {
            const redirectTo = alumniProfile.profile_completed ? '/profile' : '/profile/complete';
            setTimeout(() => navigate(redirectTo), 1200);
            return;
          }
        } catch (err) {
          console.warn('Could not fetch alumni profile to decide redirect:', err);
        }

        // Fallback: redirect to login if no profile routing decision could be made
        setTimeout(() => {
          navigate('/auth/login');
        }, 2000);
      } catch (error: any) {
        console.error('❌ Update verification status error:', error);
        
        // Check if it's a database connection issue
        if (error.message?.includes('permission denied') || error.message?.includes('RLS')) {
          setStatus('error');
          setMessage('Database permission error. Please run the RLS policy fixes.');
          toast.error('Database permission error - check RLS policies');
        } else {
          // Still show success since email verification worked
          setStatus('success');
          setMessage('Email verified! You can now log in.');
          toast.success('Email verified!');
        }
        
        setTimeout(() => {
          navigate('/auth/login');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="max-w-md mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            {status === 'loading' && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mx-auto"
              >
                <Loader2 className="h-16 w-16 text-orange-500 mx-auto" />
              </motion.div>
            )}
            
            {status === 'success' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              </motion.div>
            )}
            
            {status === 'error' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <XCircle className="h-16 w-16 text-red-500 mx-auto" />
              </motion.div>
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {status === 'loading' && 'Verifying Email'}
            {status === 'success' && 'Verification Successful'}
            {status === 'error' && 'Verification Failed'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          
          {status === 'loading' && (
            <p className="text-sm text-gray-500">
              Please wait while we verify your email address...
            </p>
          )}
          
          {status === 'success' && (
            <p className="text-sm text-green-600">
              {message || 'Redirecting...'}
            </p>
          )}
          
          {status === 'error' && (
            <div className="space-y-4">
              <p className="text-sm text-red-600">
                Please try registering again or contact support if the issue persists.
              </p>
              <button
                onClick={() => navigate('/auth/register')}
                className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                Back to Registration
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}