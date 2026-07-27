'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore, User } from '@/store/useAuthStore';

export interface SessionInfo {
  id: string;
  email: string;
  role: string;
}

export function useSession() {
  const { user, token, isAuthenticated, logout, login } = useAuthStore();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [session, setSession] = useState<SessionInfo | null>(null);

  const fetchSession = useCallback(async () => {
    if (!token) {
      setSession(null);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const freshUser: User = json.data.user;
          const freshSession: SessionInfo = json.data.session;
          login(freshUser, token);
          setSession(freshSession);
        } else {
          logout();
          setSession(null);
        }
      } else {
        if (res.status === 401 || res.status === 403) {
          logout();
        }
        setSession(null);
      }
    } catch (err) {
      console.error('Failed to fetch session:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token, login, logout]);

  useEffect(() => {
    let isCancelled = false;

    if (token && !session) {
      const runFetch = async () => {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (isCancelled) return;

          if (res.ok) {
            const json = await res.json();
            if (isCancelled) return;
            if (json.success && json.data) {
              login(json.data.user, token);
              setSession(json.data.session);
            } else {
              logout();
              setSession(null);
            }
          } else {
            if (res.status === 401 || res.status === 403) {
              logout();
            }
            setSession(null);
          }
        } catch (err) {
          if (!isCancelled) {
            console.error('Failed to fetch session:', err);
          }
        }
      };

      runFetch();
    }

    return () => {
      isCancelled = true;
    };
  }, [token, session, login, logout]);

  return {
    user,
    token,
    session,
    isAuthenticated,
    isLoading,
    refreshSession: fetchSession,
    logout,
  };
}
