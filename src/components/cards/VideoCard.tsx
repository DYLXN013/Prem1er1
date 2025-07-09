import React, { useState } from 'react';
import { Play, Eye, Clock, Share, Heart } from 'lucide-react';
import type { Database } from '../../lib/supabase';

type Video = Database['public']['Tables']['videos']['Row'];

interface VideoCardProps {
  video: Video;
  size?: 'sm' | 'md' | 'lg';
  showPreview?: boolean;
  onClick?: () => void;
  formatDuration?: (seconds: number) => string;
  formatViews?: (views: number) => string;
  getTimeAgo?: (dateString: string) => string;
}

export const VideoCard: React.FC<VideoCardProps> = ({ 
  video, 
  size = 'md', 
  showPreview = true,
  onClick,
  formatDuration = (seconds) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`,
  formatViews = (views) => views.toString(),
  getTimeAgo = (date) => 'Recently'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const sizeClasses = {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96'
  };

  return (
    <div 
      className={`${sizeClasses[size]} bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Thumbnail/Video Preview */}
      <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
        {showPreview && isHovered && video.video_url ? (
          <video
            src={video.video_url}
            autoPlay
            muted
            loop
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={video.thumbnail_url || 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop'}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        
        {/* Duration */}
        <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
          {formatDuration(video.duration)}
        </div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-white/90 rounded-full p-4">
            <Play className="w-8 h-8 text-gray-900" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Share functionality
              }}
              className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            >
              <Share className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {video.title}
        </h3>

        {/* Description */}
        {video.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
            {video.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{formatViews(video.views || 0)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{video.created_at ? getTimeAgo(video.created_at) : 'Recently'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};