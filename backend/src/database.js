import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const dbFile = process.env.DATABASE_FILE || './database.sqlite';

export async function getDbConnection() {
  return open({
    filename: dbFile,
    driver: sqlite3.Database
  });
}

export async function initializeDatabase() {
  const db = await getDbConnection();

  // Create Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Posts table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      mood TEXT NOT NULL,
      category TEXT NOT NULL,
      role TEXT NOT NULL,
      avatar TEXT NOT NULL,
      ai_note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Mood Checkins table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS mood_checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      score INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Seed some initial data if database is brand new
  const postCount = await db.get('SELECT COUNT(*) as count FROM posts');
  if (postCount.count === 0) {
    await db.run(`
      INSERT INTO posts (content, mood, category, role, avatar, ai_note, created_at)
      VALUES 
      ('I spent the whole morning fixing a process that broke because nobody had context. I’m not angry, just drained.', 'tense', 'workload', 'Ops Team', 'A', 'AI reflection: This sounds like invisible labor plus low recognition. Suggested reset: 3-minute decompression before your next handoff.', datetime('now', '-12 minutes')),
      ('Back-to-back calls all day. I need a way to vent without sounding dramatic.', 'overloaded', 'meetings', 'Product Circle', 'N', 'Micro-support from peers: “Mute one notification stream for 20 minutes and reclaim your headspace.”', datetime('now', '-1 hour'))
    `);

    // Seed default mood checkins for dashboard chart
    await db.run(`INSERT INTO mood_checkins (score, created_at) VALUES (44, datetime('now', '-6 days'))`);
    await db.run(`INSERT INTO mood_checkins (score, created_at) VALUES (58, datetime('now', '-5 days'))`);
    await db.run(`INSERT INTO mood_checkins (score, created_at) VALUES (49, datetime('now', '-4 days'))`);
    await db.run(`INSERT INTO mood_checkins (score, created_at) VALUES (76, datetime('now', '-3 days'))`);
    await db.run(`INSERT INTO mood_checkins (score, created_at) VALUES (64, datetime('now', '-2 days'))`);
    await db.run(`INSERT INTO mood_checkins (score, created_at) VALUES (82, datetime('now', '-1 days'))`);
    await db.run(`INSERT INTO mood_checkins (score, created_at) VALUES (68, datetime('now'))`);
  }

  await db.close();
  console.log('Database initialized successfully.');
}
