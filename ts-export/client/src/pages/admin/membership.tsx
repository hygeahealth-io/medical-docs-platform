import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";

export default function AdminMembership() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

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

  const { data: subscription } = useQuery({
    queryKey: ["/api/subscription"],
    retry: false,
    enabled: !!user,
  });

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const currentTier = user?.tier || "standard";

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Membership Status & Benefits</h2>
          <Button className="bg-medical-teal hover:bg-medical-teal-dark">
            Upgrade Plan
          </Button>
        </div>

        {/* Current Plan Status */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {currentTier.toUpperCase()} PLAN
                  </h3>
                  <Badge className="bg-blue-100 text-blue-800">Current Plan</Badge>
                </div>
                <p className="text-gray-600 mb-1">Active Subscription</p>
                <p className="text-sm text-gray-500">Renews on Dec 31, 2025</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  ${currentTier === "standard" ? "29" : currentTier === "gold" ? "49" : "79"}/mo
                </p>
                <div className="w-48 bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-medical-teal h-2 rounded-full" style={{ width: "75%" }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">85 days remaining in billing cycle</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Standard Plan */}
          <Card className={`${currentTier === "standard" ? "border-2 border-medical-teal" : "border"} relative`}>
            {currentTier === "standard" && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Badge className="bg-medical-teal text-white">Current Plan</Badge>
              </div>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Standard</CardTitle>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                $29<span className="text-lg font-normal text-gray-500">/mo</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 mr-3 text-green-500" />
                  Basic automation
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 mr-3 text-green-500" />
                  Template access
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 mr-3 text-green-500" />
                  Email support
                </li>
              </ul>
              <Button 
                variant="outline" 
                className="w-full"
                disabled={currentTier === "standard"}
              >
                {currentTier === "standard" ? "Current Plan" : "Downgrade"}
              </Button>
            </CardContent>
          </Card>

          {/* Gold Plan */}
          <Card className={`${currentTier === "gold" ? "border-2 border-medical-teal" : "border"} relative`}>
            {currentTier === "gold" && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Badge className="bg-medical-teal text-white">Current Plan</Badge>
              </div>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Gold</CardTitle>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                $49<span className="text-lg font-normal text-gray-500">/mo</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 mr-3 text-green-500" />
                  Custom hotkeys
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 mr-3 text-green-500" />
                  Vital signs tool
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 mr-3 text-green-500" />
                  Advanced templates
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 mr-3 text-green-500" />
                  Priority support
                </li>
              </ul>
              <Button 
                className={`w-full ${currentTier === "gold" ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-medical-teal hover:bg-medical-teal-dark text-white"}`}
                disabled={currentTier === "gold"}
              >
                {currentTier === "gold" ? "Current Plan" : "Upgrade"}
              </Button>
            </CardContent>
          </Card>

          {/* Platinum Plan */}
          <Card className={`${currentTier === "platinum" ? "border-2 border-medical-teal" : "border"} relative`}>
            {currentTier === "platinum" && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Badge className="bg-medical-teal text-white">Current Plan</Badge>
              </div>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Platinum</CardTitle>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                $79<span className="text-lg font-normal text-gray-500">/mo</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 mr-3 text-green-500" />
                  AI reports
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 mr-3 text-green-500" />
                  Quality check
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 mr-3 text-green-500" />
                  Specialized report generation
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 mr-3 text-green-500" />
                  24/7 support
                </li>
              </ul>
              <Button 
                className={`w-full ${currentTier === "platinum" ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-medical-teal hover:bg-medical-teal-dark text-white"}`}
                disabled={currentTier === "platinum"}
              >
                {currentTier === "platinum" ? "Current Plan" : "Upgrade"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
