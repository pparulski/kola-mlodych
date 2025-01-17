import { UnionsMap } from "@/components/UnionsMap";

const Map = () => {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Koła Młodych</h1>
      <div className="h-[600px] w-full">
        <UnionsMap />
      </div>
    </div>
  );
};

export default Map;