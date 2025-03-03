
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { Layout } from "@/components/Layout";
import Index from "@/pages/Index";
import { ManageNews } from "@/pages/manage/ManageNews";
import ManageCategories from "@/pages/manage/ManageCategories";
import { ManageMenu } from "@/pages/manage/ManageMenu";
import { ManagePages } from "@/pages/manage/ManagePages";
import { StaticPage } from "@/components/StaticPage";
import CategoryFeed from "@/pages/CategoryFeed";
import Downloads from "@/pages/Downloads";
import Ebooks from "@/pages/Ebooks";
import { ManageDownloads } from "@/pages/manage/ManageDownloads";
import { ManageEbooks } from "@/pages/manage/ManageEbooks";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Index />,
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
        element: <ManagePages />,
      },
      {
        path: "/strona/:slug",
        element: <StaticPage />,
      },
      {
        path: "/downloads",
        element: <Downloads />,
      },
      {
        path: "/ebooks",
        element: <Ebooks />,
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
