import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, Play } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export const Auth: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [justSignedUp, setJustSignedUp] = useState(false);
  const [connectionTest, setConnectionTest] = useState<string | null>(null);
  const [networkTest, setNetworkTest] = useState<string | null>(null);
  
  const { signIn, signUp, loading, user, isAuthenticated } = useAuth();

  // Test basic network connectivity
  const testNetwork = async () => {
    try {
      setNetworkTest('Testing basic network...');
      console.log('Testing basic network connectivity...');
      
      // Test 1: Basic fetch to a reliable endpoint
      const response = await fetch('https://httpbin.org/get', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        setNetworkTest('Network OK, testing Supabase URL...');
        console.log('Basic network test: SUCCESS');
        
        // Test 2: Basic fetch to Supabase URL (without auth)
        const supabaseResponse = await fetch(import.meta.env.VITE_SUPABASE_URL + '/rest/v1/', {
          method: 'GET',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Supabase URL test response:', supabaseResponse.status, supabaseResponse.statusText);
        
        if (supabaseResponse.status === 200 || supabaseResponse.status === 401) {
          setNetworkTest('Supabase URL reachable! Issue might be with auth.getSession()');
        } else {
          setNetworkTest(`Supabase URL issue: ${supabaseResponse.status} ${supabaseResponse.statusText}`);
        }
      } else {
        setNetworkTest(`Network issue: ${response.status}`);
      }
    } catch (error) {
      console.error('Network test error:', error);
      setNetworkTest(`Network test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Test Supabase connection
  const testConnection = async () => {
    try {
      setConnectionTest('Testing Supabase connection...');
      console.log('Testing Supabase connection...');
      
      // Test 1: Check if we can reach the auth endpoint directly
      setConnectionTest('Testing Supabase auth endpoint...');
      try {
        const authResponse = await fetch(import.meta.env.VITE_SUPABASE_URL + '/auth/v1/token?grant_type=password', {
          method: 'POST',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({}) // Empty body, just testing endpoint reachability
        });
        
        console.log('Auth endpoint test:', authResponse.status, authResponse.statusText);
        setConnectionTest(`Auth endpoint reachable: ${authResponse.status}`);
      } catch (authError) {
        console.error('Auth endpoint test failed:', authError);
        setConnectionTest(`Auth endpoint failed: ${authError instanceof Error ? authError.message : 'Unknown error'}`);
        return;
      }
      
      // Test 2: Try a simpler Supabase client operation
      setConnectionTest('Testing Supabase client operation...');
      try {
        // Simple check that the client is initialized
        console.log('Supabase client initialized, testing auth.getSession()...');
        setConnectionTest(`Client initialized OK, testing auth.getSession()...`);
      } catch (clientError) {
        console.error('Supabase client issue:', clientError);
        setConnectionTest(`Client config error: ${clientError instanceof Error ? clientError.message : 'Unknown error'}`);
        return;
      }
      
      // Test 3: The actual problematic call with timeout
      setConnectionTest('Testing auth.getSession() with timeout...');
      const connectionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection test timed out after 10 seconds')), 10000);
      });

      const { data, error } = await Promise.race([connectionPromise, timeoutPromise]) as any;
      console.log('Connection test result:', { data: !!data, error });
      
      if (error) {
        setConnectionTest(`Connection error: ${error.message}`);
      } else {
        setConnectionTest('Supabase connection successful!');
        // Clear after 3 seconds
        setTimeout(() => setConnectionTest(null), 3000);
      }
    } catch (error) {
      console.error('Connection test error:', error);
      setConnectionTest(`Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Emergency timeout for button loading state
  useEffect(() => {
    if (localLoading) {
      const timeout = setTimeout(() => {
        console.warn('Auth operation timeout, resetting local loading state');
        // Check if the main loading is still active - if so, this might be a real issue
        if (loading) {
          setError('Signup is taking longer than expected. Please try again or check your internet connection.');
        }
        setLocalLoading(false);
      }, 15000); // Increased to 15 seconds to give more time

      return () => clearTimeout(timeout);
    }
  }, [localLoading, loading]);

  // Handle navigation after successful authentication
  useEffect(() => {
    console.log('Auth state changed:', { 
      isAuthenticated, 
      user: !!user, 
      isSigningUp, 
      justSignedUp, 
      mode 
    });

    if (isAuthenticated && user) {
      setLocalLoading(false); // Reset local loading state
      
      if (justSignedUp || (isSigningUp && mode === 'signup')) {
        console.log('Redirecting new user to payment page');
        setSuccess('Account created successfully! You are now logged in.');
        setIsSigningUp(false);
        setJustSignedUp(false);
        
        // Short delay to show success message, then navigate to payment
        setTimeout(() => {
          navigate('/payment');
        }, 1500);
      } else if (mode === 'signin') {
        console.log('Redirecting signed-in user');
        // For signin, navigate to redirect or home
        const redirectTo = searchParams.get('redirect') || '/';
        navigate(redirectTo);
      }
    }
  }, [isAuthenticated, user, isSigningUp, justSignedUp, mode, searchParams, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLocalLoading(true);

    try {
      if (mode === 'signup') {
        if (!username.trim()) {
          setError('Username is required');
          setLocalLoading(false);
          return;
        }
        console.log('Starting signup process...');
        setIsSigningUp(true);
        setJustSignedUp(true); // Set flag to track this is a new signup
        await signUp(email, password, username);
        console.log('Signup completed, waiting for auth state update...');
        // Navigation will be handled by the useEffect when user state updates
      } else {
        console.log('Starting signin process...');
        await signIn(email, password);
        console.log('Signin completed, waiting for auth state update...');
        // Navigation will be handled by the useEffect when user state updates
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'An error occurred');
      setIsSigningUp(false);
      setJustSignedUp(false);
      setLocalLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setError(null);
    setSuccess(null);
    setShowPassword(false);
  };

  const switchMode = () => {
    const newMode = mode === 'signin' ? 'signup' : 'signin';
    setMode(newMode);
    resetForm();
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-blue-800/20" />
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-5" />
        
        {/* Animated background elements */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 h-full flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12">
          <div className="max-w-md">
            {/* Back to Home */}
            <Link
              to="/"
              className="inline-flex items-center space-x-2 text-gray-400 hover:text-white mb-8 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </Link>

            {/* Logo/Brand */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center">
                <Play className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Premier Football</h1>
            </div>

            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              {mode === 'signin' ? 'Welcome Back' : 'Join the Action'}
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              {mode === 'signin' 
                ? 'Access live matches, highlights, and create watch parties with friends.'
                : 'Get access to premium football content and never miss a moment of the beautiful game.'
              }
            </p>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-gray-300">Live match streaming</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-gray-300">Exclusive highlights</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-gray-300">Watch parties with friends</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            {/* Mobile back button */}
            <div className="lg:hidden mb-6">
              <Link
                to="/"
                className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Home</span>
              </Link>
            </div>

            {/* Form Container */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-3xl border border-gray-800/50 p-8 shadow-2xl">
              {/* Form Header */}
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-white mb-2">
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                </h3>
                <p className="text-gray-400">
                  {mode === 'signin' 
                    ? 'Enter your credentials to access your account'
                    : 'Fill in your details to get started'
                  }
                </p>
              </div>

              {/* Debug section */}
              <div className="mb-6 space-y-2">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={testNetwork}
                    className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                    disabled={!!networkTest}
                  >
                    Test Network
                  </button>
                  <button
                    onClick={testConnection}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    disabled={!!connectionTest}
                  >
                    Test Supabase
                  </button>
                  <button
                    onClick={() => {
                      // Direct test of signup endpoint without getSession()
                      const uniqueEmail = `test${Date.now()}@example.com`;
                      setConnectionTest('Testing direct signup...');
                      supabase.auth.signUp({
                        email: uniqueEmail,
                        password: 'testpass123'
                      }).then(result => {
                        console.log('Direct signup test result:', result);
                        if (result.error) {
                          setConnectionTest(`Signup test error: ${result.error.message}`);
                        } else {
                          setConnectionTest('✅ Direct signup works! Try your real signup now.');
                        }
                      }).catch(error => {
                        console.error('Direct signup test failed:', error);
                        setConnectionTest(`Direct signup failed: ${error.message}`);
                      });
                    }}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    disabled={!!connectionTest}
                  >
                    Test Signup
                  </button>
                </div>
                {networkTest && (
                  <div className="text-xs text-yellow-300 bg-yellow-900/30 p-2 rounded">
                    {networkTest}
                  </div>
                )}
                {connectionTest && (
                  <div className="text-xs text-blue-300 bg-blue-900/30 p-2 rounded">
                    {connectionTest}
                  </div>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 transition-all"
                        placeholder="Enter your username"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 transition-all"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 transition-all"
                      placeholder="Enter your password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-4">
                    <p className="text-sm text-red-400">{error}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Check the browser console for detailed error logs.
                    </p>
                  </div>
                )}

                {success && (
                  <div className="bg-green-900/20 border border-green-800/50 rounded-xl p-4">
                    <p className="text-sm text-green-400">{success}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 py-4 text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                  disabled={loading || localLoading}
                >
                  {(loading || localLoading) ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
                </Button>
              </form>

              {/* Switch Mode */}
              <div className="mt-8 text-center">
                <p className="text-gray-400">
                  {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
                  <button
                    onClick={switchMode}
                    className="ml-2 text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                  >
                    {mode === 'signin' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 