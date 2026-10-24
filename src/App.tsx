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

// Dastlabki holat: yangi ochilganda to'siqsiz o'quvchi sifatida ochiladi
const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.id) return parsed;
    }
  } catch (e) {}
  return DEFAULT_STUDENT_USER;
});

// Admin kirganda ishlaydigan handler:
const handleAdminLogin = (adminUser: UserAccount) => {
  setCurrentUser(adminUser);
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminUser));
  } catch (e) {}
  setToastNotification({
    title: "Admin holatiga o'tildi!",
    message: `Xush kelibsiz, ${adminUser.name}! Barcha admin imkoniyatlari faollashtirildi.`,
  });
};

// O'quvchi rejimiga qaytish:
const handleLogoutToStudent = () => {
  setCurrentUser(DEFAULT_STUDENT_USER);
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (e) {}
  setToastNotification({
    title: "O'quvchi holatiga qaytildi",
    message: "Platforma o'quvchi rejimiga o'tkazildi.",
  });
};
