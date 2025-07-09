import { useState, useEffect } from 'react';
import { Play, Star, Crown } from 'lucide-react';
import { 
  SubscriptionPlan, 
  PaymentMethod, 
  Subscription, 
  PaymentIntent, 
  BillingHistory 
} from '../types';

export const usePayments = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);

  // Mock subscription plans - in real app, this would come from your backend
  const plans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for casual viewers',
      features: [
        'Watch highlights',
        'Limited live matches',
        'Standard quality (720p)',
        'Ads included',
        'Basic match stats'
      ],
      limitations: [
        'Limited to 5 hours per month',
        'No offline viewing',
        'No premium content'
      ],
      maxStreams: 1,
      videoQuality: '720p',
      trialDays: 0,
      icon: Play
    },
    {
      id: 'premium',
      name: 'Premium',
      price: { monthly: 9.99, yearly: 99.99 },
      description: 'Most popular choice',
      features: [
        'Unlimited live matches',
        'All highlights & replays',
        'HD quality (1080p)',
        'No ads',
        'Advanced match stats',
        'Multiple camera angles',
        'Offline downloads',
        'Mobile & tablet apps'
      ],
      popular: true,
      maxStreams: 2,
      videoQuality: '1080p',
      trialDays: 7,
      icon: Star
    },
    {
      id: 'pro',
      name: 'Pro',
      price: { monthly: 19.99, yearly: 199.99 },
      description: 'For the ultimate fan',
      features: [
        'Everything in Premium',
        '4K Ultra HD quality',
        'Exclusive behind-the-scenes content',
        'Early access to new features',
        'Priority customer support',
        'Watch parties with friends',
        'Advanced analytics',
        'VIP match notifications'
      ],
      maxStreams: 4,
      videoQuality: '4K',
      trialDays: 7,
      icon: Crown
    }
  ];

  // Load user's subscription
  const loadSubscription = async () => {
    try {
      setLoading(true);
      // In real app, this would be an API call
      // const response = await fetch('/api/subscription');
      // const data = await response.json();
      
      // Mock data for now
      const mockSubscription: Subscription | null = null; // Set to null for free user
      setSubscription(mockSubscription);
    } catch (err) {
      setError('Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  // Load payment methods
  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      // In real app, this would be an API call
      // const response = await fetch('/api/payment-methods');
      // const data = await response.json();
      
      // Mock data for now
      const mockPaymentMethods: PaymentMethod[] = [];
      setPaymentMethods(mockPaymentMethods);
    } catch (err) {
      setError('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  // Load billing history
  const loadBillingHistory = async () => {
    try {
      setLoading(true);
      // In real app, this would be an API call
      // const response = await fetch('/api/billing-history');
      // const data = await response.json();
      
      // Mock data for now
      const mockBillingHistory: BillingHistory[] = [];
      setBillingHistory(mockBillingHistory);
    } catch (err) {
      setError('Failed to load billing history');
    } finally {
      setLoading(false);
    }
  };

  // Create payment intent
  const createPaymentIntent = async (planId: string, billingCycle: 'monthly' | 'yearly'): Promise<PaymentIntent> => {
    try {
      setLoading(true);
      setError(null);
      
      const plan = plans.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      // In real app, this would be an API call to create a payment intent
      // const response = await fetch('/api/create-payment-intent', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ planId, billingCycle })
      // });
      // const data = await response.json();

      // Mock payment intent
      const mockPaymentIntent: PaymentIntent = {
        id: `pi_${Math.random().toString(36).substr(2, 9)}`,
        amount: plan.price[billingCycle] * 100, // Convert to cents
        currency: 'usd',
        status: 'requires_payment_method',
        clientSecret: `pi_${Math.random().toString(36).substr(2, 9)}_secret_${Math.random().toString(36).substr(2, 9)}`
      };

      return mockPaymentIntent;
    } catch (err: any) {
      setError(err.message || 'Failed to create payment intent');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to a plan
  const subscribeToPlan = async (planId: string, billingCycle: 'monthly' | 'yearly', paymentMethodId?: string) => {
    try {
      setLoading(true);
      setError(null);

      // In real app, this would be an API call
      // const response = await fetch('/api/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ planId, billingCycle, paymentMethodId })
      // });
      // const data = await response.json();

      // Mock subscription
      const plan = plans.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      const mockSubscription: Subscription = {
        id: `sub_${Math.random().toString(36).substr(2, 9)}`,
        planId,
        status: 'trialing',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + (billingCycle === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        trialStart: new Date().toISOString(),
        trialEnd: new Date(Date.now() + plan.trialDays * 24 * 60 * 60 * 1000).toISOString(),
        paymentMethodId: paymentMethodId || '',
        billingCycle
      };

      setSubscription(mockSubscription);
      return mockSubscription;
    } catch (err: any) {
      setError(err.message || 'Failed to subscribe');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cancel subscription
  const cancelSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      // In real app, this would be an API call
      // const response = await fetch('/api/cancel-subscription', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' }
      // });

      if (subscription) {
        setSubscription({
          ...subscription,
          cancelAtPeriodEnd: true
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to cancel subscription');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reactivate subscription
  const reactivateSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      // In real app, this would be an API call
      // const response = await fetch('/api/reactivate-subscription', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' }
      // });

      if (subscription) {
        setSubscription({
          ...subscription,
          cancelAtPeriodEnd: false
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reactivate subscription');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add payment method
  const addPaymentMethod = async (paymentMethod: Omit<PaymentMethod, 'id'>) => {
    try {
      setLoading(true);
      setError(null);

      // In real app, this would be an API call
      // const response = await fetch('/api/payment-methods', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(paymentMethod)
      // });
      // const data = await response.json();

      const newPaymentMethod: PaymentMethod = {
        ...paymentMethod,
        id: `pm_${Math.random().toString(36).substr(2, 9)}`
      };

      setPaymentMethods(prev => [...prev, newPaymentMethod]);
      return newPaymentMethod;
    } catch (err: any) {
      setError(err.message || 'Failed to add payment method');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remove payment method
  const removePaymentMethod = async (paymentMethodId: string) => {
    try {
      setLoading(true);
      setError(null);

      // In real app, this would be an API call
      // const response = await fetch(`/api/payment-methods/${paymentMethodId}`, {
      //   method: 'DELETE'
      // });

      setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodId));
    } catch (err: any) {
      setError(err.message || 'Failed to remove payment method');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Set default payment method
  const setDefaultPaymentMethod = async (paymentMethodId: string) => {
    try {
      setLoading(true);
      setError(null);

      // In real app, this would be an API call
      // const response = await fetch(`/api/payment-methods/${paymentMethodId}/default`, {
      //   method: 'POST'
      // });

      setPaymentMethods(prev => 
        prev.map(pm => ({
          ...pm,
          isDefault: pm.id === paymentMethodId
        }))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to set default payment method');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscription();
    loadPaymentMethods();
    loadBillingHistory();
  }, []);

  return {
    plans,
    subscription,
    paymentMethods,
    billingHistory,
    loading,
    error,
    createPaymentIntent,
    subscribeToPlan,
    cancelSubscription,
    reactivateSubscription,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    loadSubscription,
    loadPaymentMethods,
    loadBillingHistory
  };
}; 