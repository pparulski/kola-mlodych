import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { RM } from '@request-metrics/browser-agent';
RM.install({
    token: "x8eq6hq:m8wk2cx"
});
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from 'react-helmet-async';
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
import NewsArticle from "@/pages/NewsArticle";
import Auth from "@/pages/Auth";
import { AuthGuard } from "@/components/AuthGuard";
import { ManageGalleries } from "@/pages/manage/ManageGalleries";
import { lazy, Suspense } from "react";
import EbookDetails from "@/pages/EbookDetails";
// Lazy load the Struktury page (which contains MapBox)
const Struktury = lazy(() => import("./pages/Map"));

// Loading component for the lazy-loaded route
const RouteLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center space-y-2">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      <p className="text-sm text-muted-foreground">Wczytywanie...</p>
    </div>
  </div>
);

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
        element: <AuthGuard />,
        children: [
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
            path: "/manage/downloads",
            element: <ManageDownloads />,
          },
          {
            path: "/manage/ebooks",
            element: <ManageEbooks />,
          },
          {
            path: "/manage/galleries",
            element: <ManageGalleries />,
          },
        ],
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
        path: "/struktury",
        element: (
          <Suspense fallback={<RouteLoadingFallback />}>
            <Struktury />
          </Suspense>
        ),
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
        path: "/ebooks/:slug",
        element: <EbookDetails />,
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
     <HelmetProvider> {/* Add the provider here */}
      <RouterProvider router={router} />
    </HelmetProvider>
  );
}

export default App;
