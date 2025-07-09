import { useState } from 'react';
import { supabase } from '../lib/supabase';

export interface SearchResult {
  type: 'match' | 'highlight' | 'team' | 'league';
  id: string;
  title: string;
  subtitle?: string;
  thumbnail?: string;
  url: string;
}

export const useSearch = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const searchTerm = `%${query.toLowerCase()}%`;
      const allResults: SearchResult[] = [];

      // Search matches
      const { data: matches } = await supabase
        .from('matches')
        .select(`
          id,
          start_time,
          status,
          home_team:teams!home_team_id(name, short_name),
          away_team:teams!away_team_id(name, short_name),
          league:leagues(name),
          thumbnail_url
        `)
        .or(`home_team.name.ilike.${searchTerm},away_team.name.ilike.${searchTerm}`)
        .limit(5);

      if (matches) {
        matches.forEach(match => {
          allResults.push({
            type: 'match',
            id: match.id,
            title: `${match.home_team.name} vs ${match.away_team.name}`,
            subtitle: match.league.name,
            thumbnail: match.thumbnail_url,
            url: match.status === 'live' ? `/live/${match.id}` : `/match/${match.id}`
          });
        });
      }

      // Search highlights
      const { data: highlights } = await supabase
        .from('highlights')
        .select(`
          id,
          title,
          thumbnail_url,
          match:matches(
            home_team:teams!home_team_id(name),
            away_team:teams!away_team_id(name)
          )
        `)
        .ilike('title', searchTerm)
        .limit(5);

      if (highlights) {
        highlights.forEach(highlight => {
          allResults.push({
            type: 'highlight',
            id: highlight.id,
            title: highlight.title,
            subtitle: highlight.match ? 
              `${highlight.match.home_team.name} vs ${highlight.match.away_team.name}` : 
              'Highlight',
            thumbnail: highlight.thumbnail_url,
            url: `/highlight/${highlight.id}`
          });
        });
      }

      // Search teams
      const { data: teams } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          short_name,
          logo_url,
          league:leagues(name)
        `)
        .ilike('name', searchTerm)
        .limit(5);

      if (teams) {
        teams.forEach(team => {
          allResults.push({
            type: 'team',
            id: team.id,
            title: team.name,
            subtitle: team.league.name,
            thumbnail: team.logo_url,
            url: `/team/${team.id}`
          });
        });
      }

      // Search leagues
      const { data: leagues } = await supabase
        .from('leagues')
        .select('id, name, logo_url')
        .ilike('name', searchTerm)
        .limit(3);

      if (leagues) {
        leagues.forEach(league => {
          allResults.push({
            type: 'league',
            id: league.id,
            title: league.name,
            subtitle: 'League',
            thumbnail: league.logo_url,
            url: `/league/${league.id}`
          });
        });
      }

      setResults(allResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return {
    results,
    loading,
    error,
    search,
    clearResults
  };
};