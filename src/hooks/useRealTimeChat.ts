import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface ChatMessage {
  id: string;
  created_at: string;
  message: string;
  user_id: string;
  livestream_id?: string;
  match_id?: string;
  is_pinned: boolean;
  is_deleted: boolean;
  user: {
    username: string;
    avatar_url?: string;
  };
}

export const useRealTimeChat = (livestreamId?: string, matchId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!livestreamId && !matchId) return;

    fetchMessages();
    subscribeToMessages();

    return () => {
      supabase.removeAllChannels();
    };
  }, [livestreamId, matchId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('chat_messages')
        .select(`
          *,
          user:profiles(username, avatar_url)
        `)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(100);

      if (livestreamId) {
        query = query.eq('livestream_id', livestreamId);
      } else if (matchId) {
        query = query.eq('match_id', matchId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: livestreamId 
            ? `livestream_id=eq.${livestreamId}` 
            : `match_id=eq.${matchId}`
        },
        async (payload) => {
          // Fetch the complete message with user data
          const { data } = await supabase
            .from('chat_messages')
            .select(`
              *,
              user:profiles(username, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setMessages(prev => [...prev, data]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === payload.new.id 
                ? { ...msg, ...payload.new }
                : msg
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (message: string) => {
    if (!user) throw new Error('Must be authenticated to send messages');

    const messageData: any = {
      message: message.trim(),
      user_id: user.id
    };

    if (livestreamId) {
      messageData.livestream_id = livestreamId;
    } else if (matchId) {
      messageData.match_id = matchId;
    }

    const { error } = await supabase
      .from('chat_messages')
      .insert([messageData]);

    if (error) throw error;
  };

  const pinMessage = async (messageId: string) => {
    if (!user) throw new Error('Must be authenticated');

    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    const { error } = await supabase
      .from('chat_messages')
      .update({ is_pinned: !message.is_pinned })
      .eq('id', messageId);

    if (error) throw error;
  };

  const deleteMessage = async (messageId: string) => {
    if (!user) throw new Error('Must be authenticated');

    const { error } = await supabase
      .from('chat_messages')
      .update({ is_deleted: true })
      .eq('id', messageId)
      .eq('user_id', user.id);

    if (error) throw error;
  };

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    pinMessage,
    deleteMessage,
    getTimeAgo,
    refetch: fetchMessages
  };
};