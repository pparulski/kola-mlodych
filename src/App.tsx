
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
import ErrorPage from "@/pages/ErrorPage";
import Map from "@/pages/Map";
import NewsArticle from "@/pages/NewsArticle";
import Auth from "@/pages/Auth";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Index />,
      },
      {
        path: "/manage/news",
        element: <ManageNews />,
      },
      {
        path: "/manage/categories",
        element: <ManageCategories />,
      },
      {
        path: "/manage/menu",
        element: <ManageMenu />,
      },
      {
        path: "/manage/pages",
        element: <ManagePages />,
      },
      {
        path: "/news/:slug",
        element: <NewsArticle />,
      },
      {
        path: "/category/:slug",
        element: <CategoryFeed />,
      },
      {
        path: "/kola-mlodych",
        element: <Map />,
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
        path: "/manage/downloads",
        element: <ManageDownloads />,
      },
      {
        path: "/manage/ebooks",
        element: <ManageEbooks />,
      },
      {
        path: "/auth",
        element: <Auth />,
      },
      {
        path: "/:slug",
        element: <StaticPage />,
      },
    ],
  },
]);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
