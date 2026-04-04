import { createContext } from 'preact';
import { useContext, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import type { User, UserWithToken } from '../types';
import { getStoredAuth, setStoredAuth, removeStoredAuth } from '../utils/storage';

interface UserContextType {
  user: User | null;
  token: string | null;
  login: (data: UserWithToken) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
});

export const UserProvider = ({ children }: { children: ComponentChildren }) => {
  const stored = getStoredAuth();
  const [user, setUser] = useState<User | null>(stored?.user ?? null);
  const [token, setToken] = useState<string | null>(stored?.token ?? null);

  const login = (data: UserWithToken) => {
    setUser(data.user);
    setToken(data.token);
    setStoredAuth(data);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    removeStoredAuth();
  };

  return (
    <UserContext.Provider value={{ user, token, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
};
