import { UserAccount, VocabularyLesson, WordItem, StudentApplication, UserSessionLog } from '../types/german';

/**
 * Universal API helper for cross-device synchronization.
 * Connects to the Express backend running on the server so that accounts,
 * lessons, and words are shared seamlessly across all devices (phones, tablets, computers).
 */

const API_TIMEOUT = 5000;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), API_TIMEOUT);
  try {
    const res = await fetch(endpoint, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    clearTimeout(id);
    if (!res.ok) {
      return null;
    }
    return (await res.json()) as T;
  } catch (e) {
    clearTimeout(id);
    // Graceful offline fallback
    return null;
  }
}

export const api = {
  // Auth
  async login(username: string, password: string): Promise<{ success: boolean; user?: UserAccount; message?: string }> {
    const result = await request<{ success: boolean; user?: UserAccount; message?: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (result) return result;
    return { success: false, message: 'network_fallback' };
  },

  // Users
  async getUsers(): Promise<UserAccount[] | null> {
    return request<UserAccount[]>('/api/users');
  },

  async createUser(user: UserAccount): Promise<UserAccount | null> {
    return request<UserAccount>('/api/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  },

  async updateUser(id: string, updates: Partial<UserAccount>): Promise<UserAccount | null> {
    return request<UserAccount>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteUser(id: string): Promise<boolean> {
    const res = await request<{ success: boolean }>(`/api/users/${id}`, {
      method: 'DELETE',
    });
    return !!res?.success;
  },

  // Lessons
  async getLessons(): Promise<VocabularyLesson[] | null> {
    return request<VocabularyLesson[]>('/api/lessons');
  },

  async createLesson(lesson: VocabularyLesson): Promise<VocabularyLesson | null> {
    return request<VocabularyLesson>('/api/lessons', {
      method: 'POST',
      body: JSON.stringify(lesson),
    });
  },

  async updateLesson(id: string, updates: Partial<VocabularyLesson>): Promise<VocabularyLesson | null> {
    return request<VocabularyLesson>(`/api/lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteLesson(id: string): Promise<boolean> {
    const res = await request<{ success: boolean }>(`/api/lessons/${id}`, {
      method: 'DELETE',
    });
    return !!res?.success;
  },

  // Words
  async getWords(): Promise<WordItem[] | null> {
    return request<WordItem[]>('/api/words');
  },

  async saveWord(word: WordItem): Promise<WordItem | null> {
    return request<WordItem>('/api/words', {
      method: 'POST',
      body: JSON.stringify(word),
    });
  },

  async importWords(words: WordItem[]): Promise<boolean> {
    const res = await request<{ success: boolean }>('/api/words/batch', {
      method: 'POST',
      body: JSON.stringify({ words }),
    });
    return !!res?.success;
  },

  async deleteWord(id: string): Promise<boolean> {
    const res = await request<{ success: boolean }>(`/api/words/${id}`, {
      method: 'DELETE',
    });
    return !!res?.success;
  },

  // Applications
  async getApplications(): Promise<StudentApplication[] | null> {
    return request<StudentApplication[]>('/api/applications');
  },

  async submitApplication(app: StudentApplication): Promise<StudentApplication | null> {
    return request<StudentApplication>('/api/applications', {
      method: 'POST',
      body: JSON.stringify(app),
    });
  },

  async deleteApplication(id: string): Promise<boolean> {
    const res = await request<{ success: boolean }>(`/api/applications/${id}`, {
      method: 'DELETE',
    });
    return !!res?.success;
  },

  // Sessions
  async getSessions(): Promise<UserSessionLog[] | null> {
    return request<UserSessionLog[]>('/api/sessions');
  },

  async logSession(session: UserSessionLog): Promise<UserSessionLog | null> {
    return request<UserSessionLog>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(session),
    });
  },
};
