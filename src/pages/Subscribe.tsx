import React, { useState } from 'react';
import { Check, Star, Zap, Crown, Play } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PaymentModal } from '../components/payments/PaymentModal';
import { usePayments } from '../hooks/usePayments';
import { useAuth } from '../hooks/useAuth';
import { SubscriptionPlan } from '../types';

export const Subscribe: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium' | 'pro'>('premium');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { plans, subscription } = usePayments();
  const { user } = useAuth();

  const currentPlan = plans.find(plan => plan.id === selectedPlan);
  const userSubscription = subscription;

  const calculateSavings = (plan: SubscriptionPlan) => {
    const monthlyTotal = plan.price.monthly * 12;
    const savings = monthlyTotal - plan.price.yearly;
    const percentage = Math.round((savings / monthlyTotal) * 100);
    return { amount: savings, percentage };
  };

  const handleSubscribe = () => {
    if (!user) {
      // Redirect to login or show auth modal
      return;
    }

    if (selectedPlan === 'free') {
      // Handle free plan selection
      return;
    }

    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Choose Your Plan
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Get unlimited access to live matches, highlights, and exclusive content
            </p>
            
            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-lg p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-blue-900'
                    : 'text-white hover:text-blue-200'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-blue-900'
                    : 'text-white hover:text-blue-200'
                }`}
              >
                Yearly
                <span className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Current Subscription Notice */}
        {userSubscription && (
          <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  Current Subscription: {userSubscription.planId.charAt(0).toUpperCase() + userSubscription.planId.slice(1)}
                </h3>
                <p className="text-blue-700 dark:text-blue-300">
                  Your subscription is active until {new Date(userSubscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const savings = calculateSavings(plan);
            const isSelected = selectedPlan === plan.id;
            const isCurrentPlan = userSubscription?.planId === plan.id;
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg transition-all duration-300 ${
                  plan.popular 
                    ? 'ring-2 ring-blue-500 scale-105' 
                    : isSelected 
                    ? 'ring-2 ring-blue-300' 
                    : 'hover:shadow-xl'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Current Plan
                    </span>
                  </div>
                )}
                
                <div className="p-8">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
                      <Icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {plan.description}
                    </p>
                  </div>

                  {/* Pricing */}
                  <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        ${plan.price[billingCycle]}
                      </span>
                      {plan.price[billingCycle] > 0 && (
                        <span className="text-gray-600 dark:text-gray-400 ml-2">
                          /{billingCycle === 'monthly' ? 'month' : 'year'}
                        </span>
                      )}
                    </div>
                    
                    {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                        Save ${savings.amount} ({savings.percentage}% off)
                      </p>
                    )}

                    {plan.trialDays > 0 && (
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                        ✨ {plan.trialDays}-day free trial
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                    
                    {plan.limitations && plan.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-start space-x-3 opacity-60">
                        <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                          <div className="w-3 h-3 bg-gray-400 rounded-full mx-auto mt-1"></div>
                        </div>
                        <span className="text-gray-600 dark:text-gray-400 text-sm">{limitation}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => {
                      setSelectedPlan(plan.id as any);
                      if (plan.id !== 'free') {
                        handleSubscribe();
                      }
                    }}
                    variant={plan.popular ? 'primary' : isSelected ? 'primary' : 'secondary'}
                    className="w-full"
                    size="lg"
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan ? 'Current Plan' : 
                     plan.id === 'free' ? 'Get Started Free' : 'Choose Plan'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Features Comparison */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Compare All Features
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">
                    Features
                  </th>
                  {plans.map(plan => (
                    <th key={plan.id} className="text-center py-4 px-6 font-medium text-gray-900 dark:text-white">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {[
                  { name: 'Live Matches', free: 'Limited', premium: 'Unlimited', pro: 'Unlimited' },
                  { name: 'Video Quality', free: '720p', premium: '1080p HD', pro: '4K Ultra HD' },
                  { name: 'Offline Downloads', free: '✗', premium: '✓', pro: '✓' },
                  { name: 'Multiple Camera Angles', free: '✗', premium: '✓', pro: '✓' },
                  { name: 'Advanced Stats', free: 'Basic', premium: '✓', pro: '✓ + Analytics' },
                  { name: 'Watch Parties', free: '✗', premium: '✗', pro: '✓' },
                  { name: 'Priority Support', free: '✗', premium: '✗', pro: '✓' },
                  { name: 'Max Streams', free: '1', premium: '2', pro: '4' }
                ].map((feature, index) => (
                  <tr key={index}>
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">
                      {feature.name}
                    </td>
                    <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-400">
                      {feature.free}
                    </td>
                    <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-400">
                      {feature.premium}
                    </td>
                    <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-400">
                      {feature.pro}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                q: 'Can I cancel anytime?',
                a: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.'
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes! Premium and Pro plans come with a 7-day free trial. No credit card required for the free plan.'
              },
              {
                q: 'Can I watch on multiple devices?',
                a: 'Premium allows 2 simultaneous streams, Pro allows 4. You can install the app on unlimited devices.'
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, PayPal, and digital wallets like Apple Pay and Google Pay.'
              }
            ].map((faq, index) => (
              <div key={index} className="text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {faq.q}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {currentPlan && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={handleClosePaymentModal}
          selectedPlan={currentPlan}
          billingCycle={billingCycle}
        />
      )}
    </div>
  );
};