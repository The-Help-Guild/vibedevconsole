import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, Users, Package, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface PendingApp {
  id: string;
  app_name: string;
  package_name: string;
  short_description: string;
  category: string;
  version_name: string;
  status: string;
  created_at: string;
  developer_id: string;
}

interface DeveloperProfile {
  user_id: string;
  company_name: string | null;
  phone_number: string | null;
  address: string | null;
  website_url: string | null;
  created_at: string;
}

interface DeveloperWithEmail extends DeveloperProfile {
  email?: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [pendingApps, setPendingApps] = useState<PendingApp[]>([]);
  const [developers, setDevelopers] = useState<DeveloperWithEmail[]>([]);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedDev, setExpandedDev] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!roleLoading && !isAdmin && user) {
      (async () => {
        try {
          // Double-check role directly to avoid race conditions
          const { data: directRoles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id);
          const hasAdmin = (directRoles || []).some((r: any) => r.role === "admin");
          if (hasAdmin) return; // allow access

          // Attempt one-time admin bootstrap if no admins exist
          const { data: grantData, error: grantError } = await supabase.functions.invoke("grant-admin", {});
          if (!grantError && grantData?.granted) {
            toast.success("Admin privileges granted. Reloading...");
            window.location.reload();
            return;
          }
        } catch (e) {
          // ignore
        }
        toast.error("Access denied: Admin privileges required");
        navigate("/dashboard");
      })();
    }
  }, [isAdmin, roleLoading, navigate, user]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch pending applications
    const { data: apps, error: appsError } = await supabase
      .from("applications")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (appsError) {
      console.error(appsError);
    } else {
      setPendingApps(apps || []);
    }

    // Fetch developers (without emails initially)
    const { data: devs, error: devsError } = await supabase
      .from("developer_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (devsError) {
      console.error(devsError);
    } else {
      setDevelopers(devs || []);
    }

    setLoading(false);
  };

  const logAuditAction = async (action: string, targetUserId: string, metadata?: any) => {
    try {
      await supabase.from("admin_audit_log").insert({
        admin_id: user?.id,
        action,
        target_user_id: targetUserId,
        metadata: metadata || {},
      });
    } catch (error) {
      console.error("Failed to log audit action:", error);
    }
  };

  const fetchDeveloperEmail = async (devUserId: string) => {
    try {
      const { data: emailData } = await supabase.functions.invoke("get-developer-email", {
        body: { userId: devUserId },
      });
      
      if (emailData?.email) {
        // Log PII access
        await logAuditAction("view_developer_email", devUserId);
        
        setDevelopers(prev => 
          prev.map(d => d.user_id === devUserId ? { ...d, email: emailData.email } : d)
        );
      }
    } catch (error) {
      console.error("Failed to fetch email:", error);
    }
  };

  const maskPII = (value: string | null, type: "phone" | "address" | "email") => {
    if (!value) return "Not provided";
    if (type === "phone") return `***-***-${value.slice(-4)}`;
    if (type === "email") {
      const [local, domain] = value.split("@");
      return `${local.slice(0, 2)}***@${domain}`;
    }
    return `${value.slice(0, 10)}...`;
  };

  const handleReview = async (appId: string, newStatus: "published" | "rejected") => {
    if (!reviewNotes && newStatus === "rejected") {
      toast.error("Please provide review notes for rejection");
      return;
    }

    setLoading(true);

    try {
      // Update application status
      const { error: updateError } = await supabase
        .from("applications")
        .update({
          status: newStatus,
          published_at: newStatus === "published" ? new Date().toISOString() : null,
        })
        .eq("id", appId);

      if (updateError) throw updateError;

      // Update submission history
      const { error: historyError } = await supabase
        .from("submission_history")
        .update({
          status: newStatus,
          reviewed_by: user?.id,
          review_notes: reviewNotes || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("application_id", appId)
        .eq("status", "pending");

      if (historyError) throw historyError;

      // Get developer email for notification
      const app = pendingApps.find(a => a.id === appId);
      if (app) {
        const { data: devProfile } = await supabase
          .from("developer_profiles")
          .select("user_id")
          .eq("user_id", app.developer_id)
          .single();

        if (devProfile) {
          // Get user email securely via edge function
          try {
            const { data: emailData, error: emailError } = await supabase.functions.invoke(
              "get-developer-email",
              { body: { userId: app.developer_id } }
            );
            
            if (!emailError && emailData?.email) {
              // Send status update email
              await supabase.functions.invoke("send-status-update", {
                body: {
                  email: emailData.email,
                  appName: app.app_name,
                  status: newStatus,
                  reviewNotes: reviewNotes || undefined,
                  reviewedAt: new Date().toISOString(),
                },
              });
            }
          } catch (emailError) {
            console.error("Failed to send status update email:", emailError);
            // Don't fail the review if email fails
          }
        }
      }

      toast.success(`Application ${newStatus === "published" ? "approved" : "rejected"}`);
      setSelectedApp(null);
      setReviewNotes("");
      fetchData();
    } catch (error: any) {
      console.error("Review error:", error);
      toast.error(error.message || "Failed to process review");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Clock className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{pendingApps.length}</div>
                  <p className="text-sm text-muted-foreground">Pending Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{developers.length}</div>
                  <p className="text-sm text-muted-foreground">Developers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Package className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold">MFA Required</div>
                  <p className="text-sm text-muted-foreground">Security Status</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending Apps ({pendingApps.length})</TabsTrigger>
            <TabsTrigger value="developers">Developers ({developers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingApps.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No pending applications</p>
                </CardContent>
              </Card>
            ) : (
              pendingApps.map((app) => (
                <Card key={app.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{app.app_name}</CardTitle>
                        <CardDescription className="mt-1">
                          {app.package_name} • v{app.version_name}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{app.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{app.short_description}</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Submitted: {new Date(app.created_at).toLocaleDateString()}
                    </p>

                    {selectedApp === app.id ? (
                      <div className="space-y-4 pt-4 border-t">
                        <div className="space-y-2">
                          <Label htmlFor="review-notes">Review Notes</Label>
                          <Textarea
                            id="review-notes"
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            placeholder="Provide feedback or reason for rejection..."
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedApp(null);
                              setReviewNotes("");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleReview(app.id, "rejected")}
                            disabled={loading}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                          <Button
                            onClick={() => handleReview(app.id, "published")}
                            disabled={loading}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button onClick={() => setSelectedApp(app.id)}>
                        Review Application
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="developers" className="space-y-4">
            {developers.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No developers registered</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Registered Developers</CardTitle>
                  <CardDescription>Manage developer accounts (PII access is logged)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {developers.map((dev) => (
                      <div key={dev.user_id} className="border rounded-lg">
                        <div 
                          className="flex justify-between items-center p-3 cursor-pointer hover:bg-accent/5"
                          onClick={() => {
                            const newExpanded = expandedDev === dev.user_id ? null : dev.user_id;
                            setExpandedDev(newExpanded);
                            if (newExpanded && !dev.email) {
                              fetchDeveloperEmail(dev.user_id);
                            }
                          }}
                        >
                          <div>
                            <p className="font-medium">{dev.company_name || "Individual Developer"}</p>
                            <p className="text-sm text-muted-foreground">
                              Joined: {new Date(dev.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Active</Badge>
                            <Button variant="ghost" size="sm">
                              {expandedDev === dev.user_id ? "Hide" : "View"} Details
                            </Button>
                          </div>
                        </div>
                        {expandedDev === dev.user_id && (
                          <div className="p-4 border-t bg-muted/30 space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Email:</span>
                              <span className="font-mono">
                                {dev.email ? maskPII(dev.email, "email") : "Loading..."}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Phone:</span>
                              <span className="font-mono">{maskPII(dev.phone_number, "phone")}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Address:</span>
                              <span className="font-mono">{maskPII(dev.address, "address")}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Website:</span>
                              <span className="font-mono">{dev.website_url || "Not provided"}</span>
                            </div>
                            <p className="text-xs text-muted-foreground pt-2 italic">
                              ⚠️ PII access logged for security audit
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
