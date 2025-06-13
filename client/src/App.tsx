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
import AdvancedAnalytics from "@/pages/advanced-analytics";
import SystemAnnouncements from "@/pages/system-announcements";
import ReportBuilder from "@/pages/report-builder";
import ComplianceAudit from "@/pages/compliance-audit";
import AdminTools from "@/pages/admin-tools";
import AdminSettings from "@/pages/admin-settings";
import Tools from "@/pages/tools";
import ToolsGold from "@/pages/tools-gold";
import ToolsPlatinum from "@/pages/tools-platinum";
import UserQualityCheck from "@/pages/user-quality-check";
import VitalsGenerator from "@/pages/vitals-generator";
import CustomKeys from "@/pages/custom-keys";
import QualityCheckPlatinum from "@/pages/quality-check-platinum";
import ReportGeneratorPlatinum from "@/pages/report-generator-platinum";
import QualityCheckResults from "@/pages/quality-check-results";
import ReportGenerator from "@/pages/report-generator";
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
          <Route path="/advanced-analytics">
            <RoleGuard requiredRole="admin">
              <AdvancedAnalytics />
            </RoleGuard>
          </Route>
          <Route path="/system-announcements">
            <RoleGuard requiredRole="admin">
              <SystemAnnouncements />
            </RoleGuard>
          </Route>

          <Route path="/compliance-audit">
            <RoleGuard requiredRole="admin">
              <ComplianceAudit />
            </RoleGuard>
          </Route>
          <Route path="/admin-tools">
            <RoleGuard requiredRole="admin">
              <AdminTools />
            </RoleGuard>
          </Route>
          <Route path="/tools" component={Tools} />
          <Route path="/tools-gold" component={ToolsGold} />
          <Route path="/tools-platinum" component={ToolsPlatinum} />
          <Route path="/user-quality-check" component={QualityCheckPlatinum} />
          <Route path="/quality-check-results" component={QualityCheckResults} />
          <Route path="/report-builder" component={ReportGenerator} />
          <Route path="/report-generator" component={ReportGenerator} />
          <Route path="/vitals-generator" component={VitalsGenerator} />
          <Route path="/custom-keys" component={CustomKeys} />
          <Route path="/membership" component={Membership} />
          <Route path="/settings">
            {user?.role === 'admin' ? <AdminSettings /> : <Settings />}
          </Route>
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
