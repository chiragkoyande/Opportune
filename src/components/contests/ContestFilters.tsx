// ============================================================
// Opportune V4 — ContestFilters Component
// Filter controls for competitive programming contests
// Platform, Status (Upcoming, Live, Completed), Difficulty, Timeframe
// ============================================================

import React from 'react';
import { ContestFilters, ContestPlatform, ContestStatus, ContestSortOption } from '@/types/contest';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RotateCcw, Filter, Trophy, Zap } from 'lucide-react';

interface ContestFiltersProps {
  filters: ContestFilters;
  onFilterChange: (newFilters: Partial<ContestFilters>) => void;
  onReset: () => void;
  totalCount?: number;
}

const PLATFORMS: ContestPlatform[] = [
  'CodeChef',
  'Codeforces',
  'LeetCode',
  'AtCoder',
  'GeeksforGeeks',
  'HackerRank',
];

const STATUSES: { id: ContestStatus; label: string }[] = [
  { id: 'UPCOMING', label: 'Upcoming Contests' },
  { id: 'LIVE', label: 'Live Now' },
  { id: 'COMPLETED', label: 'Completed' },
];

export const ContestFiltersSidebar: React.FC<ContestFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  totalCount,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-contest" />
          <h3 className="font-semibold text-sm">Filters</h3>
          {totalCount !== undefined && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
              {totalCount}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </Button>
      </div>

      {/* Status: Upcoming / Live / Completed */}
      <div className="space-y-2.5">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Contest Status
        </Label>
        <div className="space-y-1.5">
          {STATUSES.map((status) => (
            <div key={status.id} className="flex items-center space-x-2">
              <Checkbox
                id={`status-${status.id}`}
                checked={filters.status === status.id}
                onCheckedChange={(checked) =>
                  onFilterChange({ status: checked ? status.id : 'all' })
                }
              />
              <label htmlFor={`status-${status.id}`} className="text-xs text-muted-foreground cursor-pointer">
                {status.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Platform */}
      <div className="space-y-2.5">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Platform
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {PLATFORMS.map((platform) => {
            const isSelected = filters.platform === platform;
            return (
              <button
                key={platform}
                type="button"
                onClick={() => onFilterChange({ platform: isSelected ? 'all' : platform })}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-contest text-white shadow-sm'
                    : 'bg-secondary/60 text-secondary-foreground hover:bg-secondary border border-border/50'
                }`}
              >
                {platform}
              </button>
            );
          })}
        </div>
      </div>

      {/* Difficulty */}
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Target Difficulty
        </Label>
        <Select
          value={filters.difficulty || 'all'}
          onValueChange={(val) => onFilterChange({ difficulty: val as ContestFilters['difficulty'] })}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="All levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            <SelectItem value="beginner">Beginner (Div 4 / ABC)</SelectItem>
            <SelectItem value="intermediate">Intermediate (Div 2 & 3)</SelectItem>
            <SelectItem value="advanced">Advanced (Div 1)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
