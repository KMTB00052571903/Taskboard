import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './providers/UserProvider';
import { AxiosProvider } from './providers/AxiosProvider';
import { ToastProvider } from './providers/ToastProvider';
import { BoardProvider } from './providers/BoardProvider';
import { LoginPage } from './pages/LoginPage';
import { BoardsPage } from './pages/BoardsPage';
import { BoardDetailPage } from './pages/BoardDetailPage';

const AppRoutes = () => {
  const { user } = useUser();

  if (!user) return <LoginPage />;

  return (
    <Routes>
      <Route path="/" element={<BoardsPage />} />
      <Route
        path="/boards/:boardId"
        element={
          <BoardProvider>
            <BoardDetailPage />
          </BoardProvider>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App = () => (
  <BrowserRouter>
    <UserProvider>
      <AxiosProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AxiosProvider>
    </UserProvider>
  </BrowserRouter>
);
