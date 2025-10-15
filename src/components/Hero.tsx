import { Link } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

export function Hero() {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      background: [
        'linear-gradient(45deg, #ea580c, #991b1b, #d97706)',
        'linear-gradient(135deg, #f97316, #7c2d12, #eab308)',
        'linear-gradient(225deg, #ea580c, #991b1b, #d97706)'
      ],
      transition: {
        duration: 8,
        repeat: Infinity,
        repeatType: 'reverse'
      }
    });
  }, [controls]);

  const typewriterText = "Jai Shree Krishna";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-orange-600 via-red-800 to-yellow-600"
        animate={controls}
      />
      
      {/* Mandala Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <motion.circle
            cx="20" cy="30" r="15" fill="none" stroke="white" strokeWidth="0.5"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.circle
            cx="80" cy="70" r="12" fill="none" stroke="white" strokeWidth="0.3"
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />
          <motion.path
            d="M50,20 L60,40 L50,60 L40,40 Z" fill="none" stroke="white" strokeWidth="0.4"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
        {/* Spiritual Greeting with Typewriter Effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mb-8"
        >
          <motion.h1 
            className="text-2xl md:text-3xl font-serif text-yellow-200 mb-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            {typewriterText.split('').map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1, delay: 1.5 + index * 0.1 }}
              >
                {char}
              </motion.span>
            ))}
          </motion.h1>
        </motion.div>

        {/* Main Headline */}
        <motion.h2 
          className="text-4xl md:text-7xl font-bold mb-6 leading-tight"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.5 }}
        >
          Shri GB Rathi Maheshwari
          <br />
          <span className="bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">
            Hostel Alumni Connect
          </span>
        </motion.h2>

        {/* Subheading */}
        <motion.p
          className="text-xl md:text-2xl mb-12 text-orange-100 max-w-4xl mx-auto leading-relaxed"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 3 }}
        >
          A platform to connect alumni and students for mentorship, 
          opportunities, and lifelong bonding
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row justify-center gap-6"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 3.5 }}
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Link 
              to="/alumni" 
              className="inline-block px-8 py-4 bg-white backdrop-blur-md text-black rounded-full border border-white hover:bg-white hover:text-red-800 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl"
            >
              Explore Alumni
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Link 
              to="/auth/register" 
              className="inline-block px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-red-900 rounded-full hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl"
            >
              Join Network
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 4 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
        >
          <motion.div 
            className="w-1 h-3 bg-white/70 rounded-full mt-2"
            animate={{ height: [12, 6, 12] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}