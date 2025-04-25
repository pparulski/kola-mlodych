
import React, { lazy, Suspense } from 'react';

// The expected type for import functions
export type DynamicImportType = () => Promise<{
  default: React.ComponentType<any>;
}>;

// This wrapper function helps transform Lucide dynamic imports to the expected format
export function wrapDynamicIconImport(importFn: () => Promise<any>): DynamicImportType {
  return () => importFn().then(module => ({ default: module.default }));
}

// Simple dynamic import component for React with improved error handling
export default function dynamic(importFunc: DynamicImportType, options: { 
  loading?: React.ReactNode;
  fallback?: React.ReactNode;
} = {}) {
  const LoadingComponent = options?.loading 
    ? () => <>{options.loading}</> 
    : () => <div className="w-4 h-4 animate-pulse rounded bg-muted" />;

  // Create a safe wrapper component that catches errors from dynamic imports
  const LazyComponentWithErrorBoundary = React.memo(() => {
    const [error, setError] = React.useState<Error | null>(null);
    
    // If we have an error loading the component, show fallback or error state
    if (error) {
      console.warn('Failed to load dynamic component:', error);
      return options?.fallback ? <>{options.fallback}</> : <div className="w-4 h-4 bg-muted rounded" />;
    }

    // Create lazy component with error catching
    const LazyComponent = lazy(() => 
      importFunc().catch(err => {
        console.error('Dynamic import failed:', err);
        setError(err);
        // Return a minimal component to avoid breaking the UI
        return { default: () => options?.fallback || <div className="w-4 h-4 bg-muted rounded" /> };
      })
    );

    return (
      <Suspense fallback={<LoadingComponent />}>
        <LazyComponent />
      </Suspense>
    );
  });

  // Return a component that accepts props and passes them to the inner component
  return function DynamicComponent(props: any) {
    return <LazyComponentWithErrorBoundary {...props} />;
  };
}
