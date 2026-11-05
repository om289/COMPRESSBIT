import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ShieldCheck, Wrench, BookOpen, HeartHandshake } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const AboutPage = () => (
  <>
    <Helmet>
      <title>About CompressBit | Private Browser-Based File Tools</title>
      <meta name="description" content="Learn why CompressBit builds practical, browser-based tools for compressing, converting, organizing, and protecting files." />
      <link rel="canonical" href="https://www.compressbit.com/about" />
    </Helmet>
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between pb-20 md:pb-0">
      <Header />
      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.header initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center space-y-5 mb-14">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10"><ShieldCheck className="w-8 h-8 text-primary" /></div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">About CompressBit</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">CompressBit is an independent collection of browser-based file tools built to make common document and image tasks simpler, faster, and more private.</p>
          </motion.header>
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {[
              { icon: Wrench, title: 'Practical tools, not upload gates', text: 'We focus on useful everyday tasks: reducing file size, merging and splitting PDFs, converting images, and applying password protection. The goal is a clear tool that gets out of your way.' },
              { icon: ShieldCheck, title: 'Privacy by design', text: 'Our tools are built to work in the browser rather than by sending your selected files to a CompressBit processing server. This is especially helpful when handling personal, client, or business documents.' },
              { icon: BookOpen, title: 'Clear information', text: 'A tool should explain what it does, which formats it supports, and what trade-offs to expect. We publish guides and in-product FAQs to help you choose the right workflow.' },
              { icon: HeartHandshake, title: 'A transparent experience', text: 'You can review our privacy policy, terms, guides, and support route from anywhere on the site. We aim to keep the experience usable without requiring an account.' }
            ].map(({ icon: Icon, title, text }) => <Card key={title} className="p-7 bg-card border-border"><Icon className="w-7 h-7 text-primary mb-5" /><h2 className="text-xl font-bold mb-3">{title}</h2><p className="text-muted-foreground text-sm leading-relaxed">{text}</p></Card>)}
          </div>
          <article className="max-w-3xl mx-auto space-y-6 text-muted-foreground leading-relaxed">
            <h2 className="text-2xl font-bold text-foreground">How we think about file processing</h2>
            <p>Many online file tools require uploading a document before you can learn whether the result will be useful. CompressBit takes a different approach: you choose a tool, work with the file on your own device, and download the output when you are happy with it. Actual results can vary with the source file, its images and fonts, your settings, and the capabilities of your browser.</p>
            <p>We also believe privacy claims should be understandable. Our <Link to="/privacy" className="text-primary font-semibold hover:underline">Privacy Policy</Link> explains what the site does and does not collect, including how analytics and advertising may operate. If you have a question or spot an issue, visit <Link to="/contact" className="text-primary font-semibold hover:underline">Contact & Support</Link>.</p>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  </>
);

export default AboutPage;
