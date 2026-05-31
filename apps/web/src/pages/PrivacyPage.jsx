import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const PrivacyPage = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - CompressBit</title>
        <meta name="description" content="CompressBit privacy policy. Learn how we protect your data — all processing happens locally in your browser." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground pb-20 md:pb-0">
        <Header />

        <section className="relative pt-32 pb-16 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-primary/5 blur-[120px] pointer-events-none rounded-full" />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-4 mb-16"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
                Privacy Policy
              </h1>
              <p className="text-muted-foreground text-lg">
                Last updated: May 2026
              </p>
            </motion.div>

            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="prose prose-invert max-w-none space-y-10"
            >
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Our Core Promise</h2>
                <p className="text-muted-foreground leading-relaxed">
                  CompressBit is built on one fundamental principle: <strong className="text-foreground">your files never leave your device</strong>. All compression, merging, and encryption operations are performed entirely within your browser using client-side JavaScript, Web Workers, and the HTML5 Canvas API. No file data is ever transmitted to, processed on, or stored on our servers.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">What We Don't Collect</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>We do not upload, read, scan, or store any file you process on CompressBit.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>We do not collect file names, file contents, or metadata from your documents or images.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>We do not require account creation, login credentials, or personal information of any kind.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Encryption passwords are never transmitted — they exist solely in your browser's memory.</span>
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use Google Analytics to understand aggregate usage patterns such as page visits and general geographic distribution. This data helps us improve CompressBit. Google Analytics may use cookies to collect anonymous, non-personal information. No file data or personal information is shared with Google Analytics.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  You can opt out of Google Analytics tracking by using a browser extension like <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Analytics Opt-out Browser Add-on</a>.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Advertising</h2>
                <p className="text-muted-foreground leading-relaxed">
                  CompressBit may display ads served through third-party advertising partners (e.g., Google AdSense). These partners may use cookies or similar technologies to serve relevant ads based on your browsing behavior. We do not share any file data or personal information with advertising partners.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  CompressBit itself does not set any cookies. However, third-party services embedded on our site (Google Analytics, advertising partners) may set cookies. You can manage cookie preferences through your browser settings.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Data Retention</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Since all file processing occurs in your browser's memory, no file data persists after you close the tab or navigate away. Compressed outputs exist only as in-memory blobs until you download them. Once the browser tab is closed, all data is permanently erased.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Third-Party Links</h2>
                <p className="text-muted-foreground leading-relaxed">
                  CompressBit may contain links to external websites. We are not responsible for the content or privacy practices of those sites. We encourage you to review their privacy policies independently.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Changes to This Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this privacy policy from time to time to reflect changes in our practices. Any changes will be posted on this page with an updated revision date.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about this privacy policy, you can reach us through the contact information provided on our website.
                </p>
              </section>
            </motion.article>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default PrivacyPage;
