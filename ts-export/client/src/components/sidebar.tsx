import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Settings, 
  CreditCard, 
  Bolt, 
  LogOut,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/member-management", icon: Users, label: "Member Management" },
  { path: "/analytics", icon: BarChart3, label: "Analytics" },
  { path: "/tools", icon: Bolt, label: "Bolt" },
  { path: "/membership", icon: CreditCard, label: "Membership" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

const userNavItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/tools", icon: Bolt, label: "Bolt" },
  { path: "/membership", icon: CreditCard, label: "Membership" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  
  const navItems = user?.role === 'admin' ? adminNavItems : userNavItems;

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <aside className="w-60 bg-white shadow-sm border-r border-gray-200 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-medical-teal rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">MedFlowPro</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={cn(
                "nav-item w-full justify-start",
                isActive && "active"
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
