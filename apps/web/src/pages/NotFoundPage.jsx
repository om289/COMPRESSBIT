import React from 'react';
import { Helmet } from 'react-helmet';
import { ArrowLeft, BookOpen, FileText, Home, Image as ImageIcon, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const NotFoundPage = () => (
  <>
    <Helmet>
      <title>Page Not Found | CompressBit</title>
      <meta name="robots" content="noindex,follow" />
    </Helmet>
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between pb-20 md:pb-0">
      <Header />
      <main className="flex-grow pt-32 pb-20 px-4">
        <section className="max-w-4xl mx-auto text-center">
          <p className="text-primary font-bold tracking-wider text-sm mb-3">ERROR 404</p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">This page is not available.</h1>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">The link may be outdated, or the page may have moved. Use one of the options below to find a CompressBit tool or resource.</p>
          <Link to="/" className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"><Home className="w-4 h-4" />Go to home</Link>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-14 text-left">
            {[
              { to: '/pdf-tools', label: 'PDF tools', text: 'Compress, merge, split, organise, and protect PDFs.', icon: FileText },
              { to: '/image-tools', label: 'Image tools', text: 'Compress, resize, convert, or turn images into PDFs.', icon: ImageIcon },
              { to: '/blog', label: 'Guides', text: 'Read practical resources on files, privacy, and formats.', icon: BookOpen },
              { to: '/contact', label: 'Support', text: 'Report a problem or suggest an improvement.', icon: MessageCircle }
            ].map(({ to, label, text, icon: Icon }) => <Link key={to} to={to} className="group"><Card className="p-5 h-full bg-card border-border hover:border-primary/50 transition-colors"><Icon className="w-6 h-6 text-primary mb-4" /><h2 className="font-bold group-hover:text-primary transition-colors">{label}</h2><p className="text-xs text-muted-foreground leading-relaxed mt-2">{text}</p><span className="inline-flex items-center gap-1 text-xs font-semibold text-primary mt-4">Explore <ArrowLeft className="w-3.5 h-3.5 rotate-180" /></span></Card></Link>)}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  </>
);

export default NotFoundPage;
