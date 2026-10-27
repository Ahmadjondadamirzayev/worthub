// Telegram Bot va Kirishlar monitoringi xizmati

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  isEnabled: boolean;
  notifyOnLogin: boolean;
  notifyOnGameFinish: boolean;
  notifyOnDailyBonus: boolean;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  studentName: string;
  level: string;
  type: 'login' | 'daily_bonus' | 'game_finished' | 'name_changed';
  details: string;
  xpEarned?: number;
}

const CONFIG_KEY = 'deutsch_master_telegram_cfg';
const LOGS_KEY = 'deutsch_master_activity_logs';

export const getTelegramConfig = (): TelegramConfig => {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return {
    botToken: '',
    chatId: '',
    isEnabled: false,
    notifyOnLogin: true,
    notifyOnGameFinish: true,
    notifyOnDailyBonus: true,
  };
};

export const saveTelegramConfig = (cfg: TelegramConfig): void => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
};

export const getActivityLogs = (): ActivityLogItem[] => {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
};

export const logActivity = (item: Omit<ActivityLogItem, 'id' | 'timestamp'>): ActivityLogItem => {
  const logs = getActivityLogs();
  const newLog: ActivityLogItem = {
    ...item,
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
  };
  const updated = [newLog, ...logs].slice(0, 100);
  localStorage.setItem(LOGS_KEY, JSON.stringify(updated));
  return newLog;
};

export const sendTelegramMessage = async (text: string): Promise<boolean> => {
  const cfg = getTelegramConfig();
  if (!cfg.isEnabled || !cfg.botToken || !cfg.chatId) {
    return false;
  }
  try {
    const url = `https://api.telegram.org/bot${cfg.botToken.trim()}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cfg.chatId.trim(),
        text: text,
        parse_mode: 'HTML',
      }),
    });
    const data = await res.json();
    return !!data.ok;
  } catch (err) {
    console.error('Telegramga xabar yuborishda xatolik:', err);
    return false;
  }
};

// Kunlik kirish bonusini xabarlash (+15 XP)
export const notifyDailyBonusEarned = async (studentName: string, level: string, streak: number) => {
  logActivity({
    studentName,
    level,
    type: 'daily_bonus',
    details: `Kunlik tashrif bonusi: +15 XP olindi! (Ketma-ket ${streak}-kun)`,
    xpEarned: 15,
  });

  const cfg = getTelegramConfig();
  if (cfg.isEnabled && cfg.notifyOnDailyBonus) {
    const msg = `🎉 <b>KUNLIK TASHRIF BONUSI!</b>\n\n👤 <b>O'quvchi:</b> ${studentName}\n📚 <b>Daraja:</b> ${level}\n🔥 <b>Ketma-ket kirish (Streak):</b> ${streak} kun\n⚡ <b>Qo'shilgan ball:</b> +15 XP\n⏰ <i>${new Date().toLocaleTimeString('uz-UZ')}</i>`;
    await sendTelegramMessage(msg);
  }
};

// O'yin yakunlanganda xabarlash
export const notifyGameCompleted = async (
  studentName: string,
  level: string,
  gameTitle: string,
  xpEarned: number,
  scoreInfo: string
) => {
  logActivity({
    studentName,
    level,
    type: 'game_finished',
    details: `${gameTitle} yakunlandi. Natija: ${scoreInfo}. (+${xpEarned} XP)`,
    xpEarned,
  });

  const cfg = getTelegramConfig();
  if (cfg.isEnabled && cfg.notifyOnGameFinish) {
    const msg = `🎮 <b>O'YIN YAKUNLANDI!</b>\n\n👤 <b>O'quvchi:</b> ${studentName}\n📚 <b>Daraja:</b> ${level}\n🎯 <b>O'yin:</b> ${gameTitle}\n📊 <b>Natija:</b> ${scoreInfo}\n⚡ <b>Qo'lga kiritilgan ball:</b> +${xpEarned} XP\n⏰ <i>${new Date().toLocaleTimeString('uz-UZ')}</i>`;
    await sendTelegramMessage(msg);
  }
};
