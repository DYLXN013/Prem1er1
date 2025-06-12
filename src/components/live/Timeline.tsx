import React, { useState, useEffect } from 'react';
import { Clock, Target, AlertTriangle, RotateCcw, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface MatchEvent {
  id: string;
  created_at: string;
  match_id: string;
  minute: number;
  event_type: string;
  team_side: 'home' | 'away';
  player_name: string;
  description: string;
  additional_data?: any;
}

interface TimelineProps {
  matchId: string;
  currentTime?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ matchId, currentTime = '67\'' }) => {
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatchEvents();
    subscribeToEvents();

    return () => {
      supabase.removeAllChannels();
    };
  }, [matchId]);

  const fetchMatchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('match_events')
        .select('*')
        .eq('match_id', matchId)
        .order('minute', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching match events:', err);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToEvents = () => {
    const channel = supabase
      .channel('match_events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'match_events',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          setEvents(prev => [...prev, payload.new as MatchEvent].sort((a, b) => a.minute - b.minute));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'goal':
        return <Target className="w-4 h-4 text-green-600" />;
      case 'yellow_card':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'red_card':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'substitution':
        return <RotateCcw className="w-4 h-4 text-blue-600" />;
      case 'foul':
        return <Zap className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'goal':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      case 'yellow_card':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
      case 'red_card':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'substitution':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
      case 'foul':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex space-x-4">
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Match Timeline</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span>Current: {currentTime}</span>
        </div>
      </div>

      <div className="space-y-4">
        {events.map((event, index) => (
          <div
            key={event.id}
            className={`relative flex items-start space-x-4 p-4 rounded-lg border ${getEventColor(event.event_type)}`}
          >
            {/* Time */}
            <div className="flex-shrink-0 w-12 text-center">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {event.minute}'
              </span>
            </div>

            {/* Event Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {getEventIcon(event.event_type)}
            </div>

            {/* Event Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {event.player_name}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  event.team_side === 'home' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}>
                  {event.team_side === 'home' ? 'Home' : 'Away'}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {event.description}
              </p>
            </div>

            {/* Timeline Line */}
            {index < events.length - 1 && (
              <div className="absolute left-16 top-14 w-px h-8 bg-gray-300 dark:bg-gray-600" />
            )}
          </div>
        ))}

        {events.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No events yet</p>
          </div>
        )}
      </div>
    </div>
  );
};