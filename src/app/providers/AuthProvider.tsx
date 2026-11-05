"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  apiFetch,
  AUTH_UNAUTHORIZED_EVENT,
  clearAccessToken,
  getAccessToken,
  getApiRoot,
  type AuthUser,
} from "../lib/auth";

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  refreshUser: () => Promise<AuthUser | null>;
  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestVersion = useRef(0);

  const updateUser = useCallback((nextUser: AuthUser | null) => {
    requestVersion.current += 1;
    setUser(nextUser);
    setError(null);
    setIsLoading(false);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentRequest = ++requestVersion.current;
    setIsLoading(true);
    setError(null);
    try {
      if (!getAccessToken()) {
        if (currentRequest === requestVersion.current) {
          setUser(null);
        }
        return null;
      }

      const response = await apiFetch(`${getApiRoot()}/auth/me`, {
        cache: "no-store",
      });
      if (response.status === 401) {
        if (currentRequest === requestVersion.current) {
          setUser(null);
        }
        return null;
      }
      if (!response.ok) {
        throw new Error("Impossible de vérifier la session.");
      }
      const currentUser = (await response.json()) as AuthUser;
      if (currentRequest === requestVersion.current) {
        setUser(currentUser);
      }
      return currentUser;
    } catch (cause) {
      if (currentRequest === requestVersion.current) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Impossible de vérifier la session."
        );
      }
      throw cause;
    } finally {
      if (currentRequest === requestVersion.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const response = await fetch(`${getApiRoot()}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Le cookie de session précédent n’a pas pu être effacé.");
      }
    } catch (cause) {
      console.error("Impossible d’effacer l’ancien cookie de session.", cause);
    } finally {
      clearAccessToken();
      requestVersion.current += 1;
      setUser(null);
      setError(null);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser().catch(() => undefined);
  }, [refreshUser]);

  useEffect(() => {
    if (getAccessToken()) return;

    void (async () => {
      try {
        const response = await fetch(`${getApiRoot()}/auth/logout`, {
          method: "POST",
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Impossible d’effacer l’ancien cookie de session.");
        }
      } catch (cause) {
        console.error("Impossible d’effacer l’ancien cookie de session.", cause);
      }
    })();
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      requestVersion.current += 1;
      setUser(null);
      setError(null);
      setIsLoading(false);
    };
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () =>
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, error, refreshUser, setUser: updateUser, logout }),
    [user, isLoading, error, refreshUser, updateUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans AuthProvider.");
  }
  return context;
}
