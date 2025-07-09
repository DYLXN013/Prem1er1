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
    const today = new Date();
    const getRandomTime = (daysFromNow: number, hour: number = 15) => {
      const date = new Date(today);
      date.setDate(today.getDate() + daysFromNow);
      date.setHours(hour, 0, 0, 0);
      return date.toISOString();
    };

    // Team logo URLs for consistency
    const teamLogos = {
      'Manchester United': 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      'Liverpool FC': 'https://images.pexels.com/photos/2249528/pexels-photo-2249528.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      'Arsenal FC': 'https://images.pexels.com/photos/1002638/pexels-photo-1002638.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      'Chelsea FC': 'https://images.pexels.com/photos/1667088/pexels-photo-1667088.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      'Manchester City': 'https://images.pexels.com/photos/1374125/pexels-photo-1374125.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      'Tottenham Hotspur': 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    };

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
          logo_url: teamLogos['Manchester United'],
          color: '#DA020E'
        },
        away_team: {
          id: 'team-2',
          name: 'Liverpool FC',
          short_name: 'LIV',
          logo_url: teamLogos['Liverpool FC'],
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
          logo_url: teamLogos['Arsenal FC'],
          color: '#EF0107'
        },
        away_team: {
          id: 'team-4',
          name: 'Chelsea FC',
          short_name: 'CHE',
          logo_url: teamLogos['Chelsea FC'],
          color: '#034694'
        },
        league: {
          id: 'league-1',
          name: 'Premier League',
          short_name: 'EPL'
        }
      },
      // Tomorrow's matches
      {
        id: 'sample-3',
        created_at: new Date().toISOString(),
        home_team_id: 'team-5',
        away_team_id: 'team-6',
        league_id: 'league-1',
        start_time: getRandomTime(1, 17),
        status: 'upcoming',
        home_score: 0,
        away_score: 0,
        venue: 'Etihad Stadium',
        thumbnail_url: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
        is_featured: true,
        home_team: {
          id: 'team-5',
          name: 'Manchester City',
          short_name: 'MCI',
          logo_url: teamLogos['Manchester City'],
          color: '#6CABDD'
        },
        away_team: {
          id: 'team-6',
          name: 'Tottenham Hotspur',
          short_name: 'TOT',
          logo_url: teamLogos['Tottenham Hotspur'],
          color: '#132257'
        },
        league: {
          id: 'league-1',
          name: 'Premier League',
          short_name: 'EPL'
        }
      },
      // Day after tomorrow
      {
        id: 'sample-4',
        created_at: new Date().toISOString(),
        home_team_id: 'team-2',
        away_team_id: 'team-3',
        league_id: 'league-1',
        start_time: getRandomTime(2, 14),
        status: 'upcoming',
        home_score: 0,
        away_score: 0,
        venue: 'Anfield',
        thumbnail_url: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
        is_featured: false,
        home_team: {
          id: 'team-2',
          name: 'Liverpool FC',
          short_name: 'LIV',
          logo_url: teamLogos['Liverpool FC'],
          color: '#C8102E'
        },
        away_team: {
          id: 'team-3',
          name: 'Arsenal FC',
          short_name: 'ARS',
          logo_url: teamLogos['Arsenal FC'],
          color: '#EF0107'
        },
        league: {
          id: 'league-1',
          name: 'Premier League',
          short_name: 'EPL'
        }
      },
      // Weekend matches (4 days from now)
      {
        id: 'sample-5',
        created_at: new Date().toISOString(),
        home_team_id: 'team-4',
        away_team_id: 'team-1',
        league_id: 'league-1',
        start_time: getRandomTime(4, 12),
        status: 'upcoming',
        home_score: 0,
        away_score: 0,
        venue: 'Stamford Bridge',
        thumbnail_url: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
        is_featured: true,
        home_team: {
          id: 'team-4',
          name: 'Chelsea FC',
          short_name: 'CHE',
          logo_url: teamLogos['Chelsea FC'],
          color: '#034694'
        },
        away_team: {
          id: 'team-1',
          name: 'Manchester United',
          short_name: 'MUN',
          logo_url: teamLogos['Manchester United'],
          color: '#DA020E'
        },
        league: {
          id: 'league-1',
          name: 'Premier League',
          short_name: 'EPL'
        }
      },
      {
        id: 'sample-6',
        created_at: new Date().toISOString(),
        home_team_id: 'team-6',
        away_team_id: 'team-5',
        league_id: 'league-1',
        start_time: getRandomTime(4, 16),
        status: 'upcoming',
        home_score: 0,
        away_score: 0,
        venue: 'Tottenham Hotspur Stadium',
        thumbnail_url: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
        is_featured: false,
        home_team: {
          id: 'team-6',
          name: 'Tottenham Hotspur',
          short_name: 'TOT',
          logo_url: teamLogos['Tottenham Hotspur'],
          color: '#132257'
        },
        away_team: {
          id: 'team-5',
          name: 'Manchester City',
          short_name: 'MCI',
          logo_url: teamLogos['Manchester City'],
          color: '#6CABDD'
        },
        league: {
          id: 'league-1',
          name: 'Premier League',
          short_name: 'EPL'
        }
      },
      // Next week matches
      {
        id: 'sample-7',
        created_at: new Date().toISOString(),
        home_team_id: 'team-1',
        away_team_id: 'team-6',
        league_id: 'league-1',
        start_time: getRandomTime(7, 20),
        status: 'upcoming',
        home_score: 0,
        away_score: 0,
        venue: 'Old Trafford',
        thumbnail_url: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
        is_featured: true,
        home_team: {
          id: 'team-1',
          name: 'Manchester United',
          short_name: 'MUN',
          logo_url: teamLogos['Manchester United'],
          color: '#DA020E'
        },
        away_team: {
          id: 'team-6',
          name: 'Tottenham Hotspur',
          short_name: 'TOT',
          logo_url: teamLogos['Tottenham Hotspur'],
          color: '#132257'
        },
        league: {
          id: 'league-1',
          name: 'Premier League',
          short_name: 'EPL'
        }
      },
      {
        id: 'sample-8',
        created_at: new Date().toISOString(),
        home_team_id: 'team-3',
        away_team_id: 'team-5',
        league_id: 'league-1',
        start_time: getRandomTime(9, 15),
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
          logo_url: teamLogos['Arsenal FC'],
          color: '#EF0107'
        },
        away_team: {
          id: 'team-5',
          name: 'Manchester City',
          short_name: 'MCI',
          logo_url: teamLogos['Manchester City'],
          color: '#6CABDD'
        },
        league: {
          id: 'league-1',
          name: 'Premier League',
          short_name: 'EPL'
        }
      },
      {
        id: 'sample-9',
        created_at: new Date().toISOString(),
        home_team_id: 'team-2',
        away_team_id: 'team-4',
        league_id: 'league-1',
        start_time: getRandomTime(10, 17),
        status: 'upcoming',
        home_score: 0,
        away_score: 0,
        venue: 'Anfield',
        thumbnail_url: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
        is_featured: true,
        home_team: {
          id: 'team-2',
          name: 'Liverpool FC',
          short_name: 'LIV',
          logo_url: teamLogos['Liverpool FC'],
          color: '#C8102E'
        },
        away_team: {
          id: 'team-4',
          name: 'Chelsea FC',
          short_name: 'CHE',
          logo_url: teamLogos['Chelsea FC'],
          color: '#034694'
        },
        league: {
          id: 'league-1',
          name: 'Premier League',
          short_name: 'EPL'
        }
      },
      // Week 3 matches
      {
        id: 'sample-10',
        created_at: new Date().toISOString(),
        home_team_id: 'team-5',
        away_team_id: 'team-2',
        league_id: 'league-1',
        start_time: getRandomTime(14, 14),
        status: 'upcoming',
        home_score: 0,
        away_score: 0,
        venue: 'Etihad Stadium',
        thumbnail_url: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
        is_featured: true,
        home_team: {
          id: 'team-5',
          name: 'Manchester City',
          short_name: 'MCI',
          logo_url: teamLogos['Manchester City'],
          color: '#6CABDD'
        },
        away_team: {
          id: 'team-2',
          name: 'Liverpool FC',
          short_name: 'LIV',
          logo_url: teamLogos['Liverpool FC'],
          color: '#C8102E'
        },
        league: {
          id: 'league-1',
          name: 'Premier League',
          short_name: 'EPL'
        }
      },
      {
        id: 'sample-11',
        created_at: new Date().toISOString(),
        home_team_id: 'team-4',
        away_team_id: 'team-6',
        league_id: 'league-1',
        start_time: getRandomTime(16, 16),
        status: 'upcoming',
        home_score: 0,
        away_score: 0,
        venue: 'Stamford Bridge',
        thumbnail_url: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
        is_featured: false,
        home_team: {
          id: 'team-4',
          name: 'Chelsea FC',
          short_name: 'CHE',
          logo_url: teamLogos['Chelsea FC'],
          color: '#034694'
        },
        away_team: {
          id: 'team-6',
          name: 'Tottenham Hotspur',
          short_name: 'TOT',
          logo_url: teamLogos['Tottenham Hotspur'],
          color: '#132257'
        },
        league: {
          id: 'league-1',
          name: 'Premier League',
          short_name: 'EPL'
        }
      },
      {
        id: 'sample-12',
        created_at: new Date().toISOString(),
        home_team_id: 'team-1',
        away_team_id: 'team-3',
        league_id: 'league-1',
        start_time: getRandomTime(17, 18),
        status: 'upcoming',
        home_score: 0,
        away_score: 0,
        venue: 'Old Trafford',
        thumbnail_url: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
        is_featured: true,
        home_team: {
          id: 'team-1',
          name: 'Manchester United',
          short_name: 'MUN',
          logo_url: teamLogos['Manchester United'],
          color: '#DA020E'
        },
        away_team: {
          id: 'team-3',
          name: 'Arsenal FC',
          short_name: 'ARS',
          logo_url: teamLogos['Arsenal FC'],
          color: '#EF0107'
        },
        league: {
          id: 'league-1',
          name: 'Premier League',
          short_name: 'EPL'
        }
      },
      // Final week matches (week 4)
      {
        id: 'sample-13',
        created_at: new Date().toISOString(),
        home_team_id: 'team-6',
        away_team_id: 'team-4',
        league_id: 'league-1',
        start_time: getRandomTime(21, 15),
        status: 'upcoming',
        home_score: 0,
        away_score: 0,
        venue: 'Tottenham Hotspur Stadium',
        thumbnail_url: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
        is_featured: false,
        home_team: {
          id: 'team-6',
          name: 'Tottenham Hotspur',
          short_name: 'TOT',
          logo_url: teamLogos['Tottenham Hotspur'],
          color: '#132257'
        },
        away_team: {
          id: 'team-4',
          name: 'Chelsea FC',
          short_name: 'CHE',
          logo_url: teamLogos['Chelsea FC'],
          color: '#034694'
        },
        league: {
          id: 'league-1',
          name: 'Premier League',
          short_name: 'EPL'
        }
      },
      {
        id: 'sample-14',
        created_at: new Date().toISOString(),
        home_team_id: 'team-3',
        away_team_id: 'team-1',
        league_id: 'league-1',
        start_time: getRandomTime(23, 17),
        status: 'upcoming',
        home_score: 0,
        away_score: 0,
        venue: 'Emirates Stadium',
        thumbnail_url: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
        is_featured: true,
        home_team: {
          id: 'team-3',
          name: 'Arsenal FC',
          short_name: 'ARS',
          logo_url: teamLogos['Arsenal FC'],
          color: '#EF0107'
        },
        away_team: {
          id: 'team-1',
          name: 'Manchester United',
          short_name: 'MUN',
          logo_url: teamLogos['Manchester United'],
          color: '#DA020E'
        },
        league: {
          id: 'league-1',
          name: 'Premier League',
          short_name: 'EPL'
        }
      },
      {
        id: 'sample-15',
        created_at: new Date().toISOString(),
        home_team_id: 'team-2',
        away_team_id: 'team-5',
        league_id: 'league-1',
        start_time: getRandomTime(24, 19),
        status: 'upcoming',
        home_score: 0,
        away_score: 0,
        venue: 'Anfield',
        thumbnail_url: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
        is_featured: true,
        home_team: {
          id: 'team-2',
          name: 'Liverpool FC',
          short_name: 'LIV',
          logo_url: teamLogos['Liverpool FC'],
          color: '#C8102E'
        },
        away_team: {
          id: 'team-5',
          name: 'Manchester City',
          short_name: 'MCI',
          logo_url: teamLogos['Manchester City'],
          color: '#6CABDD'
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