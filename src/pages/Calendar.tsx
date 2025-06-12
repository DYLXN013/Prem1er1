import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Grid, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MatchCard } from '../components/cards/MatchCard';
import { Button } from '../components/ui/Button';
import { useMatches } from '../hooks/useMatches';

export const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedLeague, setSelectedLeague] = useState('all');

  const { matches, loading, getMatchesByDate, getMatchesByStatus } = useMatches();

  const leagues = [
    { id: 'all', name: 'All Leagues' },
    { id: 'epl', name: 'Premier League' },
    { id: 'laliga', name: 'La Liga' },
    { id: 'bundesliga', name: 'Bundesliga' },
    { id: 'seriea', name: 'Serie A' }
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const filteredMatches = matches.filter(match => 
    selectedLeague === 'all' || match.league.short_name.toLowerCase() === selectedLeague
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Match Calendar</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Schedule of upcoming matches and live games
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <select
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {leagues.map(league => (
                  <option key={league.id} value={league.id}>
                    {league.name}
                  </option>
                ))}
              </select>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'calendar' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                  icon={CalendarIcon}
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
        {viewMode === 'calendar' ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
              {/* Days of Week */}
              <div className="grid grid-cols-7 gap-4 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-4">
                {getDaysInMonth(currentDate).map((day, index) => {
                  if (!day) {
                    return <div key={index} className="aspect-square" />;
                  }

                  const dayMatches = getMatchesByDate(day);
                  const isToday = day.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={day.toISOString()}
                      className={`aspect-square border border-gray-200 dark:border-gray-700 rounded-lg p-2 ${
                        isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className={`text-sm font-medium mb-2 ${
                        isToday ? 'text-blue-600' : 'text-gray-900 dark:text-white'
                      }`}>
                        {day.getDate()}
                      </div>
                      
                      {dayMatches.length > 0 && (
                        <div className="space-y-1">
                          {dayMatches.slice(0, 2).map(match => (
                            <Link
                              key={match.id}
                              to={match.status === 'live' ? `/live/${match.id}` : `/match/${match.id}`}
                              className={`block text-xs p-1 rounded truncate transition-colors ${
                                match.status === 'live' 
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/30'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                              }`}
                            >
                              {match.home_team.short_name} vs {match.away_team.short_name}
                            </Link>
                          ))}
                          {dayMatches.length > 2 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              +{dayMatches.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Live Matches */}
            {getMatchesByStatus('live').length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3 animate-pulse" />
                  Live Now
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getMatchesByStatus('live')
                    .filter(match => selectedLeague === 'all' || match.league.short_name.toLowerCase() === selectedLeague)
                    .map(match => (
                      <Link key={match.id} to={`/live/${match.id}`}>
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
                      </Link>
                    ))}
                </div>
              </section>
            )}

            {/* Today's Matches */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Today's Matches</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getMatchesByDate(new Date())
                  .filter(match => selectedLeague === 'all' || match.league.short_name.toLowerCase() === selectedLeague)
                  .map(match => (
                    <Link 
                      key={match.id} 
                      to={match.status === 'live' ? `/live/${match.id}` : `/match/${match.id}`}
                    >
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
                    </Link>
                  ))}
              </div>
            </section>

            {/* Upcoming Matches */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Upcoming Matches</h2>
              <div className="space-y-6">
                {getMatchesByStatus('upcoming')
                  .filter(match => selectedLeague === 'all' || match.league.short_name.toLowerCase() === selectedLeague)
                  .slice(0, 10)
                  .map(match => (
                    <Link 
                      key={match.id} 
                      to={`/match/${match.id}`}
                      className="block"
                    >
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {match.home_team.name} vs {match.away_team.name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">{match.league.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(new Date(match.start_time))}
                            </p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {formatTime(match.start_time)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <img
                              src={match.home_team.logo_url}
                              alt={match.home_team.name}
                              className="w-10 h-10 rounded-full"
                            />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {match.home_team.short_name}
                            </span>
                          </div>
                          
                          <div className="text-center px-4">
                            <span className="text-gray-400">vs</span>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {match.away_team.short_name}
                            </span>
                            <img
                              src={match.away_team.logo_url}
                              alt={match.away_team.name}
                              className="w-10 h-10 rounded-full"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>{match.venue}</span>
                            <Button size="sm" variant="secondary">
                              Set Reminder
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};