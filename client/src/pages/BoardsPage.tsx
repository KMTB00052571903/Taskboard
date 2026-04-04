import { useEffect, useState } from 'preact/hooks';
import { useAxios } from '../providers/AxiosProvider';
import { useUser } from '../providers/UserProvider';
import { useToast } from '../providers/ToastProvider';
import type { Board } from '../types';

export const BoardsPage = ({
  onSelectBoard,
}: {
  onSelectBoard: (id: string) => void;
}) => {
  const axios = useAxios();
  const { user, logout } = useUser();
  const { showToast } = useToast();

  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBoardName, setNewBoardName] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchBoards = async () => {
    try {
      const { data } = await axios.get<Board[]>('/api/boards');
      setBoards(data);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Error al cargar boards',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleCreate = async (e: Event) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    setCreating(true);
    try {
      const { data } = await axios.post<Board>('/api/boards', {
        name: newBoardName.trim(),
      });
      setBoards((prev) => [data, ...prev]);
      setNewBoardName('');
      showToast('Board creado', 'success');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Error al crear board',
        'error'
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div class="min-h-screen p-4 max-w-3xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold">Task Board</h1>
          <p class="text-sm text-[var(--color-text-muted)]">
            {user?.user_name} ({user?.email})
          </p>
        </div>
        <button
          onClick={logout}
          class="px-4 py-2 rounded-lg text-sm bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
        >
          Cerrar sesión
        </button>
      </div>

      <form onSubmit={handleCreate} class="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Nombre del nuevo board..."
          value={newBoardName}
          onInput={(e) => setNewBoardName((e.target as HTMLInputElement).value)}
          class="flex-1 px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        />
        <button
          type="submit"
          disabled={creating || !newBoardName.trim()}
          class="px-4 py-2 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
        >
          {creating ? 'Creando...' : 'Crear Board'}
        </button>
      </form>

      {loading ? (
        <p class="text-center text-[var(--color-text-muted)] py-12">Cargando...</p>
      ) : boards.length === 0 ? (
        <div class="text-center py-12">
          <p class="text-[var(--color-text-muted)] text-lg">No hay boards</p>
          <p class="text-[var(--color-text-muted)] text-sm mt-1">
            Crea uno para comenzar
          </p>
        </div>
      ) : (
        <div class="flex flex-col gap-3">
          {boards.map((board) => (
            <button
              key={board.id}
              onClick={() => onSelectBoard(board.id)}
              class="w-full text-left p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
            >
              <h3 class="font-semibold">{board.name}</h3>
              <p class="text-xs text-[var(--color-text-muted)] mt-1">
                Creado por {board.created_by.user_name}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
