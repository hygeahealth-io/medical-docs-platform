import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Shield, 
  UserPlus,
  BarChart3,
  CheckCircle,
  Settings
} from "lucide-react";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  const { data: securityIncidents } = useQuery({
    queryKey: ["/api/security-incidents?resolved=false&limit=5"],
    retry: false,
  });

  if (isLoading || statsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-teal"></div>
        </div>
      </Layout>
    );
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount}`;
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Layout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Admin</h2>
        <p className="text-gray-600">{currentDate}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Daily Active Users</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.dailyActiveUsers || 0}
                </p>
              </div>
              <div className="flex items-center text-green-600 text-sm font-medium">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12.5%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Registrations</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.newRegistrations || 0}
                </p>
              </div>
              <div className="flex items-center text-green-600 text-sm font-medium">
                <TrendingUp className="w-4 h-4 mr-1" />
                +8.2%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(stats?.revenue || 0)}
                </p>
              </div>
              <div className="flex items-center text-red-600 text-sm font-medium">
                <TrendingDown className="w-4 h-4 mr-1" />
                -2.4%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security Incidents</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.securityIncidents || 0}
                </p>
              </div>
              <div className="flex items-center text-green-600 text-sm font-medium">
                <TrendingUp className="w-4 h-4 mr-1" />
                +5.3%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Member Activity Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Member Activity Overview</CardTitle>
              <div className="flex space-x-2">
                <Button size="sm" className="bg-medical-teal text-white">7d</Button>
                <Button size="sm" variant="outline">30d</Button>
                <Button size="sm" variant="outline">90d</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Analytics chart will be displayed here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Alerts</CardTitle>
              <Button variant="link" size="sm" className="text-medical-teal">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {securityIncidents && securityIncidents.length > 0 ? (
                securityIncidents.slice(0, 3).map((incident: any, index: number) => (
                  <div key={incident.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      incident.severity === 'high' || incident.severity === 'critical' 
                        ? 'bg-red-500' 
                        : incident.severity === 'medium' 
                        ? 'bg-yellow-500' 
                        : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{incident.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(incident.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">System update completed</p>
                      <p className="text-xs text-gray-500">25 min ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">New member registration spike</p>
                      <p className="text-xs text-gray-500">1 hour ago</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Button 
          className="bg-medical-teal text-white p-6 h-auto flex-col space-y-2"
          onClick={() => window.location.href = '/create-user'}
        >
          <UserPlus className="w-8 h-8" />
          <span className="font-medium">Create User</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="p-6 h-auto flex-col space-y-2"
          onClick={() => window.location.href = '/analytics'}
        >
          <BarChart3 className="w-8 h-8 text-gray-600" />
          <span className="font-medium text-gray-700">View Reports</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="p-6 h-auto flex-col space-y-2"
        >
          <CheckCircle className="w-8 h-8 text-gray-600" />
          <span className="font-medium text-gray-700">System Status</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="p-6 h-auto flex-col space-y-2"
          onClick={() => window.location.href = '/settings'}
        >
          <Settings className="w-8 h-8 text-gray-600" />
          <span className="font-medium text-gray-700">Security Settings</span>
        </Button>
      </div>
    </Layout>
  );
}
