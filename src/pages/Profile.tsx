import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Globe, Edit3, Save, X, Briefcase, GraduationCap, Link as LinkIcon, Camera, CheckCircle } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import AvatarUploader from '../components/AvatarUploader';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { CountrySelect, StateSelect, CitySelect } from 'react-country-state-city';
import 'react-country-state-city/dist/react-country-state-city.css';
import { getCoordinates, getCountryCode } from '../lib/geocoding';
import { motion, AnimatePresence } from 'framer-motion';

export default function Profile() {
  const { user, profile, updateProfile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    batch_year: '',
    gender: '',
    marital_status: '',
    date_of_birth: '',
    age: '',
    bio: '',
    college_name: '',
    profession: '',
    company_name: '',
    whatsapp_number: '',
    facebook_url: '',
    instagram_url: '',
    twitter_url: '',
    linkedin_url: '',
    snapchat_url: '',
    github_url: '',
    portfolio_url: '',
    current_city: '',
    current_country: ''
  });

  const [showOtherCollege, setShowOtherCollege] = useState(false);
  
  // Location state for react-country-state-city
  const [countryId, setCountryId] = useState(0);
  const [stateId, setStateId] = useState(0);
  const [cityData, setCityData] = useState<any>(null);
  const [countryData, setCountryData] = useState<any>(null);
  
  // Geographic coordinates for mapping
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);

  // Load profile data into form
  useEffect(() => {
    if (profile) {
      const collegeName = profile.college_name || '';
      const predefinedColleges = ['VIT', 'VU', 'VIIT', 'PICT', 'Sinhagad'];
      const isOther = Boolean(collegeName && !predefinedColleges.includes(collegeName));
      
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        batch_year: profile.batch_year?.toString() || '',
        gender: profile.gender || '',
        marital_status: profile.marital_status || '',
        date_of_birth: profile.date_of_birth || '',
        age: profile.age?.toString() || '',
        bio: profile.bio || '',
        college_name: collegeName,
        profession: profile.profession || '',
        company_name: profile.company_name || '',
        whatsapp_number: profile.whatsapp_number || '',
        facebook_url: profile.facebook_url || '',
        instagram_url: profile.instagram_url || '',
        twitter_url: profile.twitter_url || '',
        linkedin_url: profile.linkedin_url || '',
        snapchat_url: profile.snapchat_url || '',
        github_url: profile.github_url || '',
        portfolio_url: profile.portfolio_url || '',
        current_city: profile.current_city || '',
        current_country: profile.current_country || ''
      });
      
      setShowOtherCollege(isOther);
    } else if (user && !loading) {
      // Initialize form for new profile creation
      setFormData({
        name: user?.user_metadata?.name || user?.email?.split('@')[0] || '',
        phone: '',
        batch_year: '',
        gender: '',
        marital_status: '',
        date_of_birth: '',
        age: '',
        bio: '',
        college_name: '',
        profession: '',
        company_name: '',
        whatsapp_number: '',
        facebook_url: '',
        instagram_url: '',
        twitter_url: '',
        linkedin_url: '',
        snapchat_url: '',
        github_url: '',
        portfolio_url: '',
        current_city: '',
        current_country: ''
      });
    }
  }, [profile, user, loading]);

  // Calculate age automatically when date_of_birth changes
  useEffect(() => {
    if (formData.date_of_birth) {
      const birthDate = dayjs(formData.date_of_birth);
      const today = dayjs();
      const calculatedAge = today.diff(birthDate, 'year');
      
      if (calculatedAge >= 0 && calculatedAge <= 150) {
        setFormData(prev => ({ ...prev, age: calculatedAge.toString() }));
      }
    }
  }, [formData.date_of_birth]);

  // Fetch coordinates when city and country are selected
  useEffect(() => {
    const fetchCoordinates = async () => {
      if (formData.current_city && formData.current_country) {
        const coords = await getCoordinates(formData.current_city, formData.current_country);
        if (coords) {
          setCoordinates(coords);
          console.log('Coordinates fetched:', coords);
        }
      }
    };

    fetchCoordinates();
  }, [formData.current_city, formData.current_country]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    if (!formData.batch_year.trim()) {
      toast.error('Batch year is required');
      return;
    }
    
    try {
      // Prepare update data, converting strings to appropriate types
      const updateData: any = {
        name: formData.name.trim(),
        phone: formData.phone?.trim() || null,
        batch_year: formData.batch_year ? parseInt(formData.batch_year) : new Date().getFullYear(),
        gender: formData.gender ? formData.gender as 'male' | 'female' | 'other' | 'prefer_not_to_say' : null,
        marital_status: formData.marital_status ? formData.marital_status as 'single' | 'married' | 'prefer_not_to_say' : null,
        date_of_birth: formData.date_of_birth || null,
        age: formData.age ? parseInt(formData.age) : null,
        bio: formData.bio?.trim() || null,
        college_name: formData.college_name?.trim() || null,
        profession: formData.profession?.trim() || null,
        company_name: formData.company_name?.trim() || null,
        whatsapp_number: formData.whatsapp_number?.trim() || null,
        facebook_url: formData.facebook_url?.trim() || null,
        instagram_url: formData.instagram_url?.trim() || null,
        twitter_url: formData.twitter_url?.trim() || null,
        linkedin_url: formData.linkedin_url?.trim() || null,
        snapchat_url: formData.snapchat_url?.trim() || null,
        github_url: formData.github_url?.trim() || null,
        portfolio_url: formData.portfolio_url?.trim() || null,
        current_city: formData.current_city?.trim() || null,
        current_country: formData.current_country?.trim() || null,
        profile_completed: true // Mark profile as completed after saving
      };

      // Add geographic coordinates if available
      if (coordinates) {
        updateData.latitude = coordinates.latitude;
        updateData.longitude = coordinates.longitude;
      }

      // Add country code if available
      if (formData.current_country) {
        const countryCode = getCountryCode(formData.current_country);
        if (countryCode) {
          updateData.country_code = countryCode;
        }
      }

      await updateProfile(updateData);
      
      if (profile) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      } else {
        toast.success('Profile created successfully! Welcome to the alumni network!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save profile. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    // Don't allow manual age input since it's auto-calculated
    if (e.target.name === 'age') {
      return;
    }
    
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-red-50/20 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-orange-500 border-r-red-500 absolute top-0 left-1/2 -translate-x-1/2"></div>
          </div>
          <p className="mt-6 text-gray-700 font-medium">Loading your profile...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    window.location.href = '/auth/login';
    return null;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-red-50/20 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {/* Header with Gradient */}
            <div className="relative bg-gradient-to-r from-orange-500 via-red-500 to-red-600 px-8 py-12 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
              
              <div className="relative flex items-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="h-24 w-24 bg-white rounded-full flex items-center justify-center shadow-lg"
                >
                  <User className="h-14 w-14 text-orange-500" />
                </motion.div>
                <div className="ml-8">
                  <motion.h1 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl font-bold text-white"
                  >
                    Complete Your Profile
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-orange-100 mt-2 text-lg"
                  >
                    Welcome to the SGBRMH Alumni Network! Let's set up your profile
                  </motion.p>
                  <motion.p 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-orange-200/80 text-sm mt-1 flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    {user?.email}
                  </motion.p>
                </div>
              </div>
            </div>

            {/* Profile Creation Form */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="p-8"
            >
              <form 
                onSubmit={handleSubmit}
                className="space-y-8"
              >
                {/* Profile Picture Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Profile Picture (Optional)
                  </label>
                  <AvatarUploader
                    userId={user?.id || ''}
                    initialAvatarPath={null}
                    onSaved={async (data) => {
                      toast.success('Profile picture uploaded!');
                      // Reload to show the uploaded photo
                      window.location.reload();
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email (Read-only) */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        readOnly
                        className="pl-11 w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none"
                        value={user?.email || ''}
                      />
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="pl-11 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Batch Year */}
                  <div>
                    <label htmlFor="batch_year" className="block text-sm font-semibold text-gray-700 mb-2">
                      Batch Year <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        id="batch_year"
                        name="batch_year"
                        required
                        min="1950"
                        max="2030"
                        className="pl-11 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="e.g., 2020"
                        value={formData.batch_year}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="pl-11 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6">
                  <button
                    type="submit"
                    className="btn-primary group"
                  >
                    <User className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                    Create Profile
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-red-50/20 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header with Modern Design */}
          <div className="relative bg-gradient-to-r from-orange-500 via-red-500 to-red-600 px-8 py-12 overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
            
            <div className="relative flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                {/* Profile Photo */}
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="relative group"
                >
                  <div className="h-28 w-28 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-2xl ring-4 ring-white/30">
                    {profile.profile_photo_url ? (
                      <img
                        src={
                          profile.profile_photo_url.startsWith('http') 
                            ? profile.profile_photo_url 
                            : supabase.storage.from('avatars').getPublicUrl(profile.profile_photo_url).data.publicUrl
                        }
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-16 w-16 text-orange-500" />
                    )}
                  </div>
                  {profile.verified && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg ring-4 ring-white"
                    >
                      <CheckCircle className="h-5 w-5 text-white" />
                    </motion.div>
                  )}
                </motion.div>

                {/* Profile Info */}
                <div>
                  <motion.h1 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl lg:text-4xl font-bold text-white flex items-center gap-3"
                  >
                    {profile.name || 'Anonymous User'}
                  </motion.h1>
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap items-center gap-4 mt-3 text-orange-100"
                  >
                    {profile.batch_year && (
                      <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                        <GraduationCap className="h-4 w-4" />
                        Batch {profile.batch_year}
                      </span>
                    )}
                    {profile.current_city && (
                      <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                        <MapPin className="h-4 w-4" />
                        {profile.current_city}
                      </span>
                    )}
                    {profile.profession && (
                      <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                        <Briefcase className="h-4 w-4" />
                        {profile.profession}
                      </span>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Edit Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white text-orange-600 px-6 py-3 rounded-xl hover:bg-orange-50 flex items-center gap-2 transition-all shadow-lg hover:shadow-xl font-semibold group"
              >
                {isEditing ? (
                  <>
                    <X className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit3 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    Edit Profile
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-8"
              >
                <form onSubmit={handleSubmit} className="space-y-10">
                  {/* Basic Information Section */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
                        <p className="text-sm text-gray-500">Your personal details</p>
                      </div>
                    </div>
                    
                    {/* Avatar Upload Section */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-4">
                        Profile Picture
                      </label>
                      <AvatarUploader
                        userId={profile?.id || user?.id || ''}
                        initialAvatarPath={profile?.profile_photo_url}
                        onSaved={async (data) => {
                          toast.success('Profile picture updated!');
                          // Reload the page to refresh profile data
                          window.location.reload();
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 rounded-xl p-6">
                      {/* Full Name */}
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            className="pl-11 w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      {/* Email (readonly) */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="email"
                            id="email"
                            name="email"
                            readOnly
                            className="pl-11 w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                            value={profile?.email || ''}
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            className="pl-11 w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                            placeholder="+91 98765 43210"
                            value={formData.phone}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      {/* Batch Year */}
                      <div>
                        <label htmlFor="batch_year" className="block text-sm font-semibold text-gray-700 mb-2">
                          Batch Year <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="number"
                            id="batch_year"
                            name="batch_year"
                            required
                            min="1950"
                            max="2030"
                            className="pl-11 w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                            placeholder="e.g., 2020"
                            value={formData.batch_year}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>

                  {/* Marital Status */}
                  <div>
                    <label htmlFor="marital_status" className="block text-sm font-medium text-gray-700">
                      Marital Status
                    </label>
                    <select
                      id="marital_status"
                      name="marital_status"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={formData.marital_status}
                      onChange={handleChange}
                    >
                      <option value="">Select Status</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>

                  {/* Date of Birth - Material-UI Date Picker */}
                  <div>
                    <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        value={formData.date_of_birth ? dayjs(formData.date_of_birth) : null}
                        onChange={(newValue: Dayjs | null) => {
                          if (newValue && newValue.isValid()) {
                            setFormData(prev => ({ 
                              ...prev, 
                              date_of_birth: newValue.format('YYYY-MM-DD') 
                            }));
                          } else if (newValue === null) {
                            setFormData(prev => ({ 
                              ...prev, 
                              date_of_birth: '' 
                            }));
                          }
                        }}
                        maxDate={dayjs()}
                        format="DD/MM/YYYY"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            variant: 'outlined',
                            placeholder: 'DD/MM/YYYY',
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                              }
                            }
                          },
                          field: {
                            readOnly: false
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </div>

                  {/* Age - Auto-calculated */}
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                      Age <span className="text-xs text-gray-500">(Auto-calculated)</span>
                    </label>
                    <input
                      type="text"
                      id="age"
                      name="age"
                      className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-gray-50 cursor-not-allowed"
                      value={formData.age ? `${formData.age} years` : 'Enter date of birth'}
                      readOnly
                      disabled
                    />
                  </div>

                  {/* College Name */}
                  <div>
                    <label htmlFor="college_name" className="block text-sm font-medium text-gray-700 mb-1">
                      College/University Name
                    </label>
                    <select
                      id="college_name"
                      name="college_name"
                      className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={showOtherCollege ? 'Other' : formData.college_name}
                      onChange={(e) => {
                        if (e.target.value === 'Other') {
                          setShowOtherCollege(true);
                          setFormData(prev => ({ ...prev, college_name: '' }));
                        } else {
                          setShowOtherCollege(false);
                          setFormData(prev => ({ ...prev, college_name: e.target.value }));
                        }
                      }}
                    >
                      <option value="">Select College/University</option>
                      <option value="VIT">VIT (Vishwakarma Institute of Technology)</option>
                      <option value="VU">VU (Vishwakarma University)</option>
                      <option value="VIIT">VIIT (Vishwakarma Institute of Information Technology)</option>
                      <option value="PICT">PICT (Pune Institute of Computer Technology)</option>
                      <option value="Sinhagad">Sinhagad Institutes</option>
                      <option value="Other">Other</option>
                    </select>
                    {showOtherCollege && (
                      <input
                        type="text"
                        name="college_name"
                        placeholder="Enter your college/university name"
                        className="mt-2 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={formData.college_name}
                        onChange={handleChange}
                      />
                    )}
                  </div>

                  {/* Profession */}
                  <div>
                    <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-1">
                      Profession <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="profession"
                      name="profession"
                      placeholder="e.g., Software Engineer, Teacher, Business Owner"
                      className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={formData.profession}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Company Name */}
                  <div>
                    <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Company/Business Name <span className="text-xs text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      id="company_name"
                      name="company_name"
                      placeholder="e.g., Google, Self-Employed"
                      className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={formData.company_name}
                      onChange={handleChange}
                    />
                  </div>

                  {/* WhatsApp Number */}
                  <div>
                    <label htmlFor="whatsapp_number" className="block text-sm font-medium text-gray-700">
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      id="whatsapp_number"
                      name="whatsapp_number"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={formData.whatsapp_number}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Current Country */}
                  <div>
                    <label htmlFor="current_country" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Country
                    </label>
                    <CountrySelect
                      onChange={(e: any) => {
                        setCountryId(e.id);
                        setCountryData(e);
                        setFormData(prev => ({ 
                          ...prev, 
                          current_country: e.name 
                        }));
                        // Reset state and city when country changes
                        setStateId(0);
                        setCityData(null);
                        setFormData(prev => ({ ...prev, current_city: '' }));
                      }}
                      placeHolder="Select Country"
                      containerClassName="react-country-state-city-select"
                      inputClassName="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>

                  {/* Current State (Optional - for better city filtering) */}
                  {countryId !== 0 && (
                    <div>
                      <label htmlFor="current_state" className="block text-sm font-medium text-gray-700 mb-1">
                        State/Province <span className="text-xs text-gray-500">(Optional)</span>
                      </label>
                      <StateSelect
                        countryid={countryId}
                        onChange={(e: any) => {
                          setStateId(e.id);
                        }}
                        placeHolder="Select State"
                        containerClassName="react-country-state-city-select"
                        inputClassName="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>
                  )}

                  {/* Current City */}
                  {countryId !== 0 && (
                    <div>
                      <label htmlFor="current_city" className="block text-sm font-medium text-gray-700 mb-1">
                        Current City
                      </label>
                      <CitySelect
                        countryid={countryId}
                        stateid={stateId}
                        onChange={(e: any) => {
                          setCityData(e);
                          setFormData(prev => ({ 
                            ...prev, 
                            current_city: e.name 
                          }));
                        }}
                        placeHolder="Select City"
                        containerClassName="react-country-state-city-select"
                        inputClassName="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>
                  )}

                  {/* LinkedIn */}
                  <div>
                    <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700">
                      LinkedIn Profile
                    </label>
                    <input
                      type="url"
                      id="linkedin_url"
                      name="linkedin_url"
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={formData.linkedin_url}
                      onChange={handleChange}
                    />
                  </div>

                  {/* GitHub */}
                  <div>
                    <label htmlFor="github_url" className="block text-sm font-medium text-gray-700">
                      GitHub Profile
                    </label>
                    <input
                      type="url"
                      id="github_url"
                      name="github_url"
                      placeholder="https://github.com/yourusername"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={formData.github_url}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Portfolio */}
                  <div>
                    <label htmlFor="portfolio_url" className="block text-sm font-medium text-gray-700">
                      Portfolio Website
                    </label>
                    <input
                      type="url"
                      id="portfolio_url"
                      name="portfolio_url"
                      placeholder="https://yourportfolio.com"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={formData.portfolio_url}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Facebook */}
                  <div>
                    <label htmlFor="facebook_url" className="block text-sm font-medium text-gray-700">
                      Facebook Profile
                    </label>
                    <input
                      type="url"
                      id="facebook_url"
                      name="facebook_url"
                      placeholder="https://facebook.com/yourprofile"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={formData.facebook_url}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Instagram */}
                  <div>
                    <label htmlFor="instagram_url" className="block text-sm font-medium text-gray-700">
                      Instagram Profile
                    </label>
                    <input
                      type="url"
                      id="instagram_url"
                      name="instagram_url"
                      placeholder="https://instagram.com/yourusername"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={formData.instagram_url}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Twitter */}
                  <div>
                    <label htmlFor="twitter_url" className="block text-sm font-medium text-gray-700">
                      Twitter Profile
                    </label>
                    <input
                      type="url"
                      id="twitter_url"
                      name="twitter_url"
                      placeholder="https://twitter.com/yourusername"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={formData.twitter_url}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Snapchat */}
                  <div>
                    <label htmlFor="snapchat_url" className="block text-sm font-medium text-gray-700">
                      Snapchat Profile
                    </label>
                    <input
                      type="url"
                      id="snapchat_url"
                      name="snapchat_url"
                      placeholder="https://snapchat.com/add/yourusername"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={formData.snapchat_url}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder="Tell us about yourself..."
                      value={formData.bio}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-8">
                    <button
                      type="submit"
                      className="btn-primary group"
                    >
                      <Save className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                      Save Profile
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="viewing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-8"
              >
                {/* View Mode */}
                <div className="space-y-8">
                  {/* Contact Information Section */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
                
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Email */}
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="text-gray-900">{profile.email}</p>
                        </div>
                      </div>

                      {/* Phone */}
                      {profile.phone && (
                        <div className="flex items-center">
                          <Phone className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="text-gray-900">{profile.phone}</p>
                          </div>
                        </div>
                      )}

                      {/* Batch Year */}
                      {profile.batch_year && (
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Batch Year</p>
                            <p className="text-gray-900">{profile.batch_year}</p>
                          </div>
                        </div>
                      )}

                      {/* Gender */}
                      {profile.gender && (
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Gender</p>
                            <p className="text-gray-900 capitalize">{profile.gender.replace('_', ' ')}</p>
                          </div>
                        </div>
                      )}

                      {/* Marital Status */}
                      {profile.marital_status && (
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Marital Status</p>
                            <p className="text-gray-900 capitalize">{profile.marital_status.replace('_', ' ')}</p>
                          </div>
                        </div>
                      )}

                      {/* Date of Birth */}
                      {profile.date_of_birth && (
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Date of Birth</p>
                            <p className="text-gray-900">{new Date(profile.date_of_birth).toLocaleDateString()}</p>
                          </div>
                        </div>
                      )}

                      {/* Age */}
                      {profile.age && (
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Age</p>
                            <p className="text-gray-900">{profile.age} years</p>
                          </div>
                        </div>
                      )}

                      {/* WhatsApp */}
                      {profile.whatsapp_number && (
                        <div className="flex items-center">
                          <Phone className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">WhatsApp</p>
                            <p className="text-gray-900">{profile.whatsapp_number}</p>
                          </div>
                        </div>
                      )}

                      {/* Location */}
                      {(profile.current_city || profile.current_country) && (
                        <div className="flex items-center">
                          <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="text-gray-900">
                              {profile.current_city}
                              {profile.current_city && profile.current_country && ', '}
                              {profile.current_country}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {profile.bio && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">About</h3>
                      <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                    </div>
                  )}

                  {/* Links */}
                  {(profile.linkedin_url || profile.github_url || profile.portfolio_url || 
                    profile.facebook_url || profile.instagram_url || profile.twitter_url || profile.snapchat_url) && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Links & Social Media</h3>
                      <div className="flex flex-wrap gap-3">
                      {profile.linkedin_url && (
                        <a
                          href={profile.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          LinkedIn
                        </a>
                      )}
                      {profile.github_url && (
                        <a
                          href={profile.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          GitHub
                        </a>
                      )}
                      {profile.portfolio_url && (
                        <a
                          href={profile.portfolio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          Portfolio
                        </a>
                      )}
                      {profile.facebook_url && (
                        <a
                          href={profile.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          Facebook
                        </a>
                      )}
                      {profile.instagram_url && (
                        <a
                          href={profile.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-2 bg-pink-50 text-pink-600 rounded-md hover:bg-pink-100 transition-colors"
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          Instagram
                        </a>
                      )}
                      {profile.twitter_url && (
                        <a
                          href={profile.twitter_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-2 bg-sky-50 text-sky-600 rounded-md hover:bg-sky-100 transition-colors"
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          Twitter
                        </a>
                      )}
                      {profile.snapchat_url && (
                        <a
                          href={profile.snapchat_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-2 bg-yellow-50 text-yellow-600 rounded-md hover:bg-yellow-100 transition-colors"
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          Snapchat
                        </a>
                      )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
