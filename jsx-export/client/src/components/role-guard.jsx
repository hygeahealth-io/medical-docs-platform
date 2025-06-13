import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function RoleGuard({ children, requiredRole }) {
  const { toast } = useToast();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== requiredRole)) {
      toast({
        title: "Access Denied",
        description: `This page requires ${requiredRole} access.`,
        variant: "destructive",
      });
    }
  }, [isAuthenticated, isLoading, user?.role, requiredRole, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-teal"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== requiredRole) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">This page requires {requiredRole} access.</p>
      </div>
    );
  }

  return children;
}