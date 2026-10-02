// ============================================================
// Opportune V4 — JobFilters Component
// Sidebar and mobile drawer filter controls for Jobs explorer
// Syncs seamlessly with URL search parameters
// ============================================================

import React from 'react';
import { JobFilters, JobEmploymentType, JobWorkplaceType, JobSeniority, JobSortOption } from '@/types/job';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RotateCcw, Filter, Briefcase } from 'lucide-react';

interface JobFiltersProps {
  filters: JobFilters;
  onFilterChange: (newFilters: Partial<JobFilters>) => void;
  onReset: () => void;
  totalCount?: number;
}

const EMPLOYMENT_TYPES: { id: JobEmploymentType; label: string }[] = [
  { id: 'full-time', label: 'Full-Time' },
  { id: 'part-time', label: 'Part-Time' },
  { id: 'contract', label: 'Contract' },
  { id: 'freelance', label: 'Freelance' },
];

const WORKPLACE_TYPES: { id: JobWorkplaceType; label: string }[] = [
  { id: 'remote', label: 'Remote' },
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'onsite', label: 'Onsite' },
];

const SENIORITY_LEVELS: { id: JobSeniority; label: string }[] = [
  { id: 'entry', label: 'Entry Level (0–2 yrs)' },
  { id: 'mid', label: 'Mid Level (3–5 yrs)' },
  { id: 'senior', label: 'Senior Level (5+ yrs)' },
  { id: 'lead', label: 'Lead / Principal' },
];

const POPULAR_SKILLS = ['React', 'TypeScript', 'Node.js', 'Python', 'Go', 'GraphQL', 'AWS', 'Docker'];

export const JobFiltersSidebar: React.FC<JobFiltersProps> = ({
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
          <Filter className="h-4 w-4 text-job" />
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

      {/* Workplace Type (Remote / Hybrid / Onsite) */}
      <div className="space-y-2.5">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Workplace Mode
        </Label>
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="filter-remote-only"
              checked={filters.remoteOnly}
              onCheckedChange={(checked) => onFilterChange({ remoteOnly: Boolean(checked) })}
            />
            <label htmlFor="filter-remote-only" className="text-xs font-medium cursor-pointer">
              Remote Only
            </label>
          </div>
          {WORKPLACE_TYPES.map((type) => (
            <div key={type.id} className="flex items-center space-x-2">
              <Checkbox
                id={`workplace-${type.id}`}
                checked={filters.workplaceType === type.id}
                onCheckedChange={(checked) =>
                  onFilterChange({ workplaceType: checked ? type.id : 'all' })
                }
              />
              <label htmlFor={`workplace-${type.id}`} className="text-xs text-muted-foreground cursor-pointer">
                {type.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Employment Type */}
      <div className="space-y-2.5">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Employment Type
        </Label>
        <div className="space-y-1.5">
          {EMPLOYMENT_TYPES.map((emp) => (
            <div key={emp.id} className="flex items-center space-x-2">
              <Checkbox
                id={`emp-${emp.id}`}
                checked={filters.employmentType === emp.id}
                onCheckedChange={(checked) =>
                  onFilterChange({ employmentType: checked ? emp.id : 'all' })
                }
              />
              <label htmlFor={`emp-${emp.id}`} className="text-xs text-muted-foreground cursor-pointer">
                {emp.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Seniority / Experience */}
      <div className="space-y-2.5">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Experience Level
        </Label>
        <div className="space-y-1.5">
          {SENIORITY_LEVELS.map((sen) => (
            <div key={sen.id} className="flex items-center space-x-2">
              <Checkbox
                id={`sen-${sen.id}`}
                checked={filters.seniority === sen.id}
                onCheckedChange={(checked) =>
                  onFilterChange({ seniority: checked ? sen.id : 'all' })
                }
              />
              <label htmlFor={`sen-${sen.id}`} className="text-xs text-muted-foreground cursor-pointer">
                {sen.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Location Search */}
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Location
        </Label>
        <Input
          type="text"
          placeholder="e.g. Bengaluru, Mumbai, Remote"
          value={filters.location || ''}
          onChange={(e) => onFilterChange({ location: e.target.value })}
          className="h-8 text-xs"
        />
      </div>

      {/* Popular Skills */}
      <div className="space-y-2.5">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Skills & Tech
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_SKILLS.map((skill) => {
            const isSelected = (filters.skills || []).includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-job text-white shadow-sm'
                    : 'bg-secondary/60 text-secondary-foreground hover:bg-secondary border border-border/50'
                }`}
              >
                {skill}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Posted */}
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Date Posted
        </Label>
        <Select
          value={filters.postedWithin || 'all'}
          onValueChange={(val) => onFilterChange({ postedWithin: val as '24h' | '7d' | '30d' | 'all' })}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Any time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any time</SelectItem>
            <SelectItem value="24h">Past 24 hours</SelectItem>
            <SelectItem value="7d">Past 7 days</SelectItem>
            <SelectItem value="30d">Past 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
