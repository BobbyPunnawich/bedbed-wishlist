import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export const sql = neon(process.env.DATABASE_URL);

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      nickname VARCHAR(50) NOT NULL,
      avatar_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      emoji VARCHAR(10) NOT NULL DEFAULT '✨',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS checklist_items (
      id SERIAL PRIMARY KEY,
      category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      emoji VARCHAR(10) DEFAULT '💜',
      is_completed BOOLEAN DEFAULT FALSE,
      created_by INTEGER REFERENCES users(id),
      completed_by INTEGER REFERENCES users(id),
      completed_at TIMESTAMPTZ,
      memory_image_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS tagline TEXT`;

  await sql`
    CREATE TABLE IF NOT EXISTS item_favorites (
      item_id INTEGER REFERENCES checklist_items(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (item_id, user_id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS item_comments (
      id SERIAL PRIMARY KEY,
      item_id INTEGER REFERENCES checklist_items(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Seed default users if none exist
  const existingUsers = await sql`SELECT id FROM users LIMIT 1`;
  if (existingUsers.length === 0) {
    await sql`
      INSERT INTO users (nickname, avatar_url, tagline) VALUES
        ('Mimi 🐥', 'https://api.dicebear.com/7.x/adventurer/svg?seed=mimi&backgroundColor=b6e3f4', NULL),
        ('Bed 🐣', 'https://api.dicebear.com/7.x/adventurer/svg?seed=bed&backgroundColor=ffdfbf', 'เดี๋ยวสอบเสร็จเราก็ได้ไปเที่ยวกันละนะเบ้ด')
    `;
  } else {
    // Backfill default tagline for Bed user if missing
    await sql`
      UPDATE users SET tagline = 'เดี๋ยวสอบเสร็จเราก็ได้ไปเที่ยวกันละนะเบ้ด'
      WHERE tagline IS NULL AND id = (SELECT id FROM users ORDER BY id ASC LIMIT 1 OFFSET 1)
    `;
  }
}
