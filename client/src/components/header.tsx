import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const pageLabels: { [key: string]: string } = {
  "/": "Dashboard",
  "/member-management": "Member Management",
  "/analytics": "Analytics",
  "/tools": "Tools",
  "/membership": "Membership",
  "/settings": "Settings",
  "/create-user": "Create User",
};

export default function Header() {
  const { user } = useAuth();
  const [location] = useLocation();
  
  const currentPageLabel = pageLabels[location] || "Dashboard";
  
  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-end px-6 py-4">
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-500">
            <Bell className="w-6 h-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.profileImageUrl || undefined} />
              <AvatarFallback className="bg-medical-teal text-white text-xs">
                {getInitials(user?.firstName || undefined, user?.lastName || undefined)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email || 'User'
                }
              </p>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-gray-500 capitalize">{user?.role || 'User'}</p>
                {user?.tier && (
                  <Badge variant="secondary" className="text-xs">
                    {user.tier.toUpperCase()}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
