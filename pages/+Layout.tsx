
import React from "react";
import { PageContextProvider } from "vike-react/PageContextProvider";
import { Layout } from "@/components/Layout";
import type { PageContext } from "vike/types";

export default function VikeLayout({ children, pageContext }: { children: React.ReactNode; pageContext: PageContext }) {
  return (
    <PageContextProvider pageContext={pageContext}>
      <Layout>
        {children}
      </Layout>
    </PageContextProvider>
  );
}
