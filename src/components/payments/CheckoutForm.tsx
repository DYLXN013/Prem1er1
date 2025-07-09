import React, { useState, useEffect } from 'react';
import {
  useStripe,
  useElements,
  CardElement
} from '@stripe/react-stripe-js';
import { CreditCard, Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';

interface CheckoutFormProps {
  amount: number; // Amount in pence
  currency: string;
  onSuccess: () => void;
  onProcessing: (processing: boolean) => void;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  amount,
  currency,
  onSuccess,
  onProcessing
}) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [demoMode, setDemoMode] = useState(false);

  // Create payment intent when component mounts
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            currency,
          }),
        });

        if (!response.ok) {
          throw new Error('API not available');
        }

        const { client_secret } = await response.json();
        setClientSecret(client_secret);
      } catch (_err) {
        console.log('Backend API not available, using demo mode');
        setDemoMode(true);
        // In demo mode, we'll simulate the payment without actually processing it
      }
    };

    createPaymentIntent();
  }, [amount, currency]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);
    onProcessing(true);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card information is required');
      setProcessing(false);
      onProcessing(false);
      return;
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      if (demoMode) {
        // Demo mode - simulate successful payment
        console.log('Demo mode: Simulating successful payment');
        setSucceeded(true);
        setProcessing(false);
        onProcessing(false);
        
        // Call success callback after a brief delay to show success state
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        // Real Stripe integration
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          }
        });

        if (result.error) {
          setError(result.error.message || 'Payment failed');
          setProcessing(false);
          onProcessing(false);
        } else {
          setSucceeded(true);
          setProcessing(false);
          onProcessing(false);
          
          setTimeout(() => {
            onSuccess();
          }, 1500);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed. Please try again.';
      setError(errorMessage);
      setProcessing(false);
      onProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        '::placeholder': {
          color: '#9ca3af',
        },
        backgroundColor: 'transparent',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
    hidePostalCode: true,
  };

  if (succeeded) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Payment Successful!</h3>
        <p className="text-gray-300">
          Welcome to Premier Football! Your membership is now active.
        </p>
        {demoMode && (
          <p className="text-yellow-400 text-sm mt-2">
            (Demo mode - no real payment was processed)
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {demoMode && (
        <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-xl p-4 flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div className="text-sm text-yellow-400">
            <strong>Demo Mode:</strong> Backend API not configured. 
            Use test card 4242 4242 4242 4242 to simulate payment.
          </div>
        </div>
      )}

      {/* Card Information */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>Card Information</span>
          </div>
        </label>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 focus-within:border-blue-500 transition-colors">
          <CardElement 
            options={cardElementOptions}
            onChange={(event) => {
              if (event.error) {
                setError(event.error.message || 'Invalid card information');
              } else {
                setError(null);
              }
            }}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-4 flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Payment Summary */}
      <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Monthly Membership</span>
          <span className="text-white font-semibold">
            £{(amount / 100).toFixed(2)}
          </span>
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Recurring monthly billing • Cancel anytime
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || processing || succeeded}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 py-4 text-lg font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
            <span>Processing...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <Lock className="w-5 h-5" />
            <span>
              {demoMode ? 'Demo: ' : ''}Subscribe for £{(amount / 100).toFixed(2)}/month
            </span>
          </div>
        )}
      </Button>

      {/* Security Notice */}
      <div className="text-center text-xs text-gray-400">
        <div className="flex items-center justify-center space-x-2">
          <Lock className="w-3 h-3" />
          <span>Your payment information is secure and encrypted</span>
        </div>
      </div>
    </form>
  );
}; 