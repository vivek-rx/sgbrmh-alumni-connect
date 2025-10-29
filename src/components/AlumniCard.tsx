import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, Calendar, Mail, Phone, CheckCircle, Lock } from 'lucide-react';

interface AlumniProps {
  id: string;
  name: string;
  email: string;
  batch_year: number;
  profile_photo_url?: string | null;
  phone?: string | null;
  gender?: string | null;
  current_city?: string | null;
  current_country?: string | null;
  bio?: string | null;
  verified?: boolean;
  profile_completed?: boolean;
}

interface AlumniCardProps {
  alumni: AlumniProps;
  index?: number;
  canViewProfile?: boolean; // Whether the current logged-in user can view full profiles
}

export function AlumniCard({ alumni, index = 0, canViewProfile = false }: AlumniCardProps) {
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut"
      }
    }
  };

  const location = [alumni.current_city, alumni.current_country].filter(Boolean).join(', ');
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(alumni.name)}&background=f97316&color=fff&size=128`;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="group"
    >
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-200 h-full flex flex-col"
      >
        <div className="relative flex-1">
          {/* Header Section with Avatar and Basic Info */}
          <div className="flex items-start space-x-4 mb-4">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-orange-200">
                <img
                  src={alumni.profile_photo_url || defaultAvatar}
                  alt={alumni.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultAvatar;
                  }}
                />
              </div>
              {/* Verified Badge */}
              {alumni.verified && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                {alumni.name}
              </h3>
              
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                <span>Batch {alumni.batch_year}</span>
              </div>
              
              {alumni.verified && (
                <span className="inline-flex items-center text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </span>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 mb-4">
            {alumni.email && (
              <div className="flex items-center text-sm text-gray-700">
                <Mail className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                <span className="truncate">{alumni.email}</span>
              </div>
            )}
            
            {alumni.phone && (
              <div className="flex items-center text-sm text-gray-700">
                <Phone className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                <span>{alumni.phone}</span>
              </div>
            )}
            
            {location && (
              <div className="flex items-center text-sm text-gray-700">
                <MapPin className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                <span className="truncate">{location}</span>
              </div>
            )}
          </div>

          {/* Bio Section */}
          {alumni.bio && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                {alumni.bio}
              </p>
            </div>
          )}
        </div>

        {/* Action Button - Only visible to verified users */}
        <div className="pt-4 border-t border-gray-100 mt-auto">
          {!canViewProfile ? (
            // Current user is NOT verified - show locked message
            <div className="flex items-center justify-center text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-lg">
              <Lock className="w-4 h-4 mr-2" />
              <span>Verify your account to view profiles</span>
            </div>
          ) : (
            // Current user IS verified - show button for all alumni profiles
            <Link to={`/profile/${alumni.id}`} className="block">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-4 py-2 rounded-lg transition-all duration-200"
              >
                View Full Profile
                <ArrowRight className="w-4 h-4 ml-2" />
              </motion.button>
            </Link>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}