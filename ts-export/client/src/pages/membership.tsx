import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  Crown, 
  Zap, 
  Star,
  Calendar,
  DollarSign,
  Users,
  Shield,
  BarChart3,
  Headphones
} from "lucide-react";

const plans = [
  {
    name: "Standard",
    price: 29,
    description: "Perfect for individual practitioners",
    features: [
      "Basic automation templates",
      "Chrome extension access", 
      "Email support",
      "Basic analytics",
      "Up to 5 key bindings"
    ],
    tier: "standard",
    color: "blue"
  },
  {
    name: "Gold", 
    price: 49,
    description: "For growing medical practices",
    features: [
      "Custom key bindings",
      "Advanced templates",
      "Priority support", 
      "Team collaboration",
      "Import/Export tools",
      "Advanced analytics"
    ],
    tier: "gold", 
    color: "yellow",
    popular: true
  },
  {
    name: "Platinum",
    price: 79,
    description: "Enterprise-grade features", 
    features: [
      "AI-powered reports",
      "Quality assurance tools",
      "24/7 support",
      "Advanced analytics",
      "Unlimited key bindings",
      "API access",
      "Custom integrations"
    ],
    tier: "platinum",
    color: "purple"
  }
];

export default function Membership() {
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

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-teal"></div>
        </div>
      </Layout>
    );
  }

  const currentPlan = plans.find(plan => plan.tier === user?.tier) || plans[0];
  
  // Mock billing cycle data
  const billingCycleEnd = new Date();
  billingCycleEnd.setDate(billingCycleEnd.getDate() + 85);
  const totalDays = 90;
  const remainingDays = 85;
  const progressPercentage = ((totalDays - remainingDays) / totalDays) * 100;

  const handleUpgrade = (planTier: string) => {
    toast({
      title: "Upgrade Requested",
      description: `Upgrade to ${planTier} plan initiated. You'll be redirected to payment processing.`,
    });
    // In a real implementation, this would redirect to a payment processor
  };

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return <Crown className="w-6 h-6" />;
      case 'gold':
        return <Star className="w-6 h-6" />;
      default:
        return <Zap className="w-6 h-6" />;
    }
  };

  const getPlanBadgeClass = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return 'bg-purple-100 text-purple-800';
      case 'gold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Membership Status & Benefits</h2>
          <Button className="bg-medical-teal hover:bg-medical-teal/90">
            <DollarSign className="w-4 h-4 mr-2" />
            Billing History
          </Button>
        </div>

        {/* Current Plan Status */}
        <Card className="border-2 border-medical-teal/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  currentPlan.tier === 'platinum' ? 'bg-purple-100 text-purple-600' :
                  currentPlan.tier === 'gold' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {getPlanIcon(currentPlan.tier)}
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{currentPlan.name.toUpperCase()} PLAN</h3>
                    <Badge className={getPlanBadgeClass(currentPlan.tier)}>
                      Current Plan
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-1">Active Subscription</p>
                  <p className="text-sm text-gray-500">
                    Renews on {billingCycleEnd.toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">${currentPlan.price}/mo</p>
                <div className="w-48 mt-3">
                  <Progress value={progressPercentage} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    {remainingDays} days remaining in billing cycle
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Comparison */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6">Choose Your Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrentPlan = plan.tier === user?.tier;
              const isUpgrade = plans.findIndex(p => p.tier === user?.tier) < plans.findIndex(p => p.tier === plan.tier);
              
              return (
                <Card 
                  key={plan.tier}
                  className={`relative ${
                    isCurrentPlan 
                      ? 'border-2 border-medical-teal' 
                      : plan.popular 
                      ? 'border-2 border-yellow-400'
                      : 'border-2 border-gray-200'
                  }`}
                >
                  {(isCurrentPlan || plan.popular) && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <Badge className={
                        isCurrentPlan 
                          ? 'bg-medical-teal text-white' 
                          : 'bg-yellow-400 text-yellow-900'
                      }>
                        {isCurrentPlan ? 'Current Plan' : 'Most Popular'}
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${
                      plan.tier === 'platinum' ? 'bg-purple-100 text-purple-600' :
                      plan.tier === 'gold' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {getPlanIcon(plan.tier)}
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      ${plan.price}<span className="text-lg font-normal text-gray-500">/month</span>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {isCurrentPlan ? (
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        disabled
                      >
                        Current Plan
                      </Button>
                    ) : isUpgrade ? (
                      <Button 
                        className="w-full bg-medical-teal hover:bg-medical-teal/90"
                        onClick={() => handleUpgrade(plan.name)}
                      >
                        Upgrade to {plan.name}
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleUpgrade(plan.name)}
                      >
                        Downgrade to {plan.name}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Benefits Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Team Collaboration</h3>
              <p className="text-sm text-gray-600">
                {user?.tier === 'standard' 
                  ? 'Available in Gold & Platinum plans'
                  : 'Share templates and workflows with your team'
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Enhanced Security</h3>
              <p className="text-sm text-gray-600">
                Advanced security features and compliance monitoring
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
              <p className="text-sm text-gray-600">
                {user?.tier === 'standard'
                  ? 'Available in Gold & Platinum plans'
                  : 'Detailed insights into your workflow patterns'
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Priority Support</h3>
              <p className="text-sm text-gray-600">
                {user?.tier === 'platinum' 
                  ? '24/7 priority support with dedicated success manager'
                  : user?.tier === 'gold'
                  ? 'Priority email and chat support during business hours'
                  : 'Standard email support within 24 hours'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Can I change my plan anytime?</h4>
              <p className="text-sm text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately for upgrades, 
                or at the next billing cycle for downgrades.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">What happens to my data if I downgrade?</h4>
              <p className="text-sm text-gray-600">
                Your data is always safe. If you downgrade, some features may become unavailable, but your existing 
                key bindings and templates will be preserved.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Do you offer annual discounts?</h4>
              <p className="text-sm text-gray-600">
                Yes! Annual subscriptions include a 20% discount. Contact our sales team to learn more about 
                annual pricing options.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
