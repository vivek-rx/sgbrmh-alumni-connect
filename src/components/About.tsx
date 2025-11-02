import { motion } from 'framer-motion';

export function About() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Diagonal Background Split */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-white"></div>
        <div 
          className="absolute inset-0 bg-gradient-to-tl from-red-50 to-transparent"
          style={{
            clipPath: 'polygon(60% 0%, 100% 0%, 100% 100%, 20% 100%)'
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Image Collage */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="max-w-md mx-auto">
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
                  <div className="relative bg-white/30 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                    <img 
                      src="/entrnce.png"
                      alt="Hostel Heritage" 
                      className="rounded-md object-cover w-full h-48"
                    />
                  </div>
                </div>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-red-400 to-orange-400 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
                  <div className="relative bg-white/30 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                    <img 
                      src="/rathii.jpg" 
                      alt="Alumni Success" 
                      className="rounded-md object-cover w-full h-48"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Side - Content */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Connecting Generations of 
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {' '}Excellence
                </span>
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
            </motion.div>

            <motion.p 
              className="text-lg text-gray-700 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              This platform is built for alumni and students of Shri GB Rathi Maheshwari Hostel, Pune. 
              We believe in fostering a community where experience meets ambition, where wisdom is shared, 
              and where lifelong connections are forged.
            </motion.p>

            <motion.div 
              className="grid grid-cols-2 gap-6 py-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">15+</div>
                <div className="text-gray-600">Years of Legacy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">500+</div>
                <div className="text-gray-600">Alumni Network</div>
              </div>
            </motion.div>

            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-700">Connect with alumni across different batches</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-700">Access mentorship and career guidance</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-700">Discover opportunities and collaborations</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}