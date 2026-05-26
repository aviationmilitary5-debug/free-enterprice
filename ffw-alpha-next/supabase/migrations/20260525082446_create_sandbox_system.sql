/*
  # Create sandbox testing system tables

  1. New Tables
    - `sandbox_features`
      - `id` (uuid, primary key)
      - `feature_id` (text, unique identifier for feature/tool)
      - `feature_type` (text: 'tool', 'setting', 'bugfix', 'ui')
      - `name` (text, display name)
      - `description` (text)
      - `code_url` (text, GitHub commit link)
      - `status` (text: 'testing', 'live', 'archived')
      - `created_at` (timestamp)
      - `deployed_at` (timestamp, when it went live)

    - `sandbox_feedback`
      - `id` (uuid, primary key)
      - `sandbox_feature_id` (uuid, FK to sandbox_features)
      - `user_email` (text, tester email)
      - `rating` (integer, 1-5)
      - `feedback` (text, detailed feedback)
      - `feature_status` (text: 'works_well', 'has_bugs', 'needs_improvement', 'broken')
      - `created_at` (timestamp)

    - `sandbox_sessions`
      - `id` (uuid, primary key)
      - `session_token` (text, unique browser session token)
      - `features_enabled` (jsonb, array of feature IDs active in this session)
      - `created_at` (timestamp)
      - `last_accessed` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Service role can manage all
    - Users can insert feedback for active features
*/

CREATE TABLE IF NOT EXISTS sandbox_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id text UNIQUE NOT NULL,
  feature_type text NOT NULL CHECK (feature_type IN ('tool', 'setting', 'bugfix', 'ui')),
  name text NOT NULL,
  description text DEFAULT '',
  code_url text DEFAULT '',
  status text NOT NULL DEFAULT 'testing' CHECK (status IN ('testing', 'live', 'archived')),
  created_at timestamptz DEFAULT now(),
  deployed_at timestamptz
);

ALTER TABLE sandbox_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active sandbox features"
  ON sandbox_features FOR SELECT
  TO anon, authenticated
  USING (status IN ('testing', 'live'));

CREATE POLICY "Service role manages sandbox features"
  ON sandbox_features FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS sandbox_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sandbox_feature_id uuid NOT NULL REFERENCES sandbox_features(id) ON DELETE CASCADE,
  user_email text DEFAULT '',
  rating integer CHECK (rating >= 1 AND rating <= 5),
  feedback text NOT NULL DEFAULT '',
  feature_status text NOT NULL DEFAULT 'works_well' CHECK (feature_status IN ('works_well', 'has_bugs', 'needs_improvement', 'broken')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sandbox_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feedback"
  ON sandbox_feedback FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Service role can view all feedback"
  ON sandbox_feedback FOR SELECT
  TO service_role
  USING (true);

CREATE TABLE IF NOT EXISTS sandbox_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token text UNIQUE NOT NULL,
  features_enabled jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  last_accessed timestamptz DEFAULT now()
);

ALTER TABLE sandbox_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages sessions"
  ON sandbox_sessions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_sandbox_features_status ON sandbox_features(status);
CREATE INDEX IF NOT EXISTS idx_sandbox_features_type ON sandbox_features(feature_type);
CREATE INDEX IF NOT EXISTS idx_sandbox_feedback_feature ON sandbox_feedback(sandbox_feature_id);
CREATE INDEX IF NOT EXISTS idx_sandbox_sessions_token ON sandbox_sessions(session_token);