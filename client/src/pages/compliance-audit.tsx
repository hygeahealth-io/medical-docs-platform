import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Layout from "@/components/layout";
import { 
  Shield, 
  Search,
  Download,
  Calendar,
  User,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Eye,
  ExternalLink
} from "lucide-react";

interface AuditLog {
  id: number;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  details: any;
  ipAddress: string | null;
  userAgent: string | null;
  sessionId: string | null;
  success: boolean;
  errorMessage: string | null;
  createdAt: Date;
  user?: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    role: string;
  };
}

export default function ComplianceAudit() {
  const [filters, setFilters] = useState({
    search: "",
    action: "",
    resource: "",
    success: "",
    dateRange: "last_30_days",
    page: 1,
    limit: 25
  });

  const { data: auditData, isLoading } = useQuery({
    queryKey: ["/api/audit-logs", filters],
  });

  const auditLogs = auditData?.logs || [];
  const totalLogs = auditData?.total || 0;
  const totalPages = Math.ceil(totalLogs / filters.limit);

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const exportAuditLogs = () => {
    // This would trigger the audit log export API
    console.log("Exporting audit logs with filters:", filters);
  };

  const getActionBadge = (action: string) => {
    const variants = {
      create: "bg-green-100 text-green-800",
      update: "bg-blue-100 text-blue-800",
      delete: "bg-red-100 text-red-800",
      view: "bg-gray-100 text-gray-800",
      export: "bg-purple-100 text-purple-800",
      login: "bg-yellow-100 text-yellow-800",
      logout: "bg-orange-100 text-orange-800"
    };
    return variants[action as keyof typeof variants] || "bg-gray-100 text-gray-800";
  };

  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case "user": return <User className="w-4 h-4" />;
      case "report": return <FileText className="w-4 h-4" />;
      case "settings": return <Shield className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatUserAgent = (userAgent: string | null) => {
    if (!userAgent) return "Unknown";
    
    // Simple user agent parsing
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Other";
  };

  // Mock compliance metrics for demonstration
  const complianceMetrics = {
    totalAuditLogs: 15847,
    criticalEvents: 23,
    failedLogins: 156,
    dataExports: 89,
    adminActions: 342,
    complianceScore: 97.8
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Compliance & Audit Trail</h1>
            <p className="text-gray-600">Monitor system activities and maintain compliance records</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={exportAuditLogs}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Audit Logs</span>
            </Button>
          </div>
        </div>

        {/* Compliance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-medical-teal">{complianceMetrics.totalAuditLogs.toLocaleString()}</p>
                <p className="text-xs text-gray-600">Total Audit Logs</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{complianceMetrics.criticalEvents}</p>
                <p className="text-xs text-gray-600">Critical Events</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{complianceMetrics.failedLogins}</p>
                <p className="text-xs text-gray-600">Failed Logins</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{complianceMetrics.dataExports}</p>
                <p className="text-xs text-gray-600">Data Exports</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{complianceMetrics.adminActions}</p>
                <p className="text-xs text-gray-600">Admin Actions</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{complianceMetrics.complianceScore}%</p>
                <p className="text-xs text-gray-600">Compliance Score</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filters.action} onValueChange={(value) => handleFilterChange("action", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="export">Export</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filters.resource} onValueChange={(value) => handleFilterChange("resource", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Resources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="report">Reports</SelectItem>
                  <SelectItem value="settings">Settings</SelectItem>
                  <SelectItem value="announcement">Announcements</SelectItem>
                  <SelectItem value="audit">Audit Logs</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filters.success} onValueChange={(value) => handleFilterChange("success", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Results" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value="true">Success</SelectItem>
                  <SelectItem value="false">Failed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange("dateRange", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_24_hours">Last 24 Hours</SelectItem>
                  <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                  <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                  <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                onClick={() => setFilters({
                  search: "",
                  action: "",
                  resource: "",
                  success: "",
                  dateRange: "last_30_days",
                  page: 1,
                  limit: 25
                })}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Clear</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Audit Logs</span>
                <Badge variant="secondary">{totalLogs.toLocaleString()} entries</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading audit logs...</div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No audit logs found</h3>
                <p className="text-gray-600">Try adjusting your filters to see more results.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Browser</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log: AuditLog) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span>{new Date(log.createdAt).toLocaleString()}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          {log.user ? (
                            <div className="text-sm">
                              <div className="font-medium">
                                {log.user.firstName} {log.user.lastName}
                              </div>
                              <div className="text-gray-500">{log.user.email}</div>
                              <Badge variant="outline" className="text-xs">
                                {log.user.role}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-gray-500">System</span>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <Badge className={getActionBadge(log.action)}>
                            {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getResourceIcon(log.resource)}
                            <span className="capitalize">{log.resource}</span>
                            {log.resourceId && (
                              <Badge variant="outline" className="text-xs">
                                ID: {log.resourceId}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          {log.success ? (
                            <div className="flex items-center space-x-1 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <span>Success</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-red-600">
                              <AlertTriangle className="w-4 h-4" />
                              <span>Failed</span>
                            </div>
                          )}
                        </TableCell>
                        
                        <TableCell className="text-sm font-mono">
                          {log.ipAddress || "Unknown"}
                        </TableCell>
                        
                        <TableCell className="text-sm">
                          {formatUserAgent(log.userAgent)}
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {log.errorMessage && (
                              <div className="text-sm text-red-600 max-w-xs truncate">
                                {log.errorMessage}
                              </div>
                            )}
                            {Object.keys(log.details || {}).length > 0 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  // Open details modal
                                  console.log("Show details:", log.details);
                                }}
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">Rows per page:</span>
                    <Select 
                      value={filters.limit.toString()} 
                      onValueChange={(value) => handleFilterChange("limit", parseInt(value))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(filters.page - 1)}
                      disabled={filters.page <= 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm bg-medical-teal text-white px-3 py-1 rounded">
                      Page {filters.page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(filters.page + 1)}
                      disabled={filters.page >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}