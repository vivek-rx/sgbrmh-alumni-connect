import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../lib/auth';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut, emergencySignOut } = useAuth();
  
  console.log('🧭 Navbar: Rendering with auth state:', {
    user: user ? { id: user.id, email: user.email } : null,
    profile: profile ? { id: profile.id, name: profile.name } : null,
    hasSignOut: !!signOut
  });

  const navigation = [
    { name: 'Home', to: '/' },
    { name: 'Alumni Directory', to: '/alumni' },
    { name: 'Jobs', to: '/jobs' },
    { name: 'Events', to: '/events' },
  ];

  const handleProfileClick = () => {
    console.log('🧭 Navbar: Profile button clicked');
  };

  const handleLogoutClick = async () => {
    console.log('🧭 Navbar: Logout button clicked');
    
    // Set a maximum wait time for logout
    const timeoutId = setTimeout(() => {
      console.log('⏰ Navbar: Logout timeout, using emergency logout...');
      emergencySignOut();
    }, 3000);
    
    try {
      await signOut();
      console.log('🧭 Navbar: Regular logout successful');
      clearTimeout(timeoutId);
    } catch (error) {
      console.error('🧭 Navbar: Regular logout failed:', error);
      clearTimeout(timeoutId);
      // Use emergency logout as backup
      console.log('🧭 Navbar: Using emergency logout...');
      emergencySignOut();
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/">
              <img
                src="/logo.png"
                alt="Alumni Connect"
                width={40}
                height={40}
                className="h-13 w-60"
              />
         
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                className="text-gray-700 hover:text-primary px-3 py-2 rounded-md"
              >
                {item.name}
              </Link>
            ))}
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  onClick={handleProfileClick}
                  className="flex items-center text-gray-700 hover:text-primary"
                >
                  <User className="h-5 w-5 mr-1" />
                  Profile
                </Link>
                <button
                  onClick={handleLogoutClick}
                  className="flex items-center text-gray-700 hover:text-primary"
                >
                  <LogOut className="h-5 w-5 mr-1" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/auth/login"
                className="btn-primary"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                className="block px-3 py-2 text-gray-700 hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {user ? (
              <div className="border-t border-gray-200 pt-4 pb-3">
                <Link
                  to="/profile"
                  className="flex items-center px-3 py-2 text-gray-700 hover:text-primary"
                  onClick={() => {
                    handleProfileClick();
                    setIsOpen(false);
                  }}
                >
                  <User className="h-5 w-5 mr-2" />
                  Profile
                </Link>
                <button
                  onClick={async () => {
                    console.log('🧭 Navbar: Mobile logout clicked');
                    
                    // Close menu immediately
                    setIsOpen(false);
                    
                    // Set timeout for logout
                    const timeoutId = setTimeout(() => {
                      console.log('⏰ Navbar: Mobile logout timeout, using emergency logout...');
                      emergencySignOut();
                    }, 3000);
                    
                    try {
                      await signOut();
                      clearTimeout(timeoutId);
                      console.log('🧭 Navbar: Mobile regular logout successful');
                    } catch (error) {
                      console.error('🧭 Navbar: Mobile regular logout failed:', error);
                      clearTimeout(timeoutId);
                      console.log('🧭 Navbar: Mobile using emergency logout...');
                      emergencySignOut();
                    }
                  }}
                  className="flex items-center w-full text-left px-3 py-2 text-gray-700 hover:text-primary"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/auth/login"
                className="block px-3 py-2 text-center bg-primary text-white rounded-md mx-3 mt-4"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}