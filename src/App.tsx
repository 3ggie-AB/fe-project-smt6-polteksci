import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { PasswordGate } from "@/components/PasswordGate";
import Dashboard from "@/pages/Dashboard";
import Targets from "@/pages/Targets";
import MonitoringTargets from "@/pages/MonitoringTargets";
import PingLog from "@/pages/PingLog";
import CorrelationPage from "@/pages/CorrelationPage";
import LoginPage from "@/pages/LoginPage";
import LandingPage from "@/pages/LandingPage";
import Notifications from "@/pages/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <PasswordGate>
                <AppLayout><Dashboard /></AppLayout>
              </PasswordGate>
            }
          />
          <Route
            path="/devices"
            element={
              <PasswordGate>
                <AppLayout><Targets /></AppLayout>
              </PasswordGate>
            }
          />
          <Route
            path="/targets"
            element={
              <PasswordGate>
                <AppLayout><MonitoringTargets /></AppLayout>
              </PasswordGate>
            }
          />
          <Route
            path="/stream"
            element={
              <PasswordGate>
                <AppLayout><PingLog /></AppLayout>
              </PasswordGate>
            }
          />
          <Route
            path="/notifications"
            element={
              <PasswordGate>
                <AppLayout><Notifications /></AppLayout>
              </PasswordGate>
            }
          />
          <Route
            path="/features"
            element={
              <PasswordGate>
                <AppLayout><CorrelationPage /></AppLayout>
              </PasswordGate>
            }
          />
          <Route path="/monitoring-targets" element={<Navigate to="/targets" replace />} />
          <Route path="/pings" element={<Navigate to="/targets" replace />} />
          <Route path="/correlation" element={<Navigate to="/features" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
