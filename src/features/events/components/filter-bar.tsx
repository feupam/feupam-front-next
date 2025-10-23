"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Check, ChevronsUpDown, CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { format } from 'date-fns';
import { CATEGORIES, LOCATIONS } from '@/lib/constants';

export default function FilterBar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [category, setCategory] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [openCategory, setOpenCategory] = useState(false);
  const [openLocation, setOpenLocation] = useState(false);
  const [openDate, setOpenDate] = useState(false);
  
  // Initialize filters from URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const locationParam = searchParams.get('location');
    const dateParam = searchParams.get('date');
    
    if (categoryParam) setCategory(categoryParam);
    if (locationParam) setLocation(locationParam);
    if (dateParam) setDate(new Date(dateParam));
  }, [searchParams]);
  
  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (category) params.set('category', category);
    if (location) params.set('location', location);
    if (date) params.set('date', format(date, 'yyyy-MM-dd'));
    
    router.push(`${pathname}?${params.toString()}`);
  };
  
  const clearFilters = () => {
    setCategory(null);
    setLocation(null);
    setDate(undefined);
    router.push(pathname);
  };
  
  const hasActiveFilters = category || location || date;
  
  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-8 space-y-4 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-4">
      <div className="flex-1 min-w-[200px]">
        <Popover open={openCategory} onOpenChange={setOpenCategory}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openCategory}
              className="w-full justify-between"
            >
              {category ? category : "Select category"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search category..." />
              <CommandEmpty>No category found.</CommandEmpty>
              <CommandGroup>
                {CATEGORIES.map((cat) => (
                  <CommandItem
                    key={cat}
                    value={cat}
                    onSelect={() => {
                      setCategory(cat === category ? null : cat);
                      setOpenCategory(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        category === cat ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {cat}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex-1 min-w-[200px]">
        <Popover open={openLocation} onOpenChange={setOpenLocation}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openLocation}
              className="w-full justify-between"
            >
              {location ? location : "Select location"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search location..." />
              <CommandEmpty>No location found.</CommandEmpty>
              <CommandGroup>
                {LOCATIONS.map((loc) => (
                  <CommandItem
                    key={loc}
                    value={loc}
                    onSelect={() => {
                      setLocation(loc === location ? null : loc);
                      setOpenLocation(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        location === loc ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {loc}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex-1 min-w-[200px]">
        <Popover open={openDate} onOpenChange={setOpenDate}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between"
            >
              {date ? format(date, "PPP") : "Pick a date"}
              <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => {
                setDate(date);
                setOpenDate(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex gap-2">
        <Button onClick={applyFilters} className="flex-1 sm:flex-none">
          Apply Filters
        </Button>
        
        {hasActiveFilters && (
          <Button onClick={clearFilters} variant="outline" className="flex-1 sm:flex-none">
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}