import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Video = Database['public']['Tables']['videos']['Row'];

export const useVideos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false); // Start with false
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set sample data immediately
    setVideos([
      {
        id: 'video-1',
        created_at: new Date().toISOString(),
        title: 'Premier League Weekly Roundup - Matchday 15',
        description: 'All the action from an incredible weekend of Premier League football. Goals, drama, controversy, and moments of brilliance from England\'s top flight.',
        duration: 180,
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnail_url: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
        user_id: null,
        views: 15420,
        is_approved: true,
        moderated_by: null,
        moderated_at: null,
        moderation_notes: null,
        playback_speeds: ['0.5', '0.75', '1', '1.25', '1.5', '2']
      },
      {
        id: 'video-2',
        created_at: new Date().toISOString(),
        title: 'Manchester Derby Extended Highlights - City vs United',
        description: 'The Manchester Derby delivered everything we hoped for and more. Goals, red cards, VAR drama, and a finish that will be talked about for years. Don\'t miss a second of this classic.',
        duration: 300,
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnail_url: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
        user_id: null,
        views: 8750,
        is_approved: true,
        moderated_by: null,
        moderated_at: null,
        moderation_notes: null,
        playback_speeds: ['0.5', '0.75', '1', '1.25', '1.5', '2']
      },
      {
        id: 'video-3',
        created_at: new Date().toISOString(),
        title: 'Tactical Analysis: How Liverpool Dominated Midfield',
        description: 'Deep dive into Liverpool\'s tactical masterclass. Our expert analysts break down the formations, player movements, and strategic decisions that led to their commanding victory.',
        duration: 420,
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        thumbnail_url: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
        user_id: null,
        views: 12300,
        is_approved: true,
        moderated_by: null,
        moderated_at: null,
        moderation_notes: null,
        playback_speeds: ['0.5', '0.75', '1', '1.25', '1.5', '2']
      },
      {
        id: 'video-4',
        created_at: new Date().toISOString(),
        title: 'Behind the Scenes: Arsenal Training Ground Exclusive',
        description: 'Exclusive access to Arsenal\'s training ground. Watch the players prepare for the biggest match of the season with intense drills, tactical sessions, and candid moments.',
        duration: 240,
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnail_url: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
        user_id: null,
        views: 5680,
        is_approved: true,
        moderated_by: null,
        moderated_at: null,
        moderation_notes: null,
        playback_speeds: ['0.5', '0.75', '1', '1.25', '1.5', '2']
      },
      {
        id: 'video-5',
        created_at: new Date().toISOString(),
        title: 'Transfer Talk: January Window Predictions',
        description: 'The January transfer window is heating up! Our transfer experts discuss the biggest moves, surprise signings, and which players could change the title race.',
        duration: 360,
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        thumbnail_url: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
        user_id: null,
        views: 23400,
        is_approved: true,
        moderated_by: null,
        moderated_at: null,
        moderation_notes: null,
        playback_speeds: ['0.5', '0.75', '1', '1.25', '1.5', '2']
      },
      {
        id: 'video-6',
        created_at: new Date().toISOString(),
        title: 'Women\'s Football Rising: WSL Match of the Week',
        description: 'The Women\'s Super League continues to showcase world-class football. Watch the best moments from this week\'s standout match featuring incredible skill and athleticism.',
        duration: 280,
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnail_url: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
        user_id: null,
        views: 18900,
        is_approved: true,
        moderated_by: null,
        moderated_at: null,
        moderation_notes: null,
        playback_speeds: ['0.5', '0.75', '1', '1.25', '1.5', '2']
      }
    ]);

    // Try to fetch real data in background
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Could not fetch videos from database, using sample data');
        return;
      }

      if (data && data.length > 0) {
        setVideos(data);
      }
    } catch (err) {
      console.warn('Database connection issue, using sample data');
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
    videos,
    loading,
    error,
    refetch: fetchVideos,
    formatDuration,
    formatViews,
    getTimeAgo
  };
};