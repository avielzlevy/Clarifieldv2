"use client";
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Default context value for better intellisense and fallback behavior
const defaultContextValue = {
  rtl: false,
  setRtl: (() => {}) as React.Dispatch<React.SetStateAction<boolean>>,
  rtlLoading: false,
  setRtlLoading: (() => {}) as React.Dispatch<React.SetStateAction<boolean>>,
  reverseWords: (str: string) => str,
};

const RtlContext = createContext(defaultContextValue);

export const useRtl = () => useContext(RtlContext);

export const RtlProvider = ({ children }: { children: React.ReactNode }) => {
  const [rtl, setRtl] = useState(false);
  const [rtlLoading, setRtlLoading] = useState(false);
  useEffect(()=>{
      document.documentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr');
  },[rtl])
  // Memoize reverseWords so it only updates when 'rtl' changes.
  const reverseWords = useCallback(
    (str:string) => (rtl ? str.split(' ').reverse().join(' ') : str),
    [rtl]
  );

  const value = { rtl, setRtl, rtlLoading, setRtlLoading, reverseWords };

  return <RtlContext.Provider value={value}>{children}</RtlContext.Provider>;
};
