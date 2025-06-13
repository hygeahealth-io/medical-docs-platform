import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";
import Landing from "@/pages/landing";
import AdminDashboard from "@/pages/admin-dashboard";
import UserDashboard from "@/pages/user-dashboard";
import MemberManagement from "@/pages/member-management";
import CreateUser from "@/pages/create-user";
import Analytics from "@/pages/analytics";
import Tools from "@/pages/tools";
import Membership from "@/pages/membership";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import RoleGuard from "@/components/role-guard";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-medical-teal"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={user?.role === 'admin' ? AdminDashboard : UserDashboard} />
          <Route path="/member-management">
            <RoleGuard requiredRole="admin">
              <MemberManagement />
            </RoleGuard>
          </Route>
          <Route path="/create-user">
            <RoleGuard requiredRole="admin">
              <CreateUser />
            </RoleGuard>
          </Route>
          <Route path="/analytics">
            <RoleGuard requiredRole="admin">
              <Analytics />
            </RoleGuard>
          </Route>
          <Route path="/tools" component={Tools} />
          <Route path="/membership" component={Membership} />
          <Route path="/settings" component={Settings} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
