import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      videos: {
        Row: {
          id: string;
          created_at: string | null;
          title: string;
          description: string | null;
          duration: number;
          thumbnail_url: string | null;
          video_url: string;
          user_id: string | null;
          views: number | null;
        };
        Insert: {
          id?: string;
          created_at?: string | null;
          title: string;
          description?: string | null;
          duration: number;
          thumbnail_url?: string | null;
          video_url: string;
          user_id?: string | null;
          views?: number | null;
        };
        Update: {
          id?: string;
          created_at?: string | null;
          title?: string;
          description?: string | null;
          duration?: number;
          thumbnail_url?: string | null;
          video_url?: string;
          user_id?: string | null;
          views?: number | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          updated_at: string | null;
          username: string;
          avatar_url: string | null;
          join_date: string | null;
        };
        Insert: {
          id: string;
          updated_at?: string | null;
          username: string;
          avatar_url?: string | null;
          join_date?: string | null;
        };
        Update: {
          id?: string;
          updated_at?: string | null;
          username?: string;
          avatar_url?: string | null;
          join_date?: string | null;
        };
      };
      highlights: {
        Row: {
          id: string;
          created_at: string | null;
          title: string;
          description: string | null;
          video_url: string;
          thumbnail_url: string | null;
          duration: number;
          match_id: string | null;
          category_id: string | null;
          tags: string[] | null;
          views: number | null;
          likes: number | null;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string | null;
          title: string;
          description?: string | null;
          video_url: string;
          thumbnail_url?: string | null;
          duration: number;
          match_id?: string | null;
          category_id?: string | null;
          tags?: string[] | null;
          views?: number | null;
          likes?: number | null;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string | null;
          title?: string;
          description?: string | null;
          video_url?: string;
          thumbnail_url?: string | null;
          duration?: number;
          match_id?: string | null;
          category_id?: string | null;
          tags?: string[] | null;
          views?: number | null;
          likes?: number | null;
          user_id?: string | null;
        };
      };
      matches: {
        Row: {
          id: string;
          created_at: string | null;
          home_team_id: string;
          away_team_id: string;
          league_id: string;
          start_time: string;
          status: string | null;
          home_score: number | null;
          away_score: number | null;
          venue: string | null;
          duration: string | null;
          thumbnail_url: string | null;
          is_featured: boolean | null;
        };
        Insert: {
          id?: string;
          created_at?: string | null;
          home_team_id: string;
          away_team_id: string;
          league_id: string;
          start_time: string;
          status?: string | null;
          home_score?: number | null;
          away_score?: number | null;
          venue?: string | null;
          duration?: string | null;
          thumbnail_url?: string | null;
          is_featured?: boolean | null;
        };
        Update: {
          id?: string;
          created_at?: string | null;
          home_team_id?: string;
          away_team_id?: string;
          league_id?: string;
          start_time?: string;
          status?: string | null;
          home_score?: number | null;
          away_score?: number | null;
          venue?: string | null;
          duration?: string | null;
          thumbnail_url?: string | null;
          is_featured?: boolean | null;
        };
      };
      teams: {
        Row: {
          id: string;
          created_at: string | null;
          name: string;
          short_name: string;
          logo_url: string | null;
          color: string | null;
          league_id: string | null;
          founded_year: number | null;
          stadium: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string | null;
          name: string;
          short_name: string;
          logo_url?: string | null;
          color?: string | null;
          league_id?: string | null;
          founded_year?: number | null;
          stadium?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string | null;
          name?: string;
          short_name?: string;
          logo_url?: string | null;
          color?: string | null;
          league_id?: string | null;
          founded_year?: number | null;
          stadium?: string | null;
        };
      };
      leagues: {
        Row: {
          id: string;
          created_at: string | null;
          name: string;
          short_name: string;
          logo_url: string | null;
          country: string | null;
          season: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string | null;
          name: string;
          short_name: string;
          logo_url?: string | null;
          country?: string | null;
          season?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string | null;
          name?: string;
          short_name?: string;
          logo_url?: string | null;
          country?: string | null;
          season?: string | null;
        };
      };
    };
  };
};