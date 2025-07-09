import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  fallback = <AuthLoadingFallback /> 
}) => {
  const { loading } = useAuth();
  const [forceShow, setForceShow] = useState(false);

  // Emergency fallback: if loading persists for more than 8 seconds, force show content
  useEffect(() => {
    const emergencyTimeout = setTimeout(() => {
      console.warn('Auth loading exceeded 8 seconds, forcing content display');
      setForceShow(true);
    }, 8000);

    return () => clearTimeout(emergencyTimeout);
  }, []);

  // Reset force show when loading changes
  useEffect(() => {
    if (!loading) {
      setForceShow(false);
    }
  }, [loading]);

  if (loading && !forceShow) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

const AuthLoadingFallback: React.FC = () => {
  const [showTrouble, setShowTrouble] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTrouble(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-400 mb-2">Loading...</p>
        
        {showTrouble && (
          <div className="mt-4">
            <p className="text-gray-500 text-sm mb-3">Taking longer than usual?</p>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-400 hover:text-blue-300 text-sm underline"
            >
              Refresh Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 