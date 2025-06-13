import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Zap } from "lucide-react";

interface TierGuardProps {
  children: ReactNode;
  requiredTier: "standard" | "gold" | "platinum";
  feature?: string;
}

const tierHierarchy = {
  standard: 1,
  gold: 2,
  platinum: 3,
};

export default function TierGuard({ children, requiredTier, feature }: TierGuardProps) {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const userTierLevel = tierHierarchy[user.tier as keyof typeof tierHierarchy] || 0;
  const requiredTierLevel = tierHierarchy[requiredTier];

  if (userTierLevel >= requiredTierLevel) {
    return <>{children}</>;
  }

  return (
    <Card className="border-2 border-dashed border-gray-300">
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {requiredTier === 'platinum' ? (
            <Crown className="w-6 h-6 text-yellow-600" />
          ) : (
            <Zap className="w-6 h-6 text-yellow-600" />
          )}
        </div>
        <CardTitle className="text-xl">
          {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} Feature
        </CardTitle>
        <CardDescription>
          {feature ? `${feature} requires` : 'This feature requires'} a {requiredTier} tier subscription or higher.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button className="bg-medical-teal hover:bg-medical-teal/90">
          Upgrade to {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)}
        </Button>
      </CardContent>
    </Card>
  );
}
