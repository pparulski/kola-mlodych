import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Home } from "@/pages/Home";
import { ManageNews } from "@/pages/manage/ManageNews";
import { ManageCategories } from "@/pages/manage/ManageCategories";
import { ManageMenu } from "@/pages/manage/ManageMenu";
import { ManageStaticPages } from "@/pages/manage/ManageStaticPages";
import { StaticPage } from "@/pages/StaticPage";
import { UnionsPage } from "@/pages/UnionsPage";
import { DownloadsPage } from "@/pages/DownloadsPage";
import { EbooksPage } from "@/pages/EbooksPage";
import { ManageDownloads } from "@/pages/manage/ManageDownloads";
import { ManageEbooks } from "@/pages/manage/ManageEbooks";
import { ManageUnions } from "@/pages/manage/ManageUnions";
import CategoryFeed from "@/pages/CategoryFeed";
import {KolaMlodychPage} from "@/pages/KolaMlodychPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/kola-mlodych",
        element: <KolaMlodychPage />,
      },
      {
        path: "/zarzadzanie-aktualnosciami",
        element: <ManageNews />,
      },
      {
        path: "/zarzadzanie-kategoriami",
        element: <ManageCategories />,
      },
      {
        path: "/zarzadzanie-menu",
        element: <ManageMenu />,
      },
      {
        path: "/zarzadzanie-stronami",
        element: <ManageStaticPages />,
      },
      {
        path: "/strona/:slug",
        element: <StaticPage />,
      },
      {
        path: "/unia/:slug",
        element: <UnionsPage />,
      },
      {
        path: "/downloads",
        element: <DownloadsPage />,
      },
      {
        path: "/ebooks",
        element: <EbooksPage />,
      },
      {
        path: "/zarzadzanie-plikami",
        element: <ManageDownloads />,
      },
      {
        path: "/zarzadzanie-publikacjami",
        element: <ManageEbooks />,
      },
      {
        path: "/zarzadzanie-kolami",
        element: <ManageUnions />,
      },
      {
        path: "/category/:slug",
        element: <CategoryFeed />,
      }
    ],
  },
]);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
