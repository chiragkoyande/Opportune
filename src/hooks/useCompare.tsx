import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Opportunity } from '@/types/opportunity';

interface CompareContextType {
  compareList: Opportunity[];
  addToCompare: (opportunity: Opportunity) => void;
  removeFromCompare: (opportunityId: string) => void;
  isInCompare: (opportunityId: string) => boolean;
  clearCompare: () => void;
  canAddMore: boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const MAX_COMPARE_ITEMS = 3;

export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const [compareList, setCompareList] = useState<Opportunity[]>([]);

  const addToCompare = useCallback((opportunity: Opportunity) => {
    setCompareList(prev => {
      if (prev.length >= MAX_COMPARE_ITEMS) return prev;
      if (prev.some(o => o.id === opportunity.id)) return prev;
      return [...prev, opportunity];
    });
  }, []);

  const removeFromCompare = useCallback((opportunityId: string) => {
    setCompareList(prev => prev.filter(o => o.id !== opportunityId));
  }, []);

  const isInCompare = useCallback((opportunityId: string) => {
    return compareList.some(o => o.id === opportunityId);
  }, [compareList]);

  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  const canAddMore = compareList.length < MAX_COMPARE_ITEMS;

  return (
    <CompareContext.Provider value={{ 
      compareList, 
      addToCompare, 
      removeFromCompare, 
      isInCompare, 
      clearCompare,
      canAddMore 
    }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
