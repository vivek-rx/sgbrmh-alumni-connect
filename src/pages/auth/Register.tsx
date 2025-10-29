import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Mail, Phone, Calendar, MapPin, Loader2, Check, X, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

// Password Requirement Component
function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {met ? (
        <Check className="h-3 w-3 text-green-600 flex-shrink-0" />
      ) : (
        <X className="h-3 w-3 text-gray-400 flex-shrink-0" />
      )}
      <span className={met ? 'text-green-600' : 'text-gray-500'}>{text}</span>
    </div>
  );
}

export default function Register() {
  console.log('📝 Register: Component rendering...');
  
  const [formData, setFormData] = useState({
    // COMPULSORY FIELDS
    name: '',
    email: '',
    batch_year: '',
    password: '',
    confirmPassword: '',
    
    // OPTIONAL FIELDS
    phone: '',
    gender: '',
    birth_day: '',
    birth_month: '',
    birth_year: '',
    current_city: '',
    current_country: '',
    bio: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ 
    score: 0, 
    feedback: '', 
    label: 'Very Weak', 
    color: 'bg-red-500' 
  });
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);
  const navigate = useNavigate();

  // Password validation function
  const validatePassword = (password: string) => {
    let score = 0;
    let feedback = [];

    if (password.length >= 8) score++;
    else feedback.push('at least 8 characters');

    if (/[a-z]/.test(password)) score++;
    else feedback.push('a lowercase letter');

    if (/[A-Z]/.test(password)) score++;
    else feedback.push('an uppercase letter');

    if (/\d/.test(password)) score++;
    else feedback.push('a number');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    else feedback.push('a special character');

    const strength = {
      0: { label: 'Very Weak', color: 'bg-red-500' },
      1: { label: 'Weak', color: 'bg-orange-500' },
      2: { label: 'Fair', color: 'bg-yellow-500' },
      3: { label: 'Good', color: 'bg-blue-500' },
      4: { label: 'Strong', color: 'bg-green-500' },
      5: { label: 'Very Strong', color: 'bg-green-600' },
    };

    return {
      score,
      feedback: feedback.length > 0 ? `Add ${feedback.join(', ')}` : 'Password is strong!',
      label: strength[score as keyof typeof strength].label,
      color: strength[score as keyof typeof strength].color,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Strong password validation
    const pwdValidation = validatePassword(formData.password);
    if (pwdValidation.score < 4) {
      toast.error(`Password is too weak! ${pwdValidation.feedback}`);
      return;
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.batch_year) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      console.log('🚀 Starting registration process...');
      console.log('📧 Email:', formData.email);
      console.log('👤 Name:', formData.name.trim());
      console.log('📅 Batch Year:', parseInt(formData.batch_year));

      // Construct date_of_birth from separate fields
      let date_of_birth = null;
      if (formData.birth_day && formData.birth_month && formData.birth_year) {
        date_of_birth = `${formData.birth_year}-${formData.birth_month.padStart(2, '0')}-${formData.birth_day.padStart(2, '0')}`;
      }
      
      // Sign up with Supabase Auth (with email confirmation)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      console.log('🔐 Auth Response:', { authData, authError });

      if (authError) {
        console.error('❌ Auth Error:', authError);
        throw authError;
      }

      if (authData.user) {
        console.log('✅ User created:', authData.user.id);
        
        // Create profile in alumni table
        const profileData = {
          id: authData.user.id,
          email: formData.email,
          name: formData.name.trim(),
          batch_year: parseInt(formData.batch_year),
          phone: formData.phone.trim() || null,
          gender: (formData.gender as any) || null,
          date_of_birth: date_of_birth,
          current_city: formData.current_city.trim() || null,
          current_country: formData.current_country.trim() || null,
          bio: formData.bio.trim() || null,
          role: 'alumni' as const,
          verified: false, // ⚠️ MUST be false - only admin can verify
          profile_completed: false,
        };

        console.log('📝 Profile Data to Insert:', profileData);
        console.log('🔍 VERIFIED FIELD CHECK:', profileData.verified, '(should be false)');

        const { data: insertedData, error: profileError } = await supabase
          .from('alumni')
          .insert(profileData)
          .select();

        console.log('💾 Database Insert Response:', { insertedData, profileError });

        if (profileError) {
          console.error('❌ Profile Creation Error:', profileError);
          throw profileError;
        }

        console.log('🎉 Registration successful! User ID:', authData.user.id);
        toast.success('Account created successfully! Please check your email to verify your account before logging in.');
        navigate('/auth/login');
      } else {
        console.log('⚠️ No user returned from auth signup');
        toast.error('Registration failed: No user created');
      }
    } catch (error: any) {
      console.error('💥 Registration error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Update password strength on password change
    if (name === 'password') {
      const strength = validatePassword(value);
      setPasswordStrength(strength);
      // Check if passwords match
      if (formData.confirmPassword) {
        setPasswordsMatch(value === formData.confirmPassword);
      }
    }

    // Check if passwords match on confirm password change
    if (name === 'confirmPassword') {
      setPasswordsMatch(formData.password === value);
    }
  };

  const currentYear = new Date().getFullYear();
  const batchYears = Array.from({ length: currentYear - 2019 + 10 }, (_, i) => 2029 - i);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      
      <motion.div 
        className="max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.img
            className="mx-auto h-16 w-16 mb-6"
            src="/logo.png"
            alt="Alumni Connect"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Join Our Alumni Community
          </h2>
          <p className="text-gray-600">
            Create your profile to connect with fellow alumni
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Already have an account?{' '}
            <Link
              to="/auth/login"
              className="font-medium text-orange-600 hover:text-orange-500"
            >
              Sign in here
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
            
            {/* Required Fields Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Required Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
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

                {/* Batch Year */}
                <div>
                  <label htmlFor="batch_year" className="block text-sm font-medium text-gray-700 mb-1">
                    Batch Year *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      id="batch_year"
                      name="batch_year"
                      required
                      className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      value={formData.batch_year}
                      onChange={handleChange}
                    >
                      <option value="">Select your batch year</option>
                      {batchYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Password */}
                <div className="md:col-span-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      className={`w-full px-3 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                        formData.password && passwordStrength.score < 4 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300'
                      }`}
                      placeholder="Create a strong password"
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
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              level <= passwordStrength.score
                                ? passwordStrength.color
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-medium ${
                          passwordStrength.score >= 4 ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {passwordStrength.label}
                        </span>
                        {passwordStrength.score < 4 && (
                          <span className="text-gray-500">{passwordStrength.feedback}</span>
                        )}
                      </div>
                      
                      {/* Password Requirements */}
                      <div className="mt-2 space-y-1">
                        <PasswordRequirement 
                          met={formData.password.length >= 8} 
                          text="At least 8 characters" 
                        />
                        <PasswordRequirement 
                          met={/[a-z]/.test(formData.password)} 
                          text="One lowercase letter" 
                        />
                        <PasswordRequirement 
                          met={/[A-Z]/.test(formData.password)} 
                          text="One uppercase letter" 
                        />
                        <PasswordRequirement 
                          met={/\d/.test(formData.password)} 
                          text="One number" 
                        />
                        <PasswordRequirement 
                          met={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)} 
                          text="One special character (!@#$%...)" 
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="md:col-span-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      className={`w-full px-3 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                        formData.confirmPassword && passwordsMatch === false
                          ? 'border-red-300 bg-red-50'
                          : formData.confirmPassword && passwordsMatch === true
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-300'
                      }`}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password Match Indicator */}
                  {formData.confirmPassword && (
                    <div className="mt-2 flex items-center gap-2">
                      {passwordsMatch ? (
                        <>
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">Passwords match</span>
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 text-red-600" />
                          <span className="text-sm text-red-600 font-medium">Passwords do not match</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Optional Fields Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                Additional Information (Optional)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Day */}
                    <div>
                      <select
                        name="birth_day"
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                        value={formData.birth_day}
                        onChange={handleChange}
                      >
                        <option value="">Day</option>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Month */}
                    <div>
                      <select
                        name="birth_month"
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                        value={formData.birth_month}
                        onChange={handleChange}
                      >
                        <option value="">Month</option>
                        <option value="1">January</option>
                        <option value="2">February</option>
                        <option value="3">March</option>
                        <option value="4">April</option>
                        <option value="5">May</option>
                        <option value="6">June</option>
                        <option value="7">July</option>
                        <option value="8">August</option>
                        <option value="9">September</option>
                        <option value="10">October</option>
                        <option value="11">November</option>
                        <option value="12">December</option>
                      </select>
                    </div>
                    
                    {/* Year */}
                    <div>
                      <select
                        name="birth_year"
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                        value={formData.birth_year}
                        onChange={handleChange}
                      >
                        <option value="">Year</option>
                        {Array.from({ length: 100 }, (_, i) => currentYear - 15 - i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Current City */}
                <div>
                  <label htmlFor="current_city" className="block text-sm font-medium text-gray-700 mb-1">
                    Current City
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="current_city"
                      name="current_city"
                      type="text"
                      className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      placeholder="Mumbai, Delhi, etc."
                      value={formData.current_city}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Current Country */}
                <div>
                  <label htmlFor="current_country" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Country
                  </label>
                  <input
                    id="current_country"
                    name="current_country"
                    type="text"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="India, USA, etc."
                    value={formData.current_country}
                    onChange={handleChange}
                  />
                </div>

                {/* Bio */}
                <div className="md:col-span-2">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="Tell us about yourself, your interests, current role, etc."
                    value={formData.bio}
                    onChange={handleChange}
                  />
                </div>
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
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </motion.button>
            </div>

            {/* Privacy Notice */}
            <div className="text-center text-sm text-gray-500">
              <p>
                By creating an account, you agree to our{' '}
                <a href="#" className="text-orange-600 hover:text-orange-500">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-orange-600 hover:text-orange-500">Privacy Policy</a>
              </p>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}