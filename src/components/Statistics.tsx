import { motion, useInView, useAnimation } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

interface StatisticProps {
  endValue: number;
  label: string;
  suffix?: string;
  delay?: number;
}

function AnimatedCounter({ endValue, label, suffix = '', delay = 0 }: StatisticProps) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref);
  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, delay }
      });

      let startValue = 0;
      const duration = 2000; // 2 seconds
      const startTime = Date.now();

      const updateCounter = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        
        const currentValue = Math.floor(startValue + (endValue - startValue) * easedProgress);
        setCount(currentValue);

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        }
      };

      const timer = setTimeout(() => {
        updateCounter();
      }, delay * 1000);

      return () => clearTimeout(timer);
    }
  }, [inView, endValue, delay, controls]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={controls}
      className="text-center"
    >
      <motion.div 
        className="text-4xl md:text-5xl font-bold text-white mb-2"
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {count}{suffix}
      </motion.div>
      <div className="text-orange-200 text-lg">{label}</div>
    </motion.div>
  );
}

export function Statistics() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Diagonal Section with Gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-orange-600 via-red-700 to-yellow-600"
        style={{
          clipPath: 'polygon(0 15%, 100% 0%, 100% 85%, 0% 100%)'
        }}
      />
      
      {/* Floating Animated Motifs */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="absolute top-20 left-10 w-16 h-16"
          animate={{
            rotate: [0, 360],
            y: [0, -30, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
            <polygon points="50,10 90,90 10,90" />
          </svg>
        </motion.div>

        <motion.div
          className="absolute top-40 right-20 w-20 h-20"
          animate={{
            rotate: [0, -360],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
            <circle cx="50" cy="50" r="40" fillOpacity="0.3" />
            <circle cx="50" cy="50" r="25" fillOpacity="0.5" />
            <circle cx="50" cy="50" r="10" />
          </svg>
        </motion.div>

        <motion.div
          className="absolute bottom-32 left-1/3 w-12 h-12"
          animate={{
            rotate: [0, 180, 360],
            x: [0, 20, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
            <rect x="25" y="25" width="50" height="50" transform="rotate(45 50 50)" />
          </svg>
        </motion.div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Our Growing Community
          </h2>
          <p className="text-xl text-orange-200 max-w-2xl mx-auto">
            Building connections and fostering growth across generations of hostelites
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <AnimatedCounter 
            endValue={500} 
            suffix="+" 
            label="Alumni Members" 
            delay={0.2}
          />
          <AnimatedCounter 
            endValue={50} 
            suffix="+" 
            label="Years Legacy" 
            delay={0.4}
          />
          <AnimatedCounter 
            endValue={100} 
            suffix="+" 
            label="Active Mentors" 
            delay={0.6}
          />
        </div>

        {/* Additional Stats Row */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-orange-300/20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-200">25+</div>
            <div className="text-orange-300 text-sm">Companies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-200">80%</div>
            <div className="text-orange-300 text-sm">Placement Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-200">150+</div>
            <div className="text-orange-300 text-sm">Success Stories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-200">24/7</div>
            <div className="text-orange-300 text-sm">Support</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}