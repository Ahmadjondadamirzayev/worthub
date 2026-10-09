import React, { useState, useEffect } from 'react';
import { GermanFlagBackdrop } from './components/GermanFlagBackdrop';
import { LoginView } from './components/LoginView';
import { TopNav } from './components/TopNav';
import { LektionenView } from './components/LektionenView';
import { GamesHubView } from './components/GamesHubView';
import { LeaderboardView } from './components/LeaderboardView';
import { AdminPanelModal } from './components/AdminPanelModal';
import { AddWordModal } from './components/AddWordModal';
import { TextFileImportModal } from './components/TextFileImportModal';
import { InstallAppModal } from './components/InstallAppModal';
import { WorthubLogo } from './components/WorthubLogo';
import { CheckCircle2, X } from 'lucide-react';
import {
  DEFAULT_USERS,
  DEFAULT_LESSONS,
  DEFAULT_WORDS,
  DEFAULT_SESSIONS,
  DEFAULT_APPLICATIONS,
} from './data/defaultGermanData';
import {
  UserAccount,
  VocabularyLesson,
  WordItem,
  CefrLevel,
  UserSessionLog,
  StudentApplication,
} from './types/german';

const USERS_STORAGE_KEY = 'worthub_users_v5';
const LESSONS_STORAGE_KEY = 'worthub_lessons_v5';
const WORDS_STORAGE_KEY = 'worthub_words_v5';
const AUTH_STORAGE_KEY = 'worthub_auth_v5';
const SESSIONS_STORAGE_KEY = 'worthub_sessions_v5';
const APPS_STORAGE_KEY = 'worthub_apps_v5';
const THEME_STORAGE_KEY = 'worthub_theme_v5';

export default function App() {
  // Users state
  const [users, setUsers] = useState<UserAccount[]>(() => {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_USERS;
  });

  // Lessons state
  const [lessons, setLessons] = useState<VocabularyLesson[]>(() => {
    try {
      const stored = localStorage.getItem(LESSONS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_LESSONS;
  });

  // Words state
  const [words, setWords] = useState<WordItem[]>(() => {
    try {
      const stored = localStorage.getItem(WORDS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_WORDS;
  });

  // Sessions state
  const [sessions, setSessions] = useState<UserSessionLog[]>(() => {
    try {
      const stored = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
    return DEFAULT_SESSIONS;
  });

  // Student Applications state
  const [applications, setApplications] = useState<StudentApplication[]>(() => {
    try {
      const stored = localStorage.getItem(APPS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
    return DEFAULT_APPLICATIONS;
  });

  // Active user session (Admin ahmadjon by default for instant control)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
    return DEFAULT_USERS[0]; // ahmadjon
  });

  // Navigation tab: 'lektionen' | 'games' | 'leaderboard'
  const [currentTab, setCurrentTab] = useState<'lektionen' | 'games' | 'leaderboard'>('lektionen');

  // Permanent Dark Mode (Qora rejim har doim yoqilgan)
  const theme = 'dark' as const;

  // Modals & Notifications state
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isAddWordOpen, setIsAddWordOpen] = useState(false);
  const [modalDefaultLessonId, setModalDefaultLessonId] = useState<string | undefined>(undefined);
  const [editingWord, setEditingWord] = useState<WordItem | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [toastNotification, setToastNotification] = useState<{ title: string; message: string } | null>(null);

  // Sync dark theme to HTML root
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } catch (e) {
      // ignore
    }
  }, []);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(LESSONS_STORAGE_KEY, JSON.stringify(lessons));
    } catch (e) {
      console.error(e);
    }
  }, [lessons]);

  useEffect(() => {
    try {
      localStorage.setItem(WORDS_STORAGE_KEY, JSON.stringify(words));
    } catch (e) {
      console.error(e);
    }
  }, [words]);

  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error(e);
    }
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(applications));
    } catch (e) {
      console.error(e);
    }
  }, [applications]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // Auth Handlers
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    // Log session
    const newSession: UserSessionLog = {
      id: `ses-${Date.now()}`,
      username: user.username,
      name: user.name,
      role: user.role,
      loginTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
      ipOrDevice: navigator.userAgent.includes('Mobile') ? 'Mobil qurilma' : 'Chrome (Desktop)',
    };
    setSessions((prev) => [newSession, ...prev.slice(0, 20)]);
    setCurrentTab('lektionen');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // User Management (CRITICAL: "odamlarni o'chirish ishlasin")
  const handleDeleteStudent = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));

    // If currently logged-in user was deleted, fallback to admin
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(users.find((u) => u.role === 'admin') || DEFAULT_USERS[0]);
    }
  };

  const handleCreateStudent = (
    newStudentData: Omit<UserAccount, 'id' | 'createdAt' | 'lastActive'>
  ) => {
    const today = new Date().toISOString().slice(0, 10);
    const newStudent: UserAccount = {
      ...newStudentData,
      id: `usr-${Date.now()}`,
      createdAt: today,
      lastActive: today,
      xp: 0,
      streakDays: 0,
      wordsCount: 0,
    };
    setUsers((prev) => [...prev, newStudent]);
  };

  const handleUpdateStudent = (id: string, updates: Partial<UserAccount>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );
    if (currentUser && currentUser.id === id) {
      setCurrentUser((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  // Application Handlers
  const handleSubmitApplication = (appData: Omit<StudentApplication, 'id' | 'status' | 'submittedAt'>) => {
    const newApp: StudentApplication = {
      ...appData,
      id: `app-${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toISOString().slice(0, 10),
    };
    setApplications((prev) => [newApp, ...prev]);
  };

  const handleApproveApplication = (app: StudentApplication) => {
    // Generate clean student login & password
    const autoUsername = app.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) + Math.floor(Math.random() * 90 + 10);
    const autoPassword = 'wort' + Math.floor(Math.random() * 900 + 100);

    handleCreateStudent({
      name: app.name,
      phone: app.phone,
      username: autoUsername,
      password: autoPassword,
      role: 'student',
      assignedLevel: app.level,
      isActive: true,
    });

    // Remove application and show notification (no window.alert!)
    setApplications((prev) => prev.filter((a) => a.id !== app.id));
    setToastNotification({
      title: "O'quvchi ro'yxatga olindi!",
      message: `Login: ${autoUsername} | Parol: ${autoPassword}`,
    });
    setTimeout(() => setToastNotification(null), 7000);
  };

  // Lesson Handlers ("mavzuni men qo'shay harbir lektionnikini")
  const handleUpdateLesson = (id: string, updates: Partial<VocabularyLesson>) => {
    setLessons((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
  };

  const handleCreateLesson = (
    title: string,
    themeTopic: string,
    level: CefrLevel
  ) => {
    const nextNum = lessons.length + 1;
    const newLesson: VocabularyLesson = {
      id: `lek-${Date.now()}`,
      lektionNumber: nextNum,
      title: title || `Lektion ${nextNum}: ${themeTopic}`,
      themeTopic,
      level,
      isActive: true,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setLessons((prev) => [...prev, newLesson]);
  };

  const handleDeleteLesson = (id: string) => {
    setLessons((prev) => prev.filter((l) => l.id !== id));
    setWords((prev) => prev.filter((w) => w.setId !== id));
  };

  // Word Handlers
  const handleSaveWord = (word: WordItem) => {
    setWords((prev) => {
      const exists = prev.some((w) => w.id === word.id);
      if (exists) {
        return prev.map((w) => (w.id === word.id ? word : w));
      }
      return [word, ...prev];
    });
  };

  const handleDeleteWord = (id: string) => {
    setWords((prev) => prev.filter((w) => w.id !== id));
  };

  const handleToggleWordActive = (id: string) => {
    setWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isActive: w.isActive === false ? true : false } : w))
    );
  };

  const handleImportWords = (newWords: WordItem[]) => {
    setWords((prev) => [...newWords, ...prev]);
  };

  // Unauthenticated screen matching Screenshot 2
  if (!currentUser) {
    return (
      <LoginView
        users={users}
        onLogin={handleLogin}
        onSubmitApplication={handleSubmitApplication}
        theme="dark"
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#07090f] text-slate-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-300 relative">
      {/* German Flag Theme Atmospheric Backdrop */}
      <GermanFlagBackdrop theme="dark" />

      {/* In-app Toast Notification */}
      {toastNotification && (
        <div className="fixed top-16 right-4 sm:right-6 z-50 max-w-sm rounded-2xl bg-emerald-600 text-white shadow-2xl p-4 border border-emerald-400 flex items-start gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <div className="font-bold">{toastNotification.title}</div>
            <div className="mt-0.5 opacity-90 font-mono">{toastNotification.message}</div>
          </div>
          <button
            onClick={() => setToastNotification(null)}
            className="p-1 hover:bg-emerald-700 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Bar */}
      <TopNav
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        currentUser={currentUser}
        theme="dark"
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        onOpenInstallApp={() => setIsInstallModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* TAB 1: Lektionlar To'plami matching Screenshot 3 */}
        {currentTab === 'lektionen' && (
          <LektionenView
            lessons={lessons}
            words={words}
            currentUser={currentUser}
            theme={theme}
            onUpdateLesson={handleUpdateLesson}
            onCreateLesson={handleCreateLesson}
            onDeleteLesson={handleDeleteLesson}
            onSaveWord={handleSaveWord}
            onDeleteWord={handleDeleteWord}
            onToggleWordActive={handleToggleWordActive}
            onOpenAddWord={(defaultId) => {
              setEditingWord(null);
              setModalDefaultLessonId(defaultId);
              setIsAddWordOpen(true);
            }}
            onOpenImport={(defaultId) => {
              setModalDefaultLessonId(defaultId);
              setIsImportModalOpen(true);
            }}
          />
        )}

        {/* TAB 2: O'yinlar & Grammatika matching Screenshot 4 */}
        {currentTab === 'games' && (
          <GamesHubView
            words={words}
            lessons={lessons}
            theme={theme}
          />
        )}

        {/* TAB 3: O'quvchilar reytingi matching Screenshot 5 */}
        {currentTab === 'leaderboard' && (
          <LeaderboardView
            users={users}
            theme={theme}
            onOpenAddStudent={() => setIsAdminPanelOpen(true)}
            onGoToGames={() => setCurrentTab('games')}
          />
        )}
      </main>

      {/* Modal 1: O'qituvchi Boshqaruv Paneli matching Screenshot 6 */}
      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        users={users}
        lessons={lessons}
        sessions={sessions}
        applications={applications}
        theme={theme}
        onCreateStudent={handleCreateStudent}
        onDeleteStudent={handleDeleteStudent}
        onUpdateStudent={handleUpdateStudent}
        onOpenAddWord={() => {
          setEditingWord(null);
          setIsAddWordOpen(true);
        }}
        onOpenImport={() => setIsImportModalOpen(true)}
        onApproveApplication={handleApproveApplication}
      />

      {/* Modal 2: So'z qo'shish */}
      <AddWordModal
        isOpen={isAddWordOpen}
        onClose={() => {
          setIsAddWordOpen(false);
          setEditingWord(null);
        }}
        lessons={lessons}
        defaultLessonId={modalDefaultLessonId || lessons[0]?.id}
        editingWord={editingWord}
        currentUser={currentUser}
        theme={theme}
        onSaveWord={handleSaveWord}
        onOpenImport={() => {
          setIsAddWordOpen(false);
          setIsImportModalOpen(true);
        }}
      />

      {/* Modal 3: Matndan import qilish (Shu joytida) */}
      <TextFileImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        lessons={lessons}
        defaultLessonId={modalDefaultLessonId || lessons[0]?.id}
        currentUser={currentUser}
        theme={theme}
        onImportWords={handleImportWords}
      />

      {/* Modal 4: Ilova o'rnatish */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        theme={theme}
      />

      {/* Footer in Uzbek */}
      <footer className={`relative z-10 border-t ${
        theme === 'dark' ? 'border-slate-800/80 bg-[#0a0d14]/90 text-slate-400' : 'border-slate-200 bg-white/95 text-slate-600'
      } py-5 px-4 text-xs transition-colors`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentTab('lektionen')}
              className="cursor-pointer hover:opacity-90"
            >
              <WorthubLogo size="sm" variant="compact" theme={theme} />
            </button>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span>Nemis tili so'z boyligi va interaktiv o'yinlar portali</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>
              Foydalanuvchi: <strong className={theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}>{currentUser.name}</strong> ({currentUser.role === 'admin' ? "O'qituvchi" : `Daraja: ${currentUser.assignedLevel}`})
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

