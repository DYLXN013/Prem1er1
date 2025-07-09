/*
  # Add Sample Data for Development

  1. Sample Data
    - Add sample matches with live and upcoming status
    - Add sample highlights with proper relationships
    - Add sample chat messages for testing real-time features

  2. Functions
    - Add function to generate realistic sample data
    - Add function to update match status for testing
*/

-- Insert sample matches if they don't exist
DO $$
DECLARE
  epl_id uuid;
  man_utd_id uuid;
  liverpool_id uuid;
  arsenal_id uuid;
  chelsea_id uuid;
  man_city_id uuid;
  tottenham_id uuid;
  goals_category_id uuid;
  highlights_category_id uuid;
BEGIN
  -- Get league and team IDs
  SELECT id INTO epl_id FROM leagues WHERE short_name = 'EPL' LIMIT 1;
  SELECT id INTO man_utd_id FROM teams WHERE short_name = 'MUN' LIMIT 1;
  SELECT id INTO liverpool_id FROM teams WHERE short_name = 'LIV' LIMIT 1;
  SELECT id INTO arsenal_id FROM teams WHERE short_name = 'ARS' LIMIT 1;
  SELECT id INTO chelsea_id FROM teams WHERE short_name = 'CHE' LIMIT 1;
  SELECT id INTO man_city_id FROM teams WHERE short_name = 'MCI' LIMIT 1;
  SELECT id INTO tottenham_id FROM teams WHERE short_name = 'TOT' LIMIT 1;
  
  -- Get category IDs
  SELECT id INTO goals_category_id FROM video_categories WHERE name = 'Goals' LIMIT 1;
  SELECT id INTO highlights_category_id FROM video_categories WHERE name = 'Highlights' LIMIT 1;

  -- Insert sample matches if teams exist
  IF man_utd_id IS NOT NULL AND liverpool_id IS NOT NULL THEN
    -- Live match
    INSERT INTO matches (
      home_team_id, away_team_id, league_id, start_time, status, 
      home_score, away_score, venue, duration, thumbnail_url, is_featured
    ) VALUES (
      man_utd_id, liverpool_id, epl_id, 
      now() - interval '67 minutes', 'live',
      2, 1, 'Old Trafford', '67''',
      'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
      true
    ) ON CONFLICT DO NOTHING;

    -- Upcoming match
    INSERT INTO matches (
      home_team_id, away_team_id, league_id, start_time, status, 
      home_score, away_score, venue, thumbnail_url
    ) VALUES (
      arsenal_id, chelsea_id, epl_id, 
      now() + interval '2 hours', 'upcoming',
      0, 0, 'Emirates Stadium',
      'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop'
    ) ON CONFLICT DO NOTHING;

    -- Another upcoming match
    INSERT INTO matches (
      home_team_id, away_team_id, league_id, start_time, status, 
      home_score, away_score, venue, thumbnail_url
    ) VALUES (
      man_city_id, tottenham_id, epl_id, 
      now() + interval '1 day', 'upcoming',
      0, 0, 'Etihad Stadium',
      'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop'
    ) ON CONFLICT DO NOTHING;

    -- Finished match
    INSERT INTO matches (
      home_team_id, away_team_id, league_id, start_time, status, 
      home_score, away_score, venue, thumbnail_url
    ) VALUES (
      liverpool_id, arsenal_id, epl_id, 
      now() - interval '2 days', 'finished',
      3, 1, 'Anfield',
      'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop'
    ) ON CONFLICT DO NOTHING;
  END IF;

  -- Insert sample highlights
  IF goals_category_id IS NOT NULL THEN
    INSERT INTO highlights (
      title, description, video_url, thumbnail_url, duration, 
      category_id, tags, views, likes
    ) VALUES 
    (
      'Best Goals of the Week - Premier League',
      'Amazing goals from this week''s Premier League matches including stunning strikes and incredible team moves.',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
      323, goals_category_id, ARRAY['goals', 'premier-league', 'highlights'], 245000, 12500
    ),
    (
      'Incredible Saves Compilation',
      'Best goalkeeper saves from recent Premier League matches showcasing world-class reflexes.',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
      225, highlights_category_id, ARRAY['saves', 'goalkeepers', 'highlights'], 156000, 8900
    ),
    (
      'Skills and Tricks Masterclass',
      'The most skillful moments from recent matches featuring incredible dribbles and tricks.',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
      187, highlights_category_id, ARRAY['skills', 'tricks', 'highlights'], 89000, 5600
    ),
    (
      'Match of the Day Highlights',
      'Extended highlights from the biggest match of the weekend.',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
      420, highlights_category_id, ARRAY['match-highlights', 'premier-league'], 320000, 18700
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Create function to simulate live match updates
CREATE OR REPLACE FUNCTION simulate_live_match_update(match_id uuid)
RETURNS void AS $$
BEGIN
  -- Randomly update score and duration for live matches
  UPDATE matches 
  SET 
    home_score = CASE WHEN random() > 0.7 THEN home_score + 1 ELSE home_score END,
    away_score = CASE WHEN random() > 0.8 THEN away_score + 1 ELSE away_score END,
    duration = (EXTRACT(EPOCH FROM (now() - start_time)) / 60)::integer || ''''
  WHERE id = match_id AND status = 'live';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to add sample chat messages
CREATE OR REPLACE FUNCTION add_sample_chat_messages(target_match_id uuid)
RETURNS void AS $$
DECLARE
  sample_messages text[] := ARRAY[
    'What a goal! Incredible strike!',
    'Best match of the season so far!',
    'Great defending there',
    'The goalkeeper is having an amazing game',
    'This is why I love football!',
    'Unbelievable skill from that player',
    'The atmosphere is electric!',
    'That was a close call by the referee',
    'Both teams are playing brilliantly',
    'Can''t believe that didn''t go in!'
  ];
  sample_usernames text[] := ARRAY[
    'FootballFan23', 'RedDevil', 'LiverpoolLad', 'GunnerForLife', 
    'BlueIsTheColour', 'CitizenBlue', 'SpursSupporter', 'PremierLeagueFan',
    'MatchWatcher', 'GoalMachine'
  ];
  i integer;
BEGIN
  -- Add 10 sample messages
  FOR i IN 1..10 LOOP
    INSERT INTO chat_messages (message, user_id, match_id, is_pinned)
    SELECT 
      sample_messages[1 + floor(random() * array_length(sample_messages, 1))],
      (SELECT id FROM profiles ORDER BY random() LIMIT 1),
      target_match_id,
      CASE WHEN i = 2 THEN true ELSE false END; -- Pin the second message
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;