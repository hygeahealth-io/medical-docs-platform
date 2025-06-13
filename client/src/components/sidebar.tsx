import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Settings, 
  CreditCard, 
  Wrench, 
  LogOut,
  FileText,
  Crown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  BarChart2,
  FileBarChart,
  Activity,
  Folder
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Tool sub-items for different user tiers
const getToolSubItems = (userTier: string) => {
  const allTools = [
    { path: "/vitals-generator", icon: Activity, label: "Vitals Generator", tier: "standard" },
    { path: "/custom-keys", icon: FileBarChart, label: "Custom Keys", tier: "platinum" },
    { path: "/user-quality-check", icon: CheckCircle, label: "Quality Check", tier: "platinum" },
    { path: "/report-builder", icon: BarChart2, label: "Report Generator", tier: "platinum" }
  ];
  
  return allTools.filter(tool => {
    if (tool.tier === "platinum") {
      return userTier === "platinum";
    }
    return true;
  });
};

const adminNavItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/member-management", icon: Users, label: "Member Management" },
  { path: "/analytics", icon: BarChart3, label: "Analytics" },
  { 
    path: "/admin-tools", 
    icon: Wrench, 
    label: "Tools",
    subItems: [
      { path: "/admin-tools", icon: Wrench, label: "Admin Tools" },
      { path: "/create-user", icon: Users, label: "Create User" },
      { path: "/system-announcements", icon: FileText, label: "Announcements" },
    ]
  },
  { path: "/settings", icon: Settings, label: "Settings" },
];

const getUserNavItems = (userTier: string) => [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { 
    path: "/tools", 
    icon: Wrench, 
    label: "Tools",
    subItems: getToolSubItems(userTier)
  },
  { path: "/membership", icon: CreditCard, label: "Membership" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  
  const navItems = user?.role === 'admin' ? adminNavItems : getUserNavItems(user?.tier || 'standard');

  const toggleMenu = (menuLabel: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuLabel) 
        ? prev.filter(item => item !== menuLabel)
        : [...prev, menuLabel]
    );
  };

  const isMenuExpanded = (menuLabel: string) => expandedMenus.includes(menuLabel);

  // Auto-expand Tools menu if user is on a tool page
  const isOnToolPage = location.includes('/tools') || 
                       location === '/user-quality-check' || 
                       location === '/report-builder' ||
                       location === '/vitals-generator' ||
                       location === '/custom-keys';
  
  // Use useEffect to handle menu expansion properly
  useEffect(() => {
    if (isOnToolPage && !isMenuExpanded('Tools')) {
      setExpandedMenus(prev => [...prev, 'Tools']);
    }
  }, [location, isOnToolPage]);

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <aside className="w-60 bg-white shadow-sm border-r border-gray-200 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <button 
          onClick={() => setLocation("/")}
          className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-medical-teal rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">MedFlowPro</span>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item: any) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isExpanded = isMenuExpanded(item.label);
          
          return (
            <div key={item.path}>
              {/* Main Menu Item */}
              <button
                onClick={() => {
                  if (hasSubItems) {
                    toggleMenu(item.label);
                  } else {
                    setLocation(item.path);
                  }
                }}
                className={cn(
                  "nav-item w-full justify-start",
                  isActive && !hasSubItems && "active"
                )}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
                {hasSubItems && (
                  <div className="ml-auto">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                )}
              </button>

              {/* Sub Menu Items */}
              {hasSubItems && isExpanded && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.subItems.map((subItem: any) => {
                    const SubIcon = subItem.icon;
                    const isSubActive = location === subItem.path;
                    const isDisabled = subItem.disabled;
                    
                    return (
                      <button
                        key={subItem.path}
                        onClick={() => !isDisabled && setLocation(subItem.path)}
                        className={cn(
                          "nav-item w-full justify-start text-sm py-2 flex items-center",
                          isSubActive && !isDisabled && "active",
                          isDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                        )}
                      >
                        <SubIcon className="w-4 h-4 mr-3" />
                        {subItem.label}
                        {subItem.tier === "platinum" && user?.tier !== "platinum" && (
                          <Crown className="w-3 h-3 ml-auto text-purple-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Tier Status - Only for Users */}
      {user?.role !== 'admin' && (
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-3">
            {/* Tier Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Crown className={cn(
                  "w-4 h-4",
                  user?.tier === 'platinum' ? "text-purple-600" :
                  user?.tier === 'gold' ? "text-yellow-600" : "text-gray-600"
                )} />
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    user?.tier === 'platinum' ? "border-purple-200 text-purple-700 bg-purple-50" :
                    user?.tier === 'gold' ? "border-yellow-200 text-yellow-700 bg-yellow-50" : 
                    "border-gray-200 text-gray-700 bg-gray-50"
                  )}
                >
                  {user?.tier?.toUpperCase() || 'STANDARD'}
                </Badge>
              </div>
              <Badge 
                variant={user?.status === 'active' ? 'default' : 'destructive'}
                className="text-xs"
              >
                {user?.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            {/* Expiration Date */}
            <div className="text-xs text-gray-500">
              <p>Expires: {user?.expirationDate ? new Date(user.expirationDate).toLocaleDateString() : 'No expiration'}</p>
            </div>

            {/* Upgrade Button - Only for Standard and Gold */}
            {(user?.tier === 'standard' || user?.tier === 'gold') && (
              <Button
                size="sm"
                onClick={() => setLocation('/membership')}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                <ArrowUp className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            )}
          </div>
        </div>
      )}

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
