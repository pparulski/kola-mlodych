
import React from "react";
import { PageContextProvider } from "vike-react/PageContextProvider";
import { Layout } from "@/components/Layout";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PageContext } from "vike/types";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export default function VikeLayout({ children, pageContext }: { children: React.ReactNode; pageContext: PageContext }) {
  return (
    <PageContextProvider pageContext={pageContext}>
      <QueryClientProvider client={queryClient}>
        <Layout>
          {children}
        </Layout>
      </QueryClientProvider>
    </PageContextProvider>
  );
}
