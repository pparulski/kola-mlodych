
import { Union } from "./types";
import { UnionCard } from "./UnionCard";

interface UnionsListProps {
  unions: Union[];
  selectedUnion: string | null;
  handleCardInteraction: (unionId: string) => void;
}

/**
 * UnionsList component that displays a list of UnionCards
 */
export const UnionsList = ({ 
  unions, 
  selectedUnion, 
  handleCardInteraction 
}: UnionsListProps) => {
  return (
    <div className="grid gap-4 grid-cols-1">
      {unions?.map((union) => (
        <UnionCard
          key={union.id}
          union={union}
          isSelected={selectedUnion === union.id}
          onSelect={() => handleCardInteraction(union.id)}
        />
      ))}
    </div>
  );
};
