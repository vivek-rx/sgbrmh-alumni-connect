import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <div className="bg-gradient-to-r from-orange-500 via-red-800 to-yellow-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-white">
        <motion.h1 
          className="text-4xl md:text-6xl font-bold mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          🎓 Shri GB Rathi Maheshwari Hostel Alumni Connect
        </motion.h1>
        
        <motion.p
          className="text-xl md:text-2xl mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          🙏 Jai Shree Krishna ✨
        </motion.p>

        <motion.p
          className="text-lg md:text-xl mb-12 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          A platform to connect alumni and students for mentorship, 
          opportunities, and lifelong bonding.
        </motion.p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/alumni" className="btn-primary bg-white text-primary hover:bg-gray-100">
            Explore Alumni
          </Link>
          <Link to="/auth/register" className="btn-outline text-white border-white hover:bg-white/10">
            Join Network
          </Link>
        </div>
      </div>
    </div>
  );
}