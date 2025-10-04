import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Code2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import ReCAPTCHA from "react-google-recaptcha";
import { sanitizeText, isValidEmail, getRateLimitIdentifier } from "@/lib/sanitize";

const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

const RECAPTCHA_SITE_KEY = "6LfYGqkqAAAAANzsXxIQyv0Kl-VDqLkJ4cYZlAkV";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate reCAPTCHA
      if (!recaptchaToken) {
        toast({
          title: "Security Check Required",
          description: "Please complete the security verification.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Verify reCAPTCHA with backend
      const { data: captchaData, error: captchaError } = await supabase.functions.invoke('verify-recaptcha', {
        body: { token: recaptchaToken }
      });

      if (captchaError || !captchaData?.success) {
        toast({
          title: "Security Check Failed",
          description: "Please try again or refresh the page.",
          variant: "destructive",
        });
        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
        setLoading(false);
        return;
      }

      // Check rate limiting
      const rateLimitId = getRateLimitIdentifier();
      const { data: rateLimitData, error: rateLimitError } = await supabase.functions.invoke('rate-limit-auth', {
        body: { 
          identifier: rateLimitId,
          action: isLogin ? 'login' : 'signup'
        }
      });

      if (rateLimitError || !rateLimitData?.allowed) {
        toast({
          title: "Too Many Attempts",
          description: rateLimitData?.error || "Please try again later.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Sanitize inputs
      const sanitizedEmail = sanitizeText(email.toLowerCase().trim(), 255);
      const sanitizedName = name ? sanitizeText(name, 100) : "";

      // Additional email validation
      if (!isValidEmail(sanitizedEmail)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Validate terms acceptance for both login and signup
      if (!termsAccepted) {
        toast({
          title: "Terms Required",
          description: "You must accept the Terms of Service and Privacy Policy to continue.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: sanitizedEmail,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
        navigate("/dashboard");
      } else {
        // Validate password strength for signup
        const passwordValidation = passwordSchema.safeParse(password);
        if (!passwordValidation.success) {
          toast({
            title: "Weak Password",
            description: passwordValidation.error.errors[0].message,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        if (!gdprConsent) {
          toast({
            title: "Consent Required",
            description: "You must agree to the data processing terms to register.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email: sanitizedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              name: sanitizedName,
              marketing_consent: marketingConsent,
              gdpr_consent: gdprConsent,
            },
          },
        });

        if (error) throw error;

        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error: any) {
      // Reset reCAPTCHA on error
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
      
      toast({
        title: "Error",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-subtle relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }}></div>
      </div>
      
      <Card className="w-full max-w-md shadow-vibrant relative z-10 border-primary/20">
        <CardHeader className="text-center">
          <Link to="/" className="flex justify-center mb-4 group">
            <div className="p-3 gradient-vibrant rounded-lg shadow-glow transition-transform group-hover:scale-110 duration-300">
              <Code2 className="h-8 w-8 text-primary-foreground" />
            </div>
          </Link>
          <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
            {isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {isLogin ? "Sign in to access your developer dashboard" : "Start publishing your free open-source Android apps today"}
          </CardDescription>
          {!isLogin && (
            <div className="mt-3 px-3 py-2 bg-primary/10 border border-primary/20 rounded-md">
              <p className="text-xs text-primary font-medium">
                100% Free for Open-Source Projects
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Join developers worldwide sharing their knowledge freely
              </p>
            </div>
          )}
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="developer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              {!isLogin && (
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters with uppercase, lowercase, number, and special character
                </p>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t">
              {/* Terms acceptance required for both login and signup */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                  required
                />
                <label htmlFor="terms" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  I accept the{" "}
                  <Link to="/terms" target="_blank" className="text-primary hover:underline font-medium">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" target="_blank" className="text-primary hover:underline font-medium">
                    Privacy Policy
                  </Link>
                  . <span className="text-destructive">*</span>
                </label>
              </div>

              {!isLogin && (
                <>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="gdpr"
                      checked={gdprConsent}
                      onCheckedChange={(checked) => setGdprConsent(checked === true)}
                      required
                    />
                    <label htmlFor="gdpr" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      I agree to the processing of my personal data in accordance with GDPR regulations.
                      <span className="text-destructive"> *</span>
                    </label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="marketing"
                      checked={marketingConsent}
                      onCheckedChange={(checked) => setMarketingConsent(checked === true)}
                    />
                    <label htmlFor="marketing" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                   I would like to receive product updates and marketing communications (optional)
                </label>
              </div>
            </>
          )}
        </div>

        {/* reCAPTCHA */}
        <div className="flex flex-col items-center gap-2 pt-4">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={RECAPTCHA_SITE_KEY}
            onChange={(token) => setRecaptchaToken(token)}
            onExpired={() => setRecaptchaToken(null)}
            theme="dark"
          />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>Protected by reCAPTCHA</span>
          </div>
        </div>
      </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              variant="hero" 
              className="w-full shadow-glow" 
              disabled={loading || !recaptchaToken}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⚡</span>
                  Please wait...
                </span>
              ) : (
                isLogin ? "Sign In" : "Create Account"
              )}
            </Button>

            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                // Reset form state when switching
                setTermsAccepted(false);
                setGdprConsent(false);
              }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>

            <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors group">
              <span className="inline-flex items-center gap-1">
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                Back to home
              </span>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Auth;
