/*
  # Create staging schema for sandbox testing environment

  1. Changes
    - Create a separate `staging` schema for sandbox testing
    - This isolates sandbox data from production data
    - Admin can promote features from staging to production
  
  2. New Schema Objects
    - `staging.sandbox_features` - mirrors public sandbox_features for testing
    - `staging.sandbox_feedback` - mirrors public sandbox_feedback for testing
    - `staging.staging_deployments` - tracks feature promotions from staging to live
    - `staging.connection_audit` - logs self-hosted DB connection attempts
  
  3. Security
    - Staging schema is isolated from production
    - Only service_role can manage staging data
    - Deployment history tracked for rollback capability
*/

CREATE SCHEMA IF NOT EXISTS staging;

CREATE TABLE IF NOT EXISTS staging.sandbox_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id text UNIQUE NOT NULL,
  feature_type text NOT NULL CHECK (feature_type IN ('tool', 'setting', 'bugfix', 'ui')),
  name text NOT NULL,
  description text DEFAULT '',
  code_url text DEFAULT '',
  status text NOT NULL DEFAULT 'testing' CHECK (status IN ('testing', 'approved_for_live', 'live', 'archived', 'rolled_back')),
  test_results jsonb DEFAULT '{}'::jsonb,
  admin_notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  deployed_at timestamptz,
  promoted_by text DEFAULT ''
);

ALTER TABLE staging.sandbox_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages staging features"
  ON staging.sandbox_features FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS staging.sandbox_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staging_feature_id uuid NOT NULL REFERENCES staging.sandbox_features(id) ON DELETE CASCADE,
  user_email text DEFAULT '',
  rating integer CHECK (rating >= 1 AND rating <= 5),
  feedback text NOT NULL DEFAULT '',
  feature_status text NOT NULL DEFAULT 'works_well' CHECK (feature_status IN ('works_well', 'has_bugs', 'needs_improvement', 'broken')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE staging.sandbox_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages staging feedback"
  ON staging.sandbox_feedback FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can submit staging feedback"
  ON staging.sandbox_feedback FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS staging.staging_deployments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id text NOT NULL,
  action text NOT NULL CHECK (action IN ('promote_to_live', 'rollback', 'archive')),
  admin_email text NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE staging.staging_deployments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages deployments"
  ON staging.staging_deployments FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS staging.connection_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_url text NOT NULL,
  anon_key_fingerprint text DEFAULT '',
  source_ip text DEFAULT '',
  status text NOT NULL DEFAULT 'attempted' CHECK (status IN ('attempted', 'allowed', 'rejected', 'revoked')),
  reason text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE staging.connection_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages connection audit"
  ON staging.connection_audit FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_staging_features_status ON staging.sandbox_features(status);
CREATE INDEX IF NOT EXISTS idx_staging_feedback_feature ON staging.sandbox_feedback(staging_feature_id);
CREATE INDEX IF NOT EXISTS idx_staging_deployments_feature ON staging.staging_deployments(feature_id);
CREATE INDEX IF NOT EXISTS idx_connection_audit_status ON staging.connection_audit(status);
CREATE INDEX IF NOT EXISTS idx_connection_audit_url ON staging.connection_audit(connection_url);