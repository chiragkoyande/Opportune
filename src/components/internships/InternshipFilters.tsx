// ============================================================
// Opportune V4 — InternshipFilters Component
// Dedicated filter controls for Internships
// Stipend, duration, PPO, start date, remote, location, skills
// ============================================================

import React from 'react';
import { InternshipFilters, InternshipSortOption } from '@/types/internship';
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
import { RotateCcw, Filter, GraduationCap, Award } from 'lucide-react';

interface InternshipFiltersProps {
  filters: InternshipFilters;
  onFilterChange: (newFilters: Partial<InternshipFilters>) => void;
  onReset: () => void;
  totalCount?: number;
}

const DURATIONS = [
  { value: 'all', label: 'Any Duration' },
  { value: 2, label: '2 Months' },
  { value: 3, label: '3 Months (Summer)' },
  { value: 6, label: '6 Months' },
];

const POPULAR_INTERN_SKILLS = ['React', 'Python', 'C++', 'Java', 'Node.js', 'Machine Learning', 'Data Structures'];

export const InternshipFiltersSidebar: React.FC<InternshipFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  totalCount,
}) => {
  const toggleSkill = (skill: string) => {
    const current = filters.skills || [];
    const updated = current.includes(skill)
      ? current.filter((s) => s !== skill)
      : [...current, skill];
    onFilterChange({ skills: updated });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-internship" />
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

      {/* PPO and Remote Checkboxes */}
      <div className="space-y-2.5">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Opportunities
        </Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="filter-ppo-only"
              checked={filters.ppoOnly}
              onCheckedChange={(checked) => onFilterChange({ ppoOnly: Boolean(checked) })}
            />
            <label htmlFor="filter-ppo-only" className="text-xs font-medium cursor-pointer flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-internship" />
              Pre-Placement Offer (PPO) Only
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="filter-intern-remote"
              checked={filters.remoteOnly}
              onCheckedChange={(checked) => onFilterChange({ remoteOnly: Boolean(checked) })}
            />
            <label htmlFor="filter-intern-remote" className="text-xs font-medium cursor-pointer">
              Remote Internships Only
            </label>
          </div>
        </div>
      </div>

      {/* Duration */}
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Duration
        </Label>
        <Select
          value={String(filters.durationMonths || 'all')}
          onValueChange={(val) =>
            onFilterChange({ durationMonths: val === 'all' ? 'all' : Number(val) })
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Any duration" />
          </SelectTrigger>
          <SelectContent>
            {DURATIONS.map((dur) => (
              <SelectItem key={String(dur.value)} value={String(dur.value)}>
                {dur.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Start Date */}
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Start Date
        </Label>
        <Select
          value={filters.startDate || 'all'}
          onValueChange={(val) => onFilterChange({ startDate: val as InternshipFilters['startDate'] })}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Flexible" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any start date</SelectItem>
            <SelectItem value="immediate">Immediate joining</SelectItem>
            <SelectItem value="next-month">Next month</SelectItem>
            <SelectItem value="flexible">Flexible</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Location
        </Label>
        <Input
          type="text"
          placeholder="e.g. Bengaluru, Pune, Delhi"
          value={filters.location || ''}
          onChange={(e) => onFilterChange({ location: e.target.value })}
          className="h-8 text-xs"
        />
      </div>

      {/* Skills */}
      <div className="space-y-2.5">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Skills & Concepts
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_INTERN_SKILLS.map((skill) => {
            const isSelected = (filters.skills || []).includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-internship text-white shadow-sm'
                    : 'bg-secondary/60 text-secondary-foreground hover:bg-secondary border border-border/50'
                }`}
              >
                {skill}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
