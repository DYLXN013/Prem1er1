import React from 'react';
import { Lock, Star, Crown } from 'lucide-react';
import { Button } from '../ui/Button';
import { usePayments } from '../../hooks/usePayments';
import { useAuth } from '../../hooks/useAuth';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requiredPlan: 'free' | 'premium' | 'pro';
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
  children,
  requiredPlan,
  fallback,
  showUpgradePrompt = true
}) => {
  const { subscription } = usePayments();
  const { user } = useAuth();

  const planHierarchy = {
    free: 0,
    premium: 1,
    pro: 2
  };

  const hasAccess = () => {
    if (!user) return false;
    if (requiredPlan === 'free') return true;
    if (!subscription) return false;
    
    const userPlanLevel = planHierarchy[subscription.planId as keyof typeof planHierarchy] || 0;
    const requiredLevel = planHierarchy[requiredPlan];
    
    return userPlanLevel >= requiredLevel;
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'premium':
        return <Star className="w-5 h-5" />;
      case 'pro':
        return <Crown className="w-5 h-5" />;
      default:
        return <Lock className="w-5 h-5" />;
    }
  };

  const getPlanName = (plan: string) => {
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };

  if (hasAccess()) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-[400px] bg-gray-50 dark:bg-gray-900">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          {getPlanIcon(requiredPlan)}
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {getPlanName(requiredPlan)} Plan Required
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This feature is only available for {getPlanName(requiredPlan)} subscribers. 
          Upgrade your plan to unlock this content.
        </p>

        <div className="space-y-3">
          <Button
            onClick={() => window.location.href = '/subscribe'}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0"
          >
            View Plans
          </Button>
          
          {!user && (
            <Button
              onClick={() => window.location.href = '/auth'}
              variant="secondary"
              className="w-full"
            >
              Sign In First
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Convenience components for common use cases
export const PremiumGuard: React.FC<Omit<SubscriptionGuardProps, 'requiredPlan'>> = (props) => (
  <SubscriptionGuard {...props} requiredPlan="premium" />
);

export const ProGuard: React.FC<Omit<SubscriptionGuardProps, 'requiredPlan'>> = (props) => (
  <SubscriptionGuard {...props} requiredPlan="pro" />
); 