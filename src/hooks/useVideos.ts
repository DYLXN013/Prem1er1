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
        title: 'Amazing Goal Compilation',
        description: 'Best goals from this season',
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
        title: 'Match Highlights: Team A vs Team B',
        description: 'Extended highlights from the championship match',
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
        title: 'Skills and Tricks Masterclass',
        description: 'Learn the best football skills',
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