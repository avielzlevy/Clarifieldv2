"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';


// Default context value for better intellisense and fallback behavior
const defaultContextValue = {
  definitions: {},
  fetchDefinitions: (() => {}) as () => Promise<void>,
  setDefinitions: (() => {}) as React.Dispatch<React.SetStateAction<object>>,
};

const DefinitionsContext = createContext(defaultContextValue);

export const DefinitionsProvider = ({ children }: { children: React.ReactNode }) => {
  const [definitions, setDefinitions] = useState({});
  const fetchDefinitions = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/definitions`);
      setDefinitions(response.data);
    } catch (error) {
      console.error('Error fetching definitions:', error);
    }
  }, []);


  useEffect(() => {
    fetchDefinitions();

  }, [fetchDefinitions]);

  return (
    <DefinitionsContext.Provider value={{ definitions, fetchDefinitions, setDefinitions }}>
      {children}
    </DefinitionsContext.Provider>
  );
};

export const useDefinitions = () => {
  return useContext(DefinitionsContext);
};
