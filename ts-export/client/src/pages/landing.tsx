import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Shield, Users, Zap, Brain, CheckCircle } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-medical-teal rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">MedFlowPro</span>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-medical-teal hover:bg-medical-teal/90"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Professional Medical Documentation
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Streamline Your Medical
            <span className="text-medical-teal block">Documentation Workflow</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A comprehensive SaaS platform designed for healthcare professionals to automate documentation, 
            manage workflows, and enhance productivity with intelligent Chrome extension integration.
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-medical-teal hover:bg-medical-teal/90 text-lg px-8 py-4"
          >
            Get Started Today
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-2 hover:border-medical-teal/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-medical-teal/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-medical-teal" />
              </div>
              <CardTitle>Smart Automation</CardTitle>
              <CardDescription>
                Automate repetitive documentation tasks with intelligent key bindings and templates
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-medical-teal/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-medical-teal/10 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-medical-teal" />
              </div>
              <CardTitle>AI-Powered Reports</CardTitle>
              <CardDescription>
                Generate comprehensive medical reports with AI assistance and quality checking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-medical-teal/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-medical-teal/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-medical-teal" />
              </div>
              <CardTitle>Enterprise Security</CardTitle>
              <CardDescription>
                Bank-grade security with role-based access control and compliance monitoring
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-medical-teal/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-medical-teal/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-medical-teal" />
              </div>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>
                Comprehensive user management with tier-based access and administrative controls
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-medical-teal/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-medical-teal/10 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-medical-teal" />
              </div>
              <CardTitle>Chrome Extension</CardTitle>
              <CardDescription>
                Seamless browser integration for real-time documentation across medical platforms
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-medical-teal/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-medical-teal/10 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-medical-teal" />
              </div>
              <CardTitle>Quality Assurance</CardTitle>
              <CardDescription>
                Built-in quality checks and compliance validation for all medical documentation
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Pricing Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
          <p className="text-gray-600 mb-12">Flexible pricing for healthcare professionals of all sizes</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Standard Plan */}
            <Card className="relative border-2">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Standard</CardTitle>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  $29<span className="text-lg font-normal text-gray-500">/month</span>
                </div>
                <CardDescription>Perfect for individual practitioners</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Basic automation templates
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Chrome extension access
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Email support
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Basic analytics
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Gold Plan */}
            <Card className="relative border-2 border-medical-teal">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Badge className="bg-medical-teal text-white">Most Popular</Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Gold</CardTitle>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  $49<span className="text-lg font-normal text-gray-500">/month</span>
                </div>
                <CardDescription>For growing medical practices</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Custom key bindings
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Advanced templates
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Priority support
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Team collaboration
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Platinum Plan */}
            <Card className="relative border-2">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Platinum</CardTitle>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  $79<span className="text-lg font-normal text-gray-500">/month</span>
                </div>
                <CardDescription>Enterprise-grade features</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    AI-powered reports
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Quality assurance tools
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    24/7 support
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Advanced analytics
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Medical Documentation?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of healthcare professionals who have streamlined their workflows with MedFlowPro.
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-medical-teal hover:bg-medical-teal/90 text-lg px-8 py-4"
          >
            Start Your Free Trial
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-medical-teal rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">MedFlowPro</span>
          </div>
          <p className="text-center text-gray-600">
            © 2024 MedFlowPro. Professional medical documentation platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
