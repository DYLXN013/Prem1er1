import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CheckoutForm } from '../components/payments/CheckoutForm';
import { Crown, Check, ArrowLeft, Play } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const Payment: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [processing, setProcessing] = useState(false);

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated after loading is complete, redirect to auth
  if (!user) {
    console.log('Payment page: No user found, redirecting to auth');
    navigate('/auth');
    return null;
  }

  console.log('Payment page: User authenticated, showing payment form');

  const handleSkipForNow = () => {
    // Allow user to skip payment and go to home for now
    navigate('/');
  };

  const handlePaymentSuccess = () => {
    // After successful payment, redirect to home
    navigate('/');
  };

  const membershipFeatures = [
    'Unlimited live match streaming',
    'Full access to match highlights',
    'HD quality (1080p) streaming',
    'Ad-free viewing experience',
    'Multiple device support',
    'Offline downloads for mobile',
    'Exclusive behind-the-scenes content',
    'Priority customer support'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Play className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Prem1er 1
              </span>
            </div>
            <button
              onClick={handleSkipForNow}
              className="text-gray-400 hover:text-white flex items-center space-x-2 transition-colors"
            >
              <span>Skip for now</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Welcome & Features */}
          <div className="text-white">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Welcome to{' '}
                <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  Premier Football
                </span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Your account has been created successfully! Complete your membership to unlock unlimited access to premium football content.
              </p>
            </div>

            {/* Membership Benefits */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Premium Membership</h3>
                  <p className="text-gray-400">Everything you need for the ultimate football experience</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {membershipFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Info */}
            <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 rounded-2xl p-6 border border-blue-500/20">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">£14.99</div>
                <div className="text-blue-300 text-lg">per month</div>
                <div className="text-gray-400 text-sm mt-2">Cancel anytime • No commitment</div>
              </div>
            </div>
          </div>

          {/* Right side - Payment Form */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-3xl border border-gray-800/50 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Complete Your Membership</h2>
              <p className="text-gray-400">Enter your payment details to get started</p>
            </div>

            <Elements stripe={stripePromise}>
              <CheckoutForm 
                amount={1499} // £14.99 in pence
                currency="gbp"
                onSuccess={handlePaymentSuccess}
                onProcessing={setProcessing}
              />
            </Elements>

            <div className="mt-6 text-center">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                <span className="flex items-center space-x-1">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span>Secure SSL encryption</span>
                </span>
                <span>•</span>
                <span>Protected by Stripe</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={handleSkipForNow}
                disabled={processing}
                className="text-gray-400 hover:text-white text-sm transition-colors disabled:opacity-50"
              >
                I'll do this later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 