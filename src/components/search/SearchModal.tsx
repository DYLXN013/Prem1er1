import React, { useState, useEffect } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSearch } from '../../hooks/useSearch';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const { results, loading, search, clearResults } = useSearch();

  const recentSearches = [
    'Manchester United',
    'Premier League',
    'Champions League',
    'Liverpool vs Arsenal'
  ];

  const trendingSearches = [
    'El Clasico highlights',
    'Messi goals',
    'Premier League table',
    'Transfer news'
  ];

  useEffect(() => {
    if (query.trim()) {
      const timeoutId = setTimeout(() => {
        search(query);
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      clearResults();
    }
  }, [query]);

  const handleClose = () => {
    setQuery('');
    clearResults();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 pt-20">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Search Input */}
        <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search teams, matches, highlights..."
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none"
            autoFocus
          />
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-3"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          )}

          {results.length > 0 && (
            <div className="p-2">
              {results.map((result) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  to={result.url}
                  onClick={handleClose}
                  className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {result.thumbnail && (
                    <img
                      src={result.thumbnail}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover mr-3"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {result.title}
                    </h3>
                    {result.subtitle && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {result.subtitle}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {result.type}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {!loading && !query && (
            <div className="p-4 space-y-6">
              {/* Recent Searches */}
              <div>
                <div className="flex items-center mb-3">
                  <Clock className="w-4 h-4 text-gray-400 mr-2" />
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Recent Searches
                  </h3>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(search)}
                      className="block w-full text-left px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trending Searches */}
              <div>
                <div className="flex items-center mb-3">
                  <TrendingUp className="w-4 h-4 text-gray-400 mr-2" />
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Trending
                  </h3>
                </div>
                <div className="space-y-1">
                  {trendingSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(search)}
                      className="block w-full text-left px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No results found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try searching for teams, matches, or highlights
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};