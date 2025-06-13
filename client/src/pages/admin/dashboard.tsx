import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Users, UserPlus, DollarSign, Shield, Plus, BarChart3, CheckCircle, Lock } from "lucide-react";

interface DashboardStats {
  dailyActiveUsers: number;
  newRegistrations: number;
  securityIncidents: number;
  totalUsers: number;
}

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

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard/stats"],
    retry: false,
  });

  const { data: recentAlerts } = useQuery({
    queryKey: ["/api/admin/activity-logs"],
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Admin</h2>
          <p className="text-gray-600">{new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Daily Active Users</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {statsLoading ? "..." : stats?.dailyActiveUsers.toLocaleString() || "0"}
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
                    {statsLoading ? "..." : stats?.newRegistrations.toLocaleString() || "0"}
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
                  <p className="text-3xl font-bold text-gray-900">$45.2K</p>
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
                    {statsLoading ? "..." : stats?.securityIncidents.toLocaleString() || "0"}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Member Activity Chart */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Member Activity Overview</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="bg-medical-teal text-white border-medical-teal">
                      7d
                    </Button>
                    <Button variant="outline" size="sm">30d</Button>
                    <Button variant="outline" size="sm">90d</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Chart visualization will be implemented</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Alerts</CardTitle>
                <Button variant="link" className="text-medical-teal hover:text-medical-teal-dark p-0">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">Unusual login attempt detected</p>
                    <p className="text-xs text-gray-500">5 min ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">System update required</p>
                    <p className="text-xs text-gray-500">25 min ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">New member registration spike</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button className="bg-medical-teal text-white rounded-lg p-4 h-auto flex flex-col items-center space-y-2 hover:bg-medical-teal-dark">
            <UserPlus className="w-8 h-8" />
            <span className="font-medium">Create User</span>
          </Button>
          <Button variant="outline" className="rounded-lg p-4 h-auto flex flex-col items-center space-y-2 hover:bg-gray-50">
            <BarChart3 className="w-8 h-8 text-gray-600" />
            <span className="font-medium text-gray-700">View Reports</span>
          </Button>
          <Button variant="outline" className="rounded-lg p-4 h-auto flex flex-col items-center space-y-2 hover:bg-gray-50">
            <CheckCircle className="w-8 h-8 text-gray-600" />
            <span className="font-medium text-gray-700">System Status</span>
          </Button>
          <Button variant="outline" className="rounded-lg p-4 h-auto flex flex-col items-center space-y-2 hover:bg-gray-50">
            <Lock className="w-8 h-8 text-gray-600" />
            <span className="font-medium text-gray-700">Security Settings</span>
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
