
import { PageLayout } from "./PageLayout";

export function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1">
      <PageLayout>
        {children}
      </PageLayout>
    </main>
  );
}
