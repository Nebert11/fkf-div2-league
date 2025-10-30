-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table for role-based access control
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create zones table
CREATE TABLE public.zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on zones
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

-- Create seasons table
CREATE TABLE public.seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID REFERENCES public.zones(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (zone_id, name)
);

-- Enable RLS on seasons
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;

-- Create teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID REFERENCES public.zones(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  home_ground TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (zone_id, name)
);

-- Enable RLS on teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Create players table
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  jersey_number INTEGER,
  position TEXT,
  date_of_birth DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on players
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Create fixtures table
CREATE TABLE public.fixtures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID REFERENCES public.seasons(id) ON DELETE CASCADE NOT NULL,
  home_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  away_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  match_date TIMESTAMPTZ NOT NULL,
  venue TEXT,
  round_number INTEGER,
  is_played BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (home_team_id != away_team_id)
);

-- Enable RLS on fixtures
ALTER TABLE public.fixtures ENABLE ROW LEVEL SECURITY;

-- Create match_results table
CREATE TABLE public.match_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID REFERENCES public.fixtures(id) ON DELETE CASCADE NOT NULL UNIQUE,
  home_team_score INTEGER NOT NULL DEFAULT 0,
  away_team_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (home_team_score >= 0),
  CHECK (away_team_score >= 0)
);

-- Enable RLS on match_results
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;

-- Create standings table (materialized for performance)
CREATE TABLE public.standings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID REFERENCES public.seasons(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  played INTEGER DEFAULT 0,
  won INTEGER DEFAULT 0,
  drawn INTEGER DEFAULT 0,
  lost INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  goal_difference INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (season_id, team_id)
);

-- Enable RLS on standings
ALTER TABLE public.standings ENABLE ROW LEVEL SECURITY;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_zones_updated_at BEFORE UPDATE ON public.zones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seasons_updated_at BEFORE UPDATE ON public.seasons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON public.players
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fixtures_updated_at BEFORE UPDATE ON public.fixtures
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_match_results_updated_at BEFORE UPDATE ON public.match_results
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_standings_updated_at BEFORE UPDATE ON public.standings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for zones
CREATE POLICY "Anyone can view zones" ON public.zones
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert zones" ON public.zones
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update zones" ON public.zones
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete zones" ON public.zones
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for seasons
CREATE POLICY "Anyone can view seasons" ON public.seasons
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage seasons" ON public.seasons
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for teams
CREATE POLICY "Anyone can view teams" ON public.teams
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage teams" ON public.teams
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for players
CREATE POLICY "Anyone can view players" ON public.players
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage players" ON public.players
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for fixtures
CREATE POLICY "Anyone can view fixtures" ON public.fixtures
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage fixtures" ON public.fixtures
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for match_results
CREATE POLICY "Anyone can view match results" ON public.match_results
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage match results" ON public.match_results
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for standings
CREATE POLICY "Anyone can view standings" ON public.standings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage standings" ON public.standings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create function to update standings when match result is added/updated
CREATE OR REPLACE FUNCTION public.update_standings_from_result()
RETURNS TRIGGER AS $$
DECLARE
  v_season_id UUID;
  v_home_team_id UUID;
  v_away_team_id UUID;
  v_home_points INTEGER;
  v_away_points INTEGER;
BEGIN
  -- Get fixture details
  SELECT season_id, home_team_id, away_team_id
  INTO v_season_id, v_home_team_id, v_away_team_id
  FROM public.fixtures
  WHERE id = NEW.fixture_id;

  -- Calculate points
  IF NEW.home_team_score > NEW.away_team_score THEN
    v_home_points := 3;
    v_away_points := 0;
  ELSIF NEW.home_team_score < NEW.away_team_score THEN
    v_home_points := 0;
    v_away_points := 3;
  ELSE
    v_home_points := 1;
    v_away_points := 1;
  END IF;

  -- Update or insert home team standings
  INSERT INTO public.standings (season_id, team_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points)
  VALUES (
    v_season_id,
    v_home_team_id,
    1,
    CASE WHEN v_home_points = 3 THEN 1 ELSE 0 END,
    CASE WHEN v_home_points = 1 THEN 1 ELSE 0 END,
    CASE WHEN v_home_points = 0 THEN 1 ELSE 0 END,
    NEW.home_team_score,
    NEW.away_team_score,
    NEW.home_team_score - NEW.away_team_score,
    v_home_points
  )
  ON CONFLICT (season_id, team_id) DO UPDATE SET
    played = standings.played + 1,
    won = standings.won + CASE WHEN v_home_points = 3 THEN 1 ELSE 0 END,
    drawn = standings.drawn + CASE WHEN v_home_points = 1 THEN 1 ELSE 0 END,
    lost = standings.lost + CASE WHEN v_home_points = 0 THEN 1 ELSE 0 END,
    goals_for = standings.goals_for + NEW.home_team_score,
    goals_against = standings.goals_against + NEW.away_team_score,
    goal_difference = standings.goal_difference + (NEW.home_team_score - NEW.away_team_score),
    points = standings.points + v_home_points;

  -- Update or insert away team standings
  INSERT INTO public.standings (season_id, team_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points)
  VALUES (
    v_season_id,
    v_away_team_id,
    1,
    CASE WHEN v_away_points = 3 THEN 1 ELSE 0 END,
    CASE WHEN v_away_points = 1 THEN 1 ELSE 0 END,
    CASE WHEN v_away_points = 0 THEN 1 ELSE 0 END,
    NEW.away_team_score,
    NEW.home_team_score,
    NEW.away_team_score - NEW.home_team_score,
    v_away_points
  )
  ON CONFLICT (season_id, team_id) DO UPDATE SET
    played = standings.played + 1,
    won = standings.won + CASE WHEN v_away_points = 3 THEN 1 ELSE 0 END,
    drawn = standings.drawn + CASE WHEN v_away_points = 1 THEN 1 ELSE 0 END,
    lost = standings.lost + CASE WHEN v_away_points = 0 THEN 1 ELSE 0 END,
    goals_for = standings.goals_for + NEW.away_team_score,
    goals_against = standings.goals_against + NEW.home_team_score,
    goal_difference = standings.goal_difference + (NEW.away_team_score - NEW.home_team_score),
    points = standings.points + v_away_points;

  -- Mark fixture as played
  UPDATE public.fixtures SET is_played = true WHERE id = NEW.fixture_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to update standings
CREATE TRIGGER on_match_result_change
  AFTER INSERT OR UPDATE ON public.match_results
  FOR EACH ROW EXECUTE FUNCTION public.update_standings_from_result();

-- Insert initial zones
INSERT INTO public.zones (name, description) VALUES
  ('Zone A', 'FKF Division 2 Zone A'),
  ('Zone B', 'FKF Division 2 Zone B'),
  ('Zone C', 'FKF Division 2 Zone C'),
  ('Zone D', 'FKF Division 2 Zone D')
ON CONFLICT (name) DO NOTHING;