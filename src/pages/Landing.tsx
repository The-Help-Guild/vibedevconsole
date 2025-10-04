import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Code2, Shield, Zap, Users, Upload, Globe, CheckCircle, Info } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const Landing = () => {
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">VibeDevConsole</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button variant="hero">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent gradient-hero">
            Publish Your Android Apps
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A streamlined platform for developers to submit, manage, and distribute Android applications with minimal friction and maximum compliance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button variant="hero" size="lg" className="w-full sm:w-auto shadow-vibrant">
                Start Publishing
              </Button>
            </Link>
            <Dialog open={learnMoreOpen} onOpenChange={setLearnMoreOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-primary/30 hover:border-primary">
                  <Info className="mr-2 h-5 w-5" />
                  Learn More
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
                    About VibeDevConsole
                  </DialogTitle>
                  <DialogDescription>
                    Your streamlined Android app publishing platform
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  {/* What is it */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Code2 className="h-5 w-5 text-primary" />
                      What is VibeDevConsole?
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      VibeDevConsole is a modern, developer-friendly platform designed to simplify the entire Android application publishing process. We provide a secure, compliant, and efficient environment where developers can submit, manage, and distribute their Android applications without the complexity and bureaucracy of traditional app stores.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Built with cutting-edge technology and security best practices, our platform ensures your apps and user data are protected while offering a seamless experience from submission to publication.
                    </p>
                  </div>

                  {/* Who is it for */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Users className="h-5 w-5 text-accent" />
                      Who is it for?
                    </h3>
                    <div className="grid gap-3">
                      <Card className="p-4 border-primary/20">
                        <h4 className="font-medium mb-2">Independent Developers</h4>
                        <p className="text-sm text-muted-foreground">
                          Solo developers looking for a hassle-free way to publish their apps without dealing with complex submission processes.
                        </p>
                      </Card>
                      <Card className="p-4 border-primary/20">
                        <h4 className="font-medium mb-2">Small Development Teams</h4>
                        <p className="text-sm text-muted-foreground">
                          Startups and small teams that need a fast, reliable platform to get their Android applications to market quickly.
                        </p>
                      </Card>
                      <Card className="p-4 border-primary/20">
                        <h4 className="font-medium mb-2">Enterprise Developers</h4>
                        <p className="text-sm text-muted-foreground">
                          Companies requiring GDPR-compliant, secure distribution channels for internal or customer-facing Android applications.
                        </p>
                      </Card>
                    </div>
                  </div>

                  {/* Submission Process */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Upload className="h-5 w-5 text-success" />
                      APK Submission Process
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Our streamlined three-step process gets your app from development to publication in record time:
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                          1
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">App Information</h4>
                          <p className="text-sm text-muted-foreground">
                            Provide your app's metadata including name, description, category, version details, and screenshots. Our form validates everything in real-time to ensure accuracy.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                          2
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Upload APK File</h4>
                          <p className="text-sm text-muted-foreground">
                            Simply drag and drop your .apk or .aab file (max 500MB). Our system securely stores your file with encrypted storage and generates signed URLs for downloads.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                          3
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Review & Publish</h4>
                          <p className="text-sm text-muted-foreground">
                            Review your submission details and agree to our terms. Once submitted, our admin team reviews your app (typically 1-3 business days) to ensure it meets our guidelines before publication.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Card className="p-4 bg-gradient-to-r from-success/10 to-success/5 border-success/30 mt-4">
                      <div className="flex gap-3">
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-success mb-1">After Approval</h4>
                          <p className="text-sm text-muted-foreground">
                            You'll receive email notifications throughout the process. Once approved, your app goes live immediately and you can track downloads, manage updates, and submit new versions through your dashboard.
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* CTA */}
                  <div className="pt-4 border-t">
                    <Link to="/auth" onClick={() => setLearnMoreOpen(false)}>
                      <Button variant="hero" className="w-full shadow-vibrant">
                        Get Started Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 bg-muted/30">
          <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why Choose VibeDevConsole?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built for developers who value speed, security, and simplicity
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="p-6 shadow-card hover:shadow-elegant transition-all duration-300 animate-slide-up">
            <div className="mb-4 p-3 bg-primary/10 rounded-lg w-fit">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Fast Submission</h3>
            <p className="text-muted-foreground">
              Submit your APK in just three simple steps. No unnecessary delays or complex verification processes.
            </p>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-elegant transition-all duration-300 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="mb-4 p-3 bg-accent/10 rounded-lg w-fit">
              <Shield className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Privacy Compliant</h3>
            <p className="text-muted-foreground">
              Built with GDPR and CCPA compliance at its core. Your data is encrypted and protected.
            </p>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-elegant transition-all duration-300 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="mb-4 p-3 bg-success/10 rounded-lg w-fit">
              <Upload className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Simple Uploads</h3>
            <p className="text-muted-foreground">
              Drag and drop your APK files with support for versioning and automatic metadata extraction.
            </p>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-elegant transition-all duration-300 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="mb-4 p-3 bg-warning/10 rounded-lg w-fit">
              <Users className="h-8 w-8 text-warning" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Developer Focused</h3>
            <p className="text-muted-foreground">
              Designed by developers, for developers. Clean dashboard with all the tools you need.
            </p>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-elegant transition-all duration-300 animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <div className="mb-4 p-3 bg-primary/10 rounded-lg w-fit">
              <Globe className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Global Distribution</h3>
            <p className="text-muted-foreground">
              Reach users worldwide with our reliable content delivery and distribution network.
            </p>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-elegant transition-all duration-300 animate-slide-up" style={{ animationDelay: "0.5s" }}>
            <div className="mb-4 p-3 bg-accent/10 rounded-lg w-fit">
              <Code2 className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Version Control</h3>
            <p className="text-muted-foreground">
              Manage multiple versions of your apps with automatic changelog generation and rollback.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center gradient-primary rounded-2xl p-12 shadow-glow">
          <h2 className="text-4xl font-bold text-primary-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Join thousands of developers publishing their Android apps
          </p>
          <Link to="/auth">
            <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-white/90">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Code2 className="h-6 w-6 text-primary" />
                <span className="font-bold">VibeDevConsole</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The streamlined Android app publishing platform for modern developers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <div className="space-y-2">
                <Link to="/privacy" className="block text-sm text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="block text-sm text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <div className="space-y-2">
                <a href="mailto:vibedeveloper@proton.me" className="block text-sm text-muted-foreground hover:text-foreground">
                  vibedeveloper@proton.me
                </a>
                <a href="#features" className="block text-sm text-muted-foreground hover:text-foreground">
                  Features
                </a>
              </div>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground border-t pt-8">
            © {new Date().getFullYear()} vibedeveloper. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
