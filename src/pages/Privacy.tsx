import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Code2, ArrowLeft } from "lucide-react";

const Privacy = () => {
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
          <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-slate max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                VibeDevConsole ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your information when you use our Android
                app submission platform. This policy complies with the EU General Data Protection Regulation
                (GDPR) and the California Consumer Privacy Act (CCPA/CPRA).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We collect only the minimum necessary personal information to provide our services:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Name and email address (required for account creation)</li>
                <li>Developer information (company name, phone number, physical address, website URL)</li>
                <li>Application metadata (app names, descriptions, categories)</li>
                <li>File data (APK files, screenshots, and associated assets)</li>
                <li>App reviews and ratings you submit</li>
                <li>Communication and consent preferences (GDPR, marketing)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">Technical Information</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Download history and timestamps</li>
                <li>User agent strings (for analytics)</li>
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Usage data and analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide and maintain our app submission services</li>
                <li>Process and review app submissions</li>
                <li>Communicate with you about your account and submissions</li>
                <li>Improve our platform and user experience</li>
                <li>Comply with legal obligations</li>
                <li>Send marketing communications (only with your explicit consent)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement comprehensive security measures to protect your data:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li><strong>Row-Level Security (RLS):</strong> Database-level access controls ensuring users can only access their own data</li>
                <li><strong>Role-Based Access Control:</strong> Strict separation between admin, moderator, and developer permissions</li>
                <li><strong>Rate Limiting:</strong> API endpoints protected against abuse (50 requests/hour for sensitive operations)</li>
                <li><strong>Audit Logging:</strong> All administrative actions are logged and immutable</li>
                <li><strong>Encryption:</strong> TLS/SSL for data in transit, encryption at rest for stored data</li>
                <li><strong>Authentication Security:</strong> Google reCAPTCHA, password validation, and secure session management</li>
                <li><strong>Regular Security Reviews:</strong> Automated security scans and manual reviews</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Your Rights (GDPR & CCPA)</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Erasure:</strong> Request deletion of your data (Right to be Forgotten)</li>
                <li><strong>Data Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong>Restrict Processing:</strong> Limit how we use your data</li>
                <li><strong>Object:</strong> Object to processing of your data</li>
                <li><strong>Withdraw Consent:</strong> Revoke consent at any time</li>
                <li><strong>Non-Discrimination:</strong> Not receive discriminatory treatment for exercising your rights</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                To exercise these rights, please contact us at vibedeveloper@proton.me
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We retain your personal data only as long as necessary to fulfill the purposes outlined in this
                policy or as required by law:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Download Logs:</strong> Automatically deleted after 90 days</li>
                <li><strong>Developer Contact Information:</strong> Retained while account is active, subject to 90-day review cycle</li>
                <li><strong>App Reviews and Ratings:</strong> Retained while account is active or until deleted by user</li>
                <li><strong>Audit Logs:</strong> Retained for compliance and security purposes as required by law</li>
                <li><strong>Account Data:</strong> Upon request or account deletion, we will securely delete or anonymize your data within 30 days</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Note: Some data may be retained longer where required by law or for legitimate business purposes (e.g., fraud prevention).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Third-Party Services</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We do not sell or rent your personal information to third parties. We use the following trusted
                service providers to operate our platform:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Supabase:</strong> Backend database, authentication, and file storage (GDPR compliant)</li>
                <li><strong>Google reCAPTCHA:</strong> Bot prevention during registration</li>
                <li><strong>Resend:</strong> Transactional email delivery</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                All service providers are subject to strict confidentiality agreements and GDPR/CCPA compliance requirements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you are located in the European Economic Area (EEA), we ensure that any transfer of your data
                outside the EEA is protected by appropriate safeguards, such as Standard Contractual Clauses
                approved by the European Commission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our services are not intended for children under 16 years of age. We do not knowingly collect
                personal information from children under 16. If we become aware that we have collected such
                information, we will take steps to delete it promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes
                by posting the new policy on this page and updating the "Last updated" date. We encourage you to
                review this policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">11. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:
              </p>
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg border border-primary/20">
                <p className="text-foreground font-medium">Email: vibedeveloper@proton.me</p>
                <p className="text-foreground font-medium">Data Protection Officer: vibedeveloper@proton.me</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">12. Supervisory Authority</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you are located in the EEA and believe we have not addressed your concerns adequately, you have
                the right to lodge a complaint with your local data protection supervisory authority.
              </p>
            </section>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Privacy;
