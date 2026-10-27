import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  DEFAULT_USERS,
  DEFAULT_LESSONS,
  DEFAULT_WORDS,
  DEFAULT_SESSIONS,
  DEFAULT_APPLICATIONS,
} from './src/data/defaultGermanData';
import { UserAccount, VocabularyLesson, WordItem, StudentApplication, UserSessionLog } from './src/types/german';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const portArgIdx = process.argv.indexOf('--port');
const portFromArg = portArgIdx !== -1 ? parseInt(process.argv[portArgIdx + 1], 10) : NaN;
const PORT = !isNaN(portFromArg) ? portFromArg : parseInt(process.env.PORT || '3000', 10);
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');

interface DatabaseSchema {
  users: UserAccount[];
  lessons: VocabularyLesson[];
  words: WordItem[];
  sessions: UserSessionLog[];
  applications: StudentApplication[];
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load or initialize DB
function getDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.lessons)) {
        // Ensure master admin is always present
        const hasAdmin = parsed.users.some((u: UserAccount) => u.username.toLowerCase() === 'ahmadjon');
        if (!hasAdmin) {
          parsed.users.unshift(DEFAULT_USERS[0]);
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading database file, resetting to defaults:', err);
  }

  const initialDB: DatabaseSchema = {
    users: DEFAULT_USERS,
    lessons: DEFAULT_LESSONS,
    words: DEFAULT_WORDS,
    sessions: DEFAULT_SESSIONS,
    applications: DEFAULT_APPLICATIONS,
  };

  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing initial database file:', err);
  }

  return initialDB;
}

let db = getDatabase();

function persistDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database to file:', err);
  }
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '25mb' }));

  // API Health
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Auth: Instant cross-device login check
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { username, password } = req.body || {};
    const trimmedUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // Fixed master admin credentials
    if (trimmedUser === 'ahmadjon' && cleanPass === 'admin1') {
      let admin = db.users.find((u) => u.username.toLowerCase() === 'ahmadjon');
      if (!admin) {
        admin = DEFAULT_USERS[0];
        db.users.unshift(admin);
        persistDatabase();
      }
      return res.json({ success: true, user: admin });
    }

    const foundUser = db.users.find(
      (u) => u.username.trim().toLowerCase() === trimmedUser && u.password.trim() === cleanPass
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

  app.post('/api/users', (req: Request, res: Response) => {
    const newUser: UserAccount = req.body;
    if (!newUser || !newUser.id || !newUser.username) {
      return res.status(400).json({ error: 'Invalid user payload' });
    }

    // Check if user already exists
    const idx = db.users.findIndex((u) => u.id === newUser.id || u.username.toLowerCase() === newUser.username.toLowerCase());
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
    console.log(`> Worthub full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
