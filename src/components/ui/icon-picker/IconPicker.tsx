
import React, { useState, useEffect } from "react"
import { Command } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, FileIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import dynamicIconImports from 'lucide-react/dynamicIconImports'
import { getSafeIconName } from "@/utils/menu/iconUtils"
import { LucideProps } from "lucide-react"
import dynamic from "@/lib/dynamic"

interface IconPickerProps {
  value: string
  onChange: (icon: string) => void
}

// Dynamic icon component with proper error handling
const DynamicIcon = ({ name, ...props }: LucideProps & { name: string }) => {
  try {
    // Get the dynamic import for this icon name
    const iconImport = dynamicIconImports[name as keyof typeof dynamicIconImports];
    
    if (!iconImport) {
      console.warn(`Icon '${name}' not found, using fallback`);
      return <FileIcon {...props} />;
    }
    
    const LucideIcon = dynamic(() => iconImport, {
      loading: <div className="h-4 w-4 animate-pulse bg-muted rounded" />,
      fallback: <FileIcon {...props} />
    });
    
    return <LucideIcon {...props} />;
  } catch (error) {
    console.error(`Error loading icon '${name}':`, error);
    return <FileIcon {...props} />;
  }
};

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [iconNames, setIconNames] = useState<string[]>([])
  const safeValue = getSafeIconName(value)

  useEffect(() => {
    // Get all icon names and filter them based on search query
    const names = Object.keys(dynamicIconImports)
    setIconNames(
      searchQuery 
        ? names.filter(name => name.toLowerCase().includes(searchQuery.toLowerCase()))
        : names
    )
  }, [searchQuery])

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
            <DynamicIcon name={safeValue} className="h-4 w-4" />
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
            <div className="grid grid-cols-4 gap-2 p-2">
              {iconNames.length > 0 ? (
                iconNames.map((name) => (
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
                    <DynamicIcon name={name} className="h-5 w-5" />
                    <span className="text-xs truncate max-w-full">{name}</span>
                  </Button>
                ))
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
