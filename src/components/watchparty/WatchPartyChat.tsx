import React, { useState, useRef, useEffect } from 'react';
import { Send, Crown, Users, Heart, Laugh, Sunrise as Surprised, Angry } from 'lucide-react';
import { useWatchParty } from '../../hooks/useWatchParty';
import { Button } from '../ui/Button';

interface WatchPartyChatProps {
  partyId: string;
}

export const WatchPartyChat: React.FC<WatchPartyChatProps> = ({ partyId }) => {
  const [newMessage, setNewMessage] = useState('');
  const [showReactions, setShowReactions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    watchParty, 
    messages, 
    participants, 
    isHost, 
    sendMessage 
  } = useWatchParty(partyId);

  const reactions = [
    { emoji: '❤️', name: 'love', icon: Heart, color: 'text-red-500' },
    { emoji: '😂', name: 'laugh', icon: Laugh, color: 'text-yellow-500' },
    { emoji: '😮', name: 'wow', icon: Surprised, color: 'text-blue-500' },
    { emoji: '😡', name: 'angry', icon: Angry, color: 'text-red-600' }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendMessage(newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleReaction = async (emoji: string) => {
    try {
      await sendMessage(emoji, 'reaction');
      setShowReactions(false);
    } catch (error) {
      console.error('Error sending reaction:', error);
    }
  };

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    return `${Math.floor(diffInHours / 24)}d`;
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-blue-900/20 to-blue-800/20">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-white flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-400" />
            Party Chat
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">{participants.length} online</span>
          </div>
        </div>
        
        {/* Participants */}
        <div className="flex -space-x-2 overflow-hidden">
          {participants.slice(0, 8).map((participant) => (
            <div
              key={participant.id}
              className="relative"
              title={participant.user.username}
            >
              <img
                src={participant.user.avatar_url || `https://ui-avatars.com/api/?name=${participant.user.username}&background=3b82f6&color=fff`}
                alt={participant.user.username}
                className="w-8 h-8 rounded-full border-2 border-gray-800"
              />
              {watchParty?.host_id === participant.user_id && (
                <Crown className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400" />
              )}
            </div>
          ))}
          {participants.length > 8 && (
            <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center">
              <span className="text-xs text-gray-300">+{participants.length - 8}</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${
              message.message_type === 'reaction' 
                ? 'flex justify-center' 
                : message.message_type === 'system'
                ? 'text-center'
                : ''
            }`}
          >
            {message.message_type === 'reaction' ? (
              <div className="bg-gray-800 rounded-full px-3 py-1 text-2xl">
                {message.message}
              </div>
            ) : message.message_type === 'system' ? (
              <div className="text-sm text-gray-400 italic">
                {message.message}
              </div>
            ) : (
              <div className="flex items-start space-x-3">
                <img
                  src={message.user.avatar_url || `https://ui-avatars.com/api/?name=${message.user.username}&background=3b82f6&color=fff`}
                  alt={message.user.username}
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm text-white">
                      {message.user.username}
                    </span>
                    {watchParty?.host_id === message.user_id && (
                      <Crown className="w-3 h-3 text-yellow-400" />
                    )}
                    <span className="text-xs text-gray-500">
                      {getTimeAgo(message.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 break-words">
                    {message.message}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-800">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
                              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 pr-12"
              maxLength={500}
            />
            
            {/* Reactions Button */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <button
                type="button"
                onClick={() => setShowReactions(!showReactions)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                😊
              </button>
              
              {/* Reactions Popup */}
              {showReactions && (
                <div className="absolute bottom-full right-0 mb-2 bg-gray-800 border border-gray-700 rounded-lg p-2 flex space-x-1">
                  {reactions.map((reaction) => (
                    <button
                      key={reaction.name}
                      onClick={() => handleReaction(reaction.emoji)}
                      className="w-8 h-8 rounded-lg hover:bg-gray-700 flex items-center justify-center transition-colors"
                      title={reaction.name}
                    >
                      {reaction.emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};