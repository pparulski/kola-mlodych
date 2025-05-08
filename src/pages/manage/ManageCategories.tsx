
import { CategoryManagement } from "@/components/manage/categories/CategoryManagement";
import { SEO } from "@/components/seo/SEO";

export function ManageCategories() {
  return (
    <div className="page-container section-spacing mt-4">
      <SEO
        title="Zarządzanie kategoriami"
        description="Panel administracyjny do zarządzania kategoriami"
      />
      <CategoryManagement />
    </div>
  );
}

export default ManageCategories;
