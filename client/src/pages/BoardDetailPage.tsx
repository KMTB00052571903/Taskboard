import { useState } from 'preact/hooks';
import { useBoard } from '../providers/BoardProvider';
import type { Task } from '../types';

const STATUS_CONFIG = {
  TODO: { label: 'Por Hacer', color: 'var(--color-todo)', next: 'IN_PROGRESS' },
  IN_PROGRESS: { label: 'En Progreso', color: 'var(--color-in-progress)', next: 'COMPLETED' },
  COMPLETED: { label: 'Completada', color: 'var(--color-completed)', next: 'TODO' },
} as const;

const COLUMNS: Array<Task['status']> = ['TODO', 'IN_PROGRESS', 'COMPLETED'];

export const BoardDetailPage = ({ onBack }: { onBack: () => void }) => {
  const { board, loading, creating, createTask, deleteTask, updateTaskStatus } =
    useBoard();

  const [newTitle, setNewTitle] = useState('');

  const handleCreate = async (e: Event) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const ok = await createTask(newTitle.trim());
    if (ok) setNewTitle('');
  };

  const handleStatusChange = (taskId: string, status: string) => {
    updateTaskStatus(taskId, status);
  };

  const handleDelete = (e: Event, taskId: string) => {
    e.stopPropagation();
    deleteTask(taskId);
  };

  if (loading) {
    return (
      <div class="min-h-screen flex items-center justify-center">
        <p class="text-[var(--color-text-muted)]">Cargando board...</p>
      </div>
    );
  }

  if (!board) {
    return (
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <p class="text-[var(--color-text-muted)] text-lg">Board no encontrado</p>
          <button
            onClick={onBack}
            class="mt-4 px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm cursor-pointer"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div class="min-h-screen p-4 max-w-6xl mx-auto">
      <div class="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          class="px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-sm cursor-pointer transition-colors"
        >
          ← Volver
        </button>
        <div>
          <h1 class="text-2xl font-bold">{board.name}</h1>
          <p class="text-xs text-[var(--color-text-muted)]">
            Creado por {board.created_by.user_name}
          </p>
        </div>
      </div>

      <form onSubmit={handleCreate} class="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Nueva tarea..."
          value={newTitle}
          onInput={(e) => setNewTitle((e.target as HTMLInputElement).value)}
          class="flex-1 px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        />
        <button
          type="submit"
          disabled={creating || !newTitle.trim()}
          class="px-4 py-2 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
        >
          {creating ? 'Creando...' : 'Agregar'}
        </button>
      </form>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((status) => {
          const config = STATUS_CONFIG[status];
          const tasks = board.tasks.filter((t) => t.status === status);

          return (
            <div
              key={status}
              class="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4"
            >
              <div class="flex items-center gap-2 mb-4">
                <div
                  class="w-3 h-3 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                <h2 class="font-semibold text-sm">{config.label}</h2>
                <span class="text-xs text-[var(--color-text-muted)] ml-auto">
                  {tasks.length}
                </span>
              </div>

              <div class="flex flex-col gap-2">
                {tasks.length === 0 ? (
                  <p class="text-xs text-[var(--color-text-muted)] text-center py-4">
                    Sin tareas
                  </p>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      class="p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] group"
                    >
                      <div class="flex items-start justify-between gap-2">
                        <p class="text-sm font-medium">{task.title}</p>
                        <button
                          onClick={(e) => handleDelete(e, task.id)}
                          class="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                      <div class="flex items-center justify-between mt-2">
                        <span class="text-xs text-[var(--color-text-muted)]">
                          {task.created_by.user_name}
                        </span>
                        <button
                          onClick={() =>
                            handleStatusChange(task.id, config.next)
                          }
                          class="text-xs px-2 py-1 rounded bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer border border-[var(--color-border)]"
                        >
                          → {STATUS_CONFIG[config.next].label}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
