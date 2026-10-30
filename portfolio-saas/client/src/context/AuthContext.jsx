import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken, setToken } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const result = await api.auth.me();
        if (!cancelled) setUser(result.user);
      } catch {
        setToken(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      setUser,
      async login(email, password) {
        const result = await api.auth.login({ email, password });
        setToken(result.token);
        setUser(result.user);
        return result.user;
      },
      async register(payload) {
        const result = await api.auth.register(payload);
        setToken(result.token);
        setUser(result.user);
        return result.user;
      },
      logout() {
        setToken(null);
        setUser(null);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
