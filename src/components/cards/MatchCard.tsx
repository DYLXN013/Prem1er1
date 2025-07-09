import React from 'react';
import { Play, Clock, Users, Calendar } from 'lucide-react';
import { Match } from '../../types';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';

interface MatchCardProps {
  match: Match;
  size?: 'sm' | 'md' | 'lg';
  showStats?: boolean;
  onClick?: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ 
  match, 
  size = 'md', 
  showStats = false,
  onClick 
}) => {
  const sizeClasses = {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96'
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div 
      className={`${sizeClasses[size]} bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden`}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <img
          src={match.thumbnailUrl}
          alt={`${match.homeTeam.name} vs ${match.awayTeam.name}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Live Badge */}
        {match.status === 'live' && (
          <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
            <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
            LIVE
          </div>
        )}

        {/* Duration */}
        {match.duration && (
          <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
            {match.duration}
          </div>
        )}

        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-white/90 rounded-full p-3">
            <Play className="w-6 h-6 text-gray-900" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Teams */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <img
              src={match.homeTeam.logo}
              alt={match.homeTeam.name}
              className="w-8 h-8 rounded-full"
            />
            <span className="font-medium text-gray-900 dark:text-white">
              {match.homeTeam.shortName}
            </span>
          </div>

          {/* Score */}
          <div className="flex items-center space-x-2 text-lg font-bold text-gray-900 dark:text-white">
            <span>{match.score.home}</span>
            <span className="text-gray-400">-</span>
            <span>{match.score.away}</span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="font-medium text-gray-900 dark:text-white">
              {match.awayTeam.shortName}
            </span>
            <img
              src={match.awayTeam.logo}
              alt={match.awayTeam.name}
              className="w-8 h-8 rounded-full"
            />
          </div>
        </div>

        {/* Match Info */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">{match.league}</span>
          {match.status === 'upcoming' ? (
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(match.startTime)} • {formatTime(match.startTime)}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{match.venue}</span>
            </div>
          )}
        </div>

        {/* Stats (optional) */}
        {showStats && match.status === 'live' && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>12.4k watching</span>
              </div>
              <span>67' played</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const MatchCardSkeleton: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96'
  };

  return (
    <div className={`${sizeClasses[size]} bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden`}>
      <LoadingSkeleton variant="video" />
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <LoadingSkeleton variant="avatar" className="w-8 h-8" />
            <LoadingSkeleton variant="text" className="w-12" />
          </div>
          <LoadingSkeleton variant="text" className="w-8" />
          <div className="flex items-center space-x-3">
            <LoadingSkeleton variant="text" className="w-12" />
            <LoadingSkeleton variant="avatar" className="w-8 h-8" />
          </div>
        </div>
        <div className="flex justify-between">
          <LoadingSkeleton variant="text" className="w-20" />
          <LoadingSkeleton variant="text" className="w-24" />
        </div>
      </div>
    </div>
  );
};