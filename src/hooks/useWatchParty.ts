import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface WatchParty {
  id: string;
  created_at: string;
  host_id: string;
  video_id?: string;
  highlight_id?: string;
  match_id?: string;
  name: string;
  description?: string;
  is_public: boolean;
  max_participants: number;
  playback_time: number;
  is_playing: boolean;
  scheduled_start?: string;
  status: 'waiting' | 'active' | 'ended';
  current_time: number;
  host: {
    username: string;
    avatar_url?: string;
  };
  participants: WatchPartyParticipant[];
}

export interface WatchPartyParticipant {
  id: string;
  user_id: string;
  joined_at: string;
  is_active: boolean;
  user: {
    username: string;
    avatar_url?: string;
  };
}

export interface WatchPartyMessage {
  id: string;
  created_at: string;
  user_id: string;
  message: string;
  message_type: 'chat' | 'system' | 'reaction';
  user: {
    username: string;
    avatar_url?: string;
  };
}

export const useWatchParty = (partyId?: string) => {
  const [watchParty, setWatchParty] = useState<WatchParty | null>(null);
  const [participants, setParticipants] = useState<WatchPartyParticipant[]>([]);
  const [messages, setMessages] = useState<WatchPartyMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (partyId) {
      fetchParty();
      fetchParticipants();
      fetchMessages();
      subscribeToUpdates();
    }

    return () => {
      supabase.removeAllChannels();
    };
  }, [partyId, user]);

  const fetchParty = async () => {
    if (!partyId) return;

    try {
      const { data, error } = await supabase
        .from('watch_parties')
        .select(`
          *,
          host:profiles!host_id(username, avatar_url)
        `)
        .eq('id', partyId)
        .single();

      if (error) throw error;

      const partyData = {
        ...data,
        current_time: data.playback_time || 0
      };

      setWatchParty(partyData);
      setIsHost(user?.id === data.host_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch party');
    }
  };

  const fetchParticipants = async () => {
    if (!partyId) return;

    try {
      const { data, error } = await supabase
        .from('watch_party_participants')
        .select(`
          *,
          user:profiles(username, avatar_url)
        `)
        .eq('watch_party_id', partyId)
        .eq('is_active', true);

      if (error) throw error;

      setParticipants(data || []);
      setIsParticipant(data?.some(p => p.user_id === user?.id) || false);
    } catch (err) {
      console.error('Error fetching participants:', err);
    }
  };

  const fetchMessages = async () => {
    if (!partyId) return;

    try {
      const { data, error } = await supabase
        .from('watch_party_messages')
        .select(`
          *,
          user:profiles(username, avatar_url)
        `)
        .eq('watch_party_id', partyId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    if (!partyId) return;

    // Subscribe to party updates
    const partyChannel = supabase
      .channel(`watch_party_${partyId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'watch_parties',
          filter: `id=eq.${partyId}`
        },
        (payload) => {
          setWatchParty(prev => prev ? { ...prev, ...payload.new, current_time: payload.new.playback_time || 0 } : null);
        }
      )
      .subscribe();

    // Subscribe to participant changes
    const participantsChannel = supabase
      .channel(`watch_party_participants_${partyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'watch_party_participants',
          filter: `watch_party_id=eq.${partyId}`
        },
        () => {
          fetchParticipants();
        }
      )
      .subscribe();

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel(`watch_party_messages_${partyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'watch_party_messages',
          filter: `watch_party_id=eq.${partyId}`
        },
        async (payload) => {
          // Fetch the complete message with user data
          const { data } = await supabase
            .from('watch_party_messages')
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
      .subscribe();

    return () => {
      supabase.removeChannel(partyChannel);
      supabase.removeChannel(participantsChannel);
      supabase.removeChannel(messagesChannel);
    };
  };

  const createWatchParty = async (partyData: {
    name: string;
    description?: string;
    video_id?: string;
    highlight_id?: string;
    match_id?: string;
    is_public?: boolean;
    max_participants?: number;
    scheduled_start?: string;
  }) => {
    if (!user) throw new Error('Must be authenticated');

    const { data, error } = await supabase
      .from('watch_parties')
      .insert([{
        ...partyData,
        host_id: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const joinWatchParty = async () => {
    if (!user || !partyId) throw new Error('Missing requirements');

    const { error } = await supabase
      .from('watch_party_participants')
      .insert([{
        watch_party_id: partyId,
        user_id: user.id
      }]);

    if (error) throw error;
  };

  const leaveWatchParty = async () => {
    if (!user || !partyId) throw new Error('Missing requirements');

    const { error } = await supabase
      .from('watch_party_participants')
      .update({ is_active: false })
      .eq('watch_party_id', partyId)
      .eq('user_id', user.id);

    if (error) throw error;
  };

  const sendMessage = async (message: string, type: 'chat' | 'system' | 'reaction' = 'chat') => {
    if (!user || !partyId) throw new Error('Missing requirements');

    const { error } = await supabase
      .from('watch_party_messages')
      .insert([{
        watch_party_id: partyId,
        user_id: user.id,
        message,
        message_type: type
      }]);

    if (error) throw error;
  };

  const syncPlayback = async (playback_time: number, is_playing: boolean) => {
    if (!isHost || !partyId) throw new Error('Only host can control playback');

    const { error } = await supabase
      .from('watch_parties')
      .update({ playback_time, is_playing })
      .eq('id', partyId);

    if (error) throw error;
  };

  const startParty = async () => {
    if (!isHost || !partyId) throw new Error('Only host can start party');

    const { error } = await supabase
      .from('watch_parties')
      .update({ status: 'active' })
      .eq('id', partyId);

    if (error) throw error;
  };

  return {
    watchParty,
    participants,
    messages,
    loading,
    error,
    isHost,
    isParticipant,
    createWatchParty,
    joinWatchParty,
    leaveWatchParty,
    sendMessage,
    syncPlayback,
    startParty,
    refetch: fetchParty
  };
};

export const useWatchParties = () => {
  const [watchParties, setWatchParties] = useState<WatchParty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    try {
      const { data, error } = await supabase
        .from('watch_parties')
        .select(`
          *,
          host:profiles!host_id(username, avatar_url)
        `)
        .eq('is_public', true)
        .in('status', ['waiting', 'active'])
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Get participant counts for each party
      const partiesWithCounts = await Promise.all(
        (data || []).map(async (party) => {
          const { data: participants } = await supabase
            .from('watch_party_participants')
            .select('id')
            .eq('watch_party_id', party.id)
            .eq('is_active', true);

          return {
            ...party,
            current_time: party.playback_time || 0,
            participants: participants || []
          };
        })
      );

      setWatchParties(partiesWithCounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch parties');
    } finally {
      setLoading(false);
    }
  };

  return {
    watchParties,
    loading,
    error,
    refetch: fetchParties
  };
};