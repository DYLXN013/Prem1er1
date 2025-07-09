import React, { useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, Users, Crown, Settings, Share, UserPlus } from 'lucide-react';
import { WatchPartyPlayer } from '../components/watchparty/WatchPartyPlayer';
import { WatchPartyChat } from '../components/watchparty/WatchPartyChat';
import { Button } from '../components/ui/Button';
import { useWatchParty } from '../hooks/useWatchParty';
import { useAuth } from '../hooks/useAuth';

export const WatchParty: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { 
    watchParty, 
    participants, 
    loading, 
    error, 
    isHost, 
    isParticipant, 
    joinWatchParty, 
    leaveWatchParty,
    startParty 
  } = useWatchParty(id);

  useEffect(() => {
    // Auto-join if user is authenticated and not already a participant
    if (user && watchParty && !isParticipant && !isHost) {
      joinWatchParty();
    }
  }, [user, watchParty, isParticipant, isHost]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading watch party...</p>
        </div>
      </div>
    );
  }

  if (error || !watchParty) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Watch Party Not Found</h2>
          <p className="text-gray-400 mb-6">This watch party may have ended or been removed.</p>
          <Link to="/" className="text-blue-400 hover:text-blue-300">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const getContentUrl = () => {
    if (watchParty.video_id) return `/video/${watchParty.video_id}`;
    if (watchParty.highlight_id) return `/highlight/${watchParty.highlight_id}`;
    if (watchParty.match_id) return `/live/${watchParty.match_id}`;
    return '/';
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: watchParty.name,
        text: `Join my watch party: ${watchParty.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to={getContentUrl()}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-xl font-bold text-white">{watchParty.name}</h1>
                  {isHost && (
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <Crown className="w-3 h-3 mr-1" />
                      Host
                    </div>
                  )}
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    watchParty.status === 'active' 
                      ? 'bg-green-500/20 text-green-400' 
                      : watchParty.status === 'waiting'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {watchParty.status === 'active' ? 'Live' : 
                     watchParty.status === 'waiting' ? 'Waiting' : 'Ended'}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{participants.length}/{watchParty.max_participants} participants</span>
                  </div>
                  <span>•</span>
                  <span>Hosted by {watchParty.host.username}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {isHost && watchParty.status === 'waiting' && (
                <Button
                  onClick={startParty}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0"
                >
                  Start Party
                </Button>
              )}
              
              <Button
                onClick={handleShare}
                variant="secondary"
                icon={Share}
                className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
              >
                Share
              </Button>
              
              {isHost && (
                <Button
                  variant="secondary"
                  icon={Settings}
                  className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
                >
                  Settings
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-3">
            <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
              {watchParty.status === 'active' ? (
                <WatchPartyPlayer
                  partyId={watchParty.id}
                  src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                  poster="https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop"
                  title={watchParty.name}
                />
              ) : (
                <div className="aspect-video bg-gray-800 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {watchParty.status === 'waiting' ? 'Waiting for host to start' : 'Party has ended'}
                    </h3>
                    <p className="text-gray-400">
                      {watchParty.status === 'waiting' 
                        ? 'The host will start the party soon. Chat with other participants while you wait!'
                        : 'Thanks for joining! You can still chat with other participants.'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Party Description */}
            {watchParty.description && (
              <div className="mt-6 bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-3">About this party</h3>
                <p className="text-gray-300">{watchParty.description}</p>
              </div>
            )}
          </div>

          {/* Chat Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 h-[calc(100vh-8rem)]">
              <WatchPartyChat partyId={watchParty.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};