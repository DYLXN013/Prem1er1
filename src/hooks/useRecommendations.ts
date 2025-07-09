import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { useFavorites } from './useFavorites';
import { useWatchHistory } from './useWatchHistory';

interface RecommendationScore {
  contentId: string;
  contentType: 'video' | 'highlight' | 'match';
  score: number;
  reasons: string[];
}

interface RecommendedContent {
  id: string;
  type: 'video' | 'highlight' | 'match';
  title: string;
  thumbnail_url: string;
  score: number;
  reasons: string[];
  data: any;
}

export const useRecommendations = () => {
  const [recommendations, setRecommendations] = useState<RecommendedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const { history } = useWatchHistory();

  useEffect(() => {
    if (user) {
      generateRecommendations();
    } else {
      generateGuestRecommendations();
    }
  }, [user, favorites, history]);

  const generateRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user's favorite teams
      const favoriteTeamIds = favorites
        .filter(fav => fav.team_id)
        .map(fav => fav.team_id);

      // Get user's watch history
      const watchedContentIds = history.map(h => ({
        id: h.video_id || h.highlight_id || h.match_id,
        type: h.video_id ? 'video' : h.highlight_id ? 'highlight' : 'match',
        progress: h.progress_seconds,
        completed: h.completed
      }));

      // Fetch all content
      const [videosResult, highlightsResult, matchesResult] = await Promise.all([
        supabase.from('videos').select('*').eq('is_approved', true),
        supabase.from('highlights').select(`
          *,
          match:matches(
            id,
            home_team:teams!home_team_id(id, name),
            away_team:teams!away_team_id(id, name),
            league:leagues(name)
          )
        `).eq('is_approved', true),
        supabase.from('matches').select(`
          *,
          home_team:teams!home_team_id(id, name),
          away_team:teams!away_team_id(id, name),
          league:leagues(name)
        `)
      ]);

      const videos = videosResult.data || [];
      const highlights = highlightsResult.data || [];
      const matches = matchesResult.data || [];

      // Calculate recommendation scores
      const scores: RecommendationScore[] = [];

      // Score videos
      videos.forEach(video => {
        const score = calculateVideoScore(video, favoriteTeamIds, watchedContentIds);
        scores.push({
          contentId: video.id,
          contentType: 'video',
          score: score.score,
          reasons: score.reasons
        });
      });

      // Score highlights
      highlights.forEach(highlight => {
        const score = calculateHighlightScore(highlight, favoriteTeamIds, watchedContentIds);
        scores.push({
          contentId: highlight.id,
          contentType: 'highlight',
          score: score.score,
          reasons: score.reasons
        });
      });

      // Score matches
      matches.forEach(match => {
        const score = calculateMatchScore(match, favoriteTeamIds, watchedContentIds);
        scores.push({
          contentId: match.id,
          contentType: 'match',
          score: score.score,
          reasons: score.reasons
        });
      });

      // Sort by score and take top recommendations
      const topScores = scores
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);

      // Build recommendation objects
      const recommendedContent: RecommendedContent[] = topScores.map(score => {
        let data;
        if (score.contentType === 'video') {
          data = videos.find(v => v.id === score.contentId);
        } else if (score.contentType === 'highlight') {
          data = highlights.find(h => h.id === score.contentId);
        } else {
          data = matches.find(m => m.id === score.contentId);
        }

        return {
          id: score.contentId,
          type: score.contentType,
          title: data?.title || `${data?.home_team?.name} vs ${data?.away_team?.name}`,
          thumbnail_url: data?.thumbnail_url || 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
          score: score.score,
          reasons: score.reasons,
          data
        };
      });

      setRecommendations(recommendedContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  const generateGuestRecommendations = async () => {
    try {
      setLoading(true);
      
      // For guests, show trending content
      const [videosResult, highlightsResult] = await Promise.all([
        supabase.from('videos').select('*').eq('is_approved', true).order('views', { ascending: false }).limit(10),
        supabase.from('highlights').select(`
          *,
          match:matches(
            home_team:teams!home_team_id(name),
            away_team:teams!away_team_id(name)
          )
        `).eq('is_approved', true).order('views', { ascending: false }).limit(10)
      ]);

      const videos = videosResult.data || [];
      const highlights = highlightsResult.data || [];

      const guestRecommendations: RecommendedContent[] = [
        ...videos.map(video => ({
          id: video.id,
          type: 'video' as const,
          title: video.title,
          thumbnail_url: video.thumbnail_url || 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
          score: 1,
          reasons: ['Trending'],
          data: video
        })),
        ...highlights.map(highlight => ({
          id: highlight.id,
          type: 'highlight' as const,
          title: highlight.title,
          thumbnail_url: highlight.thumbnail_url || 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
          score: 1,
          reasons: ['Popular'],
          data: highlight
        }))
      ];

      setRecommendations(guestRecommendations.slice(0, 12));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  const calculateVideoScore = (video: any, favoriteTeamIds: string[], watchHistory: any[]) => {
    let score = 0;
    const reasons: string[] = [];

    // Base popularity score
    score += Math.log(video.views + 1) * 0.1;

    // Recency bonus
    const daysSinceCreated = (Date.now() - new Date(video.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated < 7) {
      score += 2;
      reasons.push('Recently uploaded');
    }

    // Check if already watched
    const alreadyWatched = watchHistory.find(h => h.id === video.id && h.type === 'video');
    if (alreadyWatched) {
      if (alreadyWatched.completed) {
        score -= 5; // Heavily penalize completed content
      } else {
        score += 1; // Slight bonus for partially watched
        reasons.push('Continue watching');
      }
    }

    // Content similarity based on title keywords
    const titleWords = video.title.toLowerCase().split(' ');
    const watchedTitles = watchHistory
      .filter(h => h.type === 'video')
      .map(h => h.data?.title?.toLowerCase() || '')
      .join(' ');

    titleWords.forEach(word => {
      if (watchedTitles.includes(word) && word.length > 3) {
        score += 0.5;
      }
    });

    return { score, reasons };
  };

  const calculateHighlightScore = (highlight: any, favoriteTeamIds: string[], watchHistory: any[]) => {
    let score = 0;
    const reasons: string[] = [];

    // Base popularity score
    score += Math.log(highlight.views + 1) * 0.1;

    // Team preference bonus
    if (highlight.match) {
      const homeTeamId = highlight.match.home_team?.id;
      const awayTeamId = highlight.match.away_team?.id;
      
      if (favoriteTeamIds.includes(homeTeamId) || favoriteTeamIds.includes(awayTeamId)) {
        score += 5;
        reasons.push('Your favorite team');
      }
    }

    // Tag-based scoring
    if (highlight.tags) {
      const watchedTags = watchHistory
        .filter(h => h.type === 'highlight')
        .flatMap(h => h.data?.tags || []);
      
      highlight.tags.forEach((tag: string) => {
        if (watchedTags.includes(tag)) {
          score += 1;
          reasons.push(`You like ${tag}`);
        }
      });
    }

    // Check if already watched
    const alreadyWatched = watchHistory.find(h => h.id === highlight.id && h.type === 'highlight');
    if (alreadyWatched?.completed) {
      score -= 3;
    }

    return { score, reasons };
  };

  const calculateMatchScore = (match: any, favoriteTeamIds: string[], watchHistory: any[]) => {
    let score = 0;
    const reasons: string[] = [];

    // Team preference bonus
    const homeTeamId = match.home_team?.id;
    const awayTeamId = match.away_team?.id;
    
    if (favoriteTeamIds.includes(homeTeamId) || favoriteTeamIds.includes(awayTeamId)) {
      score += 10;
      reasons.push('Your favorite team');
    }

    // Live match bonus
    if (match.status === 'live') {
      score += 8;
      reasons.push('Live now');
    }

    // Upcoming match bonus
    if (match.status === 'upcoming') {
      const hoursUntilMatch = (new Date(match.start_time).getTime() - Date.now()) / (1000 * 60 * 60);
      if (hoursUntilMatch < 24) {
        score += 5;
        reasons.push('Starting soon');
      }
    }

    // Featured match bonus
    if (match.is_featured) {
      score += 3;
      reasons.push('Featured match');
    }

    return { score, reasons };
  };

  return {
    recommendations,
    loading,
    error,
    refetch: user ? generateRecommendations : generateGuestRecommendations
  };
};