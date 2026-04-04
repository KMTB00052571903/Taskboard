import { useState } from 'preact/hooks';
import { useAxios } from '../providers/AxiosProvider';
import { useUser } from '../providers/UserProvider';
import { useToast } from '../providers/ToastProvider';
import type { UserWithToken } from '../types';

const DEMO_USERS = [
  { email: 'alice@email.com', label: 'Alice' },
  { email: 'bob@email.com', label: 'Bob' },
  { email: 'charlie@email.com', label: 'Charlie' },
];

export const LoginPage = () => {
  const axios = useAxios();
  const { login } = useUser();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post<UserWithToken>('/api/auth/login', {
        email,
        password,
      });
      login(data);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Error al iniciar sesión',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userEmail: string) => {
    setLoading(true);
    try {
      const { data } = await axios.post<UserWithToken>('/api/auth/login', {
        email: userEmail,
        password: '123456',
      });
      login(data);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Error al iniciar sesión',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-sm">
        <div class="bg-[var(--color-surface)] rounded-2xl p-8 border border-[var(--color-border)]">
          <h1 class="text-2xl font-bold text-center mb-2">Task Board</h1>
          <p class="text-[var(--color-text-muted)] text-center text-sm mb-6">
            Iniciar sesión
          </p>

          <div class="flex flex-col gap-2 mb-6">
            <p class="text-xs text-[var(--color-text-muted)] uppercase tracking-wide">
              Acceso rápido
            </p>
            {DEMO_USERS.map((u) => (
              <button
                key={u.email}
                onClick={() => handleQuickLogin(u.email)}
                disabled={loading}
                class="w-full py-2 px-4 rounded-lg bg-[var(--color-surface-hover)] hover:bg-[var(--color-accent)] text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 border border-[var(--color-border)]"
              >
                {u.label} ({u.email})
              </button>
            ))}
          </div>

          <div class="border-t border-[var(--color-border)] pt-4">
            <form onSubmit={handleLogin} class="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
                required
                class="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
                required
                class="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
              <button
                type="submit"
                disabled={loading}
                class="w-full py-2 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-medium text-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Ingresando...' : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
