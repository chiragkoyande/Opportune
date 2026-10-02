// ============================================================
// Opportune V4 — HackathonFilters Component
// Dedicated filter controls for Hackathons explorer
// Mode (Online/Offline/Hybrid), Status, Themes, Team Size, Deadline
// ============================================================

import React from 'react';
import { HackathonFilters, HackathonMode, HackathonStatus, HackathonSortOption } from '@/types/hackathon';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RotateCcw, Filter, Rocket, Globe } from 'lucide-react';

interface HackathonFiltersProps {
  filters: HackathonFilters;
  onFilterChange: (newFilters: Partial<HackathonFilters>) => void;
  onReset: () => void;
  totalCount?: number;
}

const MODES: { id: HackathonMode; label: string }[] = [
  { id: 'online', label: 'Online / Virtual' },
  { id: 'offline', label: 'In-Person / Offline' },
  { id: 'hybrid', label: 'Hybrid' },
];

const THEMES = ['AI / Generative AI', 'Web3 / Blockchain', 'FinTech', 'Open Source', 'Healthcare', 'Cybersecurity'];

export const HackathonFiltersSidebar: React.FC<HackathonFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  totalCount,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-hackathon" />
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

      {/* Mode (Online / Offline / Hybrid) */}
      <div className="space-y-2.5">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Participation Mode
        </Label>
        <div className="space-y-1.5">
          {MODES.map((mode) => (
            <div key={mode.id} className="flex items-center space-x-2">
              <Checkbox
                id={`mode-${mode.id}`}
                checked={filters.mode === mode.id}
                onCheckedChange={(checked) =>
                  onFilterChange({ mode: checked ? mode.id : 'all' })
                }
              />
              <label htmlFor={`mode-${mode.id}`} className="text-xs text-muted-foreground cursor-pointer">
                {mode.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Registration Status */}
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Registration Status
        </Label>
        <Select
          value={filters.status || 'all'}
          onValueChange={(val) => onFilterChange({ status: val as HackathonFilters['status'] })}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="open">Open for registration</SelectItem>
            <SelectItem value="closing-soon">Closing soon (&lt; 3 days)</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Themes */}
      <div className="space-y-2.5">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Themes & Domains
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {THEMES.map((theme) => {
            const isSelected = filters.theme === theme;
            return (
              <button
                key={theme}
                type="button"
                onClick={() => onFilterChange({ theme: isSelected ? 'all' : theme })}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-hackathon text-white shadow-sm'
                    : 'bg-secondary/60 text-secondary-foreground hover:bg-secondary border border-border/50'
                }`}
              >
                {theme}
              </button>
            );
          })}
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          City / Country
        </Label>
        <Input
          type="text"
          placeholder="e.g. Bengaluru, Online"
          value={filters.location || ''}
          onChange={(e) => onFilterChange({ location: e.target.value })}
          className="h-8 text-xs"
        />
      </div>

      {/* Team Size */}
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Team Size
        </Label>
        <Select
          value={String(filters.teamSize || 'all')}
          onValueChange={(val) => onFilterChange({ teamSize: val === 'all' ? 'all' : Number(val) })}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Any team size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any team size</SelectItem>
            <SelectItem value="1">Solo builder</SelectItem>
            <SelectItem value="2">2 members</SelectItem>
            <SelectItem value="4">3–4 members</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
