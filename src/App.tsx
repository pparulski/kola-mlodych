import { Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "./components/Layout";
import { NewsPage } from "./pages/NewsPage";
import { NewsArticlePage } from "./pages/NewsArticlePage";
import { EbooksPage } from "./pages/EbooksPage";
import { DownloadsPage } from "./pages/DownloadsPage";
import { UnionsPage } from "./pages/UnionsPage";
import { StaticPage } from "./components/StaticPage";
import { AuthGuard } from "./components/AuthGuard";
import { ManageNews } from "./pages/manage/ManageNews";
import { ManageEbooks } from "./pages/manage/ManageEbooks";
import { ManageDownloads } from "./pages/manage/ManageDownloads";
import { ManagePages } from "./pages/manage/ManagePages";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Add these imports for the new pages
import { ManageCategories } from "./pages/manage/ManageCategories";
import { ManageMenu } from "./pages/manage/ManageMenu";

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
                  
                  // Add these routes
                  {
                    path: "manage/news",
                    element: (
                      <AuthGuard>
                        <ManageNews />
                      </AuthGuard>
                    ),
                  },
                  {
                    path: "manage/ebooks",
                    element: (
                      <AuthGuard>
                        <ManageEbooks />
                      </AuthGuard>
                    ),
                  },
                  {
                    path: "manage/downloads",
                    element: (
                      <AuthGuard>
                        <ManageDownloads />
                      </AuthGuard>
                    ),
                  },
                  {
                    path: "manage/pages",
                    element: (
                      <AuthGuard>
                        <ManagePages />
                      </AuthGuard>
                    ),
                  },
                  {
                    path: "manage/categories",
                    element: (
                      <AuthGuard>
                        <ManageCategories />
                      </AuthGuard>
                    ),
                  },
                  {
                    path: "manage/menu",
                    element: (
                      <AuthGuard>
                        <ManageMenu />
                      </AuthGuard>
                    ),
                  },
                ],
              },
              {
                path: "/logowanie",
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
