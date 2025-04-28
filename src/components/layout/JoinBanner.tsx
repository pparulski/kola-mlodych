
import { Link } from "react-router-dom";

export const JoinBanner = () => {
  return (
    <Link 
      to="/dolacz-do-nas"
      className="bg-primary p-2 text-primary-foreground text-center font-bold shadow-lg fixed top-0 left-0 right-0 w-full z-50 hover:bg-accent transition-colors"
    >
      <span>Dołącz do nas!</span>
    </Link>
  );
};
