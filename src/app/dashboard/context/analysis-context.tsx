'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type AnalysisType = 'sybil' | 'sensor';

interface AnalysisContextType {
  activeFile: File | null;
  activeType: AnalysisType | null;
  setAnalysis: (file: File | null, type: AnalysisType | null) => void;
  clearAnalysis: () => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [activeType, setActiveType] = useState<AnalysisType | null>(null);

  const setAnalysis = (file: File | null, type: AnalysisType | null) => {
    setActiveFile(file);
    setActiveType(type);
  };

  const clearAnalysis = () => {
    setActiveFile(null);
    setActiveType(null);
  };

  return (
    <AnalysisContext.Provider value={{ activeFile, activeType, setAnalysis, clearAnalysis }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
}
