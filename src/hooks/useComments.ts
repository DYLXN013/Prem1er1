import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Comment {
  id: string;
  created_at: string;
  content: string;
  user_id: string;
  video_id?: string;
  highlight_id?: string;
  parent_id?: string;
  likes: number;
  is_pinned: boolean;
  user: {
    username: string;
    avatar_url?: string;
  };
  replies?: Comment[];
}

export const useComments = (videoId?: string, highlightId?: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (videoId || highlightId) {
      fetchComments();
    }
  }, [videoId, highlightId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('comments')
        .select(`
          *,
          user:profiles(username, avatar_url)
        `)
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      if (videoId) {
        query = query.eq('video_id', videoId);
      } else if (highlightId) {
        query = query.eq('highlight_id', highlightId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: replies } = await supabase
            .from('comments')
            .select(`
              *,
              user:profiles(username, avatar_url)
            `)
            .eq('parent_id', comment.id)
            .order('created_at', { ascending: true });

          return {
            ...comment,
            replies: replies || []
          };
        })
      );

      setComments(commentsWithReplies);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content: string, parentId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const commentData: any = {
        content,
        user_id: user.id,
        parent_id: parentId
      };

      if (videoId) {
        commentData.video_id = videoId;
      } else if (highlightId) {
        commentData.highlight_id = highlightId;
      }

      const { error } = await supabase
        .from('comments')
        .insert([commentData]);

      if (error) {
        throw error;
      }

      await fetchComments(); // Refresh comments
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
    }
  };

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  return {
    comments,
    loading,
    error,
    addComment,
    refetch: fetchComments,
    getTimeAgo
  };
};