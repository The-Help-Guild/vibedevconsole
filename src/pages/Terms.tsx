import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Code2, ArrowLeft } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <Code2 className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">VibeDevConsole</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Card className="p-8 shadow-elegant">
          <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-slate max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using VibeDevConsole ("the Platform"), you accept and agree to be bound by these
                Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Eligibility</h2>
              <p className="text-muted-foreground leading-relaxed">
                You must be at least 18 years old to use this Platform. By using our services, you represent and
                warrant that you have the legal capacity to enter into a binding agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Account Registration</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To submit applications, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your account information</li>
                <li>Maintain the security of your password</li>
                <li>Notify us immediately of any unauthorized use</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Application Submission Requirements</h2>
              <h3 className="text-xl font-semibold mb-3">Content Standards</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">All submitted applications must:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Comply with all applicable laws and regulations</li>
                <li>Not contain malware, viruses, or malicious code</li>
                <li>Not infringe on intellectual property rights</li>
                <li>Not contain illegal, harmful, or offensive content</li>
                <li>Not violate privacy rights or collect data without consent</li>
                <li>Be properly signed with your developer certificate</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">Prohibited Content</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">Applications must not contain:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Illegal content or activities</li>
                <li>Hate speech or discriminatory content</li>
                <li>Violence or graphic content</li>
                <li>Sexual or adult content (unless age-gated)</li>
                <li>Fraudulent or deceptive practices</li>
                <li>Spam or misleading functionality</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Intellectual Property Rights</h2>
              <h3 className="text-xl font-semibold mb-3">Your Content</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You retain all ownership rights to your applications. By submitting content, you grant us a
                non-exclusive, worldwide, royalty-free license to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Host and distribute your applications</li>
                <li>Display app metadata and screenshots</li>
                <li>Perform technical operations necessary for service delivery</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">Platform Rights</h3>
              <p className="text-muted-foreground leading-relaxed">
                All Platform features, design, and functionality are owned by VibeDevConsole and protected by
                copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Review and Approval Process</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Submitted applications may be subject to review. We reserve the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Review applications for compliance with these terms</li>
                <li>Reject applications that violate our policies</li>
                <li>Remove published applications at our discretion</li>
                <li>Suspend or terminate accounts that violate terms</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We strive for minimal review times but do not guarantee acceptance or publishing timeframes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Updates and Versioning</h2>
              <p className="text-muted-foreground leading-relaxed">
                You are responsible for maintaining your applications, including security updates and bug fixes.
                You must increment version numbers appropriately and provide changelog information for updates.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground leading-relaxed">
                THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR
                IMPLIED. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, VIBEDEVCONSOLE SHALL NOT BE LIABLE FOR ANY INDIRECT,
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. Indemnification</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to indemnify and hold harmless VibeDevConsole from any claims, damages, or expenses arising
                from your use of the Platform, your applications, or your violation of these terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">11. Termination</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may terminate or suspend your account at any time for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Violation of these terms</li>
                <li>Fraudulent or illegal activity</li>
                <li>Repeated policy violations</li>
                <li>Any reason at our discretion</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You may terminate your account at any time through your account settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">12. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These terms shall be governed by and construed in accordance with the laws of [Jurisdiction],
                without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">13. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these terms at any time. Material changes will be communicated via
                email or Platform notice. Continued use after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">14. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                For questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg border border-primary/20">
                <p className="text-foreground font-medium">Email: vibedeveloper@proton.me</p>
                <p className="text-foreground font-medium">Support: vibedeveloper@proton.me</p>
              </div>
            </section>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Terms;
