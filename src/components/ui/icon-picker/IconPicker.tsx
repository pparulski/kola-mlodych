
import React, { useState, useEffect } from "react"
import { Command } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { VALID_ICONS, getIconComponent } from "@/utils/menu/iconUtils"

interface IconPickerProps {
  value: string
  onChange: (icon: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [iconNames, setIconNames] = useState<string[]>([])

  useEffect(() => {
    // Get all icon names and filter them based on search query
    const names = Object.keys(VALID_ICONS)
    setIconNames(
      searchQuery 
        ? names.filter(name => name.toLowerCase().includes(searchQuery.toLowerCase()))
        : names
    )
  }, [searchQuery])

  // Get the current icon component safely
  const IconComponent = getIconComponent(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            <IconComponent className="h-4 w-4" />
            <span>{value || "Select icon..."}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <div className="flex items-center border-b px-3" onMouseDown={(e) => e.stopPropagation()}>
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              placeholder="Search icons..."
              className="flex h-10 w-full rounded-md bg-transparent py-3 outline-none placeholder:text-muted-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[300px]">
            <div className="grid grid-cols-4 gap-2 p-2"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              {iconNames.length > 0 ? (
                iconNames.map((name) => {
                  const Icon = VALID_ICONS[name];
                  
                  return (
                    <Button
                      key={name}
                      variant="ghost"
                      className={cn(
                        "flex h-12 w-full flex-col items-center justify-center gap-1",
                        value === name && "bg-muted"
                      )}
                      onClick={() => {
                        onChange(name);
                        setOpen(false);
                      }}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs truncate max-w-full">{name}</span>
                    </Button>
                  );
                })
              ) : (
                <div className="col-span-4 text-center py-6 text-muted-foreground">
                  No icons found
                </div>
              )}
            </div>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
