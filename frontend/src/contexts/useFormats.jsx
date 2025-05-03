import React, { createContext, useContext, useState, useEffect,useCallback } from 'react';
import axios from 'axios';

const FormatsContext = createContext();

export const FormatsProvider = ({ children }) => {
  const [formats, setFormats] = useState({});

  const fetchFormats = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/formats`);
      setFormats(response.data);
    } catch (error) {
      console.error('Error fetching formats:', error);
    }
  }, []);

  useEffect(() => {
    fetchFormats();
  }, [fetchFormats]);

  return (
    <FormatsContext.Provider value={{ formats, fetchFormats, setFormats }}>
      {children}
    </FormatsContext.Provider>
  );
};

export const useFormats = () => {
  return useContext(FormatsContext);
};
