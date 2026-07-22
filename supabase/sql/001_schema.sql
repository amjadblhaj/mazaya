-- ============================================================================
-- MAZAYA — Full schema. Run once, top to bottom, in the Supabase SQL Editor.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Tenants (one row per customer academy)
-- ----------------------------------------------------------------------------
CREATE TABLE tenants (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  academy_name_ar      TEXT NOT NULL,
  academy_name_en      TEXT NOT NULL,
  logo_url             TEXT,

  color_primary        TEXT DEFAULT '#170C79',
  color_secondary      TEXT DEFAULT '#EFE3CA',
  color_accent         TEXT DEFAULT '#56B6C6',
  color_dark           TEXT DEFAULT '#0E0850',

  contact_phone        TEXT,
  contact_email        TEXT,
  welcome_message      TEXT DEFAULT 'أهلاً بك في نظام النقاط',

  subdomain            TEXT UNIQUE NOT NULL,
  custom_domain        TEXT UNIQUE,

  owner_name           TEXT NOT NULL,
  owner_email          TEXT NOT NULL UNIQUE,
  owner_phone          TEXT,

  plan                 TEXT CHECK (plan IN ('basic','standard','pro')) DEFAULT 'basic',
  max_branches         INTEGER DEFAULT 5,
  max_students         INTEGER DEFAULT 500,
  status               TEXT CHECK (status IN ('trial','active','suspended','expired')) DEFAULT 'trial',
  trial_ends_at        TIMESTAMPTZ DEFAULT NOW() + INTERVAL '14 days',
  subscription_ends_at TIMESTAMPTZ,

  -- Brand colors must be validated as #RRGGBB before they ever reach here (app layer),
  -- since they get injected verbatim into a <style> tag on every tenant page render.
  CONSTRAINT color_primary_hex   CHECK (color_primary   ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT color_secondary_hex CHECK (color_secondary ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT color_accent_hex    CHECK (color_accent    ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT color_dark_hex      CHECK (color_dark      ~ '^#[0-9A-Fa-f]{6}$'),

  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ----------------------------------------------------------------------------
-- 2. Subscriptions
-- ----------------------------------------------------------------------------
CREATE TABLE subscriptions (
  id                 SERIAL PRIMARY KEY,
  tenant_id          UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan               TEXT NOT NULL,
  amount             DECIMAL(10,2) NOT NULL,
  currency           TEXT DEFAULT 'LYD',
  branches_included  INTEGER NOT NULL DEFAULT 5,
  students_included  INTEGER NOT NULL DEFAULT 500,
  status             TEXT CHECK (status IN ('pending','active','cancelled','expired')) DEFAULT 'pending',
  payment_ref        TEXT,
  payment_note       TEXT,
  starts_at          TIMESTAMPTZ,
  ends_at            TIMESTAMPTZ,
  activated_by       TEXT,
  activated_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. Branch Add-ons
-- ----------------------------------------------------------------------------
CREATE TABLE branch_addons (
  id           SERIAL PRIMARY KEY,
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  branches     INTEGER NOT NULL DEFAULT 1,
  amount       DECIMAL(10,2) NOT NULL DEFAULT 50,
  currency     TEXT DEFAULT 'LYD',
  status       TEXT CHECK (status IN ('pending','active','rejected')) DEFAULT 'pending',
  payment_ref  TEXT,
  activated_by TEXT,
  activated_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. Super Admins (Mazaya platform admins — NOT tenant admins)
--    Auth model: real Supabase Auth users (see auth_user_id). The `password`
--    column from the original spec is dropped — Supabase Auth owns credentials
--    so we never touch or store plaintext/hashes for platform admins ourselves.
-- ----------------------------------------------------------------------------
CREATE TABLE super_admins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id  UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. Staff (per tenant)
--    Auth model: real Supabase Auth users. auth_user_id is what RLS keys off
--    (auth.uid()). `password` is dropped for the same reason as super_admins —
--    Supabase Auth is the source of truth for credentials, not this table.
-- ----------------------------------------------------------------------------
CREATE TABLE staff (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  auth_user_id  UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT NOT NULL,
  branch_id     INTEGER,
  role          TEXT CHECK (role IN ('admin','staff')) DEFAULT 'staff',
  active        BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, username)
);

-- ----------------------------------------------------------------------------
-- 6. Branches (per tenant)
-- ----------------------------------------------------------------------------
CREATE TABLE branches (
  id         SERIAL PRIMARY KEY,
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name_ar    TEXT NOT NULL,
  name_en    TEXT,
  active     BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE staff ADD CONSTRAINT staff_branch_fk
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- 7. Students (per tenant)
--    Auth model: NOT Supabase Auth users. Students log in via a tenant-scoped
--    phone+password check performed in a server action / route handler using
--    the service-role client (bcrypt compare against `password`), then get an
--    app-issued session cookie. They never talk to Postgres directly with an
--    anon key, so RLS is not the enforcement point for student access —
--    tenant_id filtering in server code is. RLS stays enabled as a backstop.
-- ----------------------------------------------------------------------------
CREATE TABLE students (
  id         SERIAL PRIMARY KEY,
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  full_name  TEXT NOT NULL,
  phone      TEXT NOT NULL,
  branch_id  INTEGER REFERENCES branches(id),
  password   TEXT NOT NULL, -- bcrypt hash, cost 12
  points     INTEGER DEFAULT 0 CHECK (points >= 0),
  active     BOOLEAN DEFAULT true,
  joined_at  DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, phone)
);

-- ----------------------------------------------------------------------------
-- 8. Points Log (per tenant)
-- ----------------------------------------------------------------------------
CREATE TABLE points_log (
  id         SERIAL PRIMARY KEY,
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  points     INTEGER NOT NULL,
  action     TEXT NOT NULL,
  type       TEXT CHECK (type IN ('grant','redeem','excel','manual','adjustment')),
  granted_by TEXT NOT NULL,
  branch_id  INTEGER REFERENCES branches(id),
  note       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 9. Rewards (per tenant)
-- ----------------------------------------------------------------------------
CREATE TABLE rewards (
  id              SERIAL PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name_ar         TEXT NOT NULL,
  name_en         TEXT,
  description     TEXT,
  points_required INTEGER NOT NULL CHECK (points_required > 0),
  active          BOOLEAN DEFAULT true,
  redeemed_count  INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 10. Redemptions (per tenant)
-- ----------------------------------------------------------------------------
CREATE TABLE redemptions (
  id          SERIAL PRIMARY KEY,
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  student_id  INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  reward_id   INTEGER NOT NULL REFERENCES rewards(id),
  status      TEXT CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by TEXT,
  note        TEXT
);

-- ----------------------------------------------------------------------------
-- 11. Notifications (per tenant)
-- ----------------------------------------------------------------------------
CREATE TABLE notifications (
  id         SERIAL PRIMARY KEY,
  tenant_id  UUID REFERENCES tenants(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  read       BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 12. Indexes
-- ----------------------------------------------------------------------------
CREATE INDEX idx_staff_tenant       ON staff(tenant_id);
CREATE INDEX idx_staff_auth_user    ON staff(auth_user_id);
CREATE INDEX idx_branches_tenant    ON branches(tenant_id);
CREATE INDEX idx_students_tenant    ON students(tenant_id);
CREATE INDEX idx_students_phone     ON students(tenant_id, phone);
CREATE INDEX idx_points_log_tenant  ON points_log(tenant_id);
CREATE INDEX idx_points_log_student ON points_log(student_id);
CREATE INDEX idx_points_log_date    ON points_log(created_at DESC);
CREATE INDEX idx_rewards_tenant     ON rewards(tenant_id);
CREATE INDEX idx_redemptions_tenant ON redemptions(tenant_id);
CREATE INDEX idx_tenants_subdomain  ON tenants(subdomain);

-- ----------------------------------------------------------------------------
-- 13. Tenant Stats View
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW tenant_stats AS
SELECT
  t.id                                                       AS tenant_id,
  t.academy_name_ar,
  t.plan,
  t.status,
  t.max_branches,
  t.max_students,
  t.subscription_ends_at,
  t.trial_ends_at,
  COUNT(DISTINCT b.id)                                       AS branches_used,
  COUNT(DISTINCT s.id) FILTER (WHERE s.active = true)       AS students_count,
  COALESCE(SUM(ao.branches) FILTER (WHERE ao.status = 'active'), 0) AS addon_branches,
  t.max_branches + COALESCE(SUM(ao.branches) FILTER (WHERE ao.status = 'active'), 0)
                                                             AS total_branches_allowed,
  COALESCE(SUM(sub.amount) FILTER (WHERE sub.status = 'active'), 0)
                                                             AS total_revenue
FROM tenants t
LEFT JOIN branches      b   ON b.tenant_id = t.id
LEFT JOIN students      s   ON s.tenant_id = t.id
LEFT JOIN branch_addons ao  ON ao.tenant_id = t.id
LEFT JOIN subscriptions sub ON sub.tenant_id = t.id
GROUP BY t.id;

-- ----------------------------------------------------------------------------
-- 14. RPC Functions
-- ----------------------------------------------------------------------------

-- Check branch limit
CREATE OR REPLACE FUNCTION can_add_branch(p_tenant_id UUID)
RETURNS JSONB AS $$
DECLARE v_stat RECORD;
BEGIN
  SELECT * INTO v_stat FROM tenant_stats WHERE tenant_id = p_tenant_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed',false,'reason','tenant_not_found');
  END IF;
  IF v_stat.status NOT IN ('active','trial') THEN
    RETURN jsonb_build_object('allowed',false,'reason','subscription_inactive');
  END IF;
  IF v_stat.status = 'trial' AND NOW() > (SELECT trial_ends_at FROM tenants WHERE id = p_tenant_id) THEN
    RETURN jsonb_build_object('allowed',false,'reason','trial_expired');
  END IF;
  IF v_stat.total_branches_allowed != -1 AND v_stat.branches_used >= v_stat.total_branches_allowed THEN
    RETURN jsonb_build_object('allowed',false,'reason','branch_limit_reached',
      'current',v_stat.branches_used,'max',v_stat.total_branches_allowed);
  END IF;
  RETURN jsonb_build_object('allowed',true,'current',v_stat.branches_used,'max',v_stat.total_branches_allowed);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check student limit
CREATE OR REPLACE FUNCTION can_add_student(p_tenant_id UUID)
RETURNS JSONB AS $$
DECLARE v_stat RECORD;
BEGIN
  SELECT * INTO v_stat FROM tenant_stats WHERE tenant_id = p_tenant_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed',false,'reason','tenant_not_found');
  END IF;
  IF v_stat.status NOT IN ('active','trial') THEN
    RETURN jsonb_build_object('allowed',false,'reason','subscription_inactive');
  END IF;
  IF v_stat.students_count >= v_stat.max_students AND v_stat.max_students != -1 THEN
    RETURN jsonb_build_object('allowed',false,'reason','student_limit_reached',
      'current',v_stat.students_count,'max',v_stat.max_students);
  END IF;
  RETURN jsonb_build_object('allowed',true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic reward redemption
CREATE OR REPLACE FUNCTION redeem_reward(
  p_tenant_id  UUID,
  p_student_id INTEGER,
  p_reward_id  INTEGER,
  p_granted_by TEXT
) RETURNS JSONB AS $$
DECLARE v_student students%ROWTYPE; v_reward rewards%ROWTYPE;
BEGIN
  SELECT * INTO v_student FROM students WHERE id = p_student_id AND tenant_id = p_tenant_id FOR UPDATE;
  SELECT * INTO v_reward  FROM rewards  WHERE id = p_reward_id  AND tenant_id = p_tenant_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('success',false,'error','Not found'); END IF;
  IF v_student.points < v_reward.points_required THEN
    RETURN jsonb_build_object('success',false,'error','Insufficient points'); END IF;
  IF NOT v_reward.active THEN
    RETURN jsonb_build_object('success',false,'error','Reward inactive'); END IF;
  UPDATE students SET points = points - v_reward.points_required
    WHERE id = p_student_id AND tenant_id = p_tenant_id;
  INSERT INTO points_log(tenant_id,student_id,points,action,type,granted_by,branch_id)
    VALUES(p_tenant_id,p_student_id,-v_reward.points_required,
           'استبدال: '||v_reward.name_ar,'redeem',p_granted_by,v_student.branch_id);
  INSERT INTO redemptions(tenant_id,student_id,reward_id,status)
    VALUES(p_tenant_id,p_student_id,p_reward_id,'pending');
  UPDATE rewards SET redeemed_count = redeemed_count + 1
    WHERE id = p_reward_id AND tenant_id = p_tenant_id;
  RETURN jsonb_build_object('success',true,'new_balance',v_student.points - v_reward.points_required);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Activate subscription (called by super admin)
CREATE OR REPLACE FUNCTION activate_subscription(
  p_tenant_id    UUID,
  p_plan         TEXT,
  p_months       INTEGER,
  p_payment_ref  TEXT,
  p_activated_by TEXT
) RETURNS JSONB AS $$
DECLARE v_max_b INTEGER; v_max_s INTEGER; v_amount DECIMAL;
BEGIN
  CASE p_plan
    WHEN 'basic'    THEN v_max_b := 5;  v_max_s := 500;  v_amount := 300;
    WHEN 'standard' THEN v_max_b := 10; v_max_s := 1500; v_amount := 500;
    WHEN 'pro'      THEN v_max_b := -1; v_max_s := -1;   v_amount := 800;
    ELSE RETURN jsonb_build_object('success',false,'error','Invalid plan');
  END CASE;
  UPDATE tenants SET plan=p_plan, max_branches=v_max_b, max_students=v_max_s,
    status='active', subscription_ends_at=NOW()+(p_months||' months')::INTERVAL
    WHERE id=p_tenant_id;
  INSERT INTO subscriptions(tenant_id,plan,amount,branches_included,students_included,
    status,payment_ref,starts_at,ends_at,activated_by,activated_at)
    VALUES(p_tenant_id,p_plan,v_amount*p_months,v_max_b,v_max_s,'active',p_payment_ref,
    NOW(),NOW()+(p_months||' months')::INTERVAL,p_activated_by,NOW());
  RETURN jsonb_build_object('success',true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic point grant/adjustment (manual grant, Excel import, and future
-- adjustment flows all go through this — mirrors redeem_reward's shape).
-- p_points may be negative (adjustment/correction); the students.points
-- CHECK(>= 0) constraint is the last line of defense against overdraft,
-- but this also checks explicitly to return a clean error instead of a
-- raw constraint-violation error to the caller.
CREATE OR REPLACE FUNCTION grant_points(
  p_tenant_id  UUID,
  p_student_id INTEGER,
  p_points     INTEGER,
  p_action     TEXT,
  p_type       TEXT,
  p_granted_by TEXT,
  p_branch_id  INTEGER DEFAULT NULL,
  p_note       TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE v_student students%ROWTYPE;
BEGIN
  IF p_points = 0 THEN
    RETURN jsonb_build_object('success',false,'error','points_zero');
  END IF;

  SELECT * INTO v_student FROM students WHERE id = p_student_id AND tenant_id = p_tenant_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success',false,'error','student_not_found');
  END IF;

  IF v_student.points + p_points < 0 THEN
    RETURN jsonb_build_object('success',false,'error','insufficient_points',
      'current',v_student.points);
  END IF;

  UPDATE students SET points = points + p_points WHERE id = p_student_id AND tenant_id = p_tenant_id;
  INSERT INTO points_log(tenant_id,student_id,points,action,type,granted_by,branch_id,note)
    VALUES(p_tenant_id,p_student_id,p_points,p_action,p_type,p_granted_by,p_branch_id,p_note);

  RETURN jsonb_build_object('success',true,'new_balance',v_student.points + p_points);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Activate branch addon
CREATE OR REPLACE FUNCTION activate_branch_addon(
  p_tenant_id    UUID,
  p_branches     INTEGER,
  p_payment_ref  TEXT,
  p_activated_by TEXT
) RETURNS JSONB AS $$
BEGIN
  UPDATE tenants SET max_branches = max_branches + p_branches WHERE id = p_tenant_id;
  INSERT INTO branch_addons(tenant_id,branches,amount,status,payment_ref,activated_by,activated_at)
    VALUES(p_tenant_id,p_branches,p_branches*50,'active',p_payment_ref,p_activated_by,NOW());
  RETURN jsonb_build_object('success',true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 15. RLS (Row Level Security)
--
-- Staff are real Supabase Auth users (staff.auth_user_id), so policies key off
-- auth.uid() directly — no subquery-by-id needed. Students are NOT Supabase
-- Auth users; the student portal is server-rendered / server-actioned using
-- the service-role client (which bypasses RLS), with tenant_id filtering done
-- in application code. RLS below is the staff-facing enforcement layer and a
-- defense-in-depth backstop for everything else.
-- ----------------------------------------------------------------------------
ALTER TABLE tenants       ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff         ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches      ENABLE ROW LEVEL SECURITY;
ALTER TABLE students      ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_log    ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards       ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_addons ENABLE ROW LEVEL SECURITY;

-- Staff can see their own row; tenant scoping for staff management goes
-- through the service-role client in admin-only server actions instead of
-- being opened up here (staff creating/editing other staff is a privileged
-- operation, not a general client-side RLS-gated one).
CREATE POLICY "staff_self" ON staff
  FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "tenant_staff_branches" ON branches
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM staff WHERE auth_user_id = auth.uid() LIMIT 1)
  );
CREATE POLICY "tenant_staff_students" ON students
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM staff WHERE auth_user_id = auth.uid() LIMIT 1)
  );
CREATE POLICY "tenant_staff_rewards" ON rewards
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM staff WHERE auth_user_id = auth.uid() LIMIT 1)
  );
CREATE POLICY "tenant_staff_logs" ON points_log
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM staff WHERE auth_user_id = auth.uid() LIMIT 1)
  );
CREATE POLICY "tenant_staff_redemptions" ON redemptions
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM staff WHERE auth_user_id = auth.uid() LIMIT 1)
  );
CREATE POLICY "tenant_staff_notifications" ON notifications
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM staff WHERE auth_user_id = auth.uid() LIMIT 1)
  );

-- tenants / subscriptions / branch_addons / super_admins have NO client-facing
-- policies: tenant branding lookups (by subdomain, pre-auth) and all super
-- admin operations go through the service-role client on the server, which
-- bypasses RLS entirely. Leaving RLS enabled with zero policies means the
-- anon/authenticated roles get nothing by default (deny-by-default).

-- ----------------------------------------------------------------------------
-- 16. Supabase Storage Bucket
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) VALUES ('tenant-logos', 'tenant-logos', true)
  ON CONFLICT (id) DO NOTHING;

-- storage.objects is a shared table across the whole project, so these
-- policies survive a "reset public schema" — DROP IF EXISTS first makes this
-- section safe to re-run on its own regardless of what already exists.
DROP POLICY IF EXISTS "logos_public_read" ON storage.objects;
CREATE POLICY "logos_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'tenant-logos');

DROP POLICY IF EXISTS "logos_auth_upload" ON storage.objects;
CREATE POLICY "logos_auth_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'tenant-logos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "logos_auth_update" ON storage.objects;
CREATE POLICY "logos_auth_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'tenant-logos' AND auth.role() = 'authenticated');
