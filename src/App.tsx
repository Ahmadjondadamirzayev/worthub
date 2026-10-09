import React, { useState, useEffect } from 'react';
import { UserAccount, WordItem, StudentApplication } from './types/german';
import { DEFAULT_USERS, DEFAULT_LESSONS, DEFAULT_WORDS } from './data/defaultGermanData';
import { TopNav } from './components/TopNav';
import { LektionenView } from './components/LektionenView';
import { GamesHubView } from './components/GamesHubView';
import { LeaderboardView } from './components/LeaderboardView';
import { LoginView } from './components/LoginView';
import { AdminPanelModal } from './components/AdminPanelModal';
import { AddWordModal } from './components/AddWordModal';
import { TextFileImportModal } from './components/TextFileImportModal';
import { InstallAppModal } from './components/InstallAppModal';
import { GermanFlagBackdrop } from './components/GermanFlagBackdrop';
import { CheckCircle2, X } from 'lucide-react';

const USERS_STORAGE_KEY = 'worthub_german_users_v2';
const LESSONS_STORAGE_KEY = 'worthub_german_lessons_v2';
const WORDS_STORAGE_KEY = 'worthub_german_words_v2';
const CURRENT_USER_KEY = 'worthub_german_current_user_v2';
const APPLICATIONS_KEY = 'worthub_german_applications_v2';

export const App: React.FC = () => {
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
  const [lessons, setLessons] = useState(() => {
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

  // Applications state
  const [applications, setApplications] = useState<StudentApplication[]>(() => {
    try {
      const stored = localStorage.getItem(APPLICATIONS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
    return [];
  });

  // Current logged in user
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const exists = DEFAULT_USERS.find((u) => u.id === parsed.id);
        if (exists) return parsed;
      }
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
      localStorage.setItem('worthub_german_theme_v2', 'dark');
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
      localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications));
    } catch (e) {
      console.error(e);
    }
  }, [applications]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // Auth Handlers
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    setToastNotification({
      title: 'Hush kelibsiz!',
      message: `${user.name} (${user.role === 'admin' ? "O'qituvchi" : "O'quvchi"}) sifatida kirdingiz.`,
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleSubmitApplication = (appData: Omit<StudentApplication, 'id' | 'status' | 'submittedAt'>) => {
    const newApp: StudentApplication = {
      ...appData,
      id: 'app-' + Date.now(),
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    setApplications((prev) => [newApp, ...prev]);
  };

  const handleApproveApplication = (app: StudentApplication) => {
    const baseUsername = app.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'student';
    let uniqueUser = baseUsername;
    let count = 1;
    while (users.some((u) => u.username === uniqueUser)) {
      uniqueUser = `${baseUsername}${count}`;
      count++;
    }

    const generatedPassword = Math.random().toString(36).slice(-6) + '12';

    const newUser: UserAccount = {
      id: 'user-' + Date.now(),
      name: app.name,
      username: uniqueUser,
      password: generatedPassword,
      phone: app.phone,
      role: 'student',
      level: app.level,
      points: 50,
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    setApplications((prev) => prev.filter((a) => a.id !== app.id));
    setToastNotification({
      title: 'O\'quvchi qabul qilindi!',
      message: `Login: ${uniqueUser} | Parol: ${generatedPassword}`,
    });
  };

  const handleSaveWord = (wordData: Omit<WordItem, 'id'>, editId?: string) => {
    if (editId) {
      setWords((prev) => prev.map((w) => (w.id === editId ? { ...wordData, id: editId } : w)));
      setToastNotification({
        title: 'Muvaffaqiyatli saqlandi',
        message: `"${wordData.german}" so'zi yangilandi.`,
      });
    } else {
      const newWord: WordItem = {
        ...wordData,
        id: 'word-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      };
      setWords((prev) => [...prev, newWord]);
      setToastNotification({
        title: 'Yangi so\'z qo\'shildi',
        message: `"${wordData.german}" lug'atga qo'shildi.`,
      });
    }
    setIsAddWordOpen(false);
    setEditingWord(null);
  };

  const handleDeleteWord = (wordId: string) => {
    setWords((prev) => prev.filter((w) => w.id !== wordId));
    setToastNotification({
      title: 'O\'chirildi',
      message: 'So\'z muvaffaqiyatli o\'chirildi.',
    });
  };

  const handleImportWords = (newWords: Omit<WordItem, 'id'>[], targetLessonId: string) => {
    const createdWords: WordItem[] = newWords.map((w, index) => ({
      ...w,
      id: `imported-${Date.now()}-${index}`,
      lessonId: targetLessonId,
    }));
    setWords((prev) => [...prev, ...createdWords]);
    setToastNotification({
      title: 'Import muvaffaqiyatli!',
      message: `${createdWords.length} ta yangi so'z darsga qo'shildi.`,
    });
    setIsImportModalOpen(false);
  };

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
      <GermanFlagBackdrop theme="dark" />

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

      <TopNav
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        currentUser={currentUser}
        theme="dark"
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        onOpenInstallApp={() => setIsInstallModalOpen(true)}
        onLogout={handleLogout}
      />

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'lektionen' && (
          <LektionenView
            lessons={lessons}
            words={words}
            currentUser={currentUser}
            onOpenAddWord={(lessonId) => {
              setModalDefaultLessonId(lessonId);
              setEditingWord(null);
              setIsAddWordOpen(true);
            }}
            onEditWord={(word) => {
              setEditingWord(word);
              setModalDefaultLessonId(word.lessonId);
              setIsAddWordOpen(true);
            }}
            onDeleteWord={handleDeleteWord}
            onOpenImportModal={(lessonId) => {
              setModalDefaultLessonId(lessonId);
              setIsImportModalOpen(true);
            }}
          />
        )}

        {currentTab === 'games' && (
          <GamesHubView
            words={words}
            currentUser={currentUser}
            onUpdateScore={(addedPoints) => {
              if (!currentUser) return;
              const newPoints = (currentUser.points || 0) + addedPoints;
              const updatedUser = { ...currentUser, points: newPoints };
              setCurrentUser(updatedUser);
              setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
            }}
          />
        )}

        {currentTab === 'leaderboard' && (
          <LeaderboardView users={users} currentUser={currentUser} />
        )}
      </main>

      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        users={users}
        theme="dark"
        onAddUser={(newUser) => {
          setUsers((prev) => [...prev, newUser]);
          setToastNotification({
            title: 'Yangi foydalanuvchi yaratildi',
            message: `Login: ${newUser.username} | Parol: ${newUser.password}`,
          });
        }}
        onDeleteUser={(userId) => {
          setUsers((prev) => prev.filter((u) => u.id !== userId));
        }}
        onUpdateUser={(updatedUser) => {
          setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
        }}
        onOpenAddWord={() => {
          setEditingWord(null);
          setIsAddWordOpen(true);
        }}
        applications={applications}
        onApproveApplication={handleApproveApplication}
      />

      <AddWordModal
        isOpen={isAddWordOpen}
        onClose={() => {
          setIsAddWordOpen(false);
          setEditingWord(null);
        }}
        lessons={lessons}
        defaultLessonId={modalDefaultLessonId}
        editingWord={editingWord}
        theme="dark"
        onSaveWord={handleSaveWord}
      />

      <TextFileImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        lessons={lessons}
        defaultLessonId={modalDefaultLessonId}
        theme="dark"
        onImportWords={handleImportWords}
      />

      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        theme="dark"
      />
    </div>
  );
};
