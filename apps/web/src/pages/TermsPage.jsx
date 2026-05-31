import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const TermsPage = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service - CompressBit</title>
        <meta name="description" content="CompressBit terms of service. Understand the conditions for using our free, client-side file optimization tools." />
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
                <Scale className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
                Terms of Service
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
                <h2 className="text-2xl font-bold text-foreground">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing and using CompressBit ("the Service"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">2. Description of Service</h2>
                <p className="text-muted-foreground leading-relaxed">
                  CompressBit provides free, browser-based tools for file compression, optimization, merging, and encryption. All processing is performed client-side using JavaScript and Web APIs within your browser. The Service does not upload, transmit, or store your files on any server.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">3. Use of the Service</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You may use CompressBit for personal and commercial purposes, subject to the following conditions:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>You will not attempt to reverse-engineer, decompile, or extract source code from the Service beyond what is publicly available.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>You will not use the Service to process illegal, harmful, or malicious content.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>You will not attempt to disrupt, overload, or interfere with the Service's availability.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>You will not use automated tools to scrape or bulk-access the Service beyond normal use.</span>
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">4. Your Files and Data</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You retain full ownership of all files you process with CompressBit. Since all processing occurs locally in your browser, we never access, view, or possess your files. You are solely responsible for the content of the files you process and for maintaining backups of your original files.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">5. No Warranty</h2>
                <p className="text-muted-foreground leading-relaxed">
                  CompressBit is provided on an "as-is" and "as-available" basis without warranties of any kind, either express or implied. We do not guarantee that the Service will be uninterrupted, error-free, or that the results of compression or encryption will meet your specific requirements.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Important:</strong> Compression is inherently lossy at certain quality levels. Always keep a backup of your original files before using aggressive or extreme compression settings.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">6. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To the fullest extent permitted by law, CompressBit and its creators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, including but not limited to data loss, file corruption, or inability to access the Service.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">7. Encryption Disclaimer</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The file encryption feature uses industry-standard AES-256-GCM encryption via the Web Crypto API. However, the security of your encrypted files depends on the strength of your chosen password. CompressBit cannot recover encrypted files if you lose your password. You are solely responsible for securely storing your encryption passwords.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">8. Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The CompressBit name, logo, design, and all associated visual elements are the intellectual property of CompressBit. You may not use our branding, trademarks, or design assets without prior written permission.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">9. Modifications</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify, suspend, or discontinue the Service at any time, with or without notice. We may also update these Terms of Service periodically. Continued use of the Service after changes constitutes acceptance of the revised terms.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">10. Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have questions about these Terms of Service, please reach out to us through the contact information provided on our website.
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

export default TermsPage;
