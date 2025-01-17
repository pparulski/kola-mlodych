import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import { StaticPage } from "./components/StaticPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { ThemeProvider } from "./components/ui/theme-provider";
import Map from "./pages/Map";
import Downloads from "./pages/Downloads";
import Ebooks from "./pages/Ebooks";
import NewsArticle from "./pages/NewsArticle";
import { AuthGuard } from "./components/AuthGuard";
import { ManageNews } from "./pages/manage/ManageNews";
import { ManageEbooks } from "./pages/manage/ManageEbooks";
import { ManageDownloads } from "./pages/manage/ManageDownloads";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Index />} />
              <Route path="/static/:slug" element={<StaticPage />} />
              <Route path="/kola-mlodych" element={<Map />} />
              <Route path="/downloads" element={<Downloads />} />
              <Route path="/publikacje" element={<Ebooks />} />
              <Route path="/news/:id" element={<NewsArticle />} />
              
              {/* Admin routes */}
              <Route element={<AuthGuard />}>
                <Route path="/manage/news" element={<ManageNews />} />
                <Route path="/manage/publikacje" element={<ManageEbooks />} />
                <Route path="/manage/downloads" element={<ManageDownloads />} />
              </Route>
            </Route>
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;