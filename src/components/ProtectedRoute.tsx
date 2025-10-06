import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  console.log('🛡️ ProtectedRoute: Checking access, adminOnly:', adminOnly);
  
  const { user, profile, loading } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);
  
  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('⏰ ProtectedRoute: Loading timeout reached, forcing continue');
        setTimeoutReached(true);
      }
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(timeout);
  }, [loading]);
  
  console.log('🛡️ ProtectedRoute: Auth state:', {
    user: user ? { id: user.id, email: user.email } : null,
    profile: profile ? { id: profile.id, name: profile.name } : null,
    loading,
    timeoutReached
  });

  // If loading and timeout hasn't reached, show spinner
  if (loading && !timeoutReached) {
    console.log('🛡️ ProtectedRoute: Still loading, showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
          <p className="text-sm text-gray-500 mt-2">This should only take a moment</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('🛡️ ProtectedRoute: No user found, redirecting to login');
    return <Navigate to="/auth/login" replace />;
  }

  if (adminOnly) {
    console.log('🛡️ ProtectedRoute: Checking admin access for user:', user.email);
    const isAdmin = user.email?.includes('admin') || false;
    console.log('🛡️ ProtectedRoute: Is admin:', isAdmin);
    
    if (!isAdmin) {
      console.log('🛡️ ProtectedRoute: Not admin, redirecting to home');
      return <Navigate to="/" replace />;
    }
  }

  console.log('🛡️ ProtectedRoute: Access granted, rendering children');
  return <>{children}</>;
}