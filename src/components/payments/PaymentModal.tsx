import React, { useState, useEffect } from 'react';
import { X, CreditCard, Lock, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { usePayments } from '../../hooks/usePayments';
import { SubscriptionPlan, PaymentMethod } from '../../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: SubscriptionPlan;
  billingCycle: 'monthly' | 'yearly';
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  selectedPlan,
  billingCycle
}) => {
  const [step, setStep] = useState<'payment-method' | 'review' | 'processing' | 'success' | 'error'>('payment-method');
  const [paymentMethod, setPaymentMethod] = useState<Partial<PaymentMethod>>({
    type: 'card',
    isDefault: true
  });
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const {
    loading,
    error,
    paymentMethods,
    createPaymentIntent,
    subscribeToPlan,
    addPaymentMethod
  } = usePayments();

  const price = selectedPlan.price[billingCycle];
  const savings = billingCycle === 'yearly' ? (selectedPlan.price.monthly * 12) - selectedPlan.price.yearly : 0;

  const validateCard = () => {
    const newErrors: Record<string, string> = {};

    if (!cardDetails.number.replace(/\s/g, '').match(/^\d{16}$/)) {
      newErrors.number = 'Please enter a valid 16-digit card number';
    }

    if (!cardDetails.expiry.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
      newErrors.expiry = 'Please enter expiry date in MM/YY format';
    }

    if (!cardDetails.cvc.match(/^\d{3,4}$/)) {
      newErrors.cvc = 'Please enter a valid CVC';
    }

    if (!cardDetails.name.trim()) {
      newErrors.name = 'Please enter the cardholder name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    setCardDetails(prev => ({ ...prev, number: formatted }));
  };

  const handleExpiryChange = (value: string) => {
    const formatted = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
    setCardDetails(prev => ({ ...prev, expiry: formatted }));
  };

  const handleSubmit = async () => {
    if (!validateCard()) return;

    try {
      setStep('processing');

      // Add payment method
      const newPaymentMethod = await addPaymentMethod({
        type: 'card',
        last4: cardDetails.number.slice(-4),
        brand: 'visa', // In real app, detect from card number
        expiryMonth: parseInt(cardDetails.expiry.split('/')[0]),
        expiryYear: 2000 + parseInt(cardDetails.expiry.split('/')[1]),
        isDefault: true
      });

      // Create payment intent
      const paymentIntent = await createPaymentIntent(selectedPlan.id, billingCycle);

      // Subscribe to plan
      await subscribeToPlan(selectedPlan.id, billingCycle, newPaymentMethod.id);

      setStep('success');
    } catch (err) {
      setStep('error');
    }
  };

  const handleClose = () => {
    if (step === 'processing') return; // Prevent closing during processing
    
    setStep('payment-method');
    setCardDetails({ number: '', expiry: '', cvc: '', name: '' });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {step === 'success' ? 'Payment Successful!' : 'Complete Payment'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {step === 'success' ? 'Welcome to Premium!' : `${selectedPlan.name} Plan - ${billingCycle}`}
              </p>
            </div>
          </div>
          {step !== 'processing' && (
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'payment-method' && (
            <div className="space-y-6">
              {/* Plan Summary */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {selectedPlan.name} Plan
                  </h3>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${price}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{billingCycle === 'monthly' ? 'Monthly billing' : 'Yearly billing'}</span>
                  {savings > 0 && (
                    <span className="text-green-600 dark:text-green-400">
                      Save ${savings}
                    </span>
                  )}
                </div>
                {selectedPlan.trialDays > 0 && (
                  <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                    ✨ {selectedPlan.trialDays}-day free trial included
                  </div>
                )}
              </div>

              {/* Card Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Payment Method</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardDetails.number}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.number ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                  {errors.number && (
                    <p className="text-red-500 text-sm mt-1">{errors.number}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={cardDetails.expiry}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.expiry ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                    {errors.expiry && (
                      <p className="text-red-500 text-sm mt-1">{errors.expiry}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      CVC
                    </label>
                    <input
                      type="text"
                      value={cardDetails.cvc}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, cvc: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.cvc ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      placeholder="123"
                      maxLength={4}
                    />
                    {errors.cvc && (
                      <p className="text-red-500 text-sm mt-1">{errors.cvc}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium">Secure Payment</p>
                  <p>Your payment information is encrypted and secure. We never store your card details.</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0"
                >
                  {loading ? 'Processing...' : `Pay $${price}`}
                </Button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Processing Payment
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we process your payment...
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Payment Successful!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Welcome to {selectedPlan.name}! Your subscription is now active.
              </p>
              <Button
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0"
              >
                Start Watching
              </Button>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Payment Failed
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error || 'There was an error processing your payment. Please try again.'}
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={() => setStep('payment-method')}
                  variant="secondary"
                  className="flex-1"
                >
                  Try Again
                </Button>
                <Button
                  onClick={handleClose}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 