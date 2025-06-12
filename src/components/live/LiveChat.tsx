import React, { useState, useRef, useEffect } from 'react';
import { Send, Pin, Smile, Trash2 } from 'lucide-react';
import { useRealTimeChat } from '../../hooks/useRealTimeChat';
import { useAuth } from '../../hooks/useAuth';

interface LiveChatProps {
  livestreamId?: string;
  matchId?: string;
}

export const LiveChat: React.FC<LiveChatProps> = ({ livestreamId, matchId }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();
  const { 
    messages, 
    loading, 
    error, 
    sendMessage, 
    pinMessage, 
    deleteMessage, 
    getTimeAgo 
  } = useRealTimeChat(livestreamId, matchId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isScrolledToBottom) {
      scrollToBottom();
    }
  }, [messages, isScrolledToBottom]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 10;
      setIsScrolledToBottom(isAtBottom);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await sendMessage(newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handlePinMessage = async (messageId: string) => {
    try {
      await pinMessage(messageId);
    } catch (error) {
      console.error('Error pinning message:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="flex-1 p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex space-x-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Live Chat</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {messages.length} messages
        </p>
      </div>

      {/* Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
        onScroll={handleScroll}
      >
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`group relative ${
              message.is_pinned 
                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2' 
                : ''
            }`}
          >
            {message.is_pinned && (
              <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 mb-1">
                <Pin className="w-3 h-3" />
                <span>Pinned</span>
              </div>
            )}
            <div className="flex items-start space-x-3">
              <img
                src={message.user.avatar_url || `https://ui-avatars.com/api/?name=${message.user.username}&background=3b82f6&color=fff`}
                alt={message.user.username}
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm text-gray-900 dark:text-white">
                    {message.user.username}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {getTimeAgo(message.created_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 break-words">
                  {message.message}
                </p>
              </div>
              
              {/* Message Actions */}
              {user && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                  <button
                    onClick={() => handlePinMessage(message.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title={message.is_pinned ? 'Unpin message' : 'Pin message'}
                  >
                    <Pin className="w-4 h-4" />
                  </button>
                  {user.id === message.user_id && (
                    <button
                      onClick={() => handleDeleteMessage(message.id)}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {user ? (
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                maxLength={500}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Sign in to join the conversation
            </p>
          </div>
        )}
      </div>
    </div>
  );
};