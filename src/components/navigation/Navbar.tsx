import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, Settings, LogOut, Play, Menu, X, Shield, Users, CreditCard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useModeration } from '../../hooks/useModeration';
import { AuthModal } from '../auth/AuthModal';
import { SearchModal } from '../search/SearchModal';
import { NotificationCenter } from '../notifications/NotificationCenter';

export const Navbar: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isModerator, setIsModerator] = useState(false);
  
  const location = useLocation();
  const { user, signOut, loading } = useAuth();
  const { checkModerationPermissions } = useModeration();

  React.useEffect(() => {
    const checkPermissions = async () => {
      if (user) {
        const hasPermissions = await checkModerationPermissions();
        setIsModerator(hasPermissions);
      }
    };
    checkPermissions();
  }, [user]);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Live', href: '/live' },
    { name: 'Highlights', href: '/highlights' },
    { name: 'Calendar', href: '/calendar' }
  ];

  const isActive = (href: string) => location.pathname === href;

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
    setIsUserMenuOpen(false); // Close user menu if open
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <>
      <nav className="bg-black/95 backdrop-blur-sm shadow-2xl border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Prem1er 1
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive(item.href)
                      ? 'text-white bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Search, Notifications and User Menu */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-300"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Notifications (only for authenticated users) */}
              {user && <NotificationCenter />}

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-800/50 transition-all duration-300 group"
                  >
                    <img
                      src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}&background=3b82f6&color=fff`}
                      alt={user.username}
                      className="w-8 h-8 rounded-full ring-2 ring-transparent group-hover:ring-blue-500/50 transition-all"
                    />
                    <span className="hidden sm:block text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                      {user.username}
                    </span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl py-2 z-50">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </Link>
                      <Link
                        to="/billing"
                        className="flex items-center px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <CreditCard className="w-4 h-4 mr-3" />
                        Billing
                      </Link>
                      {isModerator && (
                        <Link
                          to="/moderation"
                          className="flex items-center px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Shield className="w-4 h-4 mr-3" />
                          Moderation
                        </Link>
                      )}
                      <hr className="my-2 border-gray-800" />
                      <button 
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all"
                        disabled={loading}
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        {loading ? 'Signing out...' : 'Sign Out'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => openAuthModal('signin')}
                    className="text-gray-300 hover:text-white px-4 py-2 text-sm font-medium transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-800 py-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    isActive(item.href)
                      ? 'text-white bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 mx-2'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50 mx-2'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {isModerator && (
                <Link
                  to="/moderation"
                  className="block px-4 py-3 rounded-xl text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 mx-2 transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Moderation Panel
                </Link>
              )}
              
              {/* Mobile Auth Buttons */}
              {!user && (
                <div className="mt-4 px-2 space-y-2">
                  <button
                    onClick={() => {
                      openAuthModal('signin');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-gray-300 hover:text-white px-4 py-3 text-base font-medium transition-colors text-center border border-gray-700 rounded-xl hover:bg-gray-800/50"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      openAuthModal('signup');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-xl text-base font-medium transition-all duration-300"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Modals */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
      
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authMode}
      />
    </>
  );
};