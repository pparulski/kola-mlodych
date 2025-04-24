
import React from "react";
import { Button } from "@/components/ui/button";
import { useMenuItems } from "@/hooks/useMenuItems";
import { MenuList } from "./MenuList";
import { LoadingIndicator } from "@/components/home/LoadingIndicator";

export function SidebarMenuManager() {
  const {
    menuItems,
    isLoadingPages,
    updateOrderMutation,
    handleDragEnd,
    handleSaveOrder,
    moveItem
  } = useMenuItems();

  if (isLoadingPages) {
    return <LoadingIndicator type="skeleton" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Zarządzaj menu bocznym</h1>
        <Button 
          onClick={handleSaveOrder} 
          disabled={updateOrderMutation.isPending}
        >
          {updateOrderMutation.isPending ? 'Zapisywanie...' : 'Zapisz kolejność'}
        </Button>
      </div>

      <MenuList 
        menuItems={menuItems} 
        handleDragEnd={handleDragEnd} 
        moveItem={moveItem}
      />
    </div>
  );
}
