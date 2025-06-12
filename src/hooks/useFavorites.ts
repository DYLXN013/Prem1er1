import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Favorite {
  id: string;
  created_at: string;
  user_id: string;
  team_id?: string;
  video_id?: string;
  highlight_id?: string;
  match_id?: string;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch favorites');
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (type: 'team' | 'video' | 'highlight' | 'match', id: string) => {
    if (!user) throw new Error('Must be authenticated');

    const favoriteData: any = {
      user_id: user.id,
      [`${type}_id`]: id
    };

    const { data, error } = await supabase
      .from('user_favorites')
      .insert([favoriteData])
      .select()
      .single();

    if (error) throw error;

    setFavorites(prev => [...prev, data]);
    return data;
  };

  const removeFavorite = async (type: 'team' | 'video' | 'highlight' | 'match', id: string) => {
    if (!user) throw new Error('Must be authenticated');

    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq(`${type}_id`, id);

    if (error) throw error;

    setFavorites(prev => prev.filter(fav => fav[`${type}_id`] !== id));
  };

  const isFavorite = (type: 'team' | 'video' | 'highlight' | 'match', id: string): boolean => {
    return favorites.some(fav => fav[`${type}_id`] === id);
  };

  const toggleFavorite = async (type: 'team' | 'video' | 'highlight' | 'match', id: string) => {
    if (isFavorite(type, id)) {
      await removeFavorite(type, id);
    } else {
      await addFavorite(type, id);
    }
  };

  const getFavoritesByType = (type: 'team' | 'video' | 'highlight' | 'match') => {
    return favorites.filter(fav => fav[`${type}_id`] !== null);
  };

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    getFavoritesByType,
    refetch: fetchFavorites
  };
};