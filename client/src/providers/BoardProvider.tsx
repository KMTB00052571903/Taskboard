import { createContext } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { useParams } from 'react-router-dom';
import type { Task, BoardWithTasks } from '../types';
import { useAxios } from './AxiosProvider';
import { useToast } from './ToastProvider';
import useSupabase from '../hooks/useSupabase';

interface BoardContextType {
  board: BoardWithTasks | null;
  loading: boolean;
  creating: boolean;
  createTask: (title: string) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: string) => Promise<void>;
}

const BoardContext = createContext<BoardContextType>({
  board: null,
  loading: true,
  creating: false,
  createTask: async () => false,
  deleteTask: async () => {},
  updateTaskStatus: async () => {},
});

interface BoardProviderProps {
  children: ComponentChildren;
}

export const BoardProvider = ({ children }: BoardProviderProps) => {
  const { boardId } = useParams<{ boardId: string }>();
  const axios = useAxios();
  const { showToast } = useToast();
  const supabase = useSupabase();

  const [board, setBoard] = useState<BoardWithTasks | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchBoard = async () => {
    try {
      const { data } = await axios.get<BoardWithTasks>(`/api/boards/${boardId}`);
      setBoard(data);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Error al cargar board',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, [boardId]);

  useEffect(() => {
    if (!boardId) return;

    const channel = supabase
      .channel(`board:${boardId}`)
      .on('broadcast', { event: 'task-created' }, ({ payload }) => {
        setBoard((prev) => {
          if (!prev) return prev;
          if (prev.tasks.some((t) => t.id === payload.id)) return prev;
          return { ...prev, tasks: [...prev.tasks, payload] };
        });
      })
      .on('broadcast', { event: 'task-deleted' }, ({ payload }) => {
        setBoard((prev) => {
          if (!prev) return prev;
          return { ...prev, tasks: prev.tasks.filter((t) => t.id !== payload.taskId) };
        });
      })
      .on('broadcast', { event: 'task-updated' }, ({ payload }) => {
        setBoard((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            tasks: prev.tasks.map((t) => (t.id === payload.id ? payload : t)),
          };
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [boardId]);

  const createTask = async (title: string): Promise<boolean> => {
    setCreating(true);
    try {
      const { data } = await axios.post<Task>(`/api/boards/${boardId}/tasks`, {
        title,
      });
      setBoard((prev) => {
        if (!prev) return prev;
        if (prev.tasks.some((t) => t.id === data.id)) return prev;
        return { ...prev, tasks: [...prev.tasks, data] };
      });
      showToast('Tarea creada', 'success');
      return true;
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Error al crear tarea',
        'error'
      );
      return false;
    } finally {
      setCreating(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await axios.delete(`/api/boards/${boardId}/tasks/${taskId}`);
      setBoard((prev) => {
        if (!prev) return prev;
        return { ...prev, tasks: prev.tasks.filter((t) => t.id !== taskId) };
      });
      showToast('Tarea eliminada', 'success');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Error al eliminar tarea',
        'error'
      );
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const { data } = await axios.patch<Task>(
        `/api/boards/${boardId}/tasks/${taskId}`,
        { status }
      );
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === data.id ? data : t)),
        };
      });
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Error al actualizar tarea',
        'error'
      );
    }
  };

  return (
    <BoardContext.Provider
      value={{ board, loading, creating, createTask, deleteTask, updateTaskStatus }}
    >
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = () => {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error('useBoard must be used within BoardProvider');
  return ctx;
};
