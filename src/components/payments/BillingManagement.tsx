import React, { useState } from 'react';
import { 
  CreditCard, 
  Calendar, 
  Download, 
  Trash2, 
  Plus, 
  CheckCircle, 
  AlertCircle,
  X,
  Edit,
  Star
} from 'lucide-react';
import { Button } from '../ui/Button';
import { usePayments } from '../../hooks/usePayments';
import { PaymentMethod, Subscription, BillingHistory } from '../../types';

export const BillingManagement: React.FC = () => {
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const {
    subscription,
    paymentMethods,
    billingHistory,
    loading,
    error,
    cancelSubscription,
    reactivateSubscription,
    removePaymentMethod,
    setDefaultPaymentMethod
  } = usePayments();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100); // Convert from cents
  };

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 dark:text-green-400';
      case 'trialing':
        return 'text-blue-600 dark:text-blue-400';
      case 'past_due':
        return 'text-red-600 dark:text-red-400';
      case 'canceled':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getSubscriptionStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'trialing':
        return <Star className="w-4 h-4" />;
      case 'past_due':
        return <AlertCircle className="w-4 h-4" />;
      case 'canceled':
        return <X className="w-4 h-4" />;
      default:
        return <X className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Billing & Subscription
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your subscription, payment methods, and billing history
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Subscription */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Current Subscription
                </h2>
                {subscription && (
                  <span className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                    subscription.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                    subscription.status === 'trialing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                    subscription.status === 'past_due' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {getSubscriptionStatusIcon(subscription.status)}
                    <span className="capitalize">{subscription.status}</span>
                  </span>
                )}
              </div>

              {subscription ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Plan
                      </label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                        {subscription.planId}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Billing Cycle
                      </label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                        {subscription.billingCycle}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Current Period
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                      </p>
                    </div>
                    {subscription.trialEnd && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Trial Ends
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {formatDate(subscription.trialEnd)}
                        </p>
                      </div>
                    )}
                  </div>

                  {subscription.cancelAtPeriodEnd && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            Subscription will cancel on {formatDate(subscription.currentPeriodEnd)}
                          </p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                            You can reactivate your subscription anytime before this date.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-3 pt-4">
                    {subscription.cancelAtPeriodEnd ? (
                      <Button
                        onClick={reactivateSubscription}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0"
                      >
                        Reactivate Subscription
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setConfirmCancel(true)}
                        variant="secondary"
                        className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        Cancel Subscription
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Active Subscription
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You're currently on the free plan. Upgrade to unlock premium features.
                  </p>
                  <Button
                    onClick={() => window.location.href = '/subscribe'}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0"
                  >
                    View Plans
                  </Button>
                </div>
              )}
            </div>

            {/* Billing History */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Billing History
              </h2>
              
              {billingHistory.length > 0 ? (
                <div className="space-y-4">
                  {billingHistory.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {invoice.description}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(invoice.date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </p>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          invoice.status === 'succeeded' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                          invoice.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        }`}>
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  <Download className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No billing history available</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Payment Methods
                </h2>
                <Button
                  onClick={() => setShowAddPaymentMethod(true)}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>

              {paymentMethods.length > 0 ? (
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {method.brand?.toUpperCase()} •••• {method.last4}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Expires {method.expiryMonth}/{method.expiryYear}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {method.isDefault && (
                            <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full">
                              Default
                            </span>
                          )}
                          <button
                            onClick={() => setEditingPaymentMethod(method)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removePaymentMethod(method.id)}
                            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {!method.isDefault && (
                        <button
                          onClick={() => setDefaultPaymentMethod(method.id)}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          Set as default
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No payment methods added</p>
                  <p className="text-sm mt-2">Add a payment method to subscribe to premium plans</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        {confirmCancel && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Cancel Subscription
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Are you sure you want to cancel?
                    </p>
                  </div>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Your subscription will remain active until {subscription && formatDate(subscription.currentPeriodEnd)}. 
                    You can reactivate anytime before then.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={() => setConfirmCancel(false)}
                    variant="secondary"
                    className="flex-1"
                  >
                    Keep Subscription
                  </Button>
                  <Button
                    onClick={() => {
                      cancelSubscription();
                      setConfirmCancel(false);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0"
                  >
                    Cancel Subscription
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 