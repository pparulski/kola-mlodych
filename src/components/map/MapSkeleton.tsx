/**
 * Loading skeleton for the map page
 */
export const MapSkeleton = () => {
  return (
    <div className="container mx-auto px-2 py-3 flex items-center justify-center min-h-[300px]">
      <div className="animate-pulse flex flex-col items-center w-full">
        <div className="h-8 w-48 bg-muted rounded mb-4"></div>
        <div className="h-[350px] w-full bg-muted rounded mb-4"></div>
        <div className="grid gap-2 w-full md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
};
