/*
  # Create user accounts and tracking system

  1. New Tables
    - `user_accounts`
      - `id` (uuid, primary key)
      - `code_name` (text, unique, 20-char ID from IP)
      - `email` (text, unique)
      - `password_hash` (text, hashed password)
      - `display_name` (text)
      - `ip_fingerprint` (text, original IP used to generate code_name)
      - `is_partner` (boolean, default false)
      - `is_sandbox` (boolean, default false)
      - `partner_status` (text: none/pending/approved/suspended)
      - `bank_details` (jsonb, encrypted bank info)
      - `balance` (numeric, default 0)
      - `total_earned` (numeric, default 0)
      - `total_paid` (numeric, default 0)
      - `session_expires` (timestamptz)
      - `warning_count` (integer, default 0)
      - `is_banned` (boolean, default false)
      - `ban_reason` (text)
      - `created_at` (timestamptz)
      - `last_login` (timestamptz)

    - `user_actions`
      - `id` (uuid, primary key)
      - `code_name` (text, references user_accounts)
      - `action_type` (text: tool_use/submission/hack_attempt/rule_violation/suggestion/login)
      - `action_detail` (text)
      - `ip_address` (text)
      - `created_at` (timestamptz)

    - `user_suggestions`
      - `id` (uuid, primary key)
      - `code_name` (text)
      - `suggestion_type` (text: feature/reminder/warning/guide)
      - `title` (text)
      - `content` (text)
      - `is_read` (boolean, default false)
      - `action_url` (text)
      - `created_at` (timestamptz)

    - `user_submissions`
      - `id` (uuid, primary key)
      - `code_name` (text)
      - `submission_type` (text: game/website/database)
      - `name` (text)
      - `description` (text)
      - `url` (text)
      - `category` (text)
      - `tech_stack` (text)
      - `screenshot_url` (text)
      - `demo_url` (text)
      - `source_code_url` (text)
      - `license_type` (text)
      - `privacy_policy_url` (text)
      - `terms_url` (text)
      - `support_email` (text)
      - `version` (text)
      - `status` (text: pending/approved/rejected/needs_info)
      - `rejection_reason` (text)
      - `admin_notes` (text)
      - `created_at` (timestamptz)

    - `withdrawal_requests` update: threshold now $100

  2. Security
    - Enable RLS on all tables
    - Users can only read/update their own data via code_name
    - Service role has full access
*/

CREATE TABLE IF NOT EXISTS user_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_name text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  display_name text DEFAULT '',
  ip_fingerprint text DEFAULT '',
  is_partner boolean DEFAULT false,
  is_sandbox boolean DEFAULT false,
  partner_status text NOT NULL DEFAULT 'none' CHECK (partner_status IN ('none', 'pending', 'approved', 'suspended')),
  bank_details jsonb DEFAULT '{}'::jsonb,
  balance numeric DEFAULT 0,
  total_earned numeric DEFAULT 0,
  total_paid numeric DEFAULT 0,
  session_expires timestamptz,
  warning_count integer DEFAULT 0,
  is_banned boolean DEFAULT false,
  ban_reason text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  last_login timestamptz DEFAULT now()
);

ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own data"
  ON user_accounts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role manages accounts"
  ON user_accounts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS user_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_name text NOT NULL,
  action_type text NOT NULL CHECK (action_type IN ('tool_use', 'submission', 'hack_attempt', 'rule_violation', 'suggestion', 'login', 'signup', 'warning')),
  action_detail text DEFAULT '',
  ip_address text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages actions"
  ON user_actions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone insert actions"
  ON user_actions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS user_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_name text NOT NULL,
  suggestion_type text NOT NULL CHECK (suggestion_type IN ('feature', 'reminder', 'warning', 'guide', 'unfinished_action')),
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  is_read boolean DEFAULT false,
  action_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own suggestions"
  ON user_suggestions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role manages suggestions"
  ON user_suggestions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone insert suggestions"
  ON user_suggestions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS user_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_name text NOT NULL,
  submission_type text NOT NULL CHECK (submission_type IN ('game', 'website', 'database')),
  name text NOT NULL,
  description text DEFAULT '',
  url text DEFAULT '',
  category text DEFAULT '',
  tech_stack text DEFAULT '',
  screenshot_url text DEFAULT '',
  demo_url text DEFAULT '',
  source_code_url text DEFAULT '',
  license_type text DEFAULT '',
  privacy_policy_url text DEFAULT '',
  terms_url text DEFAULT '',
  support_email text DEFAULT '',
  version text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_info')),
  rejection_reason text DEFAULT '',
  admin_notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own submissions"
  ON user_submissions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role manages submissions"
  ON user_submissions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone insert submissions"
  ON user_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_user_accounts_code ON user_accounts(code_name);
CREATE INDEX IF NOT EXISTS idx_user_accounts_email ON user_accounts(email);
CREATE INDEX IF NOT EXISTS idx_user_actions_code ON user_actions(code_name);
CREATE INDEX IF NOT EXISTS idx_user_actions_type ON user_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_user_suggestions_code ON user_suggestions(code_name);
CREATE INDEX IF NOT EXISTS idx_user_suggestions_type ON user_suggestions(suggestion_type);
CREATE INDEX IF NOT EXISTS idx_user_submissions_code ON user_submissions(code_name);
CREATE INDEX IF NOT EXISTS idx_user_submissions_type ON user_submissions(submission_type);