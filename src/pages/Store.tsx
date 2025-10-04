import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SecureFileDownload } from "@/components/SecureFileDownload";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";

type Application = {
  id: string;
  app_name: string;
  package_name: string;
  short_description: string;
  long_description: string | null;
  icon_url: string | null;
  screenshots: string[] | null;
  category: string;
  version_name: string;
  version_code: number;
  downloads: number;
  rating: number | null;
  apk_file_path: string | null;
};

export default function Store() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchPublishedApps();
  }, []);

  const fetchPublishedApps = async () => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching apps:", error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold cursor-pointer" onClick={() => navigate("/")}>
              VibeDevConsole
            </h1>
            <nav className="flex gap-4">
              <Button variant="ghost" onClick={() => navigate("/")}>
                Home
              </Button>
              <Button variant="ghost" onClick={() => navigate("/store")}>
                Store
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button onClick={() => navigate("/auth")}>Sign In</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2">App Store</h2>
          <p className="text-muted-foreground">
            Browse and download published applications
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No applications available yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app) => (
              <Card key={app.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    {app.icon_url && (
                      <img
                        src={app.icon_url}
                        alt={app.app_name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <CardTitle>{app.app_name}</CardTitle>
                      <CardDescription className="mt-1">
                        v{app.version_name}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <Badge className="mb-2">{app.category}</Badge>
                  <p className="text-sm text-muted-foreground mb-4">
                    {app.short_description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span>{app.rating?.toFixed(1) || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      <span>{app.downloads.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(`/app/${app.id}`)}
                  >
                    Details
                  </Button>
                  {app.apk_file_path && (
                    <SecureFileDownload
                      bucketName="apk-files"
                      filePath={app.apk_file_path}
                      fileName={`${app.package_name}_v${app.version_name}.apk`}
                      applicationId={app.id}
                      className="flex-1"
                    />
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
