/*
  # Watch Parties Feature Schema

  1. New Tables
    - `watch_parties`
      - `id` (uuid, primary key)
      - `host_id` (uuid, references profiles)
      - `video_id` (uuid, references videos, optional)
      - `highlight_id` (uuid, references highlights, optional)
      - `match_id` (uuid, references matches, optional)
      - `name` (text, party name)
      - `description` (text, optional)
      - `is_public` (boolean, default true)
      - `max_participants` (integer, default 10)
      - `playback_time` (integer, current playback position in seconds)
      - `is_playing` (boolean, playback state)
      - `scheduled_start` (timestamptz, optional)
      - `status` (text, party status)
    
    - `watch_party_participants`
      - `id` (uuid, primary key)
      - `watch_party_id` (uuid, references watch_parties)
      - `user_id` (uuid, references profiles)
      - `joined_at` (timestamptz)
      - `is_active` (boolean)
    
    - `watch_party_messages`
      - `id` (uuid, primary key)
      - `watch_party_id` (uuid, references watch_parties)
      - `user_id` (uuid, references profiles)
      - `message` (text)
      - `message_type` (text, chat/system/reaction)

  2. Security
    - Enable RLS on all tables
    - Public can read public watch parties
    - Users can read private parties they're in
    - Hosts can manage their parties
    - Participants can send messages
*/

-- Watch Parties table
CREATE TABLE IF NOT EXISTS watch_parties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  host_id uuid REFERENCES profiles(id) NOT NULL,
  video_id uuid REFERENCES videos(id),
  highlight_id uuid REFERENCES highlights(id),
  match_id uuid REFERENCES matches(id),
  name text NOT NULL,
  description text,
  is_public boolean DEFAULT true,
  max_participants integer DEFAULT 10,
  playback_time integer DEFAULT 0,
  is_playing boolean DEFAULT false,
  scheduled_start timestamptz,
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'ended'))
);

-- Watch Party Participants table
CREATE TABLE IF NOT EXISTS watch_party_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  watch_party_id uuid REFERENCES watch_parties(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  joined_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE(watch_party_id, user_id)
);

-- Watch Party Messages table
CREATE TABLE IF NOT EXISTS watch_party_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  watch_party_id uuid REFERENCES watch_parties(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  message text NOT NULL,
  message_type text DEFAULT 'chat' CHECK (message_type IN ('chat', 'system', 'reaction'))
);

-- Enable RLS
ALTER TABLE watch_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_party_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_party_messages ENABLE ROW LEVEL SECURITY;

-- Watch Parties policies
CREATE POLICY "Public can read public watch parties"
  ON watch_parties
  FOR SELECT
  TO public
  USING (is_public = true);

CREATE POLICY "Users can read private watch parties they're in"
  ON watch_parties
  FOR SELECT
  TO authenticated
  USING (
    NOT is_public AND (
      host_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM watch_party_participants 
        WHERE watch_party_id = id AND user_id = auth.uid() AND is_active = true
      )
    )
  );

CREATE POLICY "Authenticated users can create watch parties"
  ON watch_parties
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their watch parties"
  ON watch_parties
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_id)
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can delete their watch parties"
  ON watch_parties
  FOR DELETE
  TO authenticated
  USING (auth.uid() = host_id);

-- Watch Party Participants policies
CREATE POLICY "Users can read participants of parties they're in"
  ON watch_party_participants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM watch_parties 
      WHERE id = watch_party_id AND (
        is_public = true OR 
        host_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM watch_party_participants wp2
          WHERE wp2.watch_party_id = watch_party_id AND wp2.user_id = auth.uid() AND wp2.is_active = true
        )
      )
    )
  );

CREATE POLICY "Users can join watch parties"
  ON watch_party_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation"
  ON watch_party_participants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Hosts can manage participants"
  ON watch_party_participants
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM watch_parties 
      WHERE id = watch_party_id AND host_id = auth.uid()
    )
  );

-- Watch Party Messages policies
CREATE POLICY "Users can read messages from parties they're in"
  ON watch_party_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM watch_parties 
      WHERE id = watch_party_id AND (
        host_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM watch_party_participants 
          WHERE watch_party_id = watch_party_messages.watch_party_id 
          AND user_id = auth.uid() AND is_active = true
        )
      )
    )
  );

CREATE POLICY "Participants can send messages"
  ON watch_party_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM watch_parties 
      WHERE id = watch_party_id AND (
        host_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM watch_party_participants 
          WHERE watch_party_id = watch_party_messages.watch_party_id 
          AND user_id = auth.uid() AND is_active = true
        )
      )
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_watch_parties_status ON watch_parties(status);
CREATE INDEX IF NOT EXISTS idx_watch_parties_public ON watch_parties(is_public);
CREATE INDEX IF NOT EXISTS idx_watch_party_participants_active ON watch_party_participants(watch_party_id, is_active);
CREATE INDEX IF NOT EXISTS idx_watch_party_messages_party ON watch_party_messages(watch_party_id, created_at);