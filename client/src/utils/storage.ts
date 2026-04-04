import type { UserWithToken } from '../types';

const AUTH_KEY = 'task-board-user';

export const getStoredAuth = (): UserWithToken | null => {
  const raw = sessionStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setStoredAuth = (auth: UserWithToken): void => {
  sessionStorage.setItem(AUTH_KEY, JSON.stringify(auth));
};

export const removeStoredAuth = (): void => {
  sessionStorage.removeItem(AUTH_KEY);
};
