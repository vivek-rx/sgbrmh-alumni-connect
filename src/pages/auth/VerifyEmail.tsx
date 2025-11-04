import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function VerifyEmail() {
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  const handleResend = async () => {
    try {
      setSending(true);
      const email = window.prompt('Enter the email you used to register');
      if (!email) return;

      // Trigger a signup call with the same email to re-send confirmation email.
      // Supabase will respond gracefully if the user already exists.
      const { data, error } = await supabase.auth.signUp({ email, password: Math.random().toString(36).slice(-8) }, { emailRedirectTo: `${window.location.origin}/auth/callback` } as any);

      if (error) {
        console.error('Resend error:', error);
        toast.error('Failed to resend verification email.');
      } else {
        console.log('Resend result:', data);
        toast.success('Verification email resent. Check your inbox.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to resend verification email.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div className="max-w-md mx-auto text-center bg-white rounded-2xl shadow-xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-4">
          <Mail className="mx-auto h-14 w-14 text-orange-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Verify Your Email</h2>
        <p className="text-gray-600 mb-6">We've sent a verification link to your email address. Click the link in the email to verify your address.</p>

        <div className="space-y-3">
          <button onClick={() => navigate('/auth/login')} className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg">
            Back to Login
          </button>

          <button onClick={handleResend} disabled={sending} className="w-full py-2 px-4 bg-white border border-gray-200 rounded-lg flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Resend Verification Email
          </button>
        </div>
      </motion.div>
    </div>
  );
}
