import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { fetchMe } from './authApi';
import type { UserState } from './types';

export type AuthStatus = 'idle' | 'loading' | 'authed' | 'error';

interface AuthContextValue {
  status: AuthStatus;
  user: UserState | null;
  idToken: string | null;
  error: string | null;
  /** True once the backend confirms the user has paid. */
  paid: boolean;
  /** Exchange a Google ID Token for backend user state. */
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
  setUser: (u: UserState) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<AuthStatus>('idle');
  const [user, setUser] = useState<UserState | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loginWithGoogle = useCallback(async (token: string) => {
    setStatus('loading');
    setError(null);
    try {
      const u = await fetchMe(token);
      setIdToken(token);
      setUser(u);
      setStatus('authed');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Auth failed');
      setStatus('error');
    }
  }, []);

  const logout = useCallback(() => {
    setIdToken(null);
    setUser(null);
    setStatus('idle');
    setError(null);
  }, []);

  const value: AuthContextValue = {
    status,
    user,
    idToken,
    error,
    paid: user?.isPaid ?? false,
    loginWithGoogle,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
