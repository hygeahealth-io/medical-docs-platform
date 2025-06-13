import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  Home, 
  Users, 
  BarChart3, 
  Settings, 
  Tools, 
  CreditCard,
  UserPlus,
  Shield,
  Heart,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
    roles: ["admin", "user"],
  },
  {
    name: "Member Management",
    href: "/member-management",
    icon: Users,
    roles: ["admin"],
  },
  {
    name: "Create User",
    href: "/create-user",
    icon: UserPlus,
    roles: ["admin"],
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    roles: ["admin"],
  },
  {
    name: "Tools",
    href: "/tools",
    icon: Tools,
    roles: ["user"],
  },
  {
    name: "Membership",
    href: "/membership",
    icon: CreditCard,
    roles: ["user"],
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["admin", "user"],
  },
];

export default function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role || "user")
  );

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center">
          <Heart className="h-8 w-8 text-medical-teal" />
          <span className="ml-2 text-xl font-bold text-gray-900">ClickDoc</span>
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-medical-teal rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.firstName?.[0] || user?.email?.[0] || 'U'}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
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

        {/* Navigation */}
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {filteredNavigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  
                  return (
                    <li key={item.name}>
                      <Link href={item.href}>
                        <a
                          className={`
                            group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors
                            ${isActive
                              ? 'bg-medical-teal text-white'
                              : 'text-gray-700 hover:text-medical-teal hover:bg-gray-50'
                            }
                          `}
                        >
                          <Icon
                            className={`h-6 w-6 shrink-0 ${
                              isActive ? 'text-white' : 'text-gray-400 group-hover:text-medical-teal'
                            }`}
                            aria-hidden="true"
                          />
                          {item.name}
                        </a>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>

            {/* Security Notice for Admin */}
            {user?.role === 'admin' && (
              <li className="mt-auto">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex">
                    <Shield className="h-5 w-5 text-yellow-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Admin Access
                      </h3>
                      <p className="text-xs text-yellow-700 mt-1">
                        You have administrative privileges
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            )}

            {/* Logout */}
            <li className="mt-auto">
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}