import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Shield, 
  Download,
  Calendar,
  Filter,
  Eye,
  Clock,
  Activity
} from "lucide-react";

export default function AdvancedAnalytics() {
  const [dateRange, setDateRange] = useState("last_30_days");
  const [tierFilter, setTierFilter] = useState("all");

  // Mock analytics data - in real app would come from API
  const analyticsData = {
    overview: {
      dailyActiveUsers: 1247,
      newRegistrations: 89,
      revenue: 15420,
      securityIncidents: 3
    },
    userGrowth: [
      { month: "Jan", total: 1100, standard: 750, gold: 250, platinum: 100 },
      { month: "Feb", total: 1180, standard: 800, gold: 280, platinum: 100 },
      { month: "Mar", total: 1247, standard: 840, gold: 297, platinum: 110 }
    ],
    featureUsage: [
      { feature: "Report Generator", usage: 850, tier: "Platinum" },
      { feature: "Vitals Generator", usage: 1100, tier: "Gold+" },
      { feature: "Quality Check", usage: 750, tier: "Platinum" },
      { feature: "Custom Keys", usage: 1200, tier: "Gold+" }
    ],
    tierDistribution: [
      { name: "Standard", value: 840, color: "#6b7280" },
      { name: "Gold", value: 297, color: "#f59e0b" },
      { name: "Platinum", value: 110, color: "#8b5cf6" }
    ],
    revenueData: [
      { month: "Jan", revenue: 12500, recurring: 11200, oneTime: 1300 },
      { month: "Feb", revenue: 14200, recurring: 12800, oneTime: 1400 },
      { month: "Mar", revenue: 15420, recurring: 13920, oneTime: 1500 }
    ],
    sessionMetrics: {
      avgSessionDuration: "24m 15s",
      bounceRate: "12.3%",
      pagesPerSession: 4.7,
      conversionRate: "8.9%"
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
            <p className="text-gray-600">Comprehensive insights into platform performance and user behavior</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </Button>
            <Button className="bg-medical-teal hover:bg-teal-700 flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Schedule Report</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                  <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                  <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm">
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Daily Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.dailyActiveUsers.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12.3% from last month
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New Registrations</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.newRegistrations}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +8.7% from last week
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${analyticsData.overview.revenue.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +15.2% from last month
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Security Incidents</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.securityIncidents}</p>
                  <p className="text-xs text-red-600 flex items-center mt-1">
                    <Shield className="w-3 h-3 mr-1" />
                    All resolved
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>User Growth by Tier</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="standard" stackId="a" fill="#6b7280" name="Standard" />
                  <Bar dataKey="gold" stackId="a" fill="#f59e0b" name="Gold" />
                  <Bar dataKey="platinum" stackId="a" fill="#8b5cf6" name="Platinum" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tier Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Membership Tier Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.tierDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analyticsData.tierDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Revenue Trends</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, ""]} />
                  <Line type="monotone" dataKey="revenue" stroke="#0891b2" strokeWidth={3} name="Total Revenue" />
                  <Line type="monotone" dataKey="recurring" stroke="#10b981" strokeWidth={2} name="Recurring" />
                  <Line type="monotone" dataKey="oneTime" stroke="#f59e0b" strokeWidth={2} name="One-time" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Feature Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Feature Usage Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.featureUsage.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-medical-teal rounded-full"></div>
                      <span className="font-medium">{feature.feature}</span>
                      <Badge variant="secondary" className="text-xs">
                        {feature.tier}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-medical-teal h-2 rounded-full" 
                          style={{ width: `${(feature.usage / 1200) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-16 text-right">{feature.usage}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Session Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Session & Engagement Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-medical-teal">{analyticsData.sessionMetrics.avgSessionDuration}</p>
                <p className="text-sm text-gray-600">Avg Session Duration</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-medical-teal">{analyticsData.sessionMetrics.bounceRate}</p>
                <p className="text-sm text-gray-600">Bounce Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-medical-teal">{analyticsData.sessionMetrics.pagesPerSession}</p>
                <p className="text-sm text-gray-600">Pages per Session</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-medical-teal">{analyticsData.sessionMetrics.conversionRate}</p>
                <p className="text-sm text-gray-600">Conversion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}