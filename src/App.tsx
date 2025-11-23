import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CrisisTracker from "./pages/CrisisTracker";
import ProfitPredictor from "./pages/ProfitPredictor";
import TradingSignals from "./pages/TradingSignals";
import PortfolioAnalysis from "./pages/PortfolioAnalysis";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/crisis-tracker" element={<CrisisTracker />} />
          <Route path="/profit-predictor" element={<ProfitPredictor />} />
          <Route path="/trading-signals" element={<TradingSignals />} />
          <Route path="/portfolio-analysis" element={<PortfolioAnalysis />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
