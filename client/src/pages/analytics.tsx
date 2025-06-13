import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  Shield, 
  Activity,
  Bell
} from "lucide-react";

export default function Analytics() {
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

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-teal"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="text-center py-16">
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto rounded-lg shadow-lg bg-gradient-to-br from-medical-teal to-blue-600 flex items-center justify-center mb-6">
            <BarChart3 className="w-16 h-16 text-white" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Analytics Dashboard Coming Soon</h2>
        <p className="text-gray-600 mb-8 max-w-lg mx-auto">
          We're working hard to bring you powerful analytics features for comprehensive medical workflow insights
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8">
          <Card className="bg-primary-50 border-medical-teal/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-medical-teal/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-medical-teal" />
              </div>
              <CardTitle className="text-lg mb-2">User Activity Metrics</CardTitle>
              <CardDescription>
                Track user engagement, login patterns, and workflow efficiency
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-primary-50 border-medical-teal/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-medical-teal/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-medical-teal" />
              </div>
              <CardTitle className="text-lg mb-2">Membership Statistics</CardTitle>
              <CardDescription>
                Monitor subscription trends, tier distributions, and revenue analytics
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-primary-50 border-medical-teal/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-medical-teal/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-medical-teal" />
              </div>
              <CardTitle className="text-lg mb-2">Security Monitoring</CardTitle>
              <CardDescription>
                Real-time security alerts, compliance tracking, and threat analysis
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-primary-50 border-medical-teal/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-medical-teal/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Activity className="w-6 h-6 text-medical-teal" />
              </div>
              <CardTitle className="text-lg mb-2">Feature Usage Analytics</CardTitle>
              <CardDescription>
                Detailed insights into tool usage, key binding effectiveness, and workflow patterns
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <Button 
          className="bg-medical-teal hover:bg-medical-teal/90 text-lg px-8 py-4"
          onClick={() => {
            toast({
              title: "Notification Registered",
              description: "We'll notify you when analytics features are available.",
            });
          }}
        >
          <Bell className="w-5 h-5 mr-2" />
          Notify me when ready
        </Button>
      </div>
    </Layout>
  );
}
