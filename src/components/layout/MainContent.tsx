
import { useLocation } from "react-router-dom";
import { PageLayout } from "./PageLayout";

export function MainContent() {
  const location = useLocation();
  const isManagementPage = location.pathname.includes('/manage/');
  const isCategoryPage = location.pathname.startsWith('/category/');

  return (
    <main className="flex-1">
      <PageLayout />
    </main>
  );
}
