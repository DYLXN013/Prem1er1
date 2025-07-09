import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Share, Heart, MessageCircle, Users, Maximize } from 'lucide-react';
import { VideoPlayer } from '../components/video/VideoPlayer';
import { LiveChat } from '../components/live/LiveChat';
import { GameStats } from '../components/live/GameStats';
import { Timeline } from '../components/live/Timeline';
import { CameraSelector } from '../components/live/CameraSelector';
import { Button } from '../components/ui/Button';
import { useMatches } from '../hooks/useMatches';
import { useFavorites } from '../hooks/useFavorites';
import { useWatchHistory } from '../hooks/useWatchHistory';
import { gameStats } from '../data/mockData';

export const LiveGame: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [showChat, setShowChat] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'timeline' | 'camera'>('stats');

  const { matches, loading } = useMatches();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { trackProgress, getProgress } = useWatchHistory();

  const match = matches.find(m => m.id === id);

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading match...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return <Navigate to="/" replace />;
  }

  const isMatchFavorited = isFavorite('match', match.id);
  const watchProgress = getProgress('match', match.id);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${match.home_team.name} vs ${match.away_team.name}`,
        text: `Watch live: ${match.home_team.name} vs ${match.away_team.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      await toggleFavorite('match', match.id);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleProgress = (progress: number) => {
    trackProgress('match', match.id, progress);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Match Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Teams and Score */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <img
                    src={match.home_team.logo_url}
                    alt={match.home_team.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {match.home_team.name}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Home</p>
                  </div>
                </div>

                <div className="text-center px-6">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {match.home_score} - {match.away_score}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {match.duration || (match.status === 'live' ? 'LIVE' : 'FT')}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {match.away_team.name}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Away</p>
                  </div>
                  <img
                    src={match.away_team.logo_url}
                    alt={match.away_team.name}
                    className="w-12 h-12 rounded-full"
                  />
                </div>
              </div>

              {/* Live Badge */}
              {match.status === 'live' && (
                <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                  LIVE
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span>12.4k watching</span>
              </div>
              
              <Button
                variant="ghost"
                onClick={handleToggleFavorite}
                icon={Heart}
                className={isMatchFavorited ? 'text-red-500' : ''}
              >
                {isMatchFavorited ? 'Favorited' : 'Favorite'}
              </Button>
              
              <Button variant="ghost" onClick={handleShare} icon={Share}>
                Share
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => setShowChat(!showChat)}
                icon={MessageCircle}
              >
                {showChat ? 'Hide Chat' : 'Show Chat'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video Player */}
          <div className={`${showChat ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <VideoPlayer
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                poster={match.thumbnail_url}
                title={`${match.home_team.name} vs ${match.away_team.name}`}
                onProgress={handleProgress}
                initialProgress={watchProgress}
                contentType="match"
                contentId={match.id}
                qualityOptions={[
                  { quality: '480p', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
                  { quality: '720p', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
                  { quality: '1080p', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }
                ]}
              />
              
              {/* Match Info */}
              <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <span className="font-medium">{match.league.name}</span>
                  <span className="mx-2">•</span>
                  <span>{match.venue}</span>
                </div>
                <Button variant="ghost" size="sm" icon={Maximize}>
                  Fullscreen
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-6">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: 'stats', name: 'Match Stats' },
                    { id: 'timeline', name: 'Timeline' },
                    { id: 'camera', name: 'Camera' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="mt-6">
                {activeTab === 'stats' && (
                  <GameStats
                    stats={gameStats}
                    homeTeam={match.home_team.short_name}
                    awayTeam={match.away_team.short_name}
                  />
                )}
                {activeTab === 'timeline' && (
                  <Timeline matchId={match.id} currentTime={match.duration} />
                )}
                {activeTab === 'camera' && (
                  <CameraSelector />
                )}
              </div>
            </div>
          </div>

          {/* Live Chat */}
          {showChat && (
            <div className="lg:col-span-1">
              <div className="sticky top-6 h-[calc(100vh-12rem)]">
                <LiveChat matchId={match.id} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};