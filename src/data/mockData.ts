import { Match, Team, Highlight, ChatMessage, GameStats, TimelineEvent, User } from '../types';

export const teams: Team[] = [
  {
    id: '1',
    name: 'Manchester United',
    shortName: 'MUN',
    logo: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    color: '#DA020E'
  },
  {
    id: '2',
    name: 'Liverpool FC',
    shortName: 'LIV',
    logo: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    color: '#C8102E'
  },
  {
    id: '3',
    name: 'Arsenal FC',
    shortName: 'ARS',
    logo: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    color: '#EF0107'
  },
  {
    id: '4',
    name: 'Chelsea FC',
    shortName: 'CHE',
    logo: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    color: '#034694'
  },
  {
    id: '5',
    name: 'Manchester City',
    shortName: 'MCI',
    logo: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    color: '#6CABDD'
  },
  {
    id: '6',
    name: 'Tottenham',
    shortName: 'TOT',
    logo: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    color: '#132257'
  }
];

export const liveMatches: Match[] = [
  {
    id: 'live-1',
    homeTeam: teams[0],
    awayTeam: teams[1],
    score: { home: 2, away: 1 },
    status: 'live',
    startTime: new Date().toISOString(),
    league: 'Premier League',
    venue: 'Old Trafford',
    isLive: true,
    duration: '67\'',
    thumbnailUrl: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  },
  {
    id: 'live-2',
    homeTeam: teams[2],
    awayTeam: teams[3],
    score: { home: 0, away: 0 },
    status: 'live',
    startTime: new Date(Date.now() - 30 * 60000).toISOString(),
    league: 'Premier League',
    venue: 'Emirates Stadium',
    isLive: true,
    duration: '23\'',
    thumbnailUrl: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
  }
];

export const upcomingMatches: Match[] = [
  {
    id: 'upcoming-1',
    homeTeam: teams[4],
    awayTeam: teams[5],
    score: { home: 0, away: 0 },
    status: 'upcoming',
    startTime: new Date(Date.now() + 2 * 60 * 60000).toISOString(),
    league: 'Premier League',
    venue: 'Etihad Stadium',
    thumbnailUrl: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop'
  },
  {
    id: 'upcoming-2',
    homeTeam: teams[1],
    awayTeam: teams[2],
    score: { home: 0, away: 0 },
    status: 'upcoming',
    startTime: new Date(Date.now() + 24 * 60 * 60000).toISOString(),
    league: 'Premier League',
    venue: 'Anfield',
    thumbnailUrl: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop'
  }
];

// Convert Supabase video to Highlight format
export const createHighlightFromVideo = (video: any, match?: Match): Highlight => ({
  id: video.id,
  title: video.title,
  match: match || liveMatches[0], // Use first live match as fallback
  duration: `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}`,
  thumbnailUrl: video.thumbnail_url || 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
  videoUrl: video.video_url,
  views: video.views || 0,
  timestamp: video.created_at ? getTimeAgo(video.created_at) : 'Recently',
  description: video.description || '',
  tags: extractTagsFromTitle(video.title)
});

// Helper function to extract tags from video title
const extractTagsFromTitle = (title: string): string[] => {
  const tags = [];
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('goal')) tags.push('goals');
  if (lowerTitle.includes('save')) tags.push('saves');
  if (lowerTitle.includes('skill')) tags.push('skills');
  if (lowerTitle.includes('premier league')) tags.push('premier-league');
  if (lowerTitle.includes('highlight')) tags.push('highlights');
  
  return tags.length > 0 ? tags : ['highlights'];
};

// Helper function to get time ago
const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks} weeks ago`;
};

export const highlights: Highlight[] = [
  {
    id: 'highlight-1',
    title: 'Best Goals of the Week',
    match: liveMatches[0],
    duration: '5:23',
    thumbnailUrl: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    views: 245000,
    timestamp: '2 hours ago',
    description: 'Amazing goals from this week\'s Premier League matches',
    tags: ['goals', 'premier-league', 'highlights']
  },
  {
    id: 'highlight-2',
    title: 'Incredible Saves Compilation',
    match: liveMatches[1],
    duration: '3:45',
    thumbnailUrl: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    views: 156000,
    timestamp: '5 hours ago',
    description: 'Best goalkeeper saves from recent matches',
    tags: ['saves', 'goalkeepers', 'highlights']
  }
];

export const chatMessages: ChatMessage[] = [
  {
    id: '1',
    user: 'FootballFan23',
    message: 'What a goal! Incredible strike!',
    timestamp: '2 min ago'
  },
  {
    id: '2',
    user: 'RedDevil',
    message: 'Best match of the season so far!',
    timestamp: '3 min ago',
    isPinned: true
  },
  {
    id: '3',
    user: 'LiverpoolLad',
    message: 'Great defending there',
    timestamp: '5 min ago'
  }
];

export const gameStats: GameStats = {
  possession: { home: 65, away: 35 },
  shots: { home: 12, away: 8 },
  shotsOnTarget: { home: 6, away: 3 },
  fouls: { home: 8, away: 12 },
  corners: { home: 7, away: 4 },
  yellowCards: { home: 2, away: 3 },
  redCards: { home: 0, away: 1 }
};

export const timelineEvents: TimelineEvent[] = [
  {
    id: '1',
    type: 'goal',
    time: '23\'',
    team: 'home',
    player: 'Marcus Rashford',
    description: 'Goal by Marcus Rashford'
  },
  {
    id: '2',
    type: 'card',
    time: '45\'',
    team: 'away',
    player: 'Jordan Henderson',
    description: 'Yellow card for Jordan Henderson'
  },
  {
    id: '3',
    type: 'goal',
    time: '67\'',
    team: 'home',
    player: 'Bruno Fernandes',
    description: 'Goal by Bruno Fernandes'
  }
];

export const currentUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
  favoriteTeams: ['1', '2'],
  watchHistory: ['live-1', 'highlight-1'],
  subscription: 'premium'
};