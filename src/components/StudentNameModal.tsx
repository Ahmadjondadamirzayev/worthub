import React, { useState } from 'react';
import { User, Award, CheckCircle, Info, Sparkles, X } from 'lucide-react';
import { Level } from '../types';

interface StudentNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentLevel: Level;
  onSave: (name: string, level: Level) => void;
}

export const StudentNameModal: React.FC<StudentNameModalProps> = ({
  isOpen,
  onClose,
  currentName,
  currentLevel,
  onSave,
}) => {
  const [name, setName] = useState(currentName || '');
  const [selectedLevel, setSelectedLevel] = useState<Level>(currentLevel);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Iltimos, ism va familiyangizni kiriting!');
      return;
    }
    if (trimmed.length < 3) {
      setError('Kamida 3 ta harf kiriting.');
      return;
    }
    setError('');
    onSave(trimmed, selectedLevel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-bold text-xl shadow-inner">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">O'quvchi sifatida kirish</h3>
              <p className="text-xs text-blue-100">Reytingda ishtirok eting va ballar to'plang</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nega ism-familiya kerakligi tushuntirishi */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Nega ism va familiya so'ralyapti?</span>
              Siz to'playdigan ballar (XP), kunlik faollik va o'yinlardagi natijalaringiz o'quvchilar reytingida (Leaderboard) aynan sizning ismingiz va familiyangiz ostida saqlanib, faxrli o'rinlarda turishi uchun kerak.
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Ism va familiyangiz <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Masalan: Sardor Rashidov"
              className={`w-full px-4 py-2.5 rounded-xl border ${
                error ? 'border-red-400 bg-red-50' : 'border-slate-300 focus:border-blue-500'
              } focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all text-sm font-medium`}
              autoFocus
            />
            {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              O'rganayotgan darajangiz (CEFR)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['A1', 'A2', 'B1', 'B2'] as Level[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  className={`py-2 text-sm font-bold rounded-xl border transition-all ${
                    selectedLevel === lvl
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Saqlash va davom etish</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
