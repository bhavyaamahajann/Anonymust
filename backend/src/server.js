import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { initializeDatabase, getDbConnection } from './database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'anonymust_super_secret_key_123!';

app.use(cors());
app.use(express.json());

// In-memory store for OTPs (for prototype mockup verification)
const otpStore = new Map();

// Helper functions for AI reflections
function generateAiReflection(content, mood) {
  const text = content.toLowerCase();
  
  if (mood === 'tense' || text.includes('drained') || text.includes('exhausted') || text.includes('tired')) {
    return 'AI reflection: This sounds like invisible labor plus low recognition. Suggested reset: 3-minute decompression before your next handoff.';
  }
  if (mood === 'frustrated' || text.includes('angry') || text.includes('hate') || text.includes('stupid')) {
    return 'AI reflection: Frustration usually hides overload. Suggested support: Write down one task that should not be yours today, and step away from the keyboard for 5 minutes.';
  }
  if (mood === 'sad' || text.includes('heavy') || text.includes('sad') || text.includes('cry')) {
    return 'AI reflection: This feels heavy. Micro-support: Step away for a glass of water, then share how you feel with one trusted colleague or friend.';
  }
  if (mood === 'hopeful' || text.includes('happy') || text.includes('good') || text.includes('win')) {
    return 'AI reflection: Protect that positive momentum! Suggestion: Write down this victory so you can recall it during a future stressful day.';
  }
  return 'AI reflection: You are maintaining a steady pace. Keep taking small micro-resets throughout the day to sustain your headspace.';
}

const anonymousRoles = [
  { role: 'Ops Team', avatar: 'A' },
  { role: 'Product Circle', avatar: 'P' },
  { role: 'Design Group', avatar: 'D' },
  { role: 'Dev Lead', avatar: 'S' },
  { role: 'Marketing Hub', avatar: 'M' }
];

// Initialize Database before starting the server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// Auth Endpoints
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const db = await getDbConnection();
    
    // Check if user already exists
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      await db.close();
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.run(
      'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, phone]
    );

    const user = { id: result.lastID, name, email };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    
    await db.close();
    res.status(201).json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Signup failed due to internal error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const db = await getDbConnection();
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    
    if (!user) {
      await db.close();
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await db.close();
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    await db.close();
    res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed due to internal error' });
  }
});

// Mock OTP verification endpoints
app.post('/api/auth/send-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number is required' });

  // Generate a mock 6 digit code (always 123456 or a random one)
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(phone, code);
  
  console.log(`[Mock SMS] Sent OTP code: ${code} to ${phone}`);
  
  res.status(200).json({ success: true, message: 'OTP sent successfully (Mocked)', code });
});

app.post('/api/auth/verify-otp', async (req, res) => {
  const { phone, code, name, email, password } = req.body;
  if (!phone || !code) {
    return res.status(400).json({ error: 'Phone and OTP code are required' });
  }

  const savedCode = otpStore.get(phone);
  if (!savedCode || savedCode !== code) {
    return res.status(400).json({ error: 'Invalid OTP code' });
  }

  // Clear OTP code from store
  otpStore.delete(phone);

  try {
    const db = await getDbConnection();
    
    // If name, email and password are provided, register the user
    if (name && email && password) {
      const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
      if (existingUser) {
        const token = jwt.sign({ id: existingUser.id, name: existingUser.name, email: existingUser.email }, JWT_SECRET, { expiresIn: '7d' });
        await db.close();
        return res.status(200).json({ token, user: existingUser });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await db.run(
        'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, phone]
      );
      const user = { id: result.lastID, name, email, phone };
      const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
      await db.close();
      return res.status(200).json({ token, user });
    }

    // Otherwise, check if user exists by phone
    let user = await db.get('SELECT * FROM users WHERE phone = ?', [phone]);
    if (!user) {
      // Create a guest/placeholder user if not registering fully
      const randomEmail = `phone_${Date.now()}@anonymust.local`;
      const randomPassword = Math.random().toString(36).substring(7);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      const result = await db.run(
        'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
        [`User ${phone.slice(-4)}`, randomEmail, hashedPassword, phone]
      );
      user = { id: result.lastID, name: `User ${phone.slice(-4)}`, email: randomEmail, phone };
    }

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    await db.close();
    res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Verification failed due to internal error' });
  }
});

// Posts API Endpoints
app.get('/api/posts', async (req, res) => {
  try {
    const db = await getDbConnection();
    const posts = await db.all('SELECT * FROM posts ORDER BY created_at DESC');
    await db.close();
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.post('/api/posts', async (req, res) => {
  const { content, mood, category } = req.body;
  if (!content || !mood || !category) {
    return res.status(400).json({ error: 'Content, mood, and category are required' });
  }

  // Pick a random anonymous role details
  const anonIdentity = anonymousRoles[Math.floor(Math.random() * anonymousRoles.length)];
  const aiNote = generateAiReflection(content, mood);

  try {
    const db = await getDbConnection();
    const result = await db.run(
      'INSERT INTO posts (content, mood, category, role, avatar, ai_note) VALUES (?, ?, ?, ?, ?, ?)',
      [content, mood, category, anonIdentity.role, anonIdentity.avatar, aiNote]
    );

    const newPost = {
      id: result.lastID,
      content,
      mood,
      category,
      role: anonIdentity.role,
      avatar: anonIdentity.avatar,
      ai_note: aiNote,
      created_at: new Date().toISOString()
    };

    await db.close();
    res.status(201).json(newPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Insights / Checkins Endpoints
app.get('/api/insights/patterns', async (req, res) => {
  try {
    const db = await getDbConnection();
    const checkins = await db.all('SELECT * FROM mood_checkins ORDER BY created_at ASC LIMIT 7');
    await db.close();
    res.status(200).json(checkins);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch mood insights' });
  }
});

app.post('/api/insights/checkin', async (req, res) => {
  const { score } = req.body;
  if (score === undefined) {
    return res.status(400).json({ error: 'Mood score is required' });
  }

  try {
    const db = await getDbConnection();
    await db.run('INSERT INTO mood_checkins (score) VALUES (?)', [score]);
    const checkins = await db.all('SELECT * FROM mood_checkins ORDER BY created_at ASC LIMIT 7');
    await db.close();
    res.status(201).json(checkins);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to record mood check-in' });
  }
});
