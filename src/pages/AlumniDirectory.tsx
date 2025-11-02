import { motion } from 'framer-motion';
import { AlumniCard } from '@/components/AlumniCard';
import { Search, Filter, Users, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';

interface AlumniData {
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
  role?: string;
  created_at?: string;
}

export default function AlumniDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [alumni, setAlumni] = useState<AlumniData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth(); // Get current logged-in user info

  // Check if current user is verified
  const isCurrentUserVerified = profile?.verified || false;

  // Fetch alumni from database
  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching alumni from database...');
      const { data, error: fetchError } = await supabase
        .from('alumni')
        .select('*')
        .neq('role', 'admin') // Exclude admin users from directory
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('❌ Error fetching alumni:', fetchError);
        throw fetchError;
      }

      console.log('✅ Alumni fetched successfully:', data);
      console.log('📊 Total alumni count:', data?.length || 0);
      setAlumni(data || []);
    } catch (err: any) {
      console.error('Failed to fetch alumni:', err);
      setError(err.message || 'Failed to load alumni');
      toast.error('Failed to load alumni directory');
    } finally {
      setLoading(false);
    }
  };

  const filteredAlumni = alumni.filter(alum => {
    const matchesSearch = alum.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alum.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alum.current_city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alum.current_country?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBatch = selectedBatch === 'all' || alum.batch_year.toString() === selectedBatch;
    return matchesSearch && matchesBatch;
  });

  // Get unique batch years from alumni data
  const batchYears = Array.from(new Set(alumni.map(a => a.batch_year))).sort((a, b) => b - a);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.6
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Hero Header */}
      <motion.section 
        className="relative py-16 bg-gradient-to-r from-orange-600 via-red-700 to-orange-800 overflow-hidden"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <defs>
              <pattern id="alumni-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="2" fill="white" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#alumni-grid)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            className="text-5xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Alumni Directory
          </motion.h1>
          <motion.p 
            className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Connect with our amazing alumni community across the globe
          </motion.p>
          
          {/* Stats */}
          <motion.div 
            className="flex justify-center space-x-8 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="text-center">
              <div className="text-3xl font-bold">{alumni.length}</div>
              <div className="text-orange-200">Alumni</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{alumni.filter(a => a.verified).length}</div>
              <div className="text-orange-200">Verified</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{new Set(alumni.map(a => a.current_country).filter(Boolean)).size}</div>
              <div className="text-orange-200">Countries</div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Search and Filters */}
      <motion.section 
        className="py-8 bg-white/50 backdrop-blur-sm border-b border-orange-200/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or location..."
                className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Batch Filter */}
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-600" />
              <select
                className="px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
              >
                <option value="all">All Batches</option>
                {batchYears.map(year => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Info */}
          <motion.div 
            className="mt-4 text-center text-gray-600"
            key={filteredAlumni.length}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            Showing {filteredAlumni.length} of {alumni.length} alumni
          </motion.div>
        </div>
      </motion.section>

      {/* Alumni Cards Grid */}
      <motion.section 
        className="py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 text-orange-500 animate-spin mb-4" />
              <p className="text-gray-600">Loading alumni directory...</p>
            </div>
          ) : error ? (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Error loading alumni</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <button
                onClick={fetchAlumni}
                className="px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          ) : filteredAlumni.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAlumni.map((alum, index) => (
                <AlumniCard 
                  key={alum.id} 
                  alumni={alum} 
                  index={index}
                  canViewProfile={isCurrentUserVerified}
                />
              ))}
            </div>
          ) : (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No alumni found</h3>
              <p className="text-gray-500">
                {alumni.length === 0 
                  ? 'No alumni registered yet. Be the first to join!' 
                  : 'Try adjusting your search criteria'}
              </p>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-16 bg-gradient-to-r from-orange-500 to-red-600"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join Our Alumni Network
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Connect, share experiences, and help the next generation grow
          </p>
          <motion.a
            href="/auth/register"
            className="inline-block px-8 py-4 bg-white text-orange-600 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Register as Alumni
          </motion.a>
        </div>
      </motion.section>
    </div>
  );
}