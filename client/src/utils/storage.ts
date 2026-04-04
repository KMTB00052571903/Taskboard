import type { UserWithToken } from '../types';

const AUTH_KEY = 'auth';

export const getStoredAuth = (): UserWithToken | null => {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setStoredAuth = (auth: UserWithToken): void => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
};

export const removeStoredAuth = (): void => {
  localStorage.removeItem(AUTH_KEY);
};
