'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MaliciousCountContextType {
  maliciousCount: number;
  setMaliciousCount: React.Dispatch<React.SetStateAction<number>>;
}

const MaliciousCountContext = createContext<MaliciousCountContextType | undefined>(undefined);

export function MaliciousCountProvider({ children }: { children: ReactNode }) {
  const [maliciousCount, setMaliciousCount] = useState(0);

  return (
    <MaliciousCountContext.Provider value={{ maliciousCount, setMaliciousCount }}>
      {children}
    </MaliciousCountContext.Provider>
  );
}

export function useMaliciousCount() {
  const context = useContext(MaliciousCountContext);
  if (context === undefined) {
    throw new Error('useMaliciousCount must be used within a MaliciousCountProvider');
  }
  return context;
}
