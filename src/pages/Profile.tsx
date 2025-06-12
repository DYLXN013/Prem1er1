import React, { useState } from 'react';
import { Edit, Settings, Heart, Eye, Clock, Trophy, Star } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { MatchCard } from '../components/cards/MatchCard';
import { HighlightCard } from '../components/cards/HighlightCard';
import { useAuth } from '../hooks/useAuth';
import { useFavorites } from '../hooks/useFavorites';
import { useMatches } from '../hooks/useMatches';
import { useHighlights } from '../hooks/useHighlights';

export const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'watched' | 'teams'>('favorites');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', avatar_url: '' });

  const { user, updateProfile } = useAuth();
  const { favorites, getFavoritesByType } = useFavorites();
  const { matches } = useMatches();
  const { highlights, formatDuration, formatViews, getTimeAgo } = useHighlights();

  React.useEffect(() => {
    if (user) {
      setEditForm({
        username: user.username || '',
        avatar_url: user.avatar_url || ''
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please sign in to view your profile
          </h2>
        </div>
      </div>
    );
  }

  const favoriteTeams = getFavoritesByType('team');
  const favoriteMatches = getFavoritesByType('match');
  const favoriteHighlights = getFavoritesByType('highlight');

  const favoriteMatchData = matches.filter(match => 
    favoriteMatches.some(fav => fav.match_id === match.id)
  );

  const favoriteHighlightData = highlights.filter(highlight => 
    favoriteHighlights.some(fav => fav.highlight_id === highlight.id)
  );

  const stats = {
    matchesWatched: favoriteMatches.length,
    highlightsViewed: favoriteHighlights.length,
    hoursWatched: Math.floor(Math.random() * 200) + 50, // Mock data
    favoriteTeams: favoriteTeams.length
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              <img
                src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}&background=3b82f6&color=fff`}
                alt={user.username}
                className="w-24 h-24 rounded-full"
              />
              <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full p-2">
                <Trophy className="w-4 h-4" />
              </div>
            </div>
            
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      value={editForm.avatar_url}
                      onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <Button onClick={handleSaveProfile}>Save Changes</Button>
                    <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {user.username}
                    </h1>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      <Star className="w-4 h-4 inline mr-1" />
                      Premium
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {user.email}
                  </p>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: 'Matches Watched', value: stats.matchesWatched, icon: Eye },
                      { label: 'Hours Watched', value: stats.hoursWatched, icon: Clock },
                      { label: 'Highlights Viewed', value: stats.highlightsViewed, icon: Heart },
                      { label: 'Favorite Teams', value: stats.favoriteTeams, icon: Trophy }
                    ].map((stat) => {
                      const Icon = stat.icon;
                      return (
                        <div key={stat.label} className="text-center">
                          <div className="flex items-center justify-center mb-2">
                            <Icon className="w-5 h-5 text-blue-600 mr-1" />
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                              {stat.value}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button icon={Edit} onClick={() => setIsEditing(true)}>Edit Profile</Button>
                    <Button variant="secondary" icon={Settings}>Settings</Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'favorites', name: 'Favorites', count: favoriteMatches.length + favoriteHighlights.length },
                { id: 'teams', name: 'My Teams', count: favoriteTeams.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.name} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'favorites' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Favorite Content</h2>
              
              {/* Favorite Highlights */}
              {favoriteHighlightData.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Favorite Highlights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoriteHighlightData.slice(0, 6).map((highlight) => (
                      <HighlightCard 
                        key={highlight.id} 
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
                    ))}
                  </div>
                </div>
              )}

              {/* Favorite Matches */}
              {favoriteMatchData.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Favorite Matches</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoriteMatchData.slice(0, 6).map((match) => (
                      <MatchCard 
                        key={match.id} 
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
                    ))}
                  </div>
                </div>
              )}

              {favoriteHighlightData.length === 0 && favoriteMatchData.length === 0 && (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No favorites yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Start favoriting matches and highlights to see them here
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'teams' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Teams</h2>
              
              {favoriteTeams.length === 0 ? (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 text-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No favorite teams yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Follow your favorite teams to get personalized content
                  </p>
                  <Button>Browse Teams</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteTeams.map((favorite) => (
                    <div key={favorite.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Team Name
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          League Name
                        </p>
                        <Button size="sm" variant="secondary" className="w-full">
                          View Team Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};