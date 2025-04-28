
import { Link } from "react-router-dom";

export const JoinBanner = () => {
  return (
    <Link 
      to="/dolacz-do-nas"
      className="bg-primary p-2 text-primary-foreground text-center font-bold shadow-lg sticky top-0 z-30 hover:bg-accent transition-colors"
    >
      <span>Dołącz do nas!</span>
    </Link>
  );
};
