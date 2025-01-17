import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import Map from "./pages/Map";
import NewsArticle from "./pages/NewsArticle";
import Downloads from "./pages/Downloads";
import Ebooks from "./pages/Ebooks";
import Auth from "./pages/Auth";
import { AuthGuard } from "./components/AuthGuard";
import { ManageNews } from "./pages/manage/ManageNews";
import { ManageDownloads } from "./pages/manage/ManageDownloads";
import { ManageEbooks } from "./pages/manage/ManageEbooks";
import { NewsDetails } from "./pages/NewsDetails";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Index />} />
          <Route path="/kola-mlodych" element={<Map />} />
          <Route path="/news/:id" element={<NewsArticle />} />
          <Route path="/static/:slug" element={<NewsDetails />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/ebooks" element={<Ebooks />} />
          <Route path="/auth" element={<Auth />} />
          <Route element={<AuthGuard />}>
            <Route path="/manage/news" element={<ManageNews />} />
            <Route path="/manage/downloads" element={<ManageDownloads />} />
            <Route path="/manage/ebooks" element={<ManageEbooks />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;