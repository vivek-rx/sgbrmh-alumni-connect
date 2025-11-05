import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../lib/auth';
import GooeyNav from './GooeyNav';

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
    { name: 'Yearbook', to: '/alumni' },
    { name: 'Jobs', to: '/jobs' },
    { name: 'Events', to: '/events' },
  ];

  // GooeyNav items - matching your website's orange-red color scheme
  const gooeyNavItems = navigation.map(item => ({
    label: item.name,
    href: item.to
  }));

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

  // Get user initials for avatar
  const getUserInitials = () => {
    if (profile?.name) {
      const names = profile.name.trim().split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return names[0].substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <nav className="bg-white shadow-md relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center z-20">
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

          {/* Desktop Navigation with GooeyNav */}
          <div className="hidden md:flex md:items-center md:space-x-6 flex-1 justify-center">
            <div style={{ height: '80px', width: '600px', position: 'relative' }}>
              <GooeyNav
                items={gooeyNavItems}
                particleCount={12}
                particleDistances={[90, 10]}
                particleR={100}
                initialActiveIndex={0}
                animationTime={600}
                timeVariance={300}
                colors={[1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4]}
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex md:items-center md:space-x-4 z-20">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Admin Dashboard Button - Only visible to admins */}
                {profile?.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Shield className="h-5 w-5 mr-2" />
                    <span className="font-semibold">Admin Dashboard</span>
                  </Link>
                )}
                
                {/* User Avatar with Initials */}
                <Link
                  to="/profile"
                  onClick={handleProfileClick}
                  className="relative group"
                >
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 cursor-pointer">
                    {getUserInitials()}
                  </div>
                  {/* Tooltip */}
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    View Profile
                  </div>
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
                {/* Admin Dashboard Button - Mobile - Only visible to admins */}
                {/* User Info Header in Mobile */}
                <div className="px-3 py-3 mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white font-bold shadow-md">
                      {getUserInitials()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{profile?.name || 'User'}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {profile?.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center px-3 py-2 mb-2 mx-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md"
                    onClick={() => setIsOpen(false)}
                  >
                    <Shield className="h-5 w-5 mr-2" />
                    <span className="font-semibold">Admin Dashboard</span>
                  </Link>
                )}
                
                <Link
                  to="/profile"
                  className="flex items-center px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md mx-3"
                  onClick={() => {
                    handleProfileClick();
                    setIsOpen(false);
                  }}
                >
                  <User className="h-5 w-5 mr-2" />
                  Edit Profile
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