
import { ReactNode } from 'react';
import Navigation from './Navigation';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // TODO: Add real authentication check
  const isAuthenticated = true; // Mock - will be replaced with real auth check

  if (!isAuthenticated) {
    // Redirect to auth page or show login form
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Navigation />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default ProtectedRoute;
