/**
 * @fileoverview Contexto de autenticación. Provee el estado del usuario,
 * token JWT, e información de rol (admin) a toda la aplicación.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { User } from '../types';

/** Tipo del contexto de autenticación. */
interface AuthContextType {
  /** Datos del usuario autenticado o null. */
  user: User | null;
  /** Token JWT almacenado. */
  token: string | null;
  /** Indica si hay una sesión activa. */
  isAuthenticated: boolean;
  /** Indica si el usuario tiene rol de administrador (rol === 1). */
  isAdmin: boolean;
  /** Guarda el token y los datos del usuario en sesión y localStorage. */
  login: (token: string, user: User) => void;
  /** Cierra la sesión limpiando token y datos del usuario. */
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

/** Proveedor del contexto de autenticación. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isAdmin: user?.rol === 1,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** Hook para acceder al contexto de autenticación. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
