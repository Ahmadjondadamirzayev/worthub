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
} from 'lucide-react';
import {
  UserAccount,
  VocabularyLesson,
  CefrLevel,
  UserSessionLog,
  StudentApplication,
} from '../types/german';
import { CEFR_COLORS } from '../utils/germanGrammar';

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
    'add-user' | 'users' | 'sessions' | 'applications' | 'add-word'
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
        {/* Header matching Screenshot 6 */}
        <div className={`p-5 sm:p-6 border-b flex items-start justify-between gap-4 ${
          isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-2.5 rounded-xs overflow-hidden flex flex-col border border-white/20">
                  <span className="h-1/3 bg-black" />
                  <span className="h-1/3 bg-red-600" />
                  <span className="h-1/3 bg-yellow-400" />
                </span>
                <h2 className={`text-base sm:text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  O'qituvchi boshqaruv paneli — worthub.uz
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Odamlar qo'shish, login/parol berish, arizalarni tasdiqlash va o'yinlarga yangi so'zlar kiritish
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
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
                    <label className="block text-slate-300 font-semibold mb-1.5">
                      O'quvchining ism-familiyasi: *
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: Dilshod Alimov"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#181c28] border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">
                      Telefon raqami (ixtiyoriy):
                    </label>
                    <input
                      type="tel"
                      placeholder="+998 90 123 45 67"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#181c28] border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                {/* Role Switcher matching Screenshot 6 */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Foydalanuvchi maqomi (Admin yoki O'quvchi qilib belgilash): *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all cursor-pointer ${
                        role === 'student'
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                          : 'bg-[#181c28] text-slate-400 border-slate-700 hover:text-slate-200'
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
                          : 'bg-[#181c28] text-slate-400 border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin (Boshqaruvchi)</span>
                    </button>
                  </div>
                </div>

                {/* Login and Parol matching Screenshot 6 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-amber-300 font-semibold mb-1.5 flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Kirish logini (O'zingiz belgilang): *</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: dilshod12"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-[#181c28] border border-amber-500/50 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-amber-300 font-semibold mb-1.5 flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Kirish paroli (O'zingiz belgilang): *</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: 7788 yoki nemis123"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#181c28] border border-amber-500/50 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Level selector matching Screenshot 6 */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Nemis tili darajasi:
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as CefrLevel)}
                    className="w-full bg-[#181c28] border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
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
                        className="p-4 rounded-2xl bg-[#181c28] border border-amber-500/50 space-y-3"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-slate-400">Ism:</label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100"
                            />
                          </div>
                          <div>
                            <label className="text-slate-400">Parol:</label>
                            <input
                              type="text"
                              value={editPassword}
                              onChange={(e) => setEditPassword(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-slate-400">Daraja:</label>
                            <select
                              value={editLevel}
                              onChange={(e) => setEditLevel(e.target.value as any)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono"
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
                            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                          >
                            Bekor qilish
                          </button>
                          <button
                            onClick={() => saveEdit(u.id)}
                            className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold"
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
                      className="p-3.5 sm:p-4 rounded-2xl bg-[#161a26] border border-slate-800/80 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center font-bold text-amber-400 text-sm">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{u.name}</span>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                u.role === 'admin'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : CEFR_COLORS[u.assignedLevel] || 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                            >
                              {u.role === 'admin' ? 'ADMIN' : u.assignedLevel}
                            </span>
                            {u.phone && (
                              <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                                ({u.phone})
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5 flex items-center gap-3">
                            <span>Login: <strong className="text-slate-200">{u.username}</strong></span>
                            <span>Parol: <strong className="text-amber-400">{u.password}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => handleCopyCard(u)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 border border-slate-700 cursor-pointer"
                          title="Login-parolni nusxalash"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-300">Nusxalandi</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Kartocha</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => startEdit(u)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                          title="Tahrirlash"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Odamlarni o'chirish tugmasi! */}
                        {u.username !== 'ahmadjon' && (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                            title="Foydalanuvchini o'chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
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
              <div className="text-slate-300 font-semibold">Tizimga oxirgi kirishlar:</div>
              <div className="space-y-2">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-xl bg-[#161a26] border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{s.name} ({s.username})</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Qurilma: {s.ipOrDevice}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 font-mono font-medium">Faol sessiya</div>
                      <div className="text-[11px] text-slate-500 font-mono">{s.loginTime}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Arizalar */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              <div className="text-slate-300 font-semibold">
                Sayt orqali o'quvchilardan kelib tushgan arizalar ({applications.length})
              </div>

              {applications.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
                  <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                  <div className="text-slate-400 font-medium">Yangi arizalar mavjud emas</div>
                  <p className="text-[11px] text-slate-500">
                    O'quvchilar kirish ekranidagi "Ariza qoldirish" tugmasi orqali ariza yuborishsa, ular shu yerda ko'rinadi.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 rounded-xl bg-[#161a26] border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-white text-sm">{app.name}</div>
                        <div className="text-xs text-amber-400 font-mono">{app.phone} · Daraja: {app.level}</div>
                      </div>
                      {onApproveApplication && (
                        <button
                          onClick={() => onApproveApplication(app)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs cursor-pointer"
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
        </div>
      </div>
    </div>
  );
};
