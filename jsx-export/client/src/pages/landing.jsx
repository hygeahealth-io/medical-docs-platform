import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Shield, Zap, Users } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-teal to-teal-700">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Heart className="w-12 h-12 text-white mr-3" />
            <h1 className="text-4xl font-bold text-white">ClickDoc</h1>
          </div>
          <p className="text-xl text-teal-100 max-w-2xl mx-auto">
            Streamline your medical documentation with intelligent automation and seamless workflow integration
          </p>
        </header>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-white/95 backdrop-blur">
            <CardHeader>
              <Zap className="w-8 h-8 text-medical-teal mb-2" />
              <CardTitle>Automated Documentation</CardTitle>
              <CardDescription>
                AI-powered templates and key bindings for rapid medical record creation
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/95 backdrop-blur">
            <CardHeader>
              <Shield className="w-8 h-8 text-medical-teal mb-2" />
              <CardTitle>HIPAA Compliant</CardTitle>
              <CardDescription>
                Enterprise-grade security with role-based access and audit trails
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/95 backdrop-blur">
            <CardHeader>
              <Users className="w-8 h-8 text-medical-teal mb-2" />
              <CardTitle>Team Collaboration</CardTitle>
              <CardDescription>
                Multi-tier access levels with comprehensive user management
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="bg-white/95 backdrop-blur max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Get Started Today</CardTitle>
              <CardDescription>
                Join thousands of healthcare professionals streamlining their workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleLogin}
                className="w-full bg-medical-teal hover:bg-teal-700 text-white"
                size="lg"
              >
                Sign In to Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}