
import React, { lazy, Suspense } from 'react';

type DynamicImportType = () => Promise<{
  default: React.ComponentType<any>;
}>;

// Simple dynamic import component for React
export default function dynamic(importFunc: DynamicImportType, options: { 
  loading?: React.ReactNode 
} = {}) {
  const LoadingComponent = options?.loading 
    ? () => <>{options.loading}</> 
    : () => <div className="w-4 h-4 animate-pulse rounded bg-muted" />;

  const LazyComponent = lazy(importFunc);

  return (props: any) => (
    <Suspense fallback={<LoadingComponent />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}
