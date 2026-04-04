import { createContext } from 'preact';
import { useContext, useMemo } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import axios, { AxiosInstance } from 'axios';
import { useUser } from './UserProvider';

const AxiosContext = createContext<AxiosInstance>(axios);

export const AxiosProvider = ({ children }: { children: ComponentChildren }) => {
  const { token } = useUser();

  const instance = useMemo(() => {
    const inst = axios.create();

    inst.interceptors.request.use((config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    inst.interceptors.response.use(
      (response) => response,
      (error) => {
        const message =
          error.response?.data?.message || error.message || 'Error desconocido';
        return Promise.reject(new Error(message));
      }
    );

    return inst;
  }, [token]);

  return (
    <AxiosContext.Provider value={instance}>{children}</AxiosContext.Provider>
  );
};

export const useAxios = () => useContext(AxiosContext);
