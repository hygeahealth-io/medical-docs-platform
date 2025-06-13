import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Layout from "@/components/layout";
import RoleGuard from "@/components/role-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Database, 
  Mail, 
  Globe,
  Bell,
  Lock,
  Users,
  Settings as SettingsIcon,
  Save,
  AlertTriangle
} from "lucide-react";

export default function AdminSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("system");

  // Fetch current admin settings
  const { data: adminSettings, isLoading } = useQuery({
    queryKey: ["/api/admin/settings"],
    retry: false,
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/admin/settings", "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({
        title: "Settings updated",
        description: "Admin settings have been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = (category: string, settings: any) => {
    updateSettingsMutation.mutate({ category, settings });
  };

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
    <RoleGuard requiredRole="admin">
      <Layout>
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Settings</h1>
            <p className="text-gray-600">System-wide configuration and administrative controls</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="system" className="flex items-center space-x-2">
                <SettingsIcon className="w-4 h-4" />
                <span>System</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Security</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>User Management</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="database" className="flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span>Database</span>
              </TabsTrigger>
            </TabsList>

            {/* System Settings */}
            <TabsContent value="system">
              <SystemSettings 
                settings={adminSettings?.system}
                onSave={(settings) => handleSaveSettings("system", settings)}
                isLoading={updateSettingsMutation.isPending}
              />
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security">
              <SecuritySettings 
                settings={adminSettings?.security}
                onSave={(settings) => handleSaveSettings("security", settings)}
                isLoading={updateSettingsMutation.isPending}
              />
            </TabsContent>

            {/* User Management Settings */}
            <TabsContent value="users">
              <UserManagementSettings 
                settings={adminSettings?.userManagement}
                onSave={(settings) => handleSaveSettings("userManagement", settings)}
                isLoading={updateSettingsMutation.isPending}
              />
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications">
              <NotificationSettings 
                settings={adminSettings?.notifications}
                onSave={(settings) => handleSaveSettings("notifications", settings)}
                isLoading={updateSettingsMutation.isPending}
              />
            </TabsContent>

            {/* Database Settings */}
            <TabsContent value="database">
              <DatabaseSettings 
                settings={adminSettings?.database}
                onSave={(settings) => handleSaveSettings("database", settings)}
                isLoading={updateSettingsMutation.isPending}
              />
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </RoleGuard>
  );
}

// System Settings Component
function SystemSettings({ settings, onSave, isLoading }: any) {
  const [systemSettings, setSystemSettings] = useState({
    applicationName: settings?.applicationName || "ClickDoc",
    maintenanceMode: settings?.maintenanceMode || false,
    allowNewRegistrations: settings?.allowNewRegistrations || true,
    defaultUserTier: settings?.defaultUserTier || "standard",
    sessionTimeout: settings?.sessionTimeout || 24,
    maxConcurrentSessions: settings?.maxConcurrentSessions || 5,
    ...settings,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <SettingsIcon className="w-5 h-5 text-medical-teal" />
          <span>System Configuration</span>
        </CardTitle>
        <CardDescription>
          General system settings and application behavior
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="app-name">Application Name</Label>
            <Input
              id="app-name"
              value={systemSettings.applicationName}
              onChange={(e) => setSystemSettings({...systemSettings, applicationName: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="default-tier">Default User Tier</Label>
            <Select 
              value={systemSettings.defaultUserTier} 
              onValueChange={(value) => setSystemSettings({...systemSettings, defaultUserTier: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
            <Input
              id="session-timeout"
              type="number"
              min="1"
              max="168"
              value={systemSettings.sessionTimeout}
              onChange={(e) => setSystemSettings({...systemSettings, sessionTimeout: parseInt(e.target.value)})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-sessions">Max Concurrent Sessions</Label>
            <Input
              id="max-sessions"
              type="number"
              min="1"
              max="10"
              value={systemSettings.maxConcurrentSessions}
              onChange={(e) => setSystemSettings({...systemSettings, maxConcurrentSessions: parseInt(e.target.value)})}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-gray-500">Temporarily disable user access for system maintenance</p>
            </div>
            <Switch
              checked={systemSettings.maintenanceMode}
              onCheckedChange={(checked) => setSystemSettings({...systemSettings, maintenanceMode: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow New Registrations</Label>
              <p className="text-sm text-gray-500">Enable new user account creation</p>
            </div>
            <Switch
              checked={systemSettings.allowNewRegistrations}
              onCheckedChange={(checked) => setSystemSettings({...systemSettings, allowNewRegistrations: checked})}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onSave(systemSettings)} disabled={isLoading} className="bg-medical-teal hover:bg-teal-700">
            <Save className="w-4 h-4 mr-2" />
            Save System Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Security Settings Component
function SecuritySettings({ settings, onSave, isLoading }: any) {
  const [securitySettings, setSecuritySettings] = useState({
    enforceStrongPasswords: settings?.enforceStrongPasswords || true,
    requireTwoFactor: settings?.requireTwoFactor || false,
    maxLoginAttempts: settings?.maxLoginAttempts || 5,
    lockoutDuration: settings?.lockoutDuration || 15,
    enableAuditLogs: settings?.enableAuditLogs || true,
    ipWhitelist: settings?.ipWhitelist || [],
    ...settings,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-medical-teal" />
          <span>Security Configuration</span>
        </CardTitle>
        <CardDescription>
          Authentication and security policies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="max-login">Max Login Attempts</Label>
            <Input
              id="max-login"
              type="number"
              min="3"
              max="10"
              value={securitySettings.maxLoginAttempts}
              onChange={(e) => setSecuritySettings({...securitySettings, maxLoginAttempts: parseInt(e.target.value)})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lockout">Lockout Duration (minutes)</Label>
            <Input
              id="lockout"
              type="number"
              min="5"
              max="60"
              value={securitySettings.lockoutDuration}
              onChange={(e) => setSecuritySettings({...securitySettings, lockoutDuration: parseInt(e.target.value)})}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enforce Strong Passwords</Label>
              <p className="text-sm text-gray-500">Require complex passwords with special characters</p>
            </div>
            <Switch
              checked={securitySettings.enforceStrongPasswords}
              onCheckedChange={(checked) => setSecuritySettings({...securitySettings, enforceStrongPasswords: checked})}
            />
          </div>

          <div className="space-y-4">
            <Label>Two-Factor Authentication (Always Required)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reauth-frequency">Admin Re-authentication Frequency</Label>
                <Select 
                  value={securitySettings.reauthFrequency || "30"} 
                  onValueChange={(value) => setSecuritySettings({...securitySettings, reauthFrequency: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Every 7 days</SelectItem>
                    <SelectItem value="14">Every 14 days</SelectItem>
                    <SelectItem value="30">Every 30 days</SelectItem>
                    <SelectItem value="60">Every 60 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Log All 2FA Failed Attempts</p>
                  <p className="text-xs text-gray-500">Track unsuccessful 2FA authentication attempts</p>
                </div>
                <Switch
                  checked={securitySettings.log2FAFailures || true}
                  onCheckedChange={(checked) => setSecuritySettings({...securitySettings, log2FAFailures: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Log 2FA Resets</p>
                  <p className="text-xs text-gray-500">Track when users reset their 2FA settings</p>
                </div>
                <Switch
                  checked={securitySettings.log2FAResets || true}
                  onCheckedChange={(checked) => setSecuritySettings({...securitySettings, log2FAResets: checked})}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Audit Logs</Label>
              <p className="text-sm text-gray-500">Log all user activities and system changes</p>
            </div>
            <Switch
              checked={securitySettings.enableAuditLogs}
              onCheckedChange={(checked) => setSecuritySettings({...securitySettings, enableAuditLogs: checked})}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onSave(securitySettings)} disabled={isLoading} className="bg-medical-teal hover:bg-teal-700">
            <Save className="w-4 h-4 mr-2" />
            Save Security Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// User Management Settings Component
function UserManagementSettings({ settings, onSave, isLoading }: any) {
  const [userSettings, setUserSettings] = useState({
    autoApproveUsers: settings?.autoApproveUsers || false,
    defaultRole: settings?.defaultRole || "user",
    allowSelfUpgrade: settings?.allowSelfUpgrade || true,
    maxUsersPerTier: settings?.maxUsersPerTier || {
      standard: 1000,
      gold: 500,
      platinum: 100
    },
    ...settings,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-medical-teal" />
          <span>User Management</span>
        </CardTitle>
        <CardDescription>
          User registration and role management policies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="default-role">Default User Role</Label>
            <Select 
              value={userSettings.defaultRole} 
              onValueChange={(value) => setUserSettings({...userSettings, defaultRole: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>



        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-approve New Users</Label>
              <p className="text-sm text-gray-500">Automatically activate new user accounts</p>
            </div>
            <Switch
              checked={userSettings.autoApproveUsers}
              onCheckedChange={(checked) => setUserSettings({...userSettings, autoApproveUsers: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Self-Service Tier Upgrades</Label>
              <p className="text-sm text-gray-500">Users can upgrade their own membership tier</p>
            </div>
            <Switch
              checked={userSettings.allowSelfUpgrade}
              onCheckedChange={(checked) => setUserSettings({...userSettings, allowSelfUpgrade: checked})}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onSave(userSettings)} disabled={isLoading} className="bg-medical-teal hover:bg-teal-700">
            <Save className="w-4 h-4 mr-2" />
            Save User Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Notification Settings Component
function NotificationSettings({ settings, onSave, isLoading }: any) {
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: settings?.emailNotifications || true,
    securityAlerts: settings?.securityAlerts || true,
    systemUpdates: settings?.systemUpdates || true,
    adminEmail: settings?.adminEmail || "",
    smtpServer: settings?.smtpServer || "",
    smtpPort: settings?.smtpPort || 587,
    ...settings,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-medical-teal" />
          <span>Notification Settings</span>
        </CardTitle>
        <CardDescription>
          Email and alert configuration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="admin-email">Admin Email</Label>
            <Input
              id="admin-email"
              type="email"
              value={notificationSettings.adminEmail}
              onChange={(e) => setNotificationSettings({...notificationSettings, adminEmail: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="smtp-server">SMTP Server</Label>
            <Input
              id="smtp-server"
              value={notificationSettings.smtpServer}
              onChange={(e) => setNotificationSettings({...notificationSettings, smtpServer: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-gray-500">Send email notifications for system events</p>
            </div>
            <Switch
              checked={notificationSettings.emailNotifications}
              onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Security Alerts</Label>
              <p className="text-sm text-gray-500">Immediate alerts for security incidents</p>
            </div>
            <Switch
              checked={notificationSettings.securityAlerts}
              onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, securityAlerts: checked})}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onSave(notificationSettings)} disabled={isLoading} className="bg-medical-teal hover:bg-teal-700">
            <Save className="w-4 h-4 mr-2" />
            Save Notification Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Database Settings Component
function DatabaseSettings({ settings, onSave, isLoading }: any) {
  const [dbSettings, setDbSettings] = useState({
    backupFrequency: settings?.backupFrequency || "daily",
    retentionPeriod: settings?.retentionPeriod || 30,
    enableCompression: settings?.enableCompression || true,
    autoOptimize: settings?.autoOptimize || true,
    ...settings,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-medical-teal" />
          <span>Database Configuration</span>
        </CardTitle>
        <CardDescription>
          Database backup and optimization settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="backup-frequency">Backup Frequency</Label>
            <Select 
              value={dbSettings.backupFrequency} 
              onValueChange={(value) => setDbSettings({...dbSettings, backupFrequency: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="retention">Retention Period (days)</Label>
            <Input
              id="retention"
              type="number"
              min="7"
              max="365"
              value={dbSettings.retentionPeriod}
              onChange={(e) => setDbSettings({...dbSettings, retentionPeriod: parseInt(e.target.value)})}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Compression</Label>
              <p className="text-sm text-gray-500">Compress backup files to save storage</p>
            </div>
            <Switch
              checked={dbSettings.enableCompression}
              onCheckedChange={(checked) => setDbSettings({...dbSettings, enableCompression: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-optimize Database</Label>
              <p className="text-sm text-gray-500">Automatically optimize database performance</p>
            </div>
            <Switch
              checked={dbSettings.autoOptimize}
              onCheckedChange={(checked) => setDbSettings({...dbSettings, autoOptimize: checked})}
            />
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-yellow-800">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Warning</span>
          </div>
          <p className="text-sm text-yellow-700 mt-2">
            Database configuration changes may require system restart to take effect.
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onSave(dbSettings)} disabled={isLoading} className="bg-medical-teal hover:bg-teal-700">
            <Save className="w-4 h-4 mr-2" />
            Save Database Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}