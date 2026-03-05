'use client';

import { SearchFilters } from '@/lib/search';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';

interface FilterPanelProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
}

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  function update(partial: Partial<SearchFilters>) {
    onChange({ ...filters, ...partial });
  }

  function clearFilters() {
    onChange({ query: filters.query });
  }

  const hasFilters =
    filters.gender ||
    filters.minAge !== undefined ||
    filters.maxAge !== undefined ||
    filters.location ||
    filters.upcomingBirthdays ||
    filters.isAlive !== undefined ||
    filters.generation !== undefined;

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-white">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Filters</h3>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-3 w-3 mr-1" /> Clear
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <Label className="text-xs">Gender</Label>
          <Select
            value={filters.gender || 'all'}
            onValueChange={(v) => update({ gender: v === 'all' ? undefined : v })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Min Age</Label>
          <Input
            type="number"
            className="h-8 text-xs"
            value={filters.minAge ?? ''}
            onChange={(e) =>
              update({ minAge: e.target.value ? parseInt(e.target.value) : undefined })
            }
            placeholder="0"
          />
        </div>

        <div>
          <Label className="text-xs">Max Age</Label>
          <Input
            type="number"
            className="h-8 text-xs"
            value={filters.maxAge ?? ''}
            onChange={(e) =>
              update({ maxAge: e.target.value ? parseInt(e.target.value) : undefined })
            }
            placeholder="100"
          />
        </div>

        <div>
          <Label className="text-xs">Location</Label>
          <Input
            className="h-8 text-xs"
            value={filters.location || ''}
            onChange={(e) => update({ location: e.target.value || undefined })}
            placeholder="City..."
          />
        </div>

        <div>
          <Label className="text-xs">Generation</Label>
          <Select
            value={filters.generation?.toString() || 'all'}
            onValueChange={(v) =>
              update({ generation: v === 'all' ? undefined : parseInt(v) })
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="0">Great-Grandparents</SelectItem>
              <SelectItem value="1">Grandparents</SelectItem>
              <SelectItem value="2">Parents</SelectItem>
              <SelectItem value="3">Children</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Status</Label>
          <Select
            value={filters.isAlive === undefined ? 'all' : filters.isAlive ? 'alive' : 'deceased'}
            onValueChange={(v) =>
              update({ isAlive: v === 'all' ? undefined : v === 'alive' })
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="alive">Living</SelectItem>
              <SelectItem value="deceased">Deceased</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            variant={filters.upcomingBirthdays ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-xs w-full"
            onClick={() => update({ upcomingBirthdays: !filters.upcomingBirthdays })}
          >
            🎂 Upcoming Birthdays
          </Button>
        </div>
      </div>
    </div>
  );
}
