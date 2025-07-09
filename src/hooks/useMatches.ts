import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Match {
  id: string;
  created_at: string;
  home_team_id: string;
  away_team_id: string;
  league_id: string;
  start_time: string;
  status: 'upcoming' | 'live' | 'finished';
  home_score: number;
  away_score: number;
  venue: string;
  duration?: string;
  thumbnail_url?: string;
  is_featured: boolean;
  home_team: {
    id: string;
    name: string;
    short_name: string;
    logo_url: string;
    color: string;
  };
  away_team: {
    id: string;
    name: string;
    short_name: string;
    logo_url: string;
    color: string;
  };
  league: {
    id: string;
    name: string;
    short_name: string;
  };
}

export const useMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false); // Start with false
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set sample data immediately
    setMatches([
      {
        id: 'sample-1',
        created_at: new Date().toISOString(),
        home_team_id: 'team-1',
        away_team_id: 'team-2',
        league_id: 'league-1',
        start_time: new Date().toISOString(),
        status: 'live',
        home_score: 2,
        away_score: 1,
        venue: 'Old Trafford',
        duration: '67\'',
        thumbnail_url: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
        is_featured: true,
        home_team: {
          id: 'team-1',
          name: 'Manchester United',
          short_name: 'MUN',
          logo_url: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
          color: '#DA020E'
        },
        away_team: {
          id: 'team-2',
          name: 'Liverpool FC',
          short_name: 'LIV',
          logo_url: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
          color: '#C8102E'
        },
        league: {
          id: 'league-1',
          name: 'Premier League',
          short_name: 'EPL'
        }
      },
      {
        id: 'sample-2',
        created_at: new Date().toISOString(),
        home_team_id: 'team-3',
        away_team_id: 'team-4',
        league_id: 'league-1',
        start_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        status: 'upcoming',
        home_score: 0,
        away_score: 0,
        venue: 'Emirates Stadium',
        thumbnail_url: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
        is_featured: false,
        home_team: {
          id: 'team-3',
          name: 'Arsenal FC',
          short_name: 'ARS',
          logo_url: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
          color: '#EF0107'
        },
        away_team: {
          id: 'team-4',
          name: 'Chelsea FC',
          short_name: 'CHE',
          logo_url: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
          color: '#034694'
        },
        league: {
          id: 'league-1',
          name: 'Premier League',
          short_name: 'EPL'
        }
      }
    ]);

    // Try to fetch real data in background without blocking UI
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!home_team_id(id, name, short_name, logo_url, color),
          away_team:teams!away_team_id(id, name, short_name, logo_url, color),
          league:leagues(id, name, short_name)
        `)
        .order('start_time', { ascending: true });

      if (error) {
        console.warn('Could not fetch matches from database, using sample data');
        return;
      }

      if (data && data.length > 0) {
        setMatches(data);
      }
    } catch (err) {
      console.warn('Database connection issue, using sample data');
    }
  };

  const getMatchesByStatus = (status: 'upcoming' | 'live' | 'finished') => {
    return matches.filter(match => match.status === status);
  };

  const getMatchesByLeague = (leagueId: string) => {
    return matches.filter(match => match.league_id === leagueId);
  };

  const getMatchesByDate = (date: Date) => {
    const targetDate = date.toDateString();
    return matches.filter(match => {
      const matchDate = new Date(match.start_time).toDateString();
      return matchDate === targetDate;
    });
  };

  return {
    matches,
    loading,
    error,
    refetch: fetchMatches,
    getMatchesByStatus,
    getMatchesByLeague,
    getMatchesByDate
  };
};