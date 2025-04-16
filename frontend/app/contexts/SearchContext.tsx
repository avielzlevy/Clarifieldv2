//SearchContext.jsx
"use client";
import React, { createContext, useContext, useState, useMemo } from 'react';

// Default context value for improved intellisense and fallback behavior
const defaultSearchContextValue = {
  search: false,
  setSearch: (() => {}) as React.Dispatch<React.SetStateAction<boolean>>,
  refreshSearchables: 0,
  setRefreshSearchables: (() => {}) as React.Dispatch<React.SetStateAction<number>>,
};

const SearchContext = createContext(defaultSearchContextValue);

export interface SearchableItem {
    type: "Entity" | "Definition" | "Format"
    name: string
  }

export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [search, setSearch] = useState(false);
  const [refreshSearchables, setRefreshSearchables] = useState(0);
  const value = useMemo(() => ({ search, setSearch,refreshSearchables,setRefreshSearchables }), [search,refreshSearchables]);

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};
