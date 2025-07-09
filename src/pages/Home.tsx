import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Calendar, TrendingUp, Clock, ArrowRight, Users, Sparkles, Zap, Star } from 'lucide-react';
import { MatchCard, MatchCardSkeleton } from '../components/cards/MatchCard';
import { HighlightCard } from '../components/cards/HighlightCard';
import { VideoCard } from '../components/cards/VideoCard';
import { WatchPartyModal } from '../components/watchparty/WatchPartyModal';
import { useMatches } from '../hooks/useMatches';
import { useHighlights } from '../hooks/useHighlights';
import { useVideos } from '../hooks/useVideos';
import { useAuth } from '../hooks/useAuth';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [showWatchPartyModal, setShowWatchPartyModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<{
    id: string;
    type: 'video' | 'highlight' | 'match';
    title: string;
  } | null>(null);

  const { matches, loading: matchesLoading, getMatchesByStatus } = useMatches();
  const { highlights, loading: highlightsLoading, formatDuration, formatViews, getTimeAgo } = useHighlights();
  const { videos, loading: videosLoading } = useVideos();
  const { user, isAuthenticated } = useAuth();

  const liveMatches = getMatchesByStatus('live');
  const upcomingMatches = getMatchesByStatus('upcoming').slice(0, 6);
  const trendingHighlights = highlights.slice(0, 6);
  const latestVideos = videos.slice(0, 4);

  const handleCreateWatchParty = (contentId: string, contentType: 'video' | 'highlight' | 'match', title: string) => {
    setSelectedContent({ id: contentId, type: contentType, title });
    setShowWatchPartyModal(true);
  };

  const handleVideoClick = (videoId: string) => {
    if (!isAuthenticated) {
      // Navigate to auth page with redirect parameter
      navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    
    // Navigate to video detail page
    navigate(`/video/${videoId}`);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-black to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-500/20 to-blue-600/20 backdrop-blur-sm border border-blue-500/30 rounded-full px-6 py-2 mb-8">
              <Sparkles className="w-5 h-5 text-blue-400 mr-2" />
              <span className="text-blue-300 font-medium">Premium Football Streaming</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-blue-300 bg-clip-text text-transparent">
              Live Football
              <span className="block">Experience</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Watch live matches, create watch parties with friends, and never miss a moment of the beautiful game
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link
                to="/live"
                className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center space-x-3 shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105"
              >
                <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span>Watch Live Now</span>
              </Link>
              <Link
                to="/highlights"
                className="group bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center space-x-3"
              >
                <Zap className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span>View Highlights</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Live Matches */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
              <h2 className="text-3xl font-bold text-white">Live Now</h2>
              <div className="bg-gradient-to-r from-red-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {liveMatches.length} Live
              </div>
            </div>
            <Link
              to="/calendar"
              className="text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-2 group"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="flex overflow-x-auto space-x-6 pb-4">
            {liveMatches.length > 0 ? (
              liveMatches.map((match) => (
                <div key={match.id} className="flex-shrink-0 group">
                  <Link to={`/live/${match.id}`}>
                    <div className="relative">
                      <MatchCard 
                        match={{
                          id: match.id,
                          homeTeam: {
                            id: match.home_team.id,
                            name: match.home_team.name,
                            shortName: match.home_team.short_name,
                            logo: match.home_team.logo_url,
                            color: match.home_team.color
                          },
                          awayTeam: {
                            id: match.away_team.id,
                            name: match.away_team.name,
                            shortName: match.away_team.short_name,
                            logo: match.away_team.logo_url,
                            color: match.away_team.color
                          },
                          score: {
                            home: match.home_score,
                            away: match.away_score
                          },
                          status: match.status,
                          startTime: match.start_time,
                          league: match.league.name,
                          venue: match.venue,
                          duration: match.duration,
                          thumbnailUrl: match.thumbnail_url || 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop'
                        }} 
                        size="lg" 
                        showStats 
                      />
                      
                      {/* Watch Party Button */}
                      {user && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleCreateWatchParty(match.id, 'match', `${match.home_team.name} vs ${match.away_team.name}`);
                          }}
                          className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400 w-full">
                <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
                  <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No live matches at the moment</p>
                  <p className="text-sm mt-2">Check back soon for live action!</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Latest Videos */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Clock className="w-8 h-8 text-blue-400" />
              <h2 className="text-3xl font-bold text-white">Latest Videos</h2>
            </div>
          </div>
          
          <div className="flex overflow-x-auto space-x-6 pb-4">
            {latestVideos.map((video) => (
              <div key={video.id} className="flex-shrink-0 group">
                <div className="relative">
                  <VideoCard 
                    video={video} 
                    size="md"
                    formatDuration={(seconds) => formatDuration(seconds)}
                    formatViews={(views) => formatViews(views)}
                    getTimeAgo={(date) => getTimeAgo(date)}
                    onClick={() => handleVideoClick(video.id)}
                  />
                  
                  {/* Watch Party Button */}
                  {user && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleCreateWatchParty(video.id, 'video', video.title);
                      }}
                      className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                    >
                      <Users className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Matches */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Calendar className="w-8 h-8 text-green-400" />
              <h2 className="text-3xl font-bold text-white">Upcoming Matches</h2>
            </div>
            <Link
              to="/calendar"
              className="text-green-400 hover:text-green-300 font-medium flex items-center space-x-2 group"
            >
              <span>View Calendar</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingMatches.map((match) => (
              <div key={match.id} className="group">
                <div className="relative">
                  <MatchCard 
                    match={{
                      id: match.id,
                      homeTeam: {
                        id: match.home_team.id,
                        name: match.home_team.name,
                        shortName: match.home_team.short_name,
                        logo: match.home_team.logo_url,
                        color: match.home_team.color
                      },
                      awayTeam: {
                        id: match.away_team.id,
                        name: match.away_team.name,
                        shortName: match.away_team.short_name,
                        logo: match.away_team.logo_url,
                        color: match.away_team.color
                      },
                      score: {
                        home: match.home_score,
                        away: match.away_score
                      },
                      status: match.status,
                      startTime: match.start_time,
                      league: match.league.name,
                      venue: match.venue,
                      duration: match.duration,
                      thumbnailUrl: match.thumbnail_url || 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop'
                    }} 
                  />
                  
                  {/* Watch Party Button */}
                  {user && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleCreateWatchParty(match.id, 'match', `${match.home_team.name} vs ${match.away_team.name}`);
                      }}
                      className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                    >
                      <Users className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Trending Highlights */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <TrendingUp className="w-8 h-8 text-orange-400" />
              <h2 className="text-3xl font-bold text-white">Trending Highlights</h2>
            </div>
            <Link
              to="/highlights"
              className="text-orange-400 hover:text-orange-300 font-medium flex items-center space-x-2 group"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingHighlights.map((highlight) => (
              <div key={highlight.id} className="group">
                <Link to={`/highlight/${highlight.id}`}>
                  <div className="relative">
                    <HighlightCard 
                      highlight={{
                        id: highlight.id,
                        title: highlight.title,
                        match: {
                          id: highlight.match?.id || '',
                          homeTeam: {
                            id: highlight.match?.home_team.id || '',
                            name: highlight.match?.home_team.name || '',
                            shortName: highlight.match?.home_team.short_name || '',
                            logo: highlight.match?.home_team.logo_url || '',
                            color: '#000000'
                          },
                          awayTeam: {
                            id: highlight.match?.away_team.id || '',
                            name: highlight.match?.away_team.name || '',
                            shortName: highlight.match?.away_team.short_name || '',
                            logo: highlight.match?.away_team.logo_url || '',
                            color: '#000000'
                          },
                          score: { home: 0, away: 0 },
                          status: 'finished' as const,
                          startTime: '',
                          league: highlight.match?.league.name || '',
                          venue: '',
                          thumbnailUrl: ''
                        },
                        duration: formatDuration(highlight.duration),
                        thumbnailUrl: highlight.thumbnail_url || 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
                        videoUrl: highlight.video_url,
                        views: highlight.views,
                        timestamp: getTimeAgo(highlight.created_at),
                        description: highlight.description || '',
                        tags: highlight.tags
                      }} 
                    />
                    
                    {/* Watch Party Button */}
                    {user && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleCreateWatchParty(highlight.id, 'highlight', highlight.title);
                        }}
                        className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                      >
                        <Users className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Watch Party Modal */}
      <WatchPartyModal
        isOpen={showWatchPartyModal}
        onClose={() => {
          setShowWatchPartyModal(false);
          setSelectedContent(null);
        }}
        contentId={selectedContent?.id}
        contentType={selectedContent?.type}
        contentTitle={selectedContent?.title}
      />
    </div>
  );
};