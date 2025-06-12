/*
  # Complete Football Streaming Platform Schema

  1. New Tables
    - `leagues` - Football leagues (Premier League, La Liga, etc.)
    - `teams` - Football teams with league associations
    - `matches` - Match fixtures and results
    - `video_categories` - Categories for organizing videos
    - `livestreams` - Live streaming data for matches
    - `highlights` - Highlight videos separate from main videos
    - `comments` - Comment system for videos and highlights
    - `chat_messages` - Live chat for streams
    - `user_favorites` - User favorite teams, videos, matches

  2. Enhanced Tables
    - Updated `videos` table with category and match references
    - Added proper relationships between all entities

  3. Security
    - Enable RLS on all new tables
    - Add policies for public read access and authenticated user actions

  4. Functions
    - View counting functions for videos and highlights
    - Viewer count management for livestreams
*/

-- Create leagues table
CREATE TABLE IF NOT EXISTS leagues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL UNIQUE,
  short_name text NOT NULL UNIQUE,
  logo_url text,
  country text,
  season text DEFAULT '2024-25'
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  short_name text NOT NULL,
  logo_url text,
  color text DEFAULT '#000000',
  league_id uuid REFERENCES leagues(id),
  founded_year integer,
  stadium text,
  UNIQUE(name, league_id)
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  home_team_id uuid REFERENCES teams(id) NOT NULL,
  away_team_id uuid REFERENCES teams(id) NOT NULL,
  league_id uuid REFERENCES leagues(id) NOT NULL,
  start_time timestamptz NOT NULL,
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'finished')),
  home_score integer DEFAULT 0,
  away_score integer DEFAULT 0,
  venue text,
  duration text,
  thumbnail_url text,
  is_featured boolean DEFAULT false
);

-- Create video_categories table
CREATE TABLE IF NOT EXISTS video_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL UNIQUE,
  description text,
  color text DEFAULT '#3b82f6'
);

-- Update videos table to include category and match reference
DO $$
BEGIN
  -- Add category_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE videos ADD COLUMN category_id uuid REFERENCES video_categories(id);
  END IF;

  -- Add match_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'match_id'
  ) THEN
    ALTER TABLE videos ADD COLUMN match_id uuid REFERENCES matches(id);
  END IF;

  -- Add tags column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'tags'
  ) THEN
    ALTER TABLE videos ADD COLUMN tags text[] DEFAULT '{}';
  END IF;

  -- Add is_live column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'is_live'
  ) THEN
    ALTER TABLE videos ADD COLUMN is_live boolean DEFAULT false;
  END IF;
END $$;

-- Create livestreams table
CREATE TABLE IF NOT EXISTS livestreams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  match_id uuid REFERENCES matches(id) NOT NULL,
  stream_url text NOT NULL,
  stream_key text,
  status text DEFAULT 'offline' CHECK (status IN ('offline', 'live', 'ended')),
  viewer_count integer DEFAULT 0,
  chat_enabled boolean DEFAULT true,
  quality_options jsonb DEFAULT '["720p", "1080p"]'::jsonb
);

-- Create highlights table (separate from videos for better organization)
CREATE TABLE IF NOT EXISTS highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  thumbnail_url text,
  duration integer NOT NULL, -- in seconds
  match_id uuid REFERENCES matches(id),
  category_id uuid REFERENCES video_categories(id),
  tags text[] DEFAULT '{}',
  views integer DEFAULT 0,
  likes integer DEFAULT 0,
  user_id uuid REFERENCES profiles(id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  content text NOT NULL,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  video_id uuid REFERENCES videos(id),
  highlight_id uuid REFERENCES highlights(id),
  parent_id uuid REFERENCES comments(id), -- for replies
  likes integer DEFAULT 0,
  is_pinned boolean DEFAULT false,
  CONSTRAINT comment_target_check CHECK (
    (video_id IS NOT NULL AND highlight_id IS NULL) OR
    (video_id IS NULL AND highlight_id IS NOT NULL)
  )
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  message text NOT NULL,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  livestream_id uuid REFERENCES livestreams(id),
  match_id uuid REFERENCES matches(id),
  is_pinned boolean DEFAULT false,
  is_deleted boolean DEFAULT false
);

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  team_id uuid REFERENCES teams(id),
  video_id uuid REFERENCES videos(id),
  highlight_id uuid REFERENCES highlights(id),
  match_id uuid REFERENCES matches(id),
  UNIQUE(user_id, team_id),
  UNIQUE(user_id, video_id),
  UNIQUE(user_id, highlight_id),
  UNIQUE(user_id, match_id)
);

-- Enable RLS on all tables
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public can read leagues" ON leagues FOR SELECT TO public USING (true);
CREATE POLICY "Public can read teams" ON teams FOR SELECT TO public USING (true);
CREATE POLICY "Public can read matches" ON matches FOR SELECT TO public USING (true);
CREATE POLICY "Public can read video categories" ON video_categories FOR SELECT TO public USING (true);
CREATE POLICY "Public can read livestreams" ON livestreams FOR SELECT TO public USING (true);
CREATE POLICY "Public can read highlights" ON highlights FOR SELECT TO public USING (true);
CREATE POLICY "Public can read comments" ON comments FOR SELECT TO public USING (true);

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can insert comments" ON comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert chat messages" ON chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public can read chat messages" ON chat_messages FOR SELECT TO public USING (NOT is_deleted);

CREATE POLICY "Users can manage own favorites" ON user_favorites FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Insert sample data (only if not exists)
DO $$
BEGIN
  -- Insert leagues if they don't exist
  IF NOT EXISTS (SELECT 1 FROM leagues WHERE short_name = 'EPL') THEN
    INSERT INTO leagues (name, short_name, logo_url, country) VALUES
      ('Premier League', 'EPL', 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', 'England');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM leagues WHERE short_name = 'LaLiga') THEN
    INSERT INTO leagues (name, short_name, logo_url, country) VALUES
      ('La Liga', 'LaLiga', 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', 'Spain');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM leagues WHERE short_name = 'BL') THEN
    INSERT INTO leagues (name, short_name, logo_url, country) VALUES
      ('Bundesliga', 'BL', 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', 'Germany');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM leagues WHERE short_name = 'SerieA') THEN
    INSERT INTO leagues (name, short_name, logo_url, country) VALUES
      ('Serie A', 'SerieA', 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', 'Italy');
  END IF;
END $$;

-- Insert video categories if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM video_categories WHERE name = 'Highlights') THEN
    INSERT INTO video_categories (name, description, color) VALUES
      ('Highlights', 'Match highlights and best moments', '#3b82f6');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM video_categories WHERE name = 'Goals') THEN
    INSERT INTO video_categories (name, description, color) VALUES
      ('Goals', 'Goal compilations and amazing strikes', '#10b981');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM video_categories WHERE name = 'Saves') THEN
    INSERT INTO video_categories (name, description, color) VALUES
      ('Saves', 'Incredible goalkeeper saves', '#f59e0b');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM video_categories WHERE name = 'Skills') THEN
    INSERT INTO video_categories (name, description, color) VALUES
      ('Skills', 'Player skills and tricks', '#8b5cf6');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM video_categories WHERE name = 'Interviews') THEN
    INSERT INTO video_categories (name, description, color) VALUES
      ('Interviews', 'Player and manager interviews', '#ef4444');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM video_categories WHERE name = 'Analysis') THEN
    INSERT INTO video_categories (name, description, color) VALUES
      ('Analysis', 'Match analysis and tactical breakdowns', '#6b7280');
  END IF;
END $$;

-- Insert teams if they don't exist
DO $$
DECLARE
  epl_id uuid;
BEGIN
  SELECT id INTO epl_id FROM leagues WHERE short_name = 'EPL' LIMIT 1;
  
  IF epl_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM teams WHERE name = 'Manchester United' AND league_id = epl_id) THEN
      INSERT INTO teams (name, short_name, logo_url, color, league_id, stadium) VALUES
        ('Manchester United', 'MUN', 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', '#DA020E', epl_id, 'Old Trafford');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM teams WHERE name = 'Liverpool FC' AND league_id = epl_id) THEN
      INSERT INTO teams (name, short_name, logo_url, color, league_id, stadium) VALUES
        ('Liverpool FC', 'LIV', 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', '#C8102E', epl_id, 'Anfield');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM teams WHERE name = 'Arsenal FC' AND league_id = epl_id) THEN
      INSERT INTO teams (name, short_name, logo_url, color, league_id, stadium) VALUES
        ('Arsenal FC', 'ARS', 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', '#EF0107', epl_id, 'Emirates Stadium');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM teams WHERE name = 'Chelsea FC' AND league_id = epl_id) THEN
      INSERT INTO teams (name, short_name, logo_url, color, league_id, stadium) VALUES
        ('Chelsea FC', 'CHE', 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', '#034694', epl_id, 'Stamford Bridge');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM teams WHERE name = 'Manchester City' AND league_id = epl_id) THEN
      INSERT INTO teams (name, short_name, logo_url, color, league_id, stadium) VALUES
        ('Manchester City', 'MCI', 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', '#6CABDD', epl_id, 'Etihad Stadium');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM teams WHERE name = 'Tottenham' AND league_id = epl_id) THEN
      INSERT INTO teams (name, short_name, logo_url, color, league_id, stadium) VALUES
        ('Tottenham', 'TOT', 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', '#132257', epl_id, 'Tottenham Hotspur Stadium');
    END IF;
  END IF;
END $$;

-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_video_views(video_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE videos SET views = COALESCE(views, 0) + 1 WHERE id = video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_highlight_views(highlight_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE highlights SET views = COALESCE(views, 0) + 1 WHERE id = highlight_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update livestream viewer count
CREATE OR REPLACE FUNCTION update_viewer_count(stream_id uuid, count_change integer)
RETURNS void AS $$
BEGIN
  UPDATE livestreams 
  SET viewer_count = GREATEST(0, COALESCE(viewer_count, 0) + count_change)
  WHERE id = stream_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;