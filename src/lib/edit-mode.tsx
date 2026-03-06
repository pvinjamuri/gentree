'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { verifyPin, setToken, clearToken, hasToken } from './api-client';

interface EditModeContextType {
  isEditMode: boolean;
  enterEditMode: (slug: string, pin: string) => Promise<boolean>;
  exitEditMode: () => void;
}

const EditModeContext = createContext<EditModeContextType>({
  isEditMode: false,
  enterEditMode: async () => false,
  exitEditMode: () => {},
});

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(() => hasToken());

  const enterEditMode = useCallback(async (slug: string, pin: string) => {
    try {
      const result = await verifyPin(slug, pin);
      setToken(result.token);
      setIsEditMode(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  const exitEditMode = useCallback(() => {
    clearToken();
    setIsEditMode(false);
  }, []);

  return (
    <EditModeContext.Provider value={{ isEditMode, enterEditMode, exitEditMode }}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  return useContext(EditModeContext);
}
