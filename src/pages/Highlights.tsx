import React, { useState } from 'react';
import { Search, Filter, Grid, List, SortAsc, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useHighlights } from '../hooks/useHighlights';

export const Highlights: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const { highlights, loading, formatDuration, formatViews, getTimeAgo, incrementViews } = useHighlights();

  const filters = [
    { id: 'all', name: 'All Highlights', count: highlights.length },
    { id: 'goals', name: 'Goals', count: highlights.filter(h => h.tags.includes('goals')).length },
    { id: 'saves', name: 'Saves', count: highlights.filter(h => h.tags.includes('saves')).length },
    { id: 'skills', name: 'Skills', count: highlights.filter(h => h.tags.includes('skills')).length },
    { id: 'premier-league', name: 'Premier League', count: highlights.filter(h => h.tags.includes('premier-league')).length }
  ];

  const sortOptions = [
    { id: 'recent', name: 'Most Recent' },
    { id: 'popular', name: 'Most Popular' },
    { id: 'duration', name: 'Duration' },
    { id: 'views', name: 'Most Viewed' }
  ];

  const filteredHighlights = highlights.filter(highlight => {
    const matchesSearch = highlight.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (highlight.match?.home_team.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (highlight.match?.away_team.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = selectedFilter === 'all' || 
                         highlight.tags.includes(selectedFilter) ||
                         (highlight.match?.league.name.toLowerCase().includes(selectedFilter.replace('-', ' ')));
    
    return matchesSearch && matchesFilter;
  });

  // Sort highlights
  const sortedHighlights = [...filteredHighlights].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
      case 'views':
        return b.views - a.views;
      case 'duration':
        return b.duration - a.duration;
      case 'recent':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const handleHighlightClick = (highlightId: string) => {
    incrementViews(highlightId);
  };

  const HighlightCard: React.FC<{ highlight: any }> = ({ highlight }) => (
    <Link 
      to={`/highlight/${highlight.id}`}
      onClick={() => handleHighlightClick(highlight.id)}
      className="group block"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <img
            src={highlight.thumbnail_url || 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop'}
            alt={highlight.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Duration */}
          <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
            {formatDuration(highlight.duration)}
          </div>

          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="bg-white/90 rounded-full p-4">
              <Play className="w-8 h-8 text-gray-900" />
            </div>
          </div>

          {/* Category Badge */}
          {highlight.category && (
            <div 
              className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: highlight.category.color }}
            >
              {highlight.category.name}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {highlight.title}
          </h3>

          {highlight.match && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>{highlight.match.home_team.short_name}</span>
              <span>vs</span>
              <span>{highlight.match.away_team.short_name}</span>
              <span>•</span>
              <span>{highlight.match.league.name}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span>{formatViews(highlight.views)} views</span>
              <span>{getTimeAgo(highlight.created_at)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>{highlight.likes}</span>
              <span>likes</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-3">
            {highlight.tags.slice(0, 3).map((tag: string) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Highlights</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Best moments from recent matches
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  icon={Grid}
                />
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  icon={List}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search highlights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sort and Filter Controls */}
            <div className="flex items-center space-x-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              >
                {sortOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              
              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                icon={Filter}
              >
                Filters
              </Button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2">
                {filters.map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedFilter === filter.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {filter.name} ({filter.count})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg animate-pulse">
                <div className="aspect-video bg-gray-300 dark:bg-gray-700 rounded-t-xl" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Header */}
        {!loading && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              {sortedHighlights.length} highlights found
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <SortAsc className="w-4 h-4" />
              <span>Sorted by {sortOptions.find(opt => opt.id === sortBy)?.name}</span>
            </div>
          </div>
        )}

        {/* Highlights Grid */}
        {!loading && (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedHighlights.map((highlight) => (
                  <HighlightCard key={highlight.id} highlight={highlight} />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {sortedHighlights.map((highlight) => (
                  <Link 
                    key={highlight.id} 
                    to={`/highlight/${highlight.id}`}
                    onClick={() => handleHighlightClick(highlight.id)}
                    className="block"
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                      <div className="flex space-x-4">
                        <div className="flex-shrink-0 w-48">
                          <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                            <img
                              src={highlight.thumbnail_url || 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop'}
                              alt={highlight.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                              {formatDuration(highlight.duration)}
                            </div>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {highlight.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {highlight.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>{formatViews(highlight.views)} views</span>
                            <span>{getTimeAgo(highlight.created_at)}</span>
                            <span>{formatDuration(highlight.duration)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* No Results */}
            {sortedHighlights.length === 0 && (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No highlights found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your search query or filters to find what you're looking for.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};