import { Link } from 'react-router-dom';

export function CallToAction() {
  return (
    <section className="py-16 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to Connect?
        </h2>
        <p className="text-xl text-primary-light mb-8 max-w-2xl mx-auto">
          Join our growing community of alumni and students. Start your journey of meaningful connections today.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/auth/register"
            className="bg-white text-primary px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Started
          </Link>
          <Link
            to="/alumni"
            className="border-2 border-white text-white px-8 py-3 rounded-md font-semibold hover:bg-white hover:text-primary transition-colors"
          >
            Browse Alumni
          </Link>
        </div>
      </div>
    </section>
  );
}