import React, { useState } from 'react';
import {
  X,
  Shield,
  UserPlus,
  Users,
  Radio,
  FileText,
  Gamepad2,
  Trash2,
  Copy,
  Check,
  KeyRound,
  Phone,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Download,
  GitBranch,
} from 'lucide-react';
import {
  UserAccount,
  VocabularyLesson,
  CefrLevel,
  UserSessionLog,
  StudentApplication,
} from '../types/german';
import { CEFR_COLORS } from '../utils/germanGrammar';
import { WorthubLogo } from './WorthubLogo';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserAccount[];
  lessons: VocabularyLesson[];
  sessions: UserSessionLog[];
  applications: StudentApplication[];
  theme?: 'dark' | 'light';
  onCreateStudent: (newStudent: Omit<UserAccount, 'id' | 'createdAt' | 'lastActive'>) => void;
  onDeleteStudent: (id: string) => void;
  onUpdateStudent: (id: string, updates: Partial<UserAccount>) => void;
  onOpenAddWord: () => void;
  onOpenImport: () => void;
  onApproveApplication?: (app: StudentApplication) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  users,
  lessons,
  sessions,
  applications,
  theme = 'dark',
  onCreateStudent,
  onDeleteStudent,
  onUpdateStudent,
  onOpenAddWord,
  onOpenImport,
  onApproveApplication,
}) => {
  const [activeTab, setActiveTab] = useState<
    'add-user' | 'users' | 'sessions' | 'applications' | 'add-word' | 'git'
  >('add-user');

  const isDark = theme === 'dark';

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [level, setLevel] = useState<CefrLevel>('A1');
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  // User deletion state (No window.confirm or alert!)
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);
  const [deleteNoticeError, setDeleteNoticeError] = useState<string | null>(null);

  // Copy card state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedGitCmd, setCopiedGitCmd] = useState(false);

  // Edit modal in users tab
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editLevel, setEditLevel] = useState<CefrLevel>('A1');

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const cleanUser = username.trim().toLowerCase();
    if (!cleanUser) {
      setFormError('Iltimos, kirish loginini kiriting.');
      return;
    }

    if (users.some((u) => u.username.toLowerCase() === cleanUser)) {
      setFormError('Bu login allaqachon band. Iltimos, boshqa login tanlang.');
      return;
    }

    if (!password.trim()) {
      setFormError('Iltimos, parolni kiriting.');
      return;
    }

    onCreateStudent({
      name: name.trim() || cleanUser,
      username: cleanUser,
      password: password.trim(),
      phone: phone.trim() || undefined,
      role,
      assignedLevel: level,
      isActive: true,
      xp: 0,
      streakDays: 0,
      wordsCount: 0,
    });

    setFormSuccess(`"${name || cleanUser}" muvaffaqiyatli ro'yxatga olindi!`);
    setName('');
    setPhone('');
    setUsername('');
    setPassword('');

    setTimeout(() => setFormSuccess(''), 3000);
  };

  const handleCopyCard = (user: UserAccount) => {
    const text = `Worthub.uz nemis tili platformasi:\nIsm: ${user.name}\nLogin: ${user.username}\nParol: ${user.password}\nDaraja: ${user.assignedLevel}`;
    navigator.clipboard.writeText(text);
    setCopiedId(user.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDeleteUser = (user: UserAccount) => {
    if (user.username === 'ahmadjon') {
      setDeleteNoticeError("Asosiy boshqaruvchi (ahmadjon) hisobini o'chirib bo'lmaydi.");
      setTimeout(() => setDeleteNoticeError(null), 3500);
      return;
    }
    setUserToDelete(user);
  };

  const startEdit = (u: UserAccount) => {
    setEditingUserId(u.id);
    setEditName(u.name);
    setEditPassword(u.password);
    setEditLevel(u.assignedLevel);
  };

  const saveEdit = (id: string) => {
    onUpdateStudent(id, {
      name: editName.trim(),
      password: editPassword.trim(),
      assignedLevel: editLevel,
    });
    setEditingUserId(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md"
    >
      <div className={`relative w-full max-w-4xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
        isDark ? 'border-slate-800 bg-[#12151e] text-slate-100' : 'border-slate-200 bg-white text-slate-900 shadow-xl'
      }`}>
        {/* Header */}
        <div className={`p-5 sm:p-6 border-b flex items-start justify-between gap-4 ${
          isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <WorthubLogo size="sm" variant="mark-only" theme={theme} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-base sm:text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  O'qituvchi boshqaruv paneli — worthub.uz
                </h2>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Odamlar qo'shish, login/parol berish, arizalarni tasdiqlash va tizim nazorati
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers matching Screenshot 6 */}
        <div className={`flex items-center gap-1 p-2 border-b overflow-x-auto no-scrollbar text-xs ${
          isDark ? 'bg-[#0d1017] border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => setActiveTab('add-user')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'add-user'
                ? isDark
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-white text-amber-600 border border-amber-400 shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Odam qo'shish</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'users'
                ? isDark
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-white text-amber-600 border border-amber-400 shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Foydalanuvchilar ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'sessions'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Kirib-chiqishlar & Faol sessiyalar ({sessions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'applications'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Arizalar ({applications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('git')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'git'
                ? isDark
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-white text-amber-600 border border-amber-400 shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Git & Kod yuklash (ZIP)</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenAddWord();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-slate-400 hover:text-amber-300 whitespace-nowrap transition-all cursor-pointer ml-auto"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>+ So'z qo'shish</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* TAB 1: + Odam qo'shish */}
          {activeTab === 'add-user' && (
            <div className="space-y-6">
              {/* Notice Box matching Screenshot 6 */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-1">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <Shield className="w-4 h-4" />
                  <span>O'quvchiga shaxsiy login va parol tayinlash</span>
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  Siz bu yerda o'quvchining ismini, o'zingiz belgilagan <strong>login</strong> va <strong>parolini</strong> kiritasiz. Shundan so'ng u ushbu login/parol orqali saytga kira oladi!
                </p>
              </div>

              {formSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      O'quvchining ism-familiyasi: *
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: Dilshod Alimov"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full rounded-xl px-3.5 py-2.5 transition-colors border ${
                        isDark
                          ? 'bg-[#181c28] border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400'
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white'
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Telefon raqami (ixtiyoriy):
                    </label>
                    <input
                      type="tel"
                      placeholder="+998 90 123 45 67"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full rounded-xl px-3.5 py-2.5 font-mono transition-colors border ${
                        isDark
                          ? 'bg-[#181c28] border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400'
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white'
                      }`}
                    />
                  </div>
                </div>

                {/* Role Switcher */}
                <div>
                  <label className={`block font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Foydalanuvchi maqomi (Admin yoki O'quvchi qilib belgilash): *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all cursor-pointer ${
                        role === 'student'
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                          : isDark
                          ? 'bg-[#181c28] text-slate-400 border-slate-700 hover:text-slate-200'
                          : 'bg-slate-100 text-slate-600 border-slate-300 hover:text-slate-900'
                      }`}
                    >
                      <span>🎓 O'quvchi (Student)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all cursor-pointer ${
                        role === 'admin'
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                          : isDark
                          ? 'bg-[#181c28] text-slate-400 border-slate-700 hover:text-slate-200'
                          : 'bg-slate-100 text-slate-600 border-slate-300 hover:text-slate-900'
                      }`}
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin (Boshqaruvchi)</span>
                    </button>
                  </div>
                </div>

                {/* Login and Parol */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block font-semibold mb-1.5 flex items-center gap-1 ${
                      isDark ? 'text-amber-300' : 'text-amber-700'
                    }`}>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Kirish logini (O'zingiz belgilang): *</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: dilshod12"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={`w-full rounded-xl px-3.5 py-2.5 font-mono transition-colors border ${
                        isDark
                          ? 'bg-[#181c28] border-amber-500/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400'
                          : 'bg-slate-50 border-amber-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white'
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block font-semibold mb-1.5 flex items-center gap-1 ${
                      isDark ? 'text-amber-300' : 'text-amber-700'
                    }`}>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Kirish paroli (O'zingiz belgilang): *</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: 7788 yoki nemis123"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full rounded-xl px-3.5 py-2.5 font-mono transition-colors border ${
                        isDark
                          ? 'bg-[#181c28] border-amber-500/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400'
                          : 'bg-slate-50 border-amber-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white'
                      }`}
                      required
                    />
                  </div>
                </div>

                {/* Level selector */}
                <div>
                  <label className={`block font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Nemis tili darajasi:
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as CefrLevel)}
                    className={`w-full rounded-xl px-3.5 py-2.5 font-mono transition-colors border ${
                      isDark
                        ? 'bg-[#181c28] border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white'
                    }`}
                  >
                    <option value="A1">A1 — Boshlang'ich (Anfänger)</option>
                    <option value="A2">A2 — Boshlang'ich davomiy (Grundstufe)</option>
                    <option value="B1">B1 — O'rta daraja (Mittelstufe 1)</option>
                    <option value="B2">B2 — Mustaqil (Mittelstufe 2)</option>
                    <option value="C1">C1 — Ilg'or professional (Oberstufe)</option>
                    <option value="C2">C2 — Mukammal ona tili darajasi</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-600/25 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ O'quvchini ro'yxatga kiritish va parolini saqlash</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Foydalanuvchilar (Odamlarni o'chirish ishlasin!) */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="font-semibold text-slate-200">
                  Ro'yxatdagi barcha foydalanuvchilar ({users.length})
                </div>
                <div className="text-[11px] text-slate-400">
                  Keraksiz foydalanuvchini qizil <strong className="text-rose-400">O'chirish</strong> tugmasi orqali butunlay o'chirishingiz mumkin.
                </div>
              </div>

              {deleteNoticeError && (
                <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{deleteNoticeError}</span>
                </div>
              )}

              {userToDelete && (
                <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 space-y-3 animate-shake">
                  <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>Foydalanuvchini o'chirishni tasdiqlang:</span>
                  </div>
                  <p className="text-xs text-slate-200">
                    Haqiqatan ham <strong>{userToDelete.name}</strong> (Login: <code className="bg-black/40 px-1 py-0.5 rounded font-mono text-amber-300">{userToDelete.username}</code>) hisobini tizimdan butunlay o'chirmoqchimisiz?
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setUserToDelete(null)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs cursor-pointer hover:bg-slate-700"
                    >
                      Bekor qilish
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteStudent(userToDelete.id);
                        setUserToDelete(null);
                      }}
                      className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-rose-600/30"
                    >
                      Ha, butunlay o'chirish
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2.5">
                {users.map((u) => {
                  const isCopied = copiedId === u.id;
                  const isEditing = editingUserId === u.id;

                  if (isEditing) {
                    return (
                      <div
                        key={u.id}
                        className={`p-4 rounded-2xl border space-y-3 ${
                          isDark ? 'bg-[#181c28] border-amber-500/50' : 'bg-amber-50/60 border-amber-300'
                        }`}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Ism:</label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className={`w-full rounded-xl p-2 transition-colors border ${
                                isDark
                                  ? 'bg-slate-900 border-slate-700 text-slate-100'
                                  : 'bg-white border-slate-300 text-slate-900'
                              }`}
                            />
                          </div>
                          <div>
                            <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Parol:</label>
                            <input
                              type="text"
                              value={editPassword}
                              onChange={(e) => setEditPassword(e.target.value)}
                              className={`w-full rounded-xl p-2 font-mono transition-colors border ${
                                isDark
                                  ? 'bg-slate-900 border-slate-700 text-slate-100'
                                  : 'bg-white border-slate-300 text-slate-900'
                              }`}
                            />
                          </div>
                          <div>
                            <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Daraja:</label>
                            <select
                              value={editLevel}
                              onChange={(e) => setEditLevel(e.target.value as any)}
                              className={`w-full rounded-xl p-2 font-mono transition-colors border ${
                                isDark
                                  ? 'bg-slate-900 border-slate-700 text-slate-100'
                                  : 'bg-white border-slate-300 text-slate-900'
                              }`}
                            >
                              <option value="A1">A1</option>
                              <option value="A2">A2</option>
                              <option value="B1">B1</option>
                              <option value="B2">B2</option>
                              <option value="C1">C1</option>
                              <option value="C2">C2</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingUserId(null)}
                            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                              isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                          >
                            Bekor qilish
                          </button>
                          <button
                            onClick={() => saveEdit(u.id)}
                            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition-all cursor-pointer shadow-sm"
                          >
                            Saqlash
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={u.id}
                      className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                        isDark
                          ? 'bg-[#161a26] border-slate-800/80 hover:border-slate-700'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm ${
                          isDark
                            ? 'bg-slate-800/80 border-slate-700/60 text-amber-400'
                            : 'bg-amber-100 border-amber-200 text-amber-800'
                        }`}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{u.name}</span>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                u.role === 'admin'
                                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                  : CEFR_COLORS[u.assignedLevel] || 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                            >
                              {u.role === 'admin' ? 'ADMIN' : u.assignedLevel}
                            </span>
                            {u.phone && (
                              <span className={`text-[11px] font-mono hidden md:inline ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                ({u.phone})
                              </span>
                            )}
                          </div>
                          <div className={`text-[11px] font-mono mt-0.5 flex items-center gap-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            <span>Login: <strong className={isDark ? 'text-slate-200' : 'text-slate-900'}>{u.username}</strong></span>
                            <span>Parol: <strong className={isDark ? 'text-amber-400' : 'text-amber-700'}>{u.password}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => handleCopyCard(u)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1 border cursor-pointer transition-colors ${
                            isDark
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                          title="Login-parolni nusxalash"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-500 font-bold">Nusxalandi</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-amber-500" />
                              <span>Kartocha</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => startEdit(u)}
                          className={`p-1.5 rounded-xl cursor-pointer transition-colors border ${
                            isDark
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                          title="Tahrirlash"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Odamlarni o'chirish tugmasi! */}
                        {u.username !== 'ahmadjon' && (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 text-rose-500 border border-rose-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Foydalanuvchini o'chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span>O'chirish</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Kirib-chiqishlar & Faol sessiyalar */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              <div className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>Tizimga oxirgi kirishlar:</div>
              <div className="space-y-2">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-colors ${
                      isDark ? 'bg-[#161a26] border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.name} ({s.username})</div>
                      <div className={`text-[11px] font-mono mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Qurilma: {s.ipOrDevice}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-500 font-mono font-bold">Faol sessiya</div>
                      <div className={`text-[11px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{s.loginTime}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Arizalar */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              <div className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                Sayt orqali o'quvchilardan kelib tushgan arizalar ({applications.length})
              </div>

              {applications.length === 0 ? (
                <div className={`p-8 rounded-2xl border text-center space-y-2 ${
                  isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                  <div className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Yangi arizalar mavjud emas</div>
                  <p className="text-[11px] text-slate-400">
                    O'quvchilar kirish ekranidagi "Ariza qoldirish" tugmasi orqali ariza yuborishsa, ular shu yerda ko'rinadi.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${
                        isDark ? 'bg-[#161a26] border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div>
                        <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{app.name}</div>
                        <div className={`text-xs font-mono ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>{app.phone} · Daraja: {app.level}</div>
                      </div>
                      {onApproveApplication && (
                        <button
                          onClick={() => onApproveApplication(app)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-emerald-600/20"
                        >
                          Qabul qilish & Login berish
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Git & Kodni yuklab olish */}
          {activeTab === 'git' && (
            <div className="space-y-6">
              {/* Notice */}
              <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-200 space-y-1">
                <div className="flex items-center gap-2 font-bold text-sky-300">
                  <GitBranch className="w-4 h-4" />
                  <span>Git & Vercel Loyiha Sinxronizatsiyasi</span>
                </div>
                <p className="text-xs text-sky-300/80">
                  Ushbu platforma kodi to'liq saqlangan va mahalliy Git omboriga (main tarmoqqa) commit qilingan. Vercel avtomatik tarzda sizning GitHub repozitoriyangizdan kod oladi.
                </p>
              </div>

              {/* Download ZIP Card */}
              <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isDark ? 'bg-[#151924] border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                      <Download className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Barcha yangi kodlarni yuklab olish (.ZIP)
                      </h4>
                      <p className="text-xs text-slate-400">
                        O'zbekiston rasmiy nishoni, so'nggi darslar, o'yinlar va barcha fayllar arxivlangan.
                      </p>
                    </div>
                  </div>
                </div>

                <a
                  href="/worthub-source.zip"
                  download="worthub-uz-latest.zip"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  <span>ZIP arxivni yuklab olish (1.5 MB)</span>
                </a>
              </div>

              {/* 2 Usul orqali GitHub va Vercel'ga yuklash */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                isDark ? 'bg-[#11141d] border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <h4 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Kodni GitHub va Vercel'da yangilashning 2 ta yo'li:</span>
                </h4>

                <div className="space-y-3">
                  <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="font-bold text-amber-400 text-xs mb-1">
                      1-usul: GitHub saytida «Upload files» (Eng osoni)
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
                      <li>Yuqoridagi sariq tugma orqali ZIP faylni yuklab oling va kompyuteringizda arxivdan chiqaring.</li>
                      <li>GitHub repozitoriyangizga kiring (masalan: <code className="text-amber-300 font-mono">github.com/.../sozhub</code>).</li>
                      <li><strong>«Add file»</strong> ➡️ <strong>«Upload files»</strong> tugmasini bosing va barcha fayllarni (ayniqsa <code className="text-amber-300 font-mono">src</code>, <code className="text-amber-300 font-mono">public</code>) tashlang.</li>
                      <li>Pastdagi <strong>«Commit changes»</strong> tugmasini bosing. Vercel buni o'zi sezib, yangi versiyani avtomatik ishga tushiradi!</li>
                    </ol>
                  </div>

                  <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-sky-400 text-xs">
                        2-usul: Git buyruqlari orqali to'g'ridan-to'g'ri push qilish
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`git remote add origin https://github.com/USERNAME/REPO.git\ngit branch -M main\ngit push -u origin main`);
                          setCopiedGitCmd(true);
                          setTimeout(() => setCopiedGitCmd(false), 2000);
                        }}
                        className="px-2 py-1 rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 flex items-center gap-1 text-[10px] cursor-pointer"
                      >
                        {copiedGitCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedGitCmd ? 'Nusxalandi' : 'Nusxalash'}</span>
                      </button>
                    </div>
                    <pre className="p-2.5 rounded-lg bg-black/60 font-mono text-[11px] text-amber-200 overflow-x-auto">
{`git remote add origin https://github.com/USERNAME/REPO.git
git branch -M main
git push -u origin main`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
