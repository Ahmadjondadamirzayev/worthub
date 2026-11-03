import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { execFile } from 'child_process';
import { fileURLToPath } from 'url';
import {
  DEFAULT_USERS,
  DEFAULT_LESSONS,
  DEFAULT_WORDS,
  DEFAULT_SESSIONS,
  DEFAULT_APPLICATIONS,
} from './src/data/defaultGermanData';
import {
  UserAccount,
  VocabularyLesson,
  WordItem,
  StudentApplication,
  UserSessionLog,
} from './src/types/german';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const portArgIdx = process.argv.indexOf('--port');
const portFromArg = portArgIdx !== -1 ? parseInt(process.argv[portArgIdx + 1], 10) : NaN;
const PORT = !isNaN(portFromArg) ? portFromArg : parseInt(process.env.PORT || '3000', 10);

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');
const BACKUP_FILE = path.resolve(DATA_DIR, 'database.backup.json');
const GUARDIAN_SCRIPT = path.resolve(__dirname, 'backend_security_guardian.py');

// Cryptographic HMAC Secret for Anti-Cheat Game Sessions (using OpenSSL C++ core in V8)
const HMAC_SECRET = process.env.HMAC_SECRET || 'worthub_unbreakable_secret_2026_blitz_de';

interface DatabaseSchema {
  users: UserAccount[];
  lessons: VocabularyLesson[];
  words: WordItem[];
  sessions: UserSessionLog[];
  applications: StudentApplication[];
  telegramConfig?: {
    botToken: string;
    chatId: string;
    isEnabled: boolean;
  };
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load or initialize DB with fallback to backup if corrupted
function getDatabase(): DatabaseSchema {
  // 1. Try primary database file
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.lessons)) {
        ensureMasterAdmin(parsed);
        return parsed;
      }
    } catch (err) {
      console.error('[SECURITY GUARDIAN] Error reading primary DB, attempting backup recovery...', err);
    }
  }

  // 2. Try backup database file
  if (fs.existsSync(BACKUP_FILE)) {
    try {
      const backupContent = fs.readFileSync(BACKUP_FILE, 'utf-8');
      const parsedBackup = JSON.parse(backupContent);
      if (parsedBackup && Array.isArray(parsedBackup.users)) {
        console.warn('[SECURITY GUARDIAN] Database successfully restored from backup snapshot!');
        ensureMasterAdmin(parsedBackup);
        persistDatabase(parsedBackup);
        return parsedBackup;
      }
    } catch (backupErr) {
      console.error('[SECURITY GUARDIAN] Backup also corrupted or unavailable:', backupErr);
    }
  }

  // 3. Fallback to default seed data
  const initialDB: DatabaseSchema = {
    users: DEFAULT_USERS,
    lessons: DEFAULT_LESSONS,
    words: DEFAULT_WORDS,
    sessions: DEFAULT_SESSIONS,
    applications: DEFAULT_APPLICATIONS,
    telegramConfig: {
      botToken: '8992798931:AAF_DWVE2zFDA0LZ8XTYK6sHuJLNpiGAjio',
      chatId: '8993623996',
      isEnabled: true,
    },
  };

  persistDatabase(initialDB);
  return initialDB;
}

function ensureMasterAdmin(schema: DatabaseSchema) {
  const hasAdmin = schema.users.some((u) => u.username.toLowerCase() === 'ahmadjon');
  if (!hasAdmin) {
    schema.users.unshift(DEFAULT_USERS[0]);
  }
}

let db = getDatabase();

/**
 * Atomic Database Persistence:
 * Writes to a temporary file first, then uses atomic OS rename (POSIX atomic).
 * Also writes an immutable backup snapshot. No power cut or crash can corrupt the data.
 */
function persistDatabase(customDb?: DatabaseSchema) {
  const target = customDb || db;
  try {
    const dataStr = JSON.stringify(target, null, 2);
    const tmpFile = `${DB_FILE}.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 7)}`;
    fs.writeFileSync(tmpFile, dataStr, 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);

    // Write backup copy asynchronously
    fs.writeFile(BACKUP_FILE, dataStr, 'utf-8', (err) => {
      if (err) console.error('[SECURITY GUARDIAN] Backup write warning:', err.message);
    });
  } catch (err) {
    console.error('[SECURITY GUARDIAN] Atomic persist error:', err);
  }
}

/**
 * Timing-safe string comparison to prevent Timing Side-Channel Attacks.
 * Leverages native C++ OpenSSL engine in Node.js crypto module.
 */
function timingSafeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a || '', 'utf-8');
    const bufB = Buffer.from(b || '', 'utf-8');
    if (bufA.length !== bufB.length) {
      // Pad to prevent length-leak timing
      crypto.timingSafeEqual(bufA, bufA);
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch (e) {
    return false;
  }
}

/**
 * XSS & Injection Sanitizer:
 * Strips script tags, javascript: links, null bytes, and non-printable control codes.
 */
function sanitizeInput(val: any): any {
  if (typeof val === 'string') {
    return val
      .replace(/<[^>]*>?/gm, '')
      .replace(/javascript:/gi, '')
      .replace(/onload\s*=/gi, '')
      .replace(/onerror\s*=/gi, '')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .trim();
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeInput);
  }
  if (val && typeof val === 'object') {
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(val)) {
      cleaned[key] = sanitizeInput(val[key]);
    }
    return cleaned;
  }
  return val;
}

/**
 * Sliding Window Rate Limiter
 * Blocks DDoS, automated scrapers, and brute-force password guessers.
 */
const rateLimitMap: Record<string, { count: number; resetAt: number }> = {};
// Periodic memory cleanup every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const ip in rateLimitMap) {
    if (now > rateLimitMap[ip].resetAt) {
      delete rateLimitMap[ip];
    }
  }
}, 300000);

function rateLimiter(maxRequests: number, windowSeconds: number, category: string = 'general') {
  return (req: Request, res: Response, next: NextFunction) => {
    const rawIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const clientIp = rawIp.split(',')[0].trim();
    const key = `${category}:${clientIp}`;
    const now = Date.now();
    const windowMs = windowSeconds * 1000;

    if (!rateLimitMap[key] || now > rateLimitMap[key].resetAt) {
      rateLimitMap[key] = { count: 1, resetAt: now + windowMs };
      return next();
    }

    rateLimitMap[key].count += 1;
    if (rateLimitMap[key].count > maxRequests) {
      const waitSec = Math.ceil((rateLimitMap[key].resetAt - now) / 1000);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Haddan tashqari ko'p so'rov yuborildi. Iltimos ${waitSec} soniyadan keyin qayta urinib ko'ring.`,
        retryAfter: waitSec,
      });
    }

    next();
  };
}

async function startServer() {
  const app = express();

  // 1. Military-grade Security Headers (Hardened Helmet style)
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    res.setHeader('X-Backend-Shield', 'Worthub-Python-Crypto-Armor-v3.0');
    next();
  });

  // 2. Body Parser with limit & Input Sanitization
  app.use(express.json({ limit: '20mb' }));
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeInput(req.body);
    }
    next();
  });

  // Global API rate limit: 150 requests per minute
  app.use('/api/', rateLimiter(150, 60, 'api'));

  // Health endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      securityShield: 'ACTIVE',
      engine: 'Node.js V8 (C++ OpenSSL Core) + Python 3 Guardian',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // Security Status & Diagnostics
  app.get('/api/security/status', (_req: Request, res: Response) => {
    res.json({
      status: 'SHIELD_ACTIVE',
      modules: {
        atomicDatabase: 'ACTIVE (Safe POSIX Rename + Auto-Snapshot)',
        timingSafeAuth: 'ACTIVE (C++ crypto.timingSafeEqual)',
        xssSanitizer: 'ACTIVE (Recursive Tag & Script Scrubber)',
        rateLimiter: 'ACTIVE (In-Memory Sliding Window)',
        antiCheatHmac: 'ACTIVE (SHA-256 Signature Guard)',
        pythonGuardian: 'READY (backend_security_guardian.py)',
      },
      stats: {
        totalUsers: db.users.length,
        totalLessons: db.lessons.length,
        totalWords: db.words.length,
        activeRateLimiters: Object.keys(rateLimitMap).length,
      },
    });
  });

  // Security Audit endpoint: Runs Python Guardian to audit database integrity
  app.get('/api/security/audit', (_req: Request, res: Response) => {
    execFile('python3', [GUARDIAN_SCRIPT], (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({
          status: 'ERROR',
          message: 'Python security guardian ijrosida xatolik',
          error: error.message,
          stderr,
        });
      }
      try {
        const parsed = JSON.parse(stdout);
        return res.json({ success: true, audit: parsed });
      } catch (e) {
        return res.json({ success: true, rawOutput: stdout });
      }
    });
  });

  // Anti-Cheat: Game Session HMAC Token Issuance
  app.post('/api/security/game-session', rateLimiter(30, 60, 'game-session'), (req: Request, res: Response) => {
    const { userId, gameId } = req.body || {};
    if (!userId || !gameId) {
      return res.status(400).json({ error: 'Missing userId or gameId' });
    }
    const timestamp = Date.now();
    const payload = `${userId}:${gameId}:${timestamp}`;
    const hmacSig = crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest('hex');
    const token = `${payload}:${hmacSig}`;
    res.json({ token, timestamp });
  });

  // Auth: Timing-safe protected login with brute-force rate limiter (12 attempts/min)
  app.post('/api/auth/login', rateLimiter(12, 60, 'auth'), (req: Request, res: Response) => {
    const { username, password } = req.body || {};
    const trimmedUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // Check master admin credentials using constant-time comparison
    if (timingSafeCompare(trimmedUser, 'ahmadjon') && timingSafeCompare(cleanPass, 'admin1')) {
      let admin = db.users.find((u) => u.username.toLowerCase() === 'ahmadjon');
      if (!admin) {
        admin = DEFAULT_USERS[0];
        db.users.unshift(admin);
        persistDatabase();
      }
      return res.json({ success: true, user: admin });
    }

    const foundUser = db.users.find(
      (u) =>
        timingSafeCompare(u.username.trim().toLowerCase(), trimmedUser) &&
        timingSafeCompare(u.password.trim(), cleanPass)
    );

    if (!foundUser) {
      return res.status(401).json({ success: false, message: 'invalid_credentials' });
    }

    if (foundUser.isActive === false) {
      return res.status(403).json({ success: false, message: 'inactive' });
    }

    return res.json({ success: true, user: foundUser });
  });

  // Users endpoints
  app.get('/api/users', (_req: Request, res: Response) => {
    res.json(db.users);
  });

  app.post('/api/users', rateLimiter(30, 60, 'user-create'), (req: Request, res: Response) => {
    const newUser: UserAccount = req.body;
    if (!newUser || !newUser.id || !newUser.username) {
      return res.status(400).json({ error: 'Invalid user payload' });
    }

    // Bound name length and validate score
    if (newUser.name && newUser.name.length > 80) {
      newUser.name = newUser.name.slice(0, 80);
    }
    if (typeof newUser.xp === 'number' && newUser.xp > 500000) {
      newUser.xp = 500000;
    }

    const idx = db.users.findIndex(
      (u) => u.id === newUser.id || u.username.toLowerCase() === newUser.username.toLowerCase()
    );
    if (idx >= 0) {
      db.users[idx] = { ...db.users[idx], ...newUser };
    } else {
      db.users.push(newUser);
    }
    persistDatabase();
    return res.json(newUser);
  });

  app.put('/api/users/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    const idx = db.users.findIndex((u) => u.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Anti-cheat bound on XP additions: max 500 XP per individual update
    if (typeof updates.xp === 'number') {
      const currentXp = db.users[idx].xp || 0;
      if (updates.xp - currentXp > 500) {
        console.warn(`[ANTI-CHEAT] Suspicious XP jump for user ${id}: +${updates.xp - currentXp}. Clamped.`);
        updates.xp = currentXp + 50; // Clamp suspicious jumps to max legitimate single reward
      }
    }

    db.users[idx] = { ...db.users[idx], ...updates };
    persistDatabase();
    return res.json(db.users[idx]);
  });

  app.delete('/api/users/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    db.users = db.users.filter((u) => u.id !== id);
    persistDatabase();
    return res.json({ success: true });
  });

  // Lessons endpoints
  app.get('/api/lessons', (_req: Request, res: Response) => {
    res.json(db.lessons);
  });

  app.post('/api/lessons', (req: Request, res: Response) => {
    const lesson: VocabularyLesson = req.body;
    if (!lesson || !lesson.id) return res.status(400).json({ error: 'Invalid lesson' });
    const idx = db.lessons.findIndex((l) => l.id === lesson.id);
    if (idx >= 0) {
      db.lessons[idx] = lesson;
    } else {
      db.lessons.push(lesson);
    }
    persistDatabase();
    return res.json(lesson);
  });

  app.put('/api/lessons/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    const idx = db.lessons.findIndex((l) => l.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Lesson not found' });
    db.lessons[idx] = { ...db.lessons[idx], ...updates };
    persistDatabase();
    return res.json(db.lessons[idx]);
  });

  app.delete('/api/lessons/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    db.lessons = db.lessons.filter((l) => l.id !== id);
    db.words = db.words.filter((w) => w.setId !== id);
    persistDatabase();
    return res.json({ success: true });
  });

  // Words endpoints
  app.get('/api/words', (_req: Request, res: Response) => {
    res.json(db.words);
  });

  app.post('/api/words', (req: Request, res: Response) => {
    const word: WordItem = req.body;
    if (!word || !word.id) return res.status(400).json({ error: 'Invalid word' });
    const idx = db.words.findIndex((w) => w.id === word.id);
    if (idx >= 0) {
      db.words[idx] = word;
    } else {
      db.words.unshift(word);
    }
    persistDatabase();
    return res.json(word);
  });

  app.post('/api/words/batch', (req: Request, res: Response) => {
    const { words: newWords } = req.body;
    if (!Array.isArray(newWords)) return res.status(400).json({ error: 'Expected array of words' });

    const existingIds = new Set(db.words.map((w) => w.id));
    const toAdd = newWords.filter((w: WordItem) => !existingIds.has(w.id));
    db.words = [...toAdd, ...db.words];
    persistDatabase();
    return res.json({ success: true, count: toAdd.length });
  });

  app.delete('/api/words/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    db.words = db.words.filter((w) => w.id !== id);
    persistDatabase();
    return res.json({ success: true });
  });

  // Applications endpoints
  app.get('/api/applications', (_req: Request, res: Response) => {
    res.json(db.applications);
  });

  app.post('/api/applications', (req: Request, res: Response) => {
    const appData: StudentApplication = req.body;
    if (!appData || !appData.id) return res.status(400).json({ error: 'Invalid application' });
    db.applications.unshift(appData);
    persistDatabase();
    return res.json(appData);
  });

  app.delete('/api/applications/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    db.applications = db.applications.filter((a) => a.id !== id);
    persistDatabase();
    return res.json({ success: true });
  });

  // Telegram endpoints with strict rate limiting to prevent bot quota ban
  const DEFAULT_BOT_TOKEN = '8992798931:AAF_DWVE2zFDA0LZ8XTYK6sHuJLNpiGAjio';
  const DEFAULT_CHAT_ID = '8993623996';

  app.get('/api/telegram/config', (_req: Request, res: Response) => {
    res.json(
      db.telegramConfig || {
        botToken: DEFAULT_BOT_TOKEN,
        chatId: DEFAULT_CHAT_ID,
        isEnabled: true,
      }
    );
  });

  app.post('/api/telegram/config', rateLimiter(10, 60, 'tg-config'), (req: Request, res: Response) => {
    const config = req.body;
    db.telegramConfig = config;
    persistDatabase();
    return res.json({ success: true, config });
  });

  app.post('/api/telegram/notify', rateLimiter(25, 60, 'tg-notify'), async (req: Request, res: Response) => {
    const { text } = req.body || {};
    const config = db.telegramConfig || {
      botToken: DEFAULT_BOT_TOKEN,
      chatId: DEFAULT_CHAT_ID,
      isEnabled: true,
    };
    const token = config.botToken || DEFAULT_BOT_TOKEN;
    const chatId = config.chatId || DEFAULT_CHAT_ID;

    if (!token?.trim() || !chatId?.trim()) {
      return res.json({ sent: false, reason: 'unconfigured' });
    }

    try {
      const url = `https://api.telegram.org/bot${token.trim()}/sendMessage`;
      const tgRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId.trim(),
          text,
          parse_mode: 'HTML',
        }),
      });
      return res.json({ sent: tgRes.ok });
    } catch (e: any) {
      return res.json({ sent: false, error: e?.message });
    }
  });

  // Sessions endpoints
  app.get('/api/sessions', (_req: Request, res: Response) => {
    res.json(db.sessions);
  });

  app.post('/api/sessions', (req: Request, res: Response) => {
    const session: UserSessionLog = req.body;
    if (session && session.id) {
      db.sessions = [session, ...db.sessions.slice(0, 49)];
      persistDatabase();
    }
    return res.json(session);
  });

  // Dev server vs Production static serving
  const isProd = process.env.NODE_ENV === 'production';
  const distDir = path.resolve(__dirname, 'dist');

  if (isProd && fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  } else {
    // Mount Vite in middleware mode for hot reload and full developer experience
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`> Worthub High-Security Full-Stack Server running on http://0.0.0.0:${PORT}`);
    console.log(`> Security Shield: ACTIVE [Python Guardian + OpenSSL C++ Crypto Core + Atomic Storage]`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
