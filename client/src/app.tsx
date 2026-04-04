import { useState } from 'preact/hooks';
import { UserProvider, useUser } from './providers/UserProvider';
import { AxiosProvider } from './providers/AxiosProvider';
import { ToastProvider } from './providers/ToastProvider';
import { BoardProvider } from './providers/BoardProvider';
import { LoginPage } from './pages/LoginPage';
import { BoardsPage } from './pages/BoardsPage';
import { BoardDetailPage } from './pages/BoardDetailPage';

const AppRoutes = () => {
  const { user } = useUser();
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  if (!user) return <LoginPage />;

  if (selectedBoardId) {
    return (
      <BoardProvider boardId={selectedBoardId}>
        <BoardDetailPage onBack={() => setSelectedBoardId(null)} />
      </BoardProvider>
    );
  }

  return <BoardsPage onSelectBoard={(id) => setSelectedBoardId(id)} />;
};

export const App = () => (
  <UserProvider>
    <AxiosProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AxiosProvider>
  </UserProvider>
);
