-- Gentree D1 Schema
-- Run: npx wrangler d1 execute gentree-db --remote --file=schema.sql

CREATE TABLE IF NOT EXISTS trees (
  id          TEXT PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  pin_hash    TEXT NOT NULL,
  description   TEXT,
  origin        TEXT,
  creator_email TEXT,
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS members (
  id            TEXT PRIMARY KEY,
  tree_id       TEXT NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  gender        TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth TEXT,
  date_of_death TEXT,
  photo_url     TEXT,
  facebook_url  TEXT,
  phone         TEXT,
  email         TEXT,
  location      TEXT,
  bio           TEXT,
  generation    INTEGER NOT NULL DEFAULT 0,
  maiden_name   TEXT,
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS relationships (
  id             TEXT PRIMARY KEY,
  tree_id        TEXT NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
  type           TEXT NOT NULL CHECK (type IN ('parent', 'spouse', 'sibling')),
  from_member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  to_member_id   TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments (
  id          TEXT PRIMARY KEY,
  tree_id     TEXT NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
  member_id   TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  text        TEXT NOT NULL,
  type        TEXT DEFAULT 'general' CHECK (type IN ('general', 'birthday', 'condolence', 'memory')),
  created_at  TEXT DEFAULT (datetime('now'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_members_tree ON members(tree_id);
CREATE INDEX IF NOT EXISTS idx_relationships_tree ON relationships(tree_id);
CREATE INDEX IF NOT EXISTS idx_comments_member ON comments(member_id);
CREATE INDEX IF NOT EXISTS idx_trees_slug ON trees(slug);
