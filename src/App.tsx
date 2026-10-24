import React, { useState, useEffect } from 'react';
import { GermanFlagBackdrop } from './components/GermanFlagBackdrop';
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
import { useLanguage } from './utils/i18n';
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
import { api } from './utils/api';
import { getBareGerman } from './utils/germanGrammar';

export const DEFAULT_STUDENT_USER: UserAccount = {
  id: 'guest-student',
  username: 'oquvchi',
  password: '',
  name: "O'quvchi",
  role: 'student',
  assignedLevel: 'A1',
  isActive: true,
  lastActive: '2026-09-01',
  xp: 150,
  streakDays: 1,
  wordsCount: 0,
  createdAt: '2026-09-01',
};

const USERS_STORAGE_KEY = 'worthub_users_v6';
const LESSONS_STORAGE_KEY = 'worthub_lessons_v6';
const WORDS_STORAGE_KEY = 'worthub_words_v6';
const AUTH_STORAGE_KEY = 'worthub_auth_v6';
const SESSIONS_STORAGE_KEY = 'worthub_sessions_v6';
const APPS_STORAGE_KEY = 'worthub_apps_v6';
const THEME_STORAGE_KEY = 'worthub_theme_v6';

export function App() {
  const { t } = useLanguage();
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

  // Lessons state - ensure full 20 lessons from Blitz Nemis Tili Markazi
  const [lessons, setLessons] = useState<VocabularyLesson[]>(() => {
    try {
      const stored = localStorage.getItem(LESSONS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 20) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_LESSONS;
  });

  // Words state - ensure full vocabulary database, repair missing setId, preserve user additions
  const [words, setWords] = useState<WordItem[]>(() => {
    try {
      const stored = localStorage.getItem(WORDS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Repair any word that has no setId or invalid setId
          const cleaned: WordItem[] = parsed.map((w: WordItem) => ({
            ...w,
            setId: w.setId || 'lek-1',
            german: getBareGerman(w.german) || w.german,
            isActive: w.isActive !== false,
          }));

          // Merge any DEFAULT_WORDS that might not be in cleaned
          const existingIds = new Set(cleaned.map((w) => w.id));
          const missingDefaults = DEFAULT_WORDS.filter((dw) => !existingIds.has(dw.id));
          return [...cleaned, ...missingDefaults];
        }
      }
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

  // Active user session (defaults to guest student user so any device enters immediately without login barrier!)
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_STUDENT_USER;
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

  // Multi-tab / Multi-window synchronization in the same browser
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === WORDS_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setWords(parsed);
        } catch (err) {}
      }
      if (e.key === LESSONS_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setLessons(parsed);
        } catch (err) {}
      }
      if (e.key === USERS_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setUsers(parsed);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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
      if (currentUser && currentUser.id !== 'guest-student') {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // Cross-device synchronization with the server
  useEffect(() => {
    const syncData = async () => {
      try {
        const [serverUsers, serverLessons, serverWords, serverApps, serverSessions] = await Promise.all([
          api.getUsers(),
          api.getLessons(),
          api.getWords(),
          api.getApplications(),
          api.getSessions(),
        ]);

        if (serverUsers && Array.isArray(serverUsers) && serverUsers.length > 0) {
          setUsers(serverUsers);
        }
        if (serverLessons && Array.isArray(serverLessons) && serverLessons.length > 0) {
          setLessons(serverLessons);
        }
        if (serverWords && Array.isArray(serverWords) && serverWords.length > 0) {
          const cleanedWords = serverWords.map((w) => ({
            ...w,
            setId: w.setId || 'lek-1',
            german: getBareGerman(w.german) || w.german,
            isActive: w.isActive !== false,
          }));
          setWords(cleanedWords);
        }
        if (serverApps && Array.isArray(serverApps)) {
          setApplications(serverApps);
        }
        if (serverSessions && Array.isArray(serverSessions)) {
          setSessions(serverSessions);
        }
      } catch (err) {
        console.warn('Backend sync failed, using offline cache:', err);
      }
    };

    syncData();
    window.addEventListener('focus', syncData);
    return () => window.removeEventListener('focus', syncData);
  }, []);

  // Auth Handlers
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    const newSession: UserSessionLog = {
      id: `ses-${Date.now()}`,
      username: user.username,
      name: user.name,
      role: user.role,
      loginTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
      ipOrDevice: navigator.userAgent.includes('Mobile') ? 'Mobil qurilma' : 'Chrome (Desktop)',
    };
    setSessions((prev) => [newSession, ...prev.slice(0, 20)]);
    api.logSession(newSession);
    setCurrentTab('lektionen');
  };

  const handleAdminLogin = (adminUser: UserAccount) => {
    setCurrentUser(adminUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminUser));
    } catch (e) {}

    const newSession: UserSessionLog = {
      id: `ses-${Date.now()}`,
      username: adminUser.username,
      name: adminUser.name,
      role: adminUser.role,
      loginTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
      ipOrDevice: navigator.userAgent.includes('Mobile') ? 'Mobil qurilma' : 'Chrome (Desktop)',
    };
    setSessions((prev) => [newSession, ...prev.slice(0, 20)]);
    api.logSession(newSession);

    setToastNotification({
      title: "Admin holatiga o'tildi!",
      message: `Xush kelibsiz, ${adminUser.name}! Barcha admin imkoniyatlari faollashtirildi.`,
    });
    setTimeout(() => setToastNotification(null), 5000);
  };

  const handleLogoutToStudent = () => {
    setCurrentUser(DEFAULT_STUDENT_USER);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {}
    setToastNotification({
      title: "O'quvchi holatiga qaytildi",
      message: "Platforma o'quvchi rejimiga o'tkazildi.",
    });
    setTimeout(() => setToastNotification(null), 4000);
  };

  const handleLogout = () => {
    handleLogoutToStudent();
  };

  // User Management
  const handleDeleteStudent = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    api.deleteUser(userId);

    // If currently logged-in user was deleted, reset to student
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(DEFAULT_STUDENT_USER);
    }
  };

  const handleCreateStudent = (
    newStudentData: Omit<UserAccount, 'id' | 'createdAt' | 'lastActive'>
  ) => {
    const today = new Date().toISOString().slice(0, 10);
    const newStudent: UserAccount = {
      ...newStudentData,
      username: newStudentData.username.trim().toLowerCase(),
      id: `usr-${Date.now()}`,
      createdAt: today,
      lastActive: today,
      xp: 0,
      streakDays: 0,
      wordsCount: 0,
    };
    setUsers((prev) => [...prev, newStudent]);
    api.createUser(newStudent);
  };

  const handleUpdateStudent = (id: string, updates: Partial<UserAccount>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );
    api.updateUser(id, updates);
    if (currentUser && currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
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
    api.submitApplication(newApp);
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

    // Remove application and show notification
    setApplications((prev) => prev.filter((a) => a.id !== app.id));
    api.deleteApplication(app.id);
    setToastNotification({
      title: "O'quvchi ro'yxatga olindi!",
      message: `Login: ${autoUsername} | Parol: ${autoPassword}`,
    });
    setTimeout(() => setToastNotification(null), 7000);
  };

  // Lesson Handlers
  const handleUpdateLesson = (id: string, updates: Partial<VocabularyLesson>) => {
    setLessons((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
    api.updateLesson(id, updates);
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
    api.createLesson(newLesson);
  };

  const handleDeleteLesson = (id: string) => {
    setLessons((prev) => prev.filter((l) => l.id !== id));
    setWords((prev) => prev.filter((w) => w.setId !== id));
    api.deleteLesson(id);
  };

  // Word Handlers
  const handleSaveWord = (word: WordItem) => {
    const cleanWord: WordItem = {
      ...word,
      german: getBareGerman(word.german) || word.german,
    };
    setWords((prev) => {
      const exists = prev.some((w) => w.id === cleanWord.id);
      if (exists) {
        return prev.map((w) => (w.id === cleanWord.id ? cleanWord : w));
      }
      return [cleanWord, ...prev];
    });
    api.saveWord(cleanWord);
  };

  const handleDeleteWord = (id: string) => {
    setWords((prev) => prev.filter((w) => w.id !== id));
    api.deleteWord(id);
  };

  const handleToggleWordActive = (id: string) => {
    setWords((prev) => {
      const updated = prev.map((w) => (w.id === id ? { ...w, isActive: w.isActive === false ? true : false } : w));
      const target = updated.find((w) => w.id === id);
      if (target) api.saveWord(target);
      return updated;
    });
  };

  const handleImportWords = (newWords: WordItem[]) => {
    const safeWords = newWords.map((w) => ({
      ...w,
      german: getBareGerman(w.german) || w.german,
      setId: w.setId || lessons[0]?.id || 'lek-1',
      isActive: w.isActive !== false,
    }));
    setWords((prev) => {
      const existingIds = new Set(prev.map((w) => w.id));
      const filtered = safeWords.filter((w) => !existingIds.has(w.id));
      return [...filtered, ...prev];
    });
    api.importWords(safeWords);
    setToastNotification({
      title: "So'zlar muvaffaqiyatli saqlandi!",
      message: `${safeWords.length} ta yangi so'z darsga qo'shildi`,
    });
    setTimeout(() => setToastNotification(null), 5000);
  };

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
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-8">
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

        {/* TAB 3: O'quvchilar reytingi with Admin switcher at bottom */}
        {currentTab === 'leaderboard' && (
          <LeaderboardView
            users={users}
            currentUser={currentUser}
            theme={theme}
            onOpenAddStudent={() => setIsAdminPanelOpen(true)}
            onGoToGames={() => setCurrentTab('games')}
            onAdminLogin={handleAdminLogin}
            onLogoutToStudent={handleLogoutToStudent}
            onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
          />
        )}
      </main>

      {/* Modal 1: O'qituvchi Boshqaruv Paneli matching Screenshot 6 */}
      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        users={users}
        lessons={lessons}
        words={words}
        sessions={sessions}
        applications={applications}
        theme={theme}
        onCreateStudent={handleCreateStudent}
        onDeleteStudent={handleDeleteStudent}
        onUpdateStudent={handleUpdateStudent}
        onUpdateLesson={handleUpdateLesson}
        onToggleWordActive={handleToggleWordActive}
        onDeleteWord={handleDeleteWord}
        onCreateLesson={handleCreateLesson}
        onDeleteLesson={handleDeleteLesson}
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

      {/* Footer in Selected Language */}
      <footer className={`relative z-10 border-t ${
        theme === 'dark' ? 'border-slate-800/80 bg-[#0a0d14]/90 text-slate-400' : 'border-slate-200 bg-white/95 text-slate-600'
      } py-5 px-4 mb-16 md:mb-0 text-xs transition-colors`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentTab('lektionen')}
              className="cursor-pointer hover:opacity-90"
            >
              <WorthubLogo size="sm" variant="compact" theme={theme} />
            </button>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span>{t('footer_tagline')}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>
              {t('footer_user_prefix')} <strong className={theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}>{currentUser.name}</strong> ({currentUser.role === 'admin' ? t('footer_teacher') : `${t('footer_level')}: ${currentUser.assignedLevel}`})
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
