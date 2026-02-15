
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import PaymentSuccess from "./pages/PaymentSuccess";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/results" element={<Index />} />
          <Route path="/shop" element={<Navigate to="/?section=shop" replace />} />
          <Route path="/gallery" element={<Navigate to="/?section=gallery" replace />} />
          <Route path="/documents" element={<Navigate to="/?section=documents" replace />} />
          <Route path="/reviews" element={<Navigate to="/?section=reviews" replace />} />
          <Route path="/about" element={<Navigate to="/?section=about" replace />} />
          <Route path="/contests" element={<Navigate to="/?section=contests" replace />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;