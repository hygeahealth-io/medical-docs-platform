import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Users, DollarSign, Shield, Activity, Bell } from "lucide-react";

export default function AdminAnalytics() {
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

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="text-center py-16">
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-6">
              <BarChart3 className="w-16 h-16 text-gray-400" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics Dashboard Coming Soon</h2>
          <p className="text-gray-600 mb-8 max-w-lg mx-auto">
            We're working hard to bring you powerful analytics features
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8">
            <Card className="bg-primary-50 border-0">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-medical-teal" />
                <p className="text-sm font-medium text-gray-900">User Activity Metrics</p>
              </CardContent>
            </Card>
            
            <Card className="bg-primary-50 border-0">
              <CardContent className="p-4 text-center">
                <DollarSign className="w-8 h-8 mx-auto mb-2 text-medical-teal" />
                <p className="text-sm font-medium text-gray-900">Membership Statistics</p>
              </CardContent>
            </Card>
            
            <Card className="bg-primary-50 border-0">
              <CardContent className="p-4 text-center">
                <Shield className="w-8 h-8 mx-auto mb-2 text-medical-teal" />
                <p className="text-sm font-medium text-gray-900">Security Monitoring</p>
              </CardContent>
            </Card>
            
            <Card className="bg-primary-50 border-0">
              <CardContent className="p-4 text-center">
                <Activity className="w-8 h-8 mx-auto mb-2 text-medical-teal" />
                <p className="text-sm font-medium text-gray-900">Feature Usage Analytics</p>
              </CardContent>
            </Card>
          </div>

          <Button className="bg-medical-teal text-white hover:bg-medical-teal-dark">
            <Bell className="w-5 h-5 mr-2" />
            Notify me when ready
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
