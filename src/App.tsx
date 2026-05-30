import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout";

import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Devices from "@/pages/devices";
import DeviceDetail from "@/pages/device-detail";
import Monitoring from "@/pages/monitoring";
import Users from "@/pages/users";
import Feedback from "@/pages/feedback";
import Profile from "@/pages/profile";
import Roles from "@/pages/roles";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute = ({ component: Component }: { component: any }) => {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  return <Component />;
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      <Route path="/dashboard">
        <AppLayout><ProtectedRoute component={Dashboard} /></AppLayout>
      </Route>
      <Route path="/devices">
        <AppLayout><ProtectedRoute component={Devices} /></AppLayout>
      </Route>
      <Route path="/devices/:id">
        <AppLayout><ProtectedRoute component={DeviceDetail} /></AppLayout>
      </Route>
      <Route path="/monitoring">
        <AppLayout><ProtectedRoute component={Monitoring} /></AppLayout>
      </Route>
      <Route path="/feedback">
        <AppLayout><ProtectedRoute component={Feedback} /></AppLayout>
      </Route>
      <Route path="/users">
        <AppLayout><ProtectedRoute component={Users} /></AppLayout>
      </Route>
      <Route path="/roles">
        <AppLayout><ProtectedRoute component={Roles} /></AppLayout>
      </Route>
      <Route path="/profile">
        <AppLayout><ProtectedRoute component={Profile} /></AppLayout>
      </Route>

      <Route>
        <AppLayout><NotFound /></AppLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AuthProvider>
              <Router />
            </AuthProvider>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
