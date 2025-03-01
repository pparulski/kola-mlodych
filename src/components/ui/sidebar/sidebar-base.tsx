
import * as React from "react"
import { cn } from "@/lib/utils"
import { useSidebar } from "./sidebar-context"
import { Button } from "@/components/ui/button"
import { PanelLeft } from "lucide-react"

export const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  const { openMobile } = useSidebar()

  return (
    <div
      ref={ref}
      data-sidebar="root"
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-[var(--sidebar-width)] border-r bg-background transition-transform duration-300 ease-in-out data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0 md:relative md:translate-x-0",
        openMobile ? "translate-x-0" : "-translate-x-full",
        className
      )}
      {...props}
    />
  )
})
Sidebar.displayName = "Sidebar"

export const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, children, ...props }, ref) => {
  const { toggleSidebar, open } = useSidebar()

  return (
    <Button
      ref={ref}
      variant="ghost"
      className={cn(
        "p-0 md:hidden group",
        // Edge indicator and styling
        "absolute left-0 bg-gradient-to-r from-primary/5 to-transparent",
        "rounded-r-md rounded-l-none border-l-0 h-10 w-8",
        "hover:bg-primary/10 active:bg-primary/20",
        className
      )}
      onClick={toggleSidebar}
      aria-label="Open sidebar menu"
      {...props}
    >
      {children || (
        <PanelLeft className={cn(
          "h-5 w-5 text-primary",
          open ? "opacity-80" : "opacity-100"
        )} />
      )}
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

export const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-1", className)}
    {...props}
  />
))
SidebarGroupContent.displayName = "SidebarGroupContent"

export const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
))
SidebarGroupLabel.displayName = "SidebarGroupLabel"

export const SidebarMenuSub = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("pl-6 space-y-1", className)}
    {...props}
  />
))
SidebarMenuSub.displayName = "SidebarMenuSub"

export const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("relative", className)}
    {...props}
  />
))
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

export const SidebarMenuSubButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => (
  <Button
    ref={ref}
    variant="ghost"
    className={cn(
      "w-full justify-start px-2 py-1.5 text-sm font-normal hover:bg-accent hover:text-accent-foreground",
      className
    )}
    {...props}
  />
))
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"
