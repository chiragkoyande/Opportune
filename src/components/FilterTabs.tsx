import { OpportunityType } from '@/types/opportunity';
import { Rocket, Briefcase, Trophy, LayoutGrid } from 'lucide-react';

interface FilterTabsProps {
  activeFilter: OpportunityType | 'all';
  onFilterChange: (filter: OpportunityType | 'all') => void;
}

const FilterTabs = ({ activeFilter, onFilterChange }: FilterTabsProps) => {
  const tabs = [
    { 
      id: 'all' as const, 
      label: 'All', 
      icon: LayoutGrid, 
      activeGradient: 'from-primary to-primary/80',
      activeShadow: 'shadow-glow-sm',
    },
    { 
      id: 'hackathon' as const, 
      label: 'Hackathons', 
      icon: Rocket, 
      activeGradient: 'from-hackathon to-hackathon/80',
      activeShadow: 'shadow-[0_0_20px_-5px_hsl(var(--hackathon)/0.5)]',
    },
    { 
      id: 'internship' as const, 
      label: 'Internships', 
      icon: Briefcase, 
      activeGradient: 'from-internship to-internship/80',
      activeShadow: 'shadow-[0_0_20px_-5px_hsl(var(--internship)/0.5)]',
    },
    { 
      id: 'contest' as const, 
      label: 'Contests', 
      icon: Trophy, 
      activeGradient: 'from-contest to-contest/80',
      activeShadow: 'shadow-[0_0_20px_-5px_hsl(var(--contest)/0.5)]',
    },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeFilter === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onFilterChange(tab.id)}
            className={`
              relative flex items-center gap-2 rounded-full px-5 py-2.5 font-medium text-sm
              transition-all duration-300
              ${isActive 
                ? `bg-gradient-to-r ${tab.activeGradient} text-primary-foreground ${tab.activeShadow}` 
                : 'bg-secondary/50 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-border'
              }
            `}
          >
            <Icon className={`h-4 w-4 ${isActive ? '' : 'opacity-70'}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default FilterTabs;