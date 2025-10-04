import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code2, Plus, LogOut, Package, Clock, CheckCircle2, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

interface Application {
  id: string;
  app_name: string;
  package_name: string;
  status: string;
  version_name: string;
  created_at: string;
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState({ published: 0, pending: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (user) {
      fetchApplications();
    }
  }, [user, authLoading, navigate]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("developer_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setApplications(data || []);
      
      // Calculate stats
      const published = data?.filter(app => app.status === "published").length || 0;
      const pending = data?.filter(app => app.status === "pending").length || 0;
      setStats({
        published,
        pending,
        total: data?.length || 0
      });
    } catch (error: any) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
    navigate("/");
  };

  if (authLoading || roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-success text-success-foreground";
      case "pending":
        return "bg-warning text-warning-foreground";
      case "rejected":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <Code2 className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">VibeDevConsole</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.email}
            </span>
            {isAdmin && (
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Panel
                </Button>
              </Link>
            )}
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-6 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Welcome back!
          </h1>
          <p className="text-muted-foreground mb-3">Manage your open-source Android applications and submissions</p>
          <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg inline-block">
            <p className="text-xs text-primary font-medium">
              🎉 This platform is free for open-source developers sharing their knowledge with the community
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 shadow-vibrant hover:shadow-glow transition-all duration-300 border-primary/20 animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-success/20 to-success/10 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.published}</p>
                <p className="text-sm text-muted-foreground">Published Apps</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-vibrant hover:shadow-glow transition-all duration-300 border-primary/20 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-warning/20 to-warning/10 rounded-lg">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-vibrant hover:shadow-glow transition-all duration-300 border-primary/20 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-4">
              <div className="p-3 gradient-primary rounded-lg">
                <Package className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Apps</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="mb-8">
          <Link to="/submit">
            <Button variant="hero" size="lg" className="w-full sm:w-auto shadow-vibrant hover:scale-105 transition-transform">
              <Plus className="h-5 w-5" />
              Submit New App
            </Button>
          </Link>
        </div>

        {/* Apps List */}
        <Card className="shadow-vibrant border-primary/20">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Your Applications
            </h2>
            
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-4 flex justify-center">
                  <div className="p-4 bg-muted rounded-full">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">No apps yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start by submitting your first Android application
                </p>
                <Link to="/submit">
                  <Button variant="hero">
                    <Plus className="h-5 w-5" />
                    Submit Your First App
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <Card key={app.id} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">{app.app_name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{app.package_name}</p>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(app.status)}>
                            {app.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            v{app.version_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            • {new Date(app.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
