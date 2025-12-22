import { useState } from 'react';
import { X, GitCompare, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCompare } from '@/hooks/useCompare';
import CompareModal from './CompareModal';
import { motion, AnimatePresence } from 'framer-motion';

const CompareBar = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const [showModal, setShowModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  if (compareList.length === 0) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border shadow-2xl"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1 h-auto"
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </Button>
                <div className="flex items-center gap-2">
                  <GitCompare className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-foreground">
                    Compare ({compareList.length}/3)
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div className="flex-1 flex items-center gap-2 overflow-x-auto">
                  {compareList.map((opportunity) => (
                    <div
                      key={opportunity.id}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-sm whitespace-nowrap"
                    >
                      <span className="max-w-[150px] truncate">{opportunity.title}</span>
                      <button
                        onClick={() => removeFromCompare(opportunity.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCompare}
                  className="text-muted-foreground"
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowModal(true)}
                  disabled={compareList.length < 2}
                  className="bg-gradient-to-r from-primary to-primary/80"
                >
                  <GitCompare className="mr-1.5 h-4 w-4" />
                  Compare
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <CompareModal open={showModal} onOpenChange={setShowModal} />
    </>
  );
};

export default CompareBar;
