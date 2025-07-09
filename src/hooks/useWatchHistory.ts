import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface WatchHistoryItem {
  id: string;
  created_at: string;
  user_id: string;
  video_id?: string;
  highlight_id?: string;
  match_id?: string;
  progress_seconds: number;
  completed: boolean;
  last_watched: string;
  video?: {
    title: string;
    thumbnail_url: string;
    duration: number;
  };
  highlight?: {
    title: string;
    thumbnail_url: string;
    duration: number;
  };
  match?: {
    home_team: { name: string; logo_url: string };
    away_team: { name: string; logo_url: string };
    league: { name: string };
  };
}

export const useWatchHistory = () => {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchWatchHistory();
    } else {
      setHistory([]);
      setLoading(false);
    }
  }, [user]);

  const fetchWatchHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_watch_history')
        .select(`
          *,
          video:videos(title, thumbnail_url, duration),
          highlight:highlights(title, thumbnail_url, duration),
          match:matches(
            home_team:teams!home_team_id(name, logo_url),
            away_team:teams!away_team_id(name, logo_url),
            league:leagues(name)
          )
        `)
        .eq('user_id', user.id)
        .order('last_watched', { ascending: false })
        .limit(50);

      if (error) throw error;
      setHistory(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch watch history');
    } finally {
      setLoading(false);
    }
  };

  const trackProgress = async (
    contentType: 'video' | 'highlight' | 'match',
    contentId: string,
    progressSeconds: number,
    completed: boolean = false
  ) => {
    if (!user) return;

    try {
      await supabase.rpc('track_watch_progress', {
        content_type: contentType,
        content_id: contentId,
        progress_seconds: progressSeconds,
        is_completed: completed
      });

      // Refresh history
      await fetchWatchHistory();
    } catch (err) {
      console.error('Error tracking progress:', err);
    }
  };

  const getProgress = (contentType: 'video' | 'highlight' | 'match', contentId: string): number => {
    const item = history.find(h => h[`${contentType}_id`] === contentId);
    return item?.progress_seconds || 0;
  };

  const clearHistory = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_watch_history')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      setHistory([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear history');
    }
  };

  return {
    history,
    loading,
    error,
    trackProgress,
    getProgress,
    clearHistory,
    refetch: fetchWatchHistory
  };
};