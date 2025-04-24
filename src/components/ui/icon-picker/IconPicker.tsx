
import React from 'react';
import * as Icons from 'lucide-react';
import { Command } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from 'lucide-react';

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const iconNames = Object.keys(Icons).filter(key => 
    key !== 'createLucideIcon' && 
    key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const CurrentIcon = value ? (Icons as any)[value] : Icons.FileIcon;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            <CurrentIcon className="h-4 w-4" />
            <span>{value || "Select icon..."}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              placeholder="Search icons..."
              className="flex h-10 w-full rounded-md bg-transparent py-3 outline-none placeholder:text-muted-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[300px]">
            <div className="grid grid-cols-4 gap-2 p-2">
              {iconNames.map((name) => {
                const Icon = (Icons as any)[name];
                return (
                  <Button
                    key={name}
                    variant="ghost"
                    className="flex h-12 w-full flex-col items-center justify-center gap-1"
                    onClick={() => {
                      onChange(name);
                      setOpen(false);
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
