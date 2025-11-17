-- Create scene_objects table for storing 3D objects
CREATE TABLE IF NOT EXISTS scene_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('cube', 'sphere')),
  position JSONB NOT NULL DEFAULT '[0, 0, 0]',
  rotation JSONB NOT NULL DEFAULT '[0, 0, 0]',
  scale JSONB NOT NULL DEFAULT '[1, 1, 1]',
  color TEXT NOT NULL DEFAULT '#3b82f6',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved_scenes table for scene persistence
CREATE TABLE IF NOT EXISTS saved_scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  scene_data JSONB NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE scene_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_scenes ENABLE ROW LEVEL SECURITY;

-- Create policies for scene_objects (anyone can read/write for multiplayer)
CREATE POLICY "Anyone can view scene objects" ON scene_objects
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert scene objects" ON scene_objects
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update scene objects" ON scene_objects
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete scene objects" ON scene_objects
  FOR DELETE USING (true);

-- Create policies for saved_scenes (users can manage their own scenes)
CREATE POLICY "Users can view all saved scenes" ON saved_scenes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own saved scenes" ON saved_scenes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved scenes" ON saved_scenes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved scenes" ON saved_scenes
  FOR DELETE USING (auth.uid() = user_id);

-- Enable Realtime for scene_objects
ALTER PUBLICATION supabase_realtime ADD TABLE scene_objects;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_scene_objects_created_at ON scene_objects(created_at);
CREATE INDEX IF NOT EXISTS idx_saved_scenes_user_id ON saved_scenes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_scenes_created_at ON saved_scenes(created_at);

