import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Globe,
  Briefcase,
  Heart,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Github,
  Camera,
  ArrowLeft,
  CheckCircle,
  MessageCircle,
  Share2
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AlumniProfile {
  id: string;
  email: string;
  name: string;
  batch_year: number;
  profile_photo_url: string | null;
  phone: string | null;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  marital_status: 'single' | 'married' | 'divorced' | 'widowed' | 'separated' | 'prefer_not_to_say' | null;
  date_of_birth: string | null;
  age: number | null;
  bio: string | null;
  whatsapp_number: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  snapchat_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  current_city: string | null;
  current_country: string | null;
  verified: boolean;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

export default function ProfileView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile: currentUserProfile } = useAuth();
  const [alumniProfile, setAlumniProfile] = useState<AlumniProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for profile to load
    if (!currentUserProfile) {
      console.log('⏳ ProfileView: Waiting for user profile to load...');
      return;
    }

    console.log('👤 ProfileView: Current user profile:', { 
      name: currentUserProfile.name, 
      verified: currentUserProfile.verified 
    });

    // Check if current user is verified
    if (!currentUserProfile.verified) {
      console.log('❌ ProfileView: User is not verified');
      toast.error('You must be verified to view profiles');
      navigate('/alumni');
      return;
    }

    console.log('✅ ProfileView: User is verified, fetching alumni profile...');
    fetchAlumniProfile();
  }, [id, currentUserProfile, navigate]);

  const fetchAlumniProfile = async () => {
    if (!id) {
      console.error('❌ ProfileView: No ID provided');
      return;
    }

    console.log('📡 ProfileView: Fetching profile for ID:', id);

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('alumni')
        .select('*')
        .eq('id', id)
        .single();

      console.log('📡 ProfileView: Supabase response:', { data, error });

      if (error) {
        console.error('❌ ProfileView: Error fetching alumni profile:', error);
        toast.error(`Failed to load profile: ${error.message}`);
        navigate('/alumni');
        return;
      }

      if (!data) {
        console.error('❌ ProfileView: No data returned');
        toast.error('Profile not found');
        navigate('/alumni');
        return;
      }

      console.log('✅ ProfileView: Profile loaded successfully:', data.name);
      setAlumniProfile(data);
    } catch (error) {
      console.error('❌ ProfileView: Exception:', error);
      toast.error('An error occurred');
      navigate('/alumni');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  if (!alumniProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
          <Link
            to="/alumni"
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not provided';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/alumni')}
          className="mb-6 flex items-center text-gray-600 hover:text-orange-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Directory
        </motion.button>

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6"
        >
          {/* Cover with Gradient */}
          <div className="h-48 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 relative">
            {alumniProfile.verified && (
              <div className="absolute top-4 right-4 bg-white rounded-full px-4 py-2 shadow-lg flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm font-semibold text-gray-700">Verified Alumni</span>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="px-8 pb-8">
            {/* Profile Photo */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-20 mb-6">
              <div className="relative mb-4 sm:mb-0">
                {alumniProfile.profile_photo_url ? (
                  <img
                    src={alumniProfile.profile_photo_url}
                    alt={alumniProfile.name}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">
                      {getInitials(alumniProfile.name)}
                    </span>
                  </div>
                )}
              </div>

              {/* Name and Batch */}
              <div className="sm:ml-6 flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{alumniProfile.name}</h1>
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="flex items-center text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Batch {alumniProfile.batch_year}</span>
                  </div>
                  {alumniProfile.current_city && alumniProfile.current_country && (
                    <div className="flex items-center text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">
                        {alumniProfile.current_city}, {alumniProfile.current_country}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4 sm:mt-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-md"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Connect
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Bio */}
            {alumniProfile.bio && (
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">{alumniProfile.bio}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <User className="w-6 h-6 mr-3 text-orange-500" />
              Contact Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="flex items-start">
                <div className="bg-orange-100 rounded-lg p-3 mr-4">
                  <Mail className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <a
                    href={`mailto:${alumniProfile.email}`}
                    className="text-gray-900 hover:text-orange-600 font-medium break-all"
                  >
                    {alumniProfile.email}
                  </a>
                </div>
              </div>

              {/* Phone */}
              {alumniProfile.phone && (
                <div className="flex items-start">
                  <div className="bg-orange-100 rounded-lg p-3 mr-4">
                    <Phone className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                    <a
                      href={`tel:${alumniProfile.phone}`}
                      className="text-gray-900 hover:text-orange-600 font-medium"
                    >
                      {alumniProfile.phone}
                    </a>
                  </div>
                </div>
              )}

              {/* WhatsApp */}
              {alumniProfile.whatsapp_number && (
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-lg p-3 mr-4">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">WhatsApp</p>
                    <a
                      href={`https://wa.me/${alumniProfile.whatsapp_number.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-900 hover:text-green-600 font-medium"
                    >
                      {alumniProfile.whatsapp_number}
                    </a>
                  </div>
                </div>
              )}

              {/* Location */}
              {(alumniProfile.current_city || alumniProfile.current_country) && (
                <div className="flex items-start">
                  <div className="bg-orange-100 rounded-lg p-3 mr-4">
                    <Globe className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Location</p>
                    <p className="text-gray-900 font-medium">
                      {alumniProfile.current_city && `${alumniProfile.current_city}`}
                      {alumniProfile.current_city && alumniProfile.current_country && ', '}
                      {alumniProfile.current_country && `${alumniProfile.current_country}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Personal Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Briefcase className="w-6 h-6 mr-3 text-orange-500" />
              Personal Details
            </h2>

            <div className="space-y-4">
              {/* Date of Birth */}
              {alumniProfile.date_of_birth && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Date of Birth</p>
                  <p className="text-gray-900 font-medium">{formatDate(alumniProfile.date_of_birth)}</p>
                </div>
              )}

              {/* Age */}
              {alumniProfile.age && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Age</p>
                  <p className="text-gray-900 font-medium">{alumniProfile.age} years</p>
                </div>
              )}

              {/* Gender */}
              {alumniProfile.gender && alumniProfile.gender !== 'prefer_not_to_say' && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Gender</p>
                  <p className="text-gray-900 font-medium capitalize">
                    {alumniProfile.gender.replace(/_/g, ' ')}
                  </p>
                </div>
              )}

              {/* Marital Status */}
              {alumniProfile.marital_status && alumniProfile.marital_status !== 'prefer_not_to_say' && (
                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center">
                    <Heart className="w-4 h-4 mr-2 text-pink-500" />
                    Marital Status
                  </p>
                  <p className="text-gray-900 font-medium capitalize">
                    {alumniProfile.marital_status}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Social Media Links */}
        {(alumniProfile.facebook_url ||
          alumniProfile.instagram_url ||
          alumniProfile.twitter_url ||
          alumniProfile.linkedin_url ||
          alumniProfile.github_url ||
          alumniProfile.portfolio_url ||
          alumniProfile.snapchat_url) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Globe className="w-6 h-6 mr-3 text-orange-500" />
              Connect on Social Media
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {alumniProfile.facebook_url && (
                <a
                  href={alumniProfile.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-4 rounded-lg hover:bg-blue-50 transition-colors group"
                >
                  <div className="bg-blue-100 rounded-full p-3 mb-2 group-hover:bg-blue-200 transition-colors">
                    <Facebook className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium">Facebook</span>
                </a>
              )}

              {alumniProfile.instagram_url && (
                <a
                  href={alumniProfile.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-4 rounded-lg hover:bg-pink-50 transition-colors group"
                >
                  <div className="bg-pink-100 rounded-full p-3 mb-2 group-hover:bg-pink-200 transition-colors">
                    <Instagram className="w-6 h-6 text-pink-600" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium">Instagram</span>
                </a>
              )}

              {alumniProfile.twitter_url && (
                <a
                  href={alumniProfile.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-4 rounded-lg hover:bg-blue-50 transition-colors group"
                >
                  <div className="bg-blue-100 rounded-full p-3 mb-2 group-hover:bg-blue-200 transition-colors">
                    <Twitter className="w-6 h-6 text-blue-500" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium">Twitter</span>
                </a>
              )}

              {alumniProfile.linkedin_url && (
                <a
                  href={alumniProfile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-4 rounded-lg hover:bg-blue-50 transition-colors group"
                >
                  <div className="bg-blue-100 rounded-full p-3 mb-2 group-hover:bg-blue-200 transition-colors">
                    <Linkedin className="w-6 h-6 text-blue-700" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium">LinkedIn</span>
                </a>
              )}

              {alumniProfile.github_url && (
                <a
                  href={alumniProfile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="bg-gray-100 rounded-full p-3 mb-2 group-hover:bg-gray-200 transition-colors">
                    <Github className="w-6 h-6 text-gray-800" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium">GitHub</span>
                </a>
              )}

              {alumniProfile.snapchat_url && (
                <a
                  href={alumniProfile.snapchat_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-4 rounded-lg hover:bg-yellow-50 transition-colors group"
                >
                  <div className="bg-yellow-100 rounded-full p-3 mb-2 group-hover:bg-yellow-200 transition-colors">
                    <Camera className="w-6 h-6 text-yellow-600" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium">Snapchat</span>
                </a>
              )}

              {alumniProfile.portfolio_url && (
                <a
                  href={alumniProfile.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-4 rounded-lg hover:bg-orange-50 transition-colors group"
                >
                  <div className="bg-orange-100 rounded-full p-3 mb-2 group-hover:bg-orange-200 transition-colors">
                    <Globe className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium">Portfolio</span>
                </a>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
