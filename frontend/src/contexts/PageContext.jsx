import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Default context value for improved intellisense and fallback behavior
const defaultContextValue = {
  page: 'home',
  setPage: () => {},
  authRedirect: () => {},
};

const PageContext = createContext(defaultContextValue);

export const usePage = () => useContext(PageContext);

export const PageProvider = ({ children }) => {
  const [page, setPage] = useState('home');

  // Memoized redirect function that checks for protected pages
  const authRedirect = useCallback(() => {
    const authedPages = ['settings', 'analytics', 'logs'];
    if (!localStorage.getItem('token') && authedPages.includes(page)) {
      setPage('home');
    }
  }, [page]);

  // Run the redirect check as a side-effect when 'page' changes
  useEffect(() => {
    authRedirect();
  }, [authRedirect]);

  return (
    <PageContext.Provider value={{ page, setPage, authRedirect }}>
      {children}
    </PageContext.Provider>
  );
};
