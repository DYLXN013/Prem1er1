export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  score: {
    home: number;
    away: number;
  };
  status: 'live' | 'upcoming' | 'finished';
  startTime: string;
  league: string;
  venue: string;
  isLive?: boolean;
  duration?: string;
  thumbnailUrl: string;
  videoUrl?: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  color: string;
}

export interface Highlight {
  id: string;
  title: string;
  match: Match;
  duration: string;
  thumbnailUrl: string;
  videoUrl: string;
  views: number;
  timestamp: string;
  description: string;
  tags: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  favoriteTeams: string[];
  watchHistory: string[];
  subscription: 'free' | 'premium' | 'pro';
}

export interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: string;
  isPinned?: boolean;
}

export interface GameStats {
  possession: {
    home: number;
    away: number;
  };
  shots: {
    home: number;
    away: number;
  };
  shotsOnTarget: {
    home: number;
    away: number;
  };
  fouls: {
    home: number;
    away: number;
  };
  corners: {
    home: number;
    away: number;
  };
  yellowCards: {
    home: number;
    away: number;
  };
  redCards: {
    home: number;
    away: number;
  };
}

export interface TimelineEvent {
  id: string;
  type: 'goal' | 'card' | 'substitution' | 'offside' | 'foul';
  time: string;
  team: 'home' | 'away';
  player: string;
  description: string;
}

// Payment and Subscription Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  description: string;
  features: string[];
  limitations?: string[];
  popular?: boolean;
  maxStreams: number;
  videoQuality: '720p' | '1080p' | '4K';
  trialDays: number;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface Subscription {
  id: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialStart?: string;
  trialEnd?: string;
  paymentMethodId: string;
  billingCycle: 'monthly' | 'yearly';
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'canceled';
  clientSecret: string;
}

export interface BillingHistory {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending';
  date: string;
  description: string;
  invoiceUrl?: string;
}

export type Theme = 'light' | 'dark';
export type Language = 'en' | 'es' | 'fr' | 'de';