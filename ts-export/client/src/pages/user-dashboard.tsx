import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TierGuard from "@/components/tier-guard";
import { 
  Activity, 
  FileText, 
  Keyboard, 
  Settings, 
  Crown,
  Zap,
  BarChart3,
  Clock,
  CheckCircle
} from "lucide-react";

export default function UserDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: keyBindings } = useQuery({
    queryKey: ["/api/key-bindings"],
    retry: false,
  });

  const { data: extensionSettings } = useQuery({
    queryKey: ["/api/extension-settings"],
    retry: false,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-teal"></div>
        </div>
      </Layout>
    );
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const activeKeyBindings = keyBindings?.filter((kb: any) => kb.isActive) || [];

  return (
    <Layout>
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.firstName || 'User'}
            </h2>
            <p className="text-gray-600">{currentDate}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant="secondary" 
              className={`${
                user?.tier === 'platinum' ? 'bg-purple-100 text-purple-800' :
                user?.tier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}
            >
              {user?.tier?.toUpperCase()} PLAN
            </Badge>
            {user?.isActive && (
              <Badge className="bg-green-100 text-green-800">ACTIVE</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Keyboard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Key Bindings</p>
                <p className="text-2xl font-bold text-gray-900">{activeKeyBindings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Extension Status</p>
                <p className="text-2xl font-bold text-gray-900">
                  {extensionSettings?.isEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Documents Today</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and tools for your medical documentation workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-24 flex-col space-y-2"
                onClick={() => window.location.href = '/tools'}
              >
                <Keyboard className="w-8 h-8 text-gray-600" />
                <span>Manage Key Bindings</span>
              </Button>
              
              <TierGuard requiredTier="gold" feature="Advanced Templates">
                <Button variant="outline" className="h-24 flex-col space-y-2">
                  <FileText className="w-8 h-8 text-gray-600" />
                  <span>Template Library</span>
                </Button>
              </TierGuard>
              
              <TierGuard requiredTier="platinum" feature="AI Reports">
                <Button variant="outline" className="h-24 flex-col space-y-2">
                  <Zap className="w-8 h-8 text-gray-600" />
                  <span>AI Report Generation</span>
                </Button>
              </TierGuard>
              
              <Button 
                variant="outline" 
                className="h-24 flex-col space-y-2"
                onClick={() => window.location.href = '/settings'}
              >
                <Settings className="w-8 h-8 text-gray-600" />
                <span>Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Extension connected</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Key bindings updated</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Account created</p>
                  <p className="text-xs text-gray-500">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips and Upgrade */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Quick Tips</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-medical-teal rounded-full mt-2"></div>
                <span>Use Ctrl+P for quick patient documentation templates</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-medical-teal rounded-full mt-2"></div>
                <span>Enable the Chrome extension for seamless workflow integration</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-medical-teal rounded-full mt-2"></div>
                <span>Create custom key bindings for your most-used phrases</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Upgrade Prompt */}
        {user?.tier === 'standard' && (
          <Card className="border-2 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-yellow-600" />
                <span>Upgrade Your Plan</span>
              </CardTitle>
              <CardDescription>
                Unlock advanced features with Gold or Platinum plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm mb-4">
                <li>• Custom key bindings and templates</li>
                <li>• AI-powered report generation</li>
                <li>• Priority support and training</li>
              </ul>
              <Button 
                className="w-full bg-medical-teal hover:bg-medical-teal/90"
                onClick={() => window.location.href = '/membership'}
              >
                View Plans
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
