import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import Map from "./pages/Map";
import Downloads from "./pages/Downloads";
import Ebooks from "./pages/Ebooks";
import Auth from "./pages/Auth";
import { AuthGuard } from "./components/AuthGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Layout />}>
            {/* Public routes */}
            <Route index element={<Index />} />
            <Route path="map" element={<Map />} />
            <Route path="downloads" element={<Downloads />} />
            <Route path="ebooks" element={<Ebooks />} />
            
            {/* Protected routes for content management */}
            <Route element={<AuthGuard />}>
              <Route path="manage">
                <Route path="news" element={<Index adminMode={true} />} />
                <Route path="downloads" element={<Downloads adminMode={true} />} />
                <Route path="ebooks" element={<Ebooks adminMode={true} />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;