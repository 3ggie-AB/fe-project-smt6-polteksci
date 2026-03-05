import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { PasswordGate } from "@/components/PasswordGate";
import Dashboard from "@/pages/Dashboard";
import Targets from "@/pages/Targets";
import PingLog from "@/pages/PingLog";
import SurveyPage from "@/pages/SurveyPage";
import CorrelationPage from "@/pages/CorrelationPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PasswordGate>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/targets" element={<Targets />} />
            <Route path="/pings" element={<PingLog />} />
            <Route path="/survey" element={<SurveyPage />} />
            <Route path="/correlation" element={<CorrelationPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
