import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Highlight {
  id: string;
  created_at: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration: number;
  match_id?: string;
  category_id?: string;
  tags: string[];
  views: number;
  likes: number;
  user_id?: string;
  match?: {
    id: string;
    home_team: {
      name: string;
      short_name: string;
      logo_url: string;
    };
    away_team: {
      name: string;
      short_name: string;
      logo_url: string;
    };
    league: {
      name: string;
    };
  };
  category?: {
    name: string;
    color: string;
  };
}

export const useHighlights = () => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(false); // Start with false
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set sample data immediately
    setHighlights([
      {
        id: 'highlight-1',
        created_at: new Date().toISOString(),
        title: 'Best Goals of the Week',
        description: 'Amazing goals from this week\'s Premier League matches',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnail_url: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
        duration: 323,
        tags: ['goals', 'premier-league', 'highlights'],
        views: 245000,
        likes: 12500
      },
      {
        id: 'highlight-2',
        created_at: new Date().toISOString(),
        title: 'Incredible Saves Compilation',
        description: 'Best goalkeeper saves from recent matches',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnail_url: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
        duration: 225,
        tags: ['saves', 'goalkeepers', 'highlights'],
        views: 156000,
        likes: 8900
      },
      {
        id: 'highlight-3',
        created_at: new Date().toISOString(),
        title: 'Skills and Tricks Masterclass',
        description: 'The most skillful moments from recent matches',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        thumbnail_url: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
        duration: 187,
        tags: ['skills', 'tricks', 'highlights'],
        views: 89000,
        likes: 5600
      }
    ]);

    // Try to fetch real data in background
    fetchHighlights();
  }, []);

  const fetchHighlights = async () => {
    try {
      const { data, error } = await supabase
        .from('highlights')
        .select(`
          *,
          match:matches(
            id,
            home_team:teams!home_team_id(name, short_name, logo_url),
            away_team:teams!away_team_id(name, short_name, logo_url),
            league:leagues(name)
          ),
          category:video_categories(name, color)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Could not fetch highlights from database, using sample data');
        return;
      }

      if (data && data.length > 0) {
        setHighlights(data);
      }
    } catch (err) {
      console.warn('Database connection issue, using sample data');
    }
  };

  const incrementViews = async (highlightId: string) => {
    try {
      await supabase.rpc('increment_highlight_views', { highlight_id: highlightId });
      setHighlights(prev => 
        prev.map(h => 
          h.id === highlightId 
            ? { ...h, views: h.views + 1 }
            : h
        )
      );
    } catch (err) {
      console.error('Error incrementing views:', err);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(0)}k`;
    return views.toString();
  };

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} weeks ago`;
  };

  return {
    highlights,
    loading,
    error,
    refetch: fetchHighlights,
    incrementViews,
    formatDuration,
    formatViews,
    getTimeAgo
  };
};