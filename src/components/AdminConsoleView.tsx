import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Copy,
  Check,
  KeyRound,
  Trash2,
  Edit2,
  Sparkles,
} from 'lucide-react';
import { UserAccount, VocabularyLesson, CefrLevel } from '../types/german';
import { CEFR_COLORS, CEFR_DESCRIPTIONS_UZ } from '../utils/germanGrammar';

interface AdminConsoleViewProps {
  users: UserAccount[];
  lessons: VocabularyLesson[];
  onCreateStudent: (newStudent: Omit<UserAccount, 'id' | 'createdAt' | 'lastActive'>) => void;
  onUpdateStudent: (id: string, updates: Partial<UserAccount>) => void;
  onDeleteStudent: (id: string) => void;
  onOpenImport?: () => void;
}

export const AdminConsoleView: React.FC<AdminConsoleViewProps> = ({
  users,
  lessons,
  onCreateStudent,
  onUpdateStudent,
  onDeleteStudent,
  onOpenImport,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<UserAccount | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Student Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('nemistili123');
  const [assignedLevel, setAssignedLevel] = useState<CefrLevel>('B1');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Edit Student Form State
  const [editName, setEditName] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editLevel, setEditLevel] = useState<CefrLevel>('B1');
  const [editNotes, setEditNotes] = useState('');

  // Delete modal state (100% reliable in iframes, no window.confirm)
  const [studentToDelete, setStudentToDelete] = useState<UserAccount | null>(null);

  const students = users.filter((u) => u.role === 'student');

  const handleGeneratePassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let res = 'wort';
    for (let i = 0; i < 4; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) {
      setFormError('Foydalanuvchi logini bo\'sh bo\'lishi mumkin emas.');
      return;
    }

    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      setFormError('Bu login allaqachon band qilingan. Boshqa login tanlang.');
      return;
    }

    if (!password.trim()) {
      setFormError('Parol bo\'sh bo\'lishi mumkin emas.');
      return;
    }

    onCreateStudent({
      username: cleanUsername,
      password: password.trim(),
      name: name.trim() || cleanUsername,
      role: 'student',
      assignedLevel,
      isActive: true,
      notes: notes.trim() || undefined,
    });

    setName('');
    setUsername('');
    setPassword('nemistili123');
    setNotes('');
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (student: UserAccount) => {
    setEditingStudent(student);
    setEditName(student.name);
    setEditPassword(student.password);
    setEditLevel(student.assignedLevel);
    setEditNotes(student.notes || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    onUpdateStudent(editingStudent.id, {
      name: editName.trim(),
      password: editPassword.trim(),
      assignedLevel: editLevel,
      notes: editNotes.trim() || undefined,
    });
    setEditingStudent(null);
  };

  const handleCopySlip = (student: UserAccount) => {
    const slip = `Worthub nemis tili platformasiga kirish ma'lumotlari:
Ism-familiya: ${student.name}
Login: ${student.username}
Parol: ${student.password}
Biriktirilgan daraja: ${student.assignedLevel}
Platforma: Worthub Deutsch (O'zbekcha)`;

    navigator.clipboard.writeText(slip);
    setCopiedId(student.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleToggleActive = (student: UserAccount) => {
    onUpdateStudent(student.id, { isActive: !student.isActive });
  };

  return (
    <div className="space-y-6">
      {/* Header in Uzbek */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Administrator paneli: Talabalar va darajalarni boshqarish
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Talabalar hisoblari faqat administrator tomonidan yaratiladi va ularga aniq bilim darajasi (A1–C1) biriktiriladi.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenImport && (
            <button
              onClick={onOpenImport}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 rounded-lg transition-all cursor-pointer shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Matn faylidan import</span>
            </button>
          )}

          <button
            onClick={() => {
              setIsAddModalOpen(true);
              setFormError('');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-red-500 to-amber-400 hover:opacity-95 rounded-lg transition-all cursor-pointer self-start sm:self-auto shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Yangi talaba qo'shish</span>
          </button>
        </div>
      </div>

      {/* Stats row in Uzbek */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-[#111827]/70 backdrop-blur-md">
          <div className="text-xs text-slate-400 mb-1">Ro'yxatdan o'tgan talabalar</div>
          <div className="text-2xl font-bold text-white font-mono">
            {students.length} nafar
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Barcha hisoblar admin tomonidan nazorat qilinadi
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#111827]/70 backdrop-blur-md">
          <div className="text-xs text-slate-400 mb-1">Mavjud darslar soni</div>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {lessons.length} ta Lektion
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Barcha darajalar bo'yicha tuzilgan darslar
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#111827]/70 backdrop-blur-md">
          <div className="text-xs text-slate-400 mb-1">Xavfsizlik & Kirish qoidasi</div>
          <div className="text-sm font-semibold text-purple-300 mt-1">
            Yopiq ro'yxatdan o'tish
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            O'quvchilar mustaqil hisob ocholmaydi
          </div>
        </div>
      </div>

      {/* Student List Table in Uzbek */}
      <div className="rounded-xl border border-slate-800 bg-[#111827]/70 backdrop-blur-md overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Talabalar ro'yxati va biriktirilgan darajalari</h2>
            <p className="text-[11px] text-slate-400">
              Talabaga login-parolini berish uchun "Kartocha" tugmasini bosing.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-mono">
                <th className="py-3 px-4 font-medium">Talaba ismi</th>
                <th className="py-3 px-4 font-medium">Login</th>
                <th className="py-3 px-4 font-medium">Parol</th>
                <th className="py-3 px-4 font-medium">Biriktirilgan daraja</th>
                <th className="py-3 px-4 font-medium">Holat</th>
                <th className="py-3 px-4 font-medium text-right">Amallar & Login-kartocha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {students.map((student) => {
                const isCopied = copiedId === student.id;

                return (
                  <tr key={student.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{student.name}</div>
                      {student.notes && (
                        <div className="text-[11px] text-slate-500 mt-0.5">{student.notes}</div>
                      )}
                    </td>

                    {/* Username */}
                    <td className="py-3.5 px-4 font-mono text-slate-200">
                      {student.username}
                    </td>

                    {/* Password */}
                    <td className="py-3.5 px-4 font-mono text-amber-300">
                      <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {student.password}
                      </span>
                    </td>

                    {/* Assigned Proficiency Level */}
                    <td className="py-3.5 px-4 font-mono">
                      <span className={`px-2 py-0.5 rounded border font-bold ${CEFR_COLORS[student.assignedLevel]}`}>
                        {student.assignedLevel}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleActive(student)}
                        className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                          student.isActive
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {student.isActive ? 'Faol' : 'Nofaol'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Copy slip button */}
                        <button
                          onClick={() => handleCopySlip(student)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer border ${
                            isCopied
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                          }`}
                          title="Kirish ma'lumotlarini nusxalash"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Nusxalandi!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Kartocha</span>
                            </>
                          )}
                        </button>

                        {/* Edit student & change level */}
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="p-1.5 text-slate-400 hover:text-amber-300 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Tahrirlash / Darajasini o'zgartirish"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete account */}
                        <button
                          onClick={() => setStudentToDelete(student)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Hisobni o'chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create New Student with Assigned Level */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-[#0f172a] p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-amber-400" />
              <span>Yangi talaba hisobini yaratish</span>
            </h2>

            {formError && (
              <div className="p-2.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Talabaning to'liq ismi (F.I.O) *
                </label>
                <input
                  type="text"
                  placeholder="masalan: Sardor Boboyev"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Login (foydalanuvchi nomi) *
                </label>
                <input
                  type="text"
                  placeholder="masalan: sardor.boboyev"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-medium">
                    Parol *
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-amber-400 hover:text-amber-300 underline text-[11px] cursor-pointer"
                  >
                    Avto-generatsiya
                  </button>
                </div>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Biriktiriladigan til darajasi (Proficiency Level) *
                </label>
                <select
                  value={assignedLevel}
                  onChange={(e) => setAssignedLevel(e.target.value as CefrLevel)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400 font-mono font-bold"
                >
                  <option value="A1">A1 — Boshlang'ich (Grundstufe 1)</option>
                  <option value="A2">A2 — Boshlang'ich-davomiy (Grundstufe 2)</option>
                  <option value="B1">B1 — O'rta daraja (Mittelstufe 1)</option>
                  <option value="B2">B2 — Mustaqil til egasi (Mittelstufe 2)</option>
                  <option value="C1">C1 — Yuqori professional (Oberstufe)</option>
                  <option value="C2">C2 — Mukammal ona tili darajasi (Muttersprachlich)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Guruh yoki qo'shimcha izoh
                </label>
                <input
                  type="text"
                  placeholder="masalan: 102-guruh, Goethe B1 tayyorgarlik"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-500 hover:opacity-95 text-white font-semibold rounded-lg transition-all cursor-pointer"
                >
                  Talabani ro'yxatga olish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Student & Change Assigned Level */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-[#0f172a] p-6 shadow-2xl space-y-4">
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-amber-400" />
              <span>Talaba ma'lumotlarini tahrirlash</span>
            </h2>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Ism-familiya
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Parol
                </label>
                <input
                  type="text"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Biriktirilgan daraja (Proficiency Level)
                </label>
                <select
                  value={editLevel}
                  onChange={(e) => setEditLevel(e.target.value as CefrLevel)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono font-bold focus:outline-none focus:border-amber-400"
                >
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                  <option value="C1">C1</option>
                  <option value="C2">C2</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Izoh
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-3.5 py-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-500 hover:opacity-95 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Student Deletion */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-[#0f172a] p-6 shadow-2xl space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Hisobni o'chirish</h3>
              <p className="text-xs text-slate-400">
                Haqiqatan ham <strong className="text-white">{studentToDelete.name}</strong> ({studentToDelete.username}) hisobini butunlay o'chirmoqchimisiz?
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteStudent(studentToDelete.id);
                  setStudentToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/30 cursor-pointer"
              >
                Ha, o'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
