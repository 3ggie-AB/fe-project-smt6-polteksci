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
import LoginPage from "@/pages/LoginPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public: survey as landing page */}
          <Route path="/" element={<SurveyPage />} />
          {/* Login page */}
          <Route path="/login" element={<LoginPage />} />
          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <PasswordGate>
                <AppLayout><Dashboard /></AppLayout>
              </PasswordGate>
            }
          />
          <Route
            path="/targets"
            element={
              <PasswordGate>
                <AppLayout><Targets /></AppLayout>
              </PasswordGate>
            }
          />
          <Route
            path="/pings"
            element={
              <PasswordGate>
                <AppLayout><PingLog /></AppLayout>
              </PasswordGate>
            }
          />
          <Route
            path="/correlation"
            element={
              <PasswordGate>
                <AppLayout><CorrelationPage /></AppLayout>
              </PasswordGate>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
