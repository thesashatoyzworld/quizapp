const STORAGE_KEY = 'thesasha-quiz-state';
const SCHEMA_VERSION = 1;
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface PersistedQuizState {
  version: number;
  currentQuestion: number;
  answers: number[];
  startedAt: number; // timestamp
}

interface StoredData {
  version: number;
  currentQuestion: number;
  answers: number[];
  startedAt: number;
}

/**
 * Save quiz state to localStorage.
 * Called on each answer.
 */
export function saveQuizState(currentQuestion: number, answers: number[], startedAt: number): void {
  if (typeof window === 'undefined') return;

  try {
    const data: StoredData = {
      version: SCHEMA_VERSION,
      currentQuestion,
      answers,
      startedAt,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage may be full or blocked — silently ignore
  }
}

/**
 * Load quiz state from localStorage.
 * Returns null if no valid state found, expired, or schema version mismatch.
 */
export function loadQuizState(): PersistedQuizState | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data: StoredData = JSON.parse(raw);

    // Schema version mismatch — discard
    if (data.version !== SCHEMA_VERSION) {
      clearQuizState();
      return null;
    }

    // Expired (> 24 hours old)
    if (Date.now() - data.startedAt > MAX_AGE_MS) {
      clearQuizState();
      return null;
    }

    // Basic validation
    if (
      typeof data.currentQuestion !== 'number' ||
      !Array.isArray(data.answers) ||
      data.currentQuestion < 0 ||
      data.answers.length === 0
    ) {
      clearQuizState();
      return null;
    }

    return {
      version: data.version,
      currentQuestion: data.currentQuestion,
      answers: data.answers,
      startedAt: data.startedAt,
    };
  } catch {
    // Corrupted data — clear it
    clearQuizState();
    return null;
  }
}

/**
 * Clear quiz state from localStorage.
 * Called on quiz completion or when user declines to restore.
 */
export function clearQuizState(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // silently ignore
  }
}
