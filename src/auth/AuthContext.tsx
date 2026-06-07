import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { fetchMe, restoreSession } from './authApi';
import {
  clearSessionToken,
  getSessionToken,
  setSessionToken,
} from './tokenStore';
import type { UserState } from './types';

export type AuthStatus = 'idle' | 'loading' | 'authed' | 'error';

interface AuthContextValue {
  status: AuthStatus;
  user: UserState | null;
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
  // Start in 'loading' if we have a stored token to restore, so the UI doesn't
  // flash the login screen before the session check resolves.
  const [status, setStatus] = useState<AuthStatus>(() =>
    getSessionToken() ? 'loading' : 'idle',
  );
  const [user, setUser] = useState<UserState | null>(null);
  const [error, setError] = useState<string | null>(null);

  // On mount, restore an existing session from the stored token. This is what
  // keeps the user logged in across refreshes — no Google popup needed.
  useEffect(() => {
    const token = getSessionToken();
    if (!token) return;

    let cancelled = false;
    (async () => {
      try {
        const { user: u, sessionToken } = await restoreSession(token);
        if (cancelled) return;
        setSessionToken(sessionToken); // sliding expiry: keep the latest token
        setUser(u);
        setStatus('authed');
      } catch {
        if (cancelled) return;
        // Token expired or invalid — fall back to the login screen.
        clearSessionToken();
        setStatus('idle');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const loginWithGoogle = useCallback(async (token: string) => {
    setStatus('loading');
    setError(null);
    try {
      const { user: u, sessionToken } = await fetchMe(token);
      setSessionToken(sessionToken);
      setUser(u);
      setStatus('authed');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Auth failed');
      setStatus('error');
    }
  }, []);

  const logout = useCallback(() => {
    clearSessionToken();
    setUser(null);
    setStatus('idle');
    setError(null);
  }, []);

  const value: AuthContextValue = {
    status,
    user,
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
