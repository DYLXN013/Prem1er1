import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Eye, Heart, Share, Clock, Calendar } from 'lucide-react';
import { VideoPlayer } from '../components/video/VideoPlayer';
import { CommentSection } from '../components/comments/CommentSection';
import { Button } from '../components/ui/Button';
import { useHighlights } from '../hooks/useHighlights';

export const HighlightDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { highlights, loading, formatDuration, formatViews, getTimeAgo, incrementViews } = useHighlights();

  const highlight = highlights.find(h => h.id === id);

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    if (highlight) {
      incrementViews(highlight.id);
    }
  }, [highlight?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading highlight...</p>
        </div>
      </div>
    );
  }

  if (!highlight) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Highlight not found</h2>
          <Link to="/highlights" className="text-blue-600 hover:text-blue-700">
            Back to highlights
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/highlights"
          className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to highlights</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
              <VideoPlayer
                src={highlight.video_url}
                poster={highlight.thumbnail_url}
                title={highlight.title}
              />
            </div>

            {/* Video Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {highlight.title}
              </h1>

              {highlight.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {highlight.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400 mb-6">
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{formatViews(highlight.views)} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(highlight.duration)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{getTimeAgo(highlight.created_at)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4 mb-6">
                <Button variant="secondary" icon={Heart}>
                  Like ({highlight.likes})
                </Button>
                <Button variant="secondary" icon={Share}>
                  Share
                </Button>
              </div>

              {/* Tags */}
              {highlight.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {highlight.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <CommentSection highlightId={highlight.id} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Match Info */}
            {highlight.match && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Match Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={highlight.match.home_team.logo_url}
                        alt={highlight.match.home_team.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {highlight.match.home_team.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-center text-gray-400">vs</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={highlight.match.away_team.logo_url}
                        alt={highlight.match.away_team.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {highlight.match.away_team.name}
                      </span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {highlight.match.league.name}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Category */}
            {highlight.category && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Category
                </h3>
                <div 
                  className="inline-flex items-center px-3 py-2 rounded-full text-white text-sm font-medium"
                  style={{ backgroundColor: highlight.category.color }}
                >
                  {highlight.category.name}
                </div>
              </div>
            )}

            {/* Related Highlights */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Related Highlights
              </h3>
              <div className="space-y-4">
                {highlights
                  .filter(h => h.id !== highlight.id)
                  .slice(0, 3)
                  .map((relatedHighlight) => (
                    <Link
                      key={relatedHighlight.id}
                      to={`/highlight/${relatedHighlight.id}`}
                      className="block group"
                    >
                      <div className="flex space-x-3">
                        <div className="relative w-24 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={relatedHighlight.thumbnail_url || 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop'}
                            alt={relatedHighlight.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute bottom-1 right-1 bg-black/70 text-white px-1 py-0.5 rounded text-xs">
                            {formatDuration(relatedHighlight.duration)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {relatedHighlight.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatViews(relatedHighlight.views)} views
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};