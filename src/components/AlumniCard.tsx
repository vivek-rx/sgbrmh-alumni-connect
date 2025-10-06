import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, MapPin, Briefcase, ArrowRight, Calendar } from 'lucide-react';

interface AlumniProps {
  id: string;
  name: string;
  batch: string;
  course: string;
  company?: string;
  position?: string;
  location?: string;
  avatar: string;
  bio?: string;
}

interface AlumniCardProps {
  alumni: AlumniProps;
  index?: number;
}

export function AlumniCard({ alumni, index = 0 }: AlumniCardProps) {
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
        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-200 h-full"
      >
        <div className="relative">
          {/* Header Section with Avatar and Basic Info */}
          <div className="flex items-start space-x-4 mb-4">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                <img
                  src={alumni.avatar}
                  alt={alumni.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <Link to={`/alumni/${alumni.id}`}>
                <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 mb-1">
                  {alumni.name}
                </h3>
              </Link>
              
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Batch {alumni.batch}</span>
              </div>
              
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {alumni.course}
              </span>
            </div>
          </div>

          {/* Professional Info */}
          <div className="space-y-2 mb-4">
            {alumni.position && (
              <div className="flex items-center text-sm text-gray-700">
                <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium">{alumni.position}</span>
              </div>
            )}
            
            {alumni.company && (
              <div className="flex items-center text-sm text-gray-700">
                <Building2 className="h-4 w-4 mr-2 text-gray-500" />
                <span>{alumni.company}</span>
              </div>
            )}
            
            {alumni.location && (
              <div className="flex items-center text-sm text-gray-700">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                <span>{alumni.location}</span>
              </div>
            )}
          </div>

          {/* Bio Section */}
          {alumni.bio && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                {alumni.bio}
              </p>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-end pt-2 border-t border-gray-100">
            <Link to={`/alumni/${alumni.id}`}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                View Profile
                <ArrowRight className="w-4 h-4 ml-1" />
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}