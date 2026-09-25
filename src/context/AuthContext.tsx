/**
 * AuthContext.tsx — SamriddhiAI Authentication Provider
 * =====================================================
 * Manages the full JWT session lifecycle:
 *   1. Stores JWT token in localStorage
 *   2. Provides `login()` and `logout()` methods to all child components
 *   3. Exposes an `authFetch()` helper that automatically attaches the
 *      Authorization: Bearer header to every outgoing API request
 *   4. Handles HTTP 401 (token expired) and HTTP 429 (rate limited) globally
 */
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://samriddhi-api.onrender.com';

// ========================= Types =========================

interface AuthState {
  token: string | null;
  mobile: string | null;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (token: string, mobile: string) => void;
  logout: () => void;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

// ========================= Context =========================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ========================= Provider =========================

interface AuthProviderProps {
  children: ReactNode;
  onRateLimited?: () => void;   // Callback when HTTP 429 is received
  onUnauthorized?: () => void;  // Callback when HTTP 401 is received
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  onRateLimited,
  onUnauthorized,
}) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Rehydrate session from localStorage on mount
    const savedToken = localStorage.getItem('samriddhi_token');
    const savedMobile = localStorage.getItem('samriddhi_mobile');
    return {
      token: savedToken,
      mobile: savedMobile,
      isAuthenticated: !!savedToken,
    };
  });

  /**
   * Save JWT token and mobile number after successful OTP verification.
   */
  const login = useCallback((token: string, mobile: string) => {
    localStorage.setItem('samriddhi_token', token);
    localStorage.setItem('samriddhi_mobile', mobile);
    setAuthState({ token, mobile, isAuthenticated: true });
  }, []);

  /**
   * Clear the session entirely (logout or token expiry).
   */
  const logout = useCallback(() => {
    localStorage.removeItem('samriddhi_token');
    localStorage.removeItem('samriddhi_mobile');
    setAuthState({ token: null, mobile: null, isAuthenticated: false });
  }, []);

  /**
   * Authenticated fetch wrapper.
   * Automatically:
   *   - Prepends the API base URL if the path starts with "/"
   *   - Attaches the Bearer token to every request
   *   - Intercepts 401 (expired token) → triggers logout
   *   - Intercepts 429 (rate limited) → triggers notification callback
   */
  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;

      const headers = new Headers(options.headers || {});
      if (authState.token) {
        headers.set('Authorization', `Bearer ${authState.token}`);
      }
      headers.set('Content-Type', 'application/json');

      const response = await fetch(fullUrl, { ...options, headers });

      // Handle 401: Token expired or invalid
      if (response.status === 401) {
        logout();
        onUnauthorized?.();
      }

      // Handle 429: Rate limited
      if (response.status === 429) {
        onRateLimited?.();
      }

      return response;
    },
    [authState.token, logout, onRateLimited, onUnauthorized]
  );

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    authFetch,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};


// ========================= Hook =========================

/**
 * useAuth() — Access the authentication context from any component.
 * Usage: const { isAuthenticated, login, logout, authFetch } = useAuth();
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth() must be used within an <AuthProvider>');
  }
  return context;
};

export default AuthContext;
