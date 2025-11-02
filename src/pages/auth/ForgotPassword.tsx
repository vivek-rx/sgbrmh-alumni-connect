import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      console.log('🔐 Sending password reset email to:', email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        console.error('❌ Reset password error:', error);
        throw error;
      }

      console.log('✅ Password reset email sent successfully');
      setEmailSent(true);
      toast.success('Password reset link sent! Check your email.');
    } catch (error: any) {
      console.error('💥 Forgot password error:', error);
      
      let errorMessage = 'Failed to send reset email. ';
      
      if (error.message?.includes('rate limit') || error.message?.includes('too many')) {
        errorMessage = 'Too many requests. Please wait a few minutes and try again.';
      } else if (error.message?.includes('not found')) {
        errorMessage = 'Email address not found. Please check and try again.';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else {
        errorMessage += error.message || 'Please try again.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
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
        {/* Back to Login Link */}
        <Link
          to="/auth/login"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Memory slip? <br />
            Let's Fix that.
          </h2>
          <p className="text-gray-600">
            {emailSent 
              ? "Check your email for the reset link"
              : "Enter your email and we'll send you a reset link"
            }
          </p>
        </div>

        {/* Form */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {emailSent ? (
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mb-6"
              >
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              </motion.div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Email Sent Successfully!
              </h3>
              
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to <span className="font-semibold">{email}</span>
              </p>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>What's next?</strong>
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1 text-left list-disc list-inside">
                  <li>Check your email inbox (and spam folder)</li>
                  <li>Click the reset link in the email</li>
                  <li>Enter your new password</li>
                </ul>
              </div>
              
              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
                className="text-orange-600 hover:text-orange-500 font-medium text-sm"
              >
                Didn't receive the email? Try again
              </button>
              
              <div className="mt-6">
                <Link
                  to="/auth/login"
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          ) : (
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
                    autoFocus
                    className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
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
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </motion.button>
              </div>

              {/* Help Text */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <strong>Note:</strong> The reset link will be valid for 1 hour. 
                  If you don't receive the email within a few minutes, check your spam folder.
                </p>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
