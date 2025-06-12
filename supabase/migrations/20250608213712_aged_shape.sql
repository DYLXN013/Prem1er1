/*
  # Moderator System and Enhanced Features

  1. New Tables
    - `user_roles` - User role management (moderator, admin, user)
    - `user_watch_history` - Track user viewing history
    - `notifications` - In-app notification system
    - `video_quality_options` - Multiple quality options for videos
    - `match_events` - Real-time match events for timeline

  2. Enhanced Tables
    - Add role-based permissions
    - Add moderation capabilities
    - Add advanced video features

  3. Security
    - Role-based access control
    - Moderator permissions for content management
    - Enhanced RLS policies

  4. Functions
    - Notification triggers
    - Watch history tracking
    - Moderation functions
*/

-- Create user roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  granted_by uuid REFERENCES profiles(id),
  granted_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user watch history table
CREATE TABLE IF NOT EXISTS user_watch_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  video_id uuid REFERENCES videos(id),
  highlight_id uuid REFERENCES highlights(id),
  match_id uuid REFERENCES matches(id),
  progress_seconds integer DEFAULT 0,
  completed boolean DEFAULT false,
  last_watched timestamptz DEFAULT now(),
  UNIQUE(user_id, video_id),
  UNIQUE(user_id, highlight_id),
  UNIQUE(user_id, match_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('match_start', 'goal', 'new_highlight', 'system')),
  read boolean DEFAULT false,
  action_url text,
  expires_at timestamptz
);

-- Create video quality options table
CREATE TABLE IF NOT EXISTS video_quality_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  video_id uuid REFERENCES videos(id),
  highlight_id uuid REFERENCES highlights(id),
  quality text NOT NULL CHECK (quality IN ('480p', '720p', '1080p', '4k')),
  url text NOT NULL,
  bitrate integer,
  file_size bigint,
  UNIQUE(video_id, quality),
  UNIQUE(highlight_id, quality)
);

-- Create match events table for real-time timeline
CREATE TABLE IF NOT EXISTS match_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  match_id uuid REFERENCES matches(id) NOT NULL,
  minute integer NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('goal', 'yellow_card', 'red_card', 'substitution', 'offside', 'foul', 'corner', 'penalty')),
  team_side text NOT NULL CHECK (team_side IN ('home', 'away')),
  player_name text NOT NULL,
  description text NOT NULL,
  additional_data jsonb DEFAULT '{}'::jsonb
);

-- Add moderation fields to existing tables
DO $$
BEGIN
  -- Add moderation fields to videos
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'is_approved'
  ) THEN
    ALTER TABLE videos ADD COLUMN is_approved boolean DEFAULT true;
    ALTER TABLE videos ADD COLUMN moderated_by uuid REFERENCES profiles(id);
    ALTER TABLE videos ADD COLUMN moderated_at timestamptz;
    ALTER TABLE videos ADD COLUMN moderation_notes text;
  END IF;

  -- Add moderation fields to highlights
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'highlights' AND column_name = 'is_approved'
  ) THEN
    ALTER TABLE highlights ADD COLUMN is_approved boolean DEFAULT true;
    ALTER TABLE highlights ADD COLUMN moderated_by uuid REFERENCES profiles(id);
    ALTER TABLE highlights ADD COLUMN moderated_at timestamptz;
    ALTER TABLE highlights ADD COLUMN moderation_notes text;
  END IF;

  -- Add playback speed to videos and highlights
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'playback_speeds'
  ) THEN
    ALTER TABLE videos ADD COLUMN playback_speeds text[] DEFAULT ARRAY['0.5', '0.75', '1', '1.25', '1.5', '2'];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'highlights' AND column_name = 'playback_speeds'
  ) THEN
    ALTER TABLE highlights ADD COLUMN playback_speeds text[] DEFAULT ARRAY['0.5', '0.75', '1', '1.25', '1.5', '2'];
  END IF;

  -- Add camera angles to livestreams
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'livestreams' AND column_name = 'camera_angles'
  ) THEN
    ALTER TABLE livestreams ADD COLUMN camera_angles jsonb DEFAULT '[
      {"id": "main", "name": "Main Camera", "url": ""},
      {"id": "tactical", "name": "Tactical View", "url": ""},
      {"id": "player", "name": "Player Cam", "url": ""},
      {"id": "stadium", "name": "Stadium View", "url": ""}
    ]'::jsonb;
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_quality_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles
CREATE POLICY "Users can read own role" ON user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON user_roles FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Create policies for user_watch_history
CREATE POLICY "Users can manage own watch history" ON user_watch_history FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Create policies for notifications
CREATE POLICY "Users can read own notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Create policies for video_quality_options
CREATE POLICY "Public can read quality options" ON video_quality_options FOR SELECT TO public USING (true);
CREATE POLICY "Moderators can manage quality options" ON video_quality_options FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('moderator', 'admin'))
);

-- Create policies for match_events
CREATE POLICY "Public can read match events" ON match_events FOR SELECT TO public USING (true);
CREATE POLICY "Moderators can manage match events" ON match_events FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('moderator', 'admin'))
);

-- Update video policies for moderation
DROP POLICY IF EXISTS "Public can read videos" ON videos;
CREATE POLICY "Public can read approved videos" ON videos FOR SELECT TO public USING (is_approved = true);
CREATE POLICY "Moderators can read all videos" ON videos FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('moderator', 'admin'))
);

-- Update highlight policies for moderation
DROP POLICY IF EXISTS "Public can read highlights" ON highlights;
CREATE POLICY "Public can read approved highlights" ON highlights FOR SELECT TO public USING (is_approved = true);
CREATE POLICY "Moderators can read all highlights" ON highlights FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('moderator', 'admin'))
);

-- Allow moderators to update videos and highlights
CREATE POLICY "Moderators can update videos" ON videos FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('moderator', 'admin'))
);

CREATE POLICY "Moderators can delete videos" ON videos FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('moderator', 'admin'))
);

CREATE POLICY "Moderators can update highlights" ON highlights FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('moderator', 'admin'))
);

CREATE POLICY "Moderators can delete highlights" ON highlights FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('moderator', 'admin'))
);

-- Allow moderators to manage chat messages
CREATE POLICY "Moderators can delete any chat message" ON chat_messages FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('moderator', 'admin'))
);

CREATE POLICY "Moderators can update any chat message" ON chat_messages FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('moderator', 'admin'))
);

-- Functions for moderation
CREATE OR REPLACE FUNCTION get_user_role(user_uuid uuid)
RETURNS text AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM user_roles 
    WHERE user_id = user_uuid 
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_moderator(user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = user_uuid 
    AND role IN ('moderator', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track watch history
CREATE OR REPLACE FUNCTION track_watch_progress(
  content_type text,
  content_id uuid,
  progress_seconds integer,
  is_completed boolean DEFAULT false
)
RETURNS void AS $$
DECLARE
  user_uuid uuid;
BEGIN
  SELECT auth.uid() INTO user_uuid;
  
  IF user_uuid IS NULL THEN
    RETURN;
  END IF;

  IF content_type = 'video' THEN
    INSERT INTO user_watch_history (user_id, video_id, progress_seconds, completed, last_watched)
    VALUES (user_uuid, content_id, progress_seconds, is_completed, now())
    ON CONFLICT (user_id, video_id)
    DO UPDATE SET 
      progress_seconds = EXCLUDED.progress_seconds,
      completed = EXCLUDED.completed,
      last_watched = EXCLUDED.last_watched;
  ELSIF content_type = 'highlight' THEN
    INSERT INTO user_watch_history (user_id, highlight_id, progress_seconds, completed, last_watched)
    VALUES (user_uuid, content_id, progress_seconds, is_completed, now())
    ON CONFLICT (user_id, highlight_id)
    DO UPDATE SET 
      progress_seconds = EXCLUDED.progress_seconds,
      completed = EXCLUDED.completed,
      last_watched = EXCLUDED.last_watched;
  ELSIF content_type = 'match' THEN
    INSERT INTO user_watch_history (user_id, match_id, progress_seconds, completed, last_watched)
    VALUES (user_uuid, content_id, progress_seconds, is_completed, now())
    ON CONFLICT (user_id, match_id)
    DO UPDATE SET 
      progress_seconds = EXCLUDED.progress_seconds,
      completed = EXCLUDED.completed,
      last_watched = EXCLUDED.last_watched;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notifications
CREATE OR REPLACE FUNCTION create_notification(
  target_user_id uuid,
  notification_title text,
  notification_message text,
  notification_type text,
  action_url text DEFAULT NULL,
  expires_hours integer DEFAULT 24
)
RETURNS uuid AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (user_id, title, message, type, action_url, expires_at)
  VALUES (
    target_user_id, 
    notification_title, 
    notification_message, 
    notification_type, 
    action_url,
    now() + (expires_hours || ' hours')::interval
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to moderate content
CREATE OR REPLACE FUNCTION moderate_content(
  content_type text,
  content_id uuid,
  approved boolean,
  notes text DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  moderator_id uuid;
BEGIN
  SELECT auth.uid() INTO moderator_id;
  
  -- Check if user is moderator
  IF NOT is_moderator(moderator_id) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  IF content_type = 'video' THEN
    UPDATE videos 
    SET 
      is_approved = approved,
      moderated_by = moderator_id,
      moderated_at = now(),
      moderation_notes = notes
    WHERE id = content_id;
  ELSIF content_type = 'highlight' THEN
    UPDATE highlights 
    SET 
      is_approved = approved,
      moderated_by = moderator_id,
      moderated_at = now(),
      moderation_notes = notes
    WHERE id = content_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default user roles for existing users
INSERT INTO user_roles (user_id, role)
SELECT id, 'user'
FROM profiles
WHERE id NOT IN (SELECT user_id FROM user_roles)
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample match events for live matches
DO $$
DECLARE
  live_match_id uuid;
BEGIN
  SELECT id INTO live_match_id FROM matches WHERE status = 'live' LIMIT 1;
  
  IF live_match_id IS NOT NULL THEN
    INSERT INTO match_events (match_id, minute, event_type, team_side, player_name, description) VALUES
    (live_match_id, 23, 'goal', 'home', 'Marcus Rashford', 'Goal by Marcus Rashford'),
    (live_match_id, 45, 'yellow_card', 'away', 'Jordan Henderson', 'Yellow card for Jordan Henderson'),
    (live_match_id, 67, 'goal', 'home', 'Bruno Fernandes', 'Goal by Bruno Fernandes'),
    (live_match_id, 72, 'goal', 'away', 'Mohamed Salah', 'Goal by Mohamed Salah')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Insert sample quality options for videos
INSERT INTO video_quality_options (video_id, quality, url, bitrate)
SELECT 
  v.id,
  quality_option,
  v.video_url,
  CASE quality_option
    WHEN '480p' THEN 1000
    WHEN '720p' THEN 2500
    WHEN '1080p' THEN 5000
    WHEN '4k' THEN 15000
  END
FROM videos v
CROSS JOIN unnest(ARRAY['480p', '720p', '1080p']) AS quality_option
WHERE NOT EXISTS (
  SELECT 1 FROM video_quality_options vqo 
  WHERE vqo.video_id = v.id AND vqo.quality = quality_option
);

-- Insert sample quality options for highlights
INSERT INTO video_quality_options (highlight_id, quality, url, bitrate)
SELECT 
  h.id,
  quality_option,
  h.video_url,
  CASE quality_option
    WHEN '480p' THEN 1000
    WHEN '720p' THEN 2500
    WHEN '1080p' THEN 5000
    WHEN '4k' THEN 15000
  END
FROM highlights h
CROSS JOIN unnest(ARRAY['480p', '720p', '1080p']) AS quality_option
WHERE NOT EXISTS (
  SELECT 1 FROM video_quality_options vqo 
  WHERE vqo.highlight_id = h.id AND vqo.quality = quality_option
);