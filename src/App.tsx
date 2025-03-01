
import { Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "./components/Layout";
import { StaticPage } from "./components/StaticPage";
import { AuthGuard } from "./components/AuthGuard";
import { ManageNews } from "./pages/manage/ManageNews";
import { ManageEbooks } from "./pages/manage/ManageEbooks";
import { ManageDownloads } from "./pages/manage/ManageDownloads";
import { ManagePages } from "./pages/manage/ManagePages";
import { ManageCategories } from "./pages/manage/ManageCategories";
import { ManageMenu } from "./pages/manage/ManageMenu";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Fix imports to use default exports
import NewsPage from "./pages/Index";
import NewsArticlePage from "./pages/NewsArticle";
import EbooksPage from "./pages/Ebooks";
import DownloadsPage from "./pages/Downloads";
import UnionsPage from "./pages/Map";

function App() {
  const queryClient = new QueryClient();
  
  return (
    <ThemeProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider
            router={createBrowserRouter([
              {
                path: "/",
                element: <Layout />,
                children: [
                  {
                    path: "/",
                    element: <NewsPage />,
                  },
                  {
                    path: "/artykul/:slug",
                    element: <NewsArticlePage />,
                  },
                  {
                    path: "/ebooks",
                    element: <EbooksPage />,
                  },
                  {
                    path: "/downloads",
                    element: <DownloadsPage />,
                  },
                  {
                    path: "/kola-mlodych",
                    element: <UnionsPage />,
                  },
                  {
                    path: "/:slug",
                    element: <StaticPage />,
                  },
                  
                  {
                    element: <AuthGuard />,
                    children: [
                      {
                        path: "manage/news",
                        element: <ManageNews />
                      },
                      {
                        path: "manage/ebooks",
                        element: <ManageEbooks />
                      },
                      {
                        path: "manage/downloads",
                        element: <ManageDownloads />
                      },
                      {
                        path: "manage/pages",
                        element: <ManagePages />
                      },
                      {
                        path: "manage/categories",
                        element: <ManageCategories />
                      },
                      {
                        path: "manage/menu",
                        element: <ManageMenu />
                      },
                    ]
                  },
                ],
              },
              {
                path: "/auth",
                element: <div>Logowanie</div>,
              },
            ])}
          />
          <Toaster />
        </QueryClientProvider>
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
