"use client";
import React, { createContext, useContext, useState, useEffect,useCallback } from 'react';
import axios from 'axios';

// Default context value for better intellisense and fallback behavior
const defaultContextValue = {
  entities: {},
  fetchEntities: (() => {}) as () => Promise<void>,
  setEntities: (() => {}) as React.Dispatch<React.SetStateAction<object>>,
};

const EntitiesContext = createContext(defaultContextValue);

export const EntitiesProvider = ({ children }: { children: React.ReactNode }) => {
  const [entities, setEntities] = useState({});

  const fetchEntities = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/entities`);
      setEntities(response.data);
    } catch (error) {
      console.error('Error fetching entities:', error);
    }
  }, []);

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  return (
    <EntitiesContext.Provider value={{ entities, fetchEntities, setEntities }}>
      {children}
    </EntitiesContext.Provider>
  );
};

export const useEntities = () => {
  return useContext(EntitiesContext);
};
