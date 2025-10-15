import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export function CallToAction() {
  const handleRegisterClick = () => {
    console.log('🎯 CallToAction: Register Now button clicked');
  };

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Maroon Background with Floating Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900 to-red-800">
        {/* Floating Animated Elements */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            className="absolute top-20 left-20 w-32 h-32 bg-yellow-400 rounded-full"
            animate={{
              y: [0, -20, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-40 right-40 w-24 h-24 bg-orange-400 rounded-full"
            animate={{
              y: [0, 30, 0],
              rotate: [0, -180, -360]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 left-1/3 w-16 h-16 bg-yellow-300"
            style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Glassmorphism Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-3xl blur opacity-25"></div>
          <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20">
            
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Be Part of a{' '}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                50+ Year Legacy
              </span>
            </motion.h2>

            <motion.p 
              className="text-xl text-red-100 mb-8 leading-relaxed max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              Join our thriving community of alumni and students. Share your experiences, 
              guide the next generation, and build lasting professional relationships.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link 
                  to="/auth/register"
                  onClick={handleRegisterClick}
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-red-900 transition-all duration-300 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full hover:from-yellow-300 hover:to-orange-300 shadow-lg hover:shadow-xl"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></span>
                  <span className="relative">Register Now</span>
                  <motion.svg 
                    className="relative ml-2 w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </motion.svg>
                </Link>
              </motion.div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-white/80"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              viewport={{ once: true }}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-300">Verified</div>
                <div className="text-sm">Alumni Network</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-300">Secure</div>
                <div className="text-sm">Platform</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-300">Active</div>
                <div className="text-sm">Community</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}