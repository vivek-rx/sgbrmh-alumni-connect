import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

export default function Login() {
  console.log('🔑 Login: Component rendering...');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      console.log('🔐 Starting login process...');
      console.log('📧 Email:', formData.email);

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      console.log('🔑 Login Response:', { 
        user: authData?.user ? { 
          id: authData.user.id, 
          email: authData.user.email, 
          email_confirmed_at: authData.user.email_confirmed_at,
          role: authData.user.role 
        } : null, 
        session: !!authData?.session,
        error: authError 
      });

      if (authError) {
        console.error('❌ Login Error:', authError);
        
        if (authError.message === 'Email not confirmed') {
          toast.error('Please check your email and click the confirmation link before logging in.');
          return;
        }
        
        if (authError.message === 'Invalid login credentials') {
          toast.error('Invalid email or password. Please try again.');
          return;
        }
        
        if (authError.message.includes('email not confirmed')) {
          toast.error('Please verify your email before logging in. Check your inbox for the confirmation link.');
          return;
        }
        
        throw authError;
      }

      if (!authData.user) {
        console.error('❌ No user data returned');
        toast.error('Login failed: No user data received');
        return;
      }

      console.log('✅ User logged in:', authData.user.id);
      console.log('📧 Email confirmed:', authData.user.email_confirmed_at);

      // Check if email is confirmed
      if (!authData.user.email_confirmed_at) {
        console.error('❌ Email not confirmed');
        toast.error('Please verify your email before logging in. Check your inbox for the confirmation link.');
        return;
      }
      
      // Check if user profile exists in alumni table
      console.log('🔍 Looking up user profile...');
      const { data: profile, error: profileError } = await supabase
        .from('alumni')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      console.log('👤 Profile lookup result:', { profile, profileError });

      if (profileError) {
        console.error('❌ Profile Error:', profileError);
        
        if (profileError.code === 'PGRST116') {
          // Profile doesn't exist - redirect to profile creation
          console.log('ℹ️ Profile not found - redirecting to profile creation');
          toast.success('Welcome! Please complete your profile to continue.', {
            duration: 4000,
            icon: '👋'
          });
          navigate('/profile', { replace: true });
          return;
        } else {
          toast.error(`Profile lookup failed: ${profileError.message}`);
          return;
        }
      }

      if (!profile) {
        console.error('❌ No profile data returned');
        // Redirect to profile creation if profile doesn't exist
        console.log('ℹ️ No profile data - redirecting to profile creation');
        toast.success('Welcome! Please complete your profile to continue.', {
          duration: 4000,
          icon: '👋'
        });
        navigate('/profile', { replace: true });
        return;
      }

      console.log('🎉 Login successful!');
      console.log('👤 User profile:', { name: profile.name, role: profile.role, verified: profile.verified });
      
      toast.success(`Welcome back, ${profile.name}!`);
      
      // Add a small delay to ensure auth context is updated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect based on user role or profile completion  
      console.log('🔄 Redirecting user...');
      console.log('👤 Profile role:', profile.role);
      console.log('✅ Profile completed:', profile.profile_completed);
      
      // Try React Router navigation first, with fallback to window.location
      try {
        if (profile.role === 'admin') {
          console.log('➡️ Redirecting to admin dashboard');
          navigate('/admin/dashboard', { replace: true });
        } else if (!profile.profile_completed) {
          console.log('➡️ Redirecting to profile completion');
          navigate('/profile/complete', { replace: true });
        } else {
          console.log('➡️ Redirecting to home page');
          navigate('/', { replace: true });
        }
        
        console.log('✅ React Router redirect initiated');
        
        // Fallback: if navigation doesn't work after 2 seconds, force reload
        setTimeout(() => {
          console.log('⚠️ Fallback: Using window.location redirect');
          if (profile.role === 'admin') {
            window.location.href = '/admin/dashboard';
          } else if (!profile.profile_completed) {
            window.location.href = '/profile/complete';  
          } else {
            window.location.href = '/';
          }
        }, 2000);
        
      } catch (navError) {
        console.error('❌ Navigation error:', navError);
        // Force redirect if React Router fails
        if (profile.role === 'admin') {
          window.location.href = '/admin/dashboard';
        } else if (!profile.profile_completed) {
          window.location.href = '/profile/complete';
        } else {
          window.location.href = '/';
        }
      }
    } catch (error: any) {
      console.error('💥 Login error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        status: error.status
      });
      
      let errorMessage = 'Failed to log in. ';
      
      if (error.message?.includes('fetch')) {
        errorMessage += 'Network connection issue. Please check your internet connection.';
      } else if (error.message?.includes('timeout')) {
        errorMessage += 'Request timed out. Please try again.';
      } else if (error.message?.includes('permission denied')) {
        errorMessage += 'Database permission error. Please contact support.';
      } else {
        errorMessage += error.message || 'Please try again.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!formData.email.trim()) {
      toast.error('Please enter your email address first');
      return;
    }

    setResendingEmail(true);

    try {
      console.log('📧 Resending confirmation email to:', formData.email);
      console.log('🔗 Redirect URL:', `${window.location.origin}/auth/callback`);
      
      // First try the standard resend method
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      console.log('📤 Resend response:', { data, error });

      if (error) {
        console.error('❌ Resend error:', error);
        
        // Handle specific error cases
        if (error.message?.includes('rate limit') || error.message?.includes('too many requests')) {
          toast.error('Please wait a few minutes before requesting another email');
          return;
        }
        
        if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
          toast.error('Email address not found. Please register first.');
          return;
        }
        
        if (error.message?.includes('already confirmed') || error.message?.includes('email_confirmed_at')) {
          toast.error('This email is already confirmed. Try logging in directly.');
          return;
        }

        // If resend fails, try alternative approach - trigger a password reset instead
        console.log('🔄 Trying alternative method - password reset flow');
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/auth/callback`,
        });
        
        if (resetError) {
          console.error('❌ Alternative method also failed:', resetError);
          throw error; // Throw original error
        } else {
          console.log('✅ Alternative confirmation sent via password reset');
          toast.success('Verification email sent via alternative method! Please check your inbox.');
          return;
        }
      }
      
      console.log('✅ Confirmation email resent successfully');
      toast.success('Confirmation email sent! Please check your inbox and spam folder.');
    } catch (error: any) {
      console.error('💥 Resend email error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        status: error.status
      });
      
      // Provide helpful error messages based on common issues
      let errorMessage = 'Failed to resend confirmation email. ';
      
      if (error.message?.includes('fetch')) {
        errorMessage += 'Network connection issue. Please check your internet connection.';
      } else if (error.message?.includes('timeout')) {
        errorMessage += 'Request timed out. Please try again.';
      } else if (error.status === 429) {
        errorMessage += 'Too many requests. Please wait a few minutes.';
      } else if (error.status === 400) {
        errorMessage += 'Invalid request. Please check your email address.';
      } else {
        errorMessage += error.message || 'Please try again or contact support.';
      }
      
      toast.error(errorMessage);
    } finally {
      setResendingEmail(false);
    }
  };

  const handleSignInWithGoogle = async () => {
    try {
      setLoading(true);
      // Trigger Supabase OAuth flow for Google
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Google sign-in error:', error);
        toast.error('Failed to start Google sign-in: ' + error.message);
      }

      // Note: on success Supabase will redirect the browser to Google's consent screen
    } catch (error: any) {
      console.error('Unexpected Google sign-in error:', error);
      toast.error('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      
      <motion.div 
        className="max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600">
            Sign in to your alumni account
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Don't have an account?{' '}
            <Link
              to="/auth/register"
              className="font-medium text-orange-600 hover:text-orange-500"
            >
              Create one here
            </Link>
          </p>
        </div>

        {/* Form */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                to="/auth/forgot-password"
                className="text-sm text-orange-600 hover:text-orange-500 font-medium"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <div>
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </motion.button>
            </div>

              {/* Social / OAuth */}
              <div className="my-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <div className="text-sm text-gray-500">or</div>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <button
                  type="button"
                  onClick={handleSignInWithGoogle}
                  disabled={loading}
                  className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  {/* Simple Google glyph */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.35 11.1h-9.18v2.92h5.28c-.23 1.26-1.33 3.7-5.28 3.7-3.17 0-5.76-2.62-5.76-5.84s2.59-5.84 5.76-5.84c1.81 0 3.02.77 3.71 1.44l2.53-2.44C17.05 3.18 14.73 2 11.99 2 6.9 2 2.98 5.93 2.98 11s3.92 9 9.01 9c5.19 0 8.6-3.64 8.6-8.77 0-.6-.06-1.06-.24-1.13z" fill="#4285F4"/>
                  </svg>
                  <span className="font-medium">Continue with Google</span>
                </button>
              </div>

            {/* Email Verification Help */}
            <div className="border-t border-gray-200 pt-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800 mb-1">
                      Email Verification Required
                    </h3>
                    <p className="text-sm text-blue-700 mb-2">
                      New accounts must verify their email address before logging in.
                    </p>
                    <button
                      type="button"
                      onClick={handleResendConfirmation}
                      disabled={resendingEmail}
                      className="text-sm text-blue-600 hover:text-blue-500 font-medium underline disabled:opacity-50"
                    >
                      {resendingEmail ? (
                        <>
                          <Loader2 className="animate-spin inline w-3 h-3 mr-1" />
                          Resending...
                        </>
                      ) : (
                        'Resend confirmation email'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}