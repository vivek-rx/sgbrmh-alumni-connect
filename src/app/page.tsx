import { Users, BookOpen, Calendar, Briefcase } from 'lucide-react';
import { Hero } from '@/components/Hero';
import { FeatureCard } from '@/components/FeatureCard';
import { About } from '@/components/About';
import { CallToAction } from '@/components/CallToAction';

export default function Home() {
  const features = [
    {
      title: 'Alumni Directory',
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

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Platform Features
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to connect, share and grow with the hostel community
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                link={feature.link}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 text-center">
            <div className="text-white">
              <div className="text-4xl font-bold">500+</div>
              <div className="mt-2">Alumni Members</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold">50+</div>
              <div className="mt-2">Years Legacy</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold">100+</div>
              <div className="mt-2">Active Mentors</div>
            </div>
          </div>
        </div>
      </section>

      <CallToAction />
    </div>
  )
}