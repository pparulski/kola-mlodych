
interface SidebarOverlayProps {
  isOpen: boolean;
  handleOverlayClick: () => void;
}

export const SidebarOverlay = ({ isOpen, handleOverlayClick }: SidebarOverlayProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden z-40"
      onClick={handleOverlayClick}
      aria-hidden="true"
    />
  );
};
