import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              About Alumni Connect
            </h3>
            <p className="text-sm">
              Connecting past and present students of Shri GB Rathi Maheshwari Hostel
              to foster mentorship and create opportunities.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/alumni" className="hover:text-white transition-colors">
                  Alumni Directory
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-white transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              Contact Us
            </h3>
            <div className="space-y-3">
              <p className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                123 Hostel Road, Pune, Maharashtra
              </p>
              <p className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                +91 98765 43210
              </p>
              <p className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                contact@gbrathihostel.org
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="text-sm">
            © {currentYear} Shri GB Rathi Maheshwari Hostel Alumni Connect.
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}