-- CREATE TABLE users(id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
--   username TEXT UNIQUE, 
--   email TEXT UNIQUE, 
--   password TEXT, 
--   avatar TEXT, 
--   created_at TIMESTAMPTZ DEFAULT NOW(), 
--   verified BOOLEAN,
--   role TEXT DEFAULT 'user'
-- );

-- CREATE TABLE verification (
--   id TEXT,
--   user_id UUID REFERENCES users(id) ON DELETE CASCADE,
--   token TEXT,
--   session TEXT,
--   expires TIMESTAMPTZ,
--   used_at TIMESTAMPTZ
-- );

-- CREATE TABLE friends(
--   user_id UUID REFERENCES users(id) ON DELETE CASCADE, 
--   friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
--   added_at TIMESTAMPTZ DEFAULT now(),
--   status TEXT NOT NULL DEFAULT 'pending',
--   CHECK (status IN ('pending', 'accepted', 'blocked')),
--   PRIMARY KEY (user_id, friend_id),
--   CHECK (user_id != friend_id)
-- );

-- CREATE INDEX friends_user_id_index ON friends (user_id, added_at);

-- CREATE TABLE follows(
--   follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--   followed_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--   followed_at TIMESTAMPTZ DEFAULT now(), 
--   PRIMARY KEY(follower_id, followed_id),
--   CHECK (follower_id != followed_id)
-- );

-- CREATE TABLE favourites(
--   user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--   favourited_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--   favourited_at TIMESTAMPTZ DEFAULT now()
-- );