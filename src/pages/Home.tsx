import { Users, BookOpen, Calendar, Briefcase } from 'lucide-react';
import { Hero } from '../components/Hero';
import { FeatureCard } from '../components/FeatureCard';
import { About } from '../components/About';
import { Statistics } from '../components/Statistics';
import { CallToAction } from '../components/CallToAction';
import { motion } from 'framer-motion';

export default function Home() {
  const features = [
    {
      title: 'Yearbook',
      description: 'Connect with alumni from different batches and explore their professional journeys.',
      icon: Users,
      link: '/alumni'
    },
    {
      title: 'Mentorship Program',
      description: 'Get personalized guidance from experienced alumni in your field of interest.',
      icon: BookOpen,
      link: '/mentorship'
    },
    {
      title: 'Hostel Events',
      description: 'Stay updated with upcoming events, reunions, and alumni meetups.',
      icon: Calendar,
      link: '/events'
    },
    {
      title: 'Career Opportunities',
      description: 'Access exclusive job postings and internship opportunities from our network.',
      icon: Briefcase,
      link: '/jobs'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      
      <About />

      {/* Features Section with Staggered Layout */}
      <section className="relative py-20 bg-gradient-to-br from-gray-50 via-orange-50/30 to-red-50/20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-6">
              Platform Features
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full mb-4"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Everything you need to connect, share and grow with the hostel community
            </p>
          </motion.div>

          {/* Staggered Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-2">
              <FeatureCard
                title={features[0].title}
                description={features[0].description}
                icon={features[0].icon}
                link={features[0].link}
                delay={0.2}
              />
            </div>
            <div className="lg:col-span-2 lg:mt-12">
              <FeatureCard
                title={features[1].title}
                description={features[1].description}
                icon={features[1].icon}
                link={features[1].link}
                delay={0.4}
              />
            </div>
            <div className="lg:col-span-2 lg:-mt-6">
              <FeatureCard
                title={features[2].title}
                description={features[2].description}
                icon={features[2].icon}
                link={features[2].link}
                delay={0.6}
              />
            </div>
            <div className="lg:col-span-2 lg:mt-6">
              <FeatureCard
                title={features[3].title}
                description={features[3].description}
                icon={features[3].icon}
                link={features[3].link}
                delay={0.8}
              />
            </div>
          </div>
        </div>
      </section>

      <Statistics />

      <CallToAction />
    </div>
  )
}