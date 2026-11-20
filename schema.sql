CREATE TABLE IF NOT EXISTS users (
 id BIGSERIAL PRIMARY KEY,
 full_name TEXT NOT NULL,
 email TEXT NOT NULL UNIQUE,
 password_hash TEXT NOT NULL,
 role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('member','admin')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaigns (
 id BIGSERIAL PRIMARY KEY,
 user_id BIGINT NOT NULL REFERENCES users(id),
 title TEXT NOT NULL,
 description TEXT NOT NULL,
 target_amount NUMERIC(14,2) NOT NULL CHECK(target_amount > 0),
 category TEXT NOT NULL DEFAULT 'Community support',
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','active','rejected','closed')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contributions (
 id BIGSERIAL PRIMARY KEY,
 campaign_id BIGINT NOT NULL REFERENCES campaigns(id),
 user_id BIGINT NOT NULL REFERENCES users(id),
 amount NUMERIC(14,2) NOT NULL CHECK(amount > 0),
 reference TEXT NOT NULL UNIQUE,
 payment_status TEXT NOT NULL DEFAULT 'pending' CHECK(payment_status IN ('pending','paid','failed')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 paid_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS contribution_circles (
 id BIGSERIAL PRIMARY KEY,
 creator_id BIGINT NOT NULL REFERENCES users(id),
 name TEXT NOT NULL,
 amount_per_round NUMERIC(14,2) NOT NULL CHECK(amount_per_round > 0),
 frequency TEXT NOT NULL CHECK(frequency IN ('weekly','monthly')),
 member_limit INTEGER NOT NULL CHECK(member_limit BETWEEN 2 AND 100),
 rules TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','active','paused','completed','rejected')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS circle_members (
 id BIGSERIAL PRIMARY KEY,
 circle_id BIGINT NOT NULL REFERENCES contribution_circles(id) ON DELETE CASCADE,
 user_id BIGINT NOT NULL REFERENCES users(id),
 payout_position INTEGER,
 joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(circle_id,user_id),
 UNIQUE(circle_id,payout_position)
);

CREATE TABLE IF NOT EXISTS support_requests (
 id BIGSERIAL PRIMARY KEY,
 user_id BIGINT NOT NULL REFERENCES users(id),
 title TEXT NOT NULL,
 details TEXT NOT NULL,
 amount_needed NUMERIC(14,2) NOT NULL CHECK(amount_needed > 0),
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','open','fulfilled','rejected','closed')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS withdrawal_requests (
 id BIGSERIAL PRIMARY KEY,
 user_id BIGINT NOT NULL REFERENCES users(id),
 contribution_id BIGINT NOT NULL REFERENCES contributions(id),
 amount NUMERIC(14,2) NOT NULL CHECK(amount > 0),
 bank_name TEXT NOT NULL,
 account_number TEXT NOT NULL,
 account_name TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','paid','rejected')),
 admin_note TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 reviewed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS webhook_events (
 id BIGSERIAL PRIMARY KEY,
 event_id TEXT NOT NULL UNIQUE,
 event_type TEXT NOT NULL,
 received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS campaigns_status_idx ON campaigns(status);
CREATE INDEX IF NOT EXISTS contributions_user_idx ON contributions(user_id);
CREATE INDEX IF NOT EXISTS contributions_campaign_idx ON contributions(campaign_id);
CREATE INDEX IF NOT EXISTS withdrawal_status_idx ON withdrawal_requests(status);

-- After creating your first account, promote it to admin by running:
-- UPDATE users SET role='admin' WHERE email='your-email@example.com';
