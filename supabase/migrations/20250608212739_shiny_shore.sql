/*
  # Create videos table and fix auth issues

  1. New Tables
    - `videos`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `title` (text)
      - `description` (text, nullable)
      - `duration` (integer, seconds)
      - `thumbnail_url` (text, nullable)
      - `video_url` (text)
      - `user_id` (uuid, foreign key to profiles)
      - `views` (integer, default 0)

  2. Security
    - Enable RLS on `videos` table
    - Add policies for public read access
    - Add policies for authenticated users to manage their own videos
    - Update profiles table policies to allow user registration

  3. Changes
    - Fix profiles RLS policies to allow user signup
    - Add comprehensive video management policies
*/

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  title text NOT NULL,
  description text,
  duration integer NOT NULL,
  thumbnail_url text,
  video_url text NOT NULL,
  user_id uuid REFERENCES profiles(id),
  views integer DEFAULT 0
);

-- Enable RLS on videos table
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Videos policies
CREATE POLICY "Public can read videos"
  ON videos
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert videos"
  ON videos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own videos"
  ON videos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own videos"
  ON videos
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix profiles policies to allow user registration
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

-- Create new profiles policies
CREATE POLICY "Public can read profiles"
  ON profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add some sample videos for testing
INSERT INTO videos (title, description, duration, video_url, thumbnail_url, views) VALUES
  ('Amazing Goal Compilation', 'Best goals from this season', 180, 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop', 15420),
  ('Match Highlights: Team A vs Team B', 'Extended highlights from the championship match', 300, 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4', 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop', 8750),
  ('Skills and Tricks Masterclass', 'Learn the best football skills', 420, 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4', 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop', 12300),
  ('Behind the Scenes: Training Day', 'Exclusive look at team training', 240, 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop', 5680);