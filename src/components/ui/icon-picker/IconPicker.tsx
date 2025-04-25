
import React from "react"
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
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  // Use icons from our validated list instead of all Lucide icons
  const iconNames = Object.keys(VALID_ICONS).filter(
    (iconName) => iconName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get the current icon component safely
  const IconComponent = React.useMemo(() => {
    return getIconComponent(value);
  }, [value]);

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
              {iconNames.map((name) => {
                const Icon = VALID_ICONS[name];
                
                if (!Icon) return null; // Skip if icon doesn't exist
                
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
                  </Button>
                )
              })}
            </div>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
