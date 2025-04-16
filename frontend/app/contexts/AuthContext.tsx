"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { usePage } from "./PageContext";
// import { enqueueSnackbar } from 'notistack';

// Default context value for better intellisense and fallback behavior
const defaultAuthContextValue = {
  auth: false,
  login: (() => {}) as (token: string, username: string) => void,
  logout: (() => {}) as ({ mode }?: { mode?: string }) => void,
};

const AuthContext = createContext(defaultAuthContextValue);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { authRedirect } = usePage();
  const [auth, setAuth] = useState(false);

  const login = useCallback((token: string, username: string) => {
    localStorage.setItem("token", token);
    if (username) {
      localStorage.setItem("username", username);
    }
    setAuth(true);
  }, []);

  const logout = useCallback(
    ({ mode = "logout" } = {}) => {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      setAuth(false);
      if (mode === "bad_token") {
        // enqueueSnackbar('Session expired.\n Page will reload', { variant: 'info' });
        // setTimeout(() => window.location.reload(), 3000);
      } else if (mode === "logout") {
        // enqueueSnackbar('Logged out', { variant: 'info' });
      }

      authRedirect();
    },
    [authRedirect]
  );

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
