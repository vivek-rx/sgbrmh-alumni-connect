import { motion } from 'framer-motion';
import { AlumniCard } from '@/components/AlumniCard';
import { Search, Filter, Users } from 'lucide-react';
import { useState } from 'react';

// Sample data - replace with real data from your database later
const sampleAlumni = [
  {
    id: '1',
    name: 'Raj Sharma',
    batch: '2018',
    course: 'Computer Engineering',
    company: 'Google',
    position: 'Senior Software Engineer',
    location: 'Bangalore, India',
    avatar: '/default-avatar.png',
    bio: 'Passionate about building scalable systems and mentoring junior developers. Love to contribute to open source projects.'
  },
  {
    id: '2',
    name: 'Priya Patel',
    batch: '2020',
    course: 'Information Technology',
    company: 'Microsoft',
    position: 'Product Manager',
    location: 'Seattle, USA',
    avatar: '/default-avatar.png',
    bio: 'Focused on creating user-centric products that make a real difference. Always excited to help fellow alumni.'
  },
  {
    id: '3',
    name: 'Arjun Mehta',
    batch: '2017',
    course: 'Mechanical Engineering',
    company: 'Tesla',
    position: 'Design Engineer',
    location: 'California, USA',
    avatar: '/default-avatar.png',
    bio: 'Working on sustainable transportation solutions. Happy to share insights about automotive industry.'
  },
  {
    id: '4',
    name: 'Sneha Reddy',
    batch: '2019',
    course: 'Electronics Engineering',
    company: 'Amazon',
    position: 'Technical Lead',
    location: 'Hyderabad, India',
    avatar: '/default-avatar.png',
    bio: 'Leading cross-functional teams to deliver innovative solutions. Passionate about mentoring and career growth.'
  },
  {
    id: '5',
    name: 'Vikram Singh',
    batch: '2016',
    course: 'Civil Engineering',
    company: 'L&T Construction',
    position: 'Project Manager',
    location: 'Mumbai, India',
    avatar: '/default-avatar.png',
    bio: 'Managing large-scale infrastructure projects. Always ready to share construction industry insights.'
  },
  {
    id: '6',
    name: 'Ananya Joshi',
    batch: '2021',
    course: 'Computer Science',
    company: 'Startrup Inc',
    position: 'Full Stack Developer',
    location: 'Pune, India',
    avatar: '/default-avatar.png',
    bio: 'Building the next generation of web applications. Love exploring new technologies and frameworks.'
  }
];

export default function Alumni() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('all');

  const filteredAlumni = sampleAlumni.filter(alumni => {
    const matchesSearch = alumni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alumni.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alumni.position?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBatch = selectedBatch === 'all' || alumni.batch === selectedBatch;
    return matchesSearch && matchesBatch;
  });

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
              <div className="text-3xl font-bold">{sampleAlumni.length}+</div>
              <div className="text-orange-200">Alumni</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">15+</div>
              <div className="text-orange-200">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">8+</div>
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
                placeholder="Search by name, company, or position..."
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
                <option value="2021">2021</option>
                <option value="2020">2020</option>
                <option value="2019">2019</option>
                <option value="2018">2018</option>
                <option value="2017">2017</option>
                <option value="2016">2016</option>
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
            Showing {filteredAlumni.length} alumni
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
          {filteredAlumni.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAlumni.map((alumni, index) => (
                <AlumniCard 
                  key={alumni.id} 
                  alumni={alumni} 
                  index={index}
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
              <p className="text-gray-500">Try adjusting your search criteria</p>
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
          <motion.button
            className="px-8 py-4 bg-white text-orange-600 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Register as Alumni
          </motion.button>
        </div>
      </motion.section>
    </div>
  );
}