"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

// Default context value for improved intellisense and fallback behavior
const defaultContextValue = {
  affected: null as AffectedItems | null,
  fetchAffectedItems: (async () => {}) as (params: {
    name: string;
    type: string;
  }) => Promise<void>,
  clearAffected: (() => {}) as () => void,
};

interface AffectedItems {
  definitions?: string[];
  entities?: string[];
}

const AffectedItemsContext = createContext(defaultContextValue);

export const AffectedItemsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [affected, setAffected] = useState<AffectedItems | null>(null);
  const { logout } = useAuth();
  const token = localStorage.getItem("token");

  const fetchAffectedItems = useCallback(
    async ({ name, type }: { name: string; type: string }) => {
      const affectedItems: AffectedItems = { definitions: [], entities: [] };

      switch (type) {
        case "format":
          try {
            const { data } = await axios.get(
              `${
                process.env.REACT_APP_API_URL
              }/api/affected?format=${encodeURIComponent(name)}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            affectedItems.definitions = data.definitions;
          } catch (error) {
            if (axios.isAxiosError(error)) {
              if (error.response?.status === 401) {
                logout({ mode: "bad_token" });
                return;
              } else if (error.response?.status === 404) {
                console.info(`No affected definitions for format ${name}`);
              } else {
                console.error(
                  `Error fetching affected definitions for format ${name}:`,
                  error
                );
              }
            }
          }
          const entities = [];
          if (
            affectedItems.definitions &&
            Array.isArray(affectedItems.definitions)
          ) {
            for (const definition of affectedItems.definitions) {
              try {
                const { data } = await axios.get(
                  `${process.env.REACT_APP_API_URL}/api/affected?definition=${definition}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                entities.push(...data.entities);
              } catch (error) {
                if (axios.isAxiosError(error)) {
                  // Handle specific error codes
                  if (error.response?.status === 401) {
                    logout({ mode: "bad_token" });
                    return;
                  } else if (error.response?.status === 404) {
                    console.info(
                      `No affected entities for definition ${definition}`
                    );
                  } else {
                    console.error(
                      `Error fetching affected entities for definition ${definition}:`,
                      error
                    );
                  }
                }
              }
            }
            if (entities.length > 0) {
              affectedItems.entities = Array.from(new Set(entities));
            }
          }
          if (
            (Array.isArray(affectedItems.definitions) &&
              affectedItems.definitions.length > 0) ||
            (Array.isArray(affectedItems.entities) &&
              affectedItems.entities.length > 0)
          ) {
            setAffected(affectedItems);
          } else {
            setAffected(null);
          }

          break;
        case "definition":
          try {
            const response = await axios.get(
              `${process.env.REACT_APP_API_URL}/api/affected?entity=${name}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setAffected(response.data);
          } catch (error) {
            if (axios.isAxiosError(error)) {
              if (error.response?.status === 401) {
                logout({ mode: "bad_token" });
                return;
              }
              setAffected(null);
            }
            break;
          }

        case "entity":
          try {
            const response = await axios.get(
              `${process.env.REACT_APP_API_URL}/api/affected?entity=${name}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setAffected(response.data);
          } catch (error) {
            if (axios.isAxiosError(error)) {
              if (error.response?.status === 401) {
                logout({ mode: "bad_token" });
                return;
              }
              setAffected(null);
            }
            break;
          }
      }
    },
    [token, logout]
  );

  const clearAffected = useCallback(() => {
    setAffected(null);
  }, []);

  const value = useMemo(
    () => ({ affected, fetchAffectedItems, clearAffected }),
    [affected, fetchAffectedItems, clearAffected]
  );
  return (
    <AffectedItemsContext.Provider value={value}>
      {children}
    </AffectedItemsContext.Provider>
  );
};

export const useAffectedItems = () => useContext(AffectedItemsContext);
