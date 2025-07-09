import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface ModerationAction {
  contentType: 'video' | 'highlight' | 'chat_message';
  contentId: string;
  action: 'approve' | 'reject' | 'delete';
  notes?: string;
}

export const useModeration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const checkModerationPermissions = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      return data?.role === 'moderator' || data?.role === 'admin';
    } catch {
      return false;
    }
  };

  const moderateContent = async (action: ModerationAction) => {
    try {
      setLoading(true);
      setError(null);

      const isModerator = await checkModerationPermissions();
      if (!isModerator) {
        throw new Error('Insufficient permissions');
      }

      if (action.contentType === 'chat_message') {
        if (action.action === 'delete') {
          const { error } = await supabase
            .from('chat_messages')
            .update({ is_deleted: true })
            .eq('id', action.contentId);

          if (error) throw error;
        }
      } else {
        await supabase.rpc('moderate_content', {
          content_type: action.contentType,
          content_id: action.contentId,
          approved: action.action === 'approve',
          notes: action.notes
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Moderation action failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteContent = async (contentType: 'video' | 'highlight', contentId: string) => {
    try {
      setLoading(true);
      setError(null);

      const isModerator = await checkModerationPermissions();
      if (!isModerator) {
        throw new Error('Insufficient permissions');
      }

      const { error } = await supabase
        .from(contentType === 'video' ? 'videos' : 'highlights')
        .delete()
        .eq('id', contentId);

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete action failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadContent = async (
    contentType: 'video' | 'highlight',
    contentData: any
  ) => {
    try {
      setLoading(true);
      setError(null);

      const isModerator = await checkModerationPermissions();
      if (!isModerator) {
        throw new Error('Insufficient permissions');
      }

      const { data, error } = await supabase
        .from(contentType === 'video' ? 'videos' : 'highlights')
        .insert([{
          ...contentData,
          user_id: user?.id,
          is_approved: true // Moderators can auto-approve
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPendingContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const isModerator = await checkModerationPermissions();
      if (!isModerator) {
        throw new Error('Insufficient permissions');
      }

      const [videosResult, highlightsResult] = await Promise.all([
        supabase
          .from('videos')
          .select('*, user:profiles(username)')
          .eq('is_approved', false),
        supabase
          .from('highlights')
          .select('*, user:profiles(username)')
          .eq('is_approved', false)
      ]);

      if (videosResult.error) throw videosResult.error;
      if (highlightsResult.error) throw highlightsResult.error;

      return {
        videos: videosResult.data || [],
        highlights: highlightsResult.data || []
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pending content');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    moderateContent,
    deleteContent,
    uploadContent,
    getPendingContent,
    checkModerationPermissions
  };
};