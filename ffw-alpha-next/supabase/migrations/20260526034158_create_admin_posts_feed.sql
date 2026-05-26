/*
  # Create admin posts feed system

  1. New Tables
    - `admin_posts`
      - `id` (uuid, primary key)
      - `admin_email` (text, who posted)
      - `title` (text, post title)
      - `content` (text, post body)
      - `media_url` (text, video/image URL)
      - `media_type` (text: 'video', 'image', 'none')
      - `category` (text: 'guideline', 'update', 'new_feature', 'announcement', 'maintenance')
      - `likes` (integer, default 0)
      - `shares` (integer, default 0)
      - `downloads` (integer, default 0)
      - `status` (text: 'published', 'draft', 'archived')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on admin_posts
    - Anyone can read published posts
    - Only service_role can create/update/delete
*/

CREATE TABLE IF NOT EXISTS admin_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email text NOT NULL,
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  media_url text DEFAULT '',
  media_type text NOT NULL DEFAULT 'none' CHECK (media_type IN ('video', 'image', 'none')),
  category text NOT NULL DEFAULT 'announcement' CHECK (category IN ('guideline', 'update', 'new_feature', 'announcement', 'maintenance')),
  likes integer DEFAULT 0,
  shares integer DEFAULT 0,
  downloads integer DEFAULT 0,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published posts"
  ON admin_posts FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Service role manages posts"
  ON admin_posts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_admin_posts_status ON admin_posts(status);
CREATE INDEX IF NOT EXISTS idx_admin_posts_category ON admin_posts(category);
CREATE INDEX IF NOT EXISTS idx_admin_posts_created ON admin_posts(created_at DESC);