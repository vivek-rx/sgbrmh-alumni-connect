import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  link: string;
  delay?: number;
}

export function FeatureCard({ title, description, icon: Icon, link, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="block"
    >
      <Link to={link} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow block">
        <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </Link>
    </motion.div>
  );
}