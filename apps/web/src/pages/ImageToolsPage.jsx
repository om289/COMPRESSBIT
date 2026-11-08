import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  Image as ImageIcon, 
  Maximize2, 
  FileText, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  Sliders,
  CheckCircle2,
  LockKeyhole
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { FAQAccordion } from '@/components/FAQAccordion.jsx';
import { trackPageView } from '@/lib/analytics.js';

const imageTools = [
  {
    id: 'image-compress',
    title: 'Compress Image',
    description: 'Compress PNG, JPG, and WebP images to your desired file size in KB without visible quality loss.',
    icon: ImageIcon,
    path: '/image',
    color: 'bg-blue-500/10 text-blue-500',
    popular: true
  },
  {
    id: 'image-resize',
    title: 'Resize Image',
    description: 'Scale and crop images by exact pixel dimensions, percentage scale, or standard social media presets.',
    icon: Maximize2,
    path: '/image/resize',
    color: 'bg-cyan-500/10 text-cyan-500'
  },
  {
    id: 'image-to-pdf',
    title: 'Image to PDF',
    description: 'Convert and merge single or multiple JPG, PNG, and WebP images into a clean PDF document.',
    icon: FileText,
    path: '/image/to-pdf',
    color: 'bg-indigo-500/10 text-indigo-500'
  },
  {
    id: 'image-convert',
    title: 'Convert Image',
    description: 'Batch convert image formats between JPG, PNG, and WebP locally with adjustable quality.',
    icon: Layers,
    path: '/image/convert',
    color: 'bg-teal-500/10 text-teal-500'
  }
];

const faqs = [
  {
    question: "Are my images sent to an external server?",
    answer: "No. All image compression, resizing, and conversion takes place entirely within your browser using Canvas and WebAssembly. Your photos never leave your device."
  },
  {
    question: "Which image formats are supported?",
    answer: "CompressBit supports standard modern web image formats including JPEG, JPG, PNG, and WebP."
  },
  {
    question: "Can I compress or convert images in bulk?",
    answer: "Yes, you can drop multiple images at once to compress or convert them in batch, then download the processed files individually or packed together."
  },
  {
    question: "Will compressing my images degrade their clarity?",
    answer: "CompressBit uses intelligent compression algorithms that strip unnecessary metadata and optimize color data so you can drastically cut file weight while keeping crisp visuals."
  }
];

const ImageToolsPage = () => {
  useEffect(() => {
    trackPageView('/image-tools');
  }, []);

  return (
    <>
      <Helmet>
        <title>All Image Tools - 100% Free & Private Online Image Toolkit | CompressBit</title>
        <meta name="description" content="Free, private client-side image tools: compress, resize, convert, and turn PNG, JPG, and WebP images into PDFs locally. No server uploads." />
        <meta property="og:title" content="All Image Tools - Free & Private | CompressBit" />
        <meta property="og:description" content="Free, private client-side image tools: compress, resize, convert, and turn images into PDFs directly in your browser." />
        <meta property="og:url" content="https://www.compressbit.com/image-tools" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between pb-20 md:pb-0">
        <Header />

        <main className="flex-grow pt-28 pb-20">
          {/* Hero Section */}
          <section className="relative pb-16 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[450px] bg-primary/5 blur-[120px] pointer-events-none rounded-full" />
            
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <Badge variant="outline" className="px-4 py-1.5 border-primary/20 text-primary bg-primary/5 backdrop-blur-sm">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  100% Local & Private Image Suite
                </Badge>

                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
                  All-in-One <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
                    Image Tools
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Compress, resize, convert, and turn images into PDFs directly in your browser.
                  Fast, high-fidelity, and 100% offline-capable.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Tools Grid */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {imageTools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Link 
                    to={tool.path} 
                    className="block group h-full cursor-pointer"
                  >
                    <Card className="p-6 h-full flex flex-col justify-between bg-card border-border hover:border-primary/50 transition-all duration-300 relative overflow-hidden hover:shadow-xl hover:shadow-primary/5">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tool.color}`}>
                            <tool.icon className="w-6 h-6" />
                          </div>
                          {tool.popular && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-xs font-semibold">
                              Popular
                            </Badge>
                          )}
                        </div>

                        <div>
                          <h2 className="text-lg font-bold text-foreground flex items-center group-hover:text-primary transition-colors duration-200">
                            {tool.title}
                            <ArrowRight className="w-4 h-4 ml-1.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                          </h2>
                          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                            {tool.description}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-border/50 flex items-center text-xs font-semibold text-primary">
                        <Zap className="w-3.5 h-3.5 mr-1" />
                        Processed in Browser
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Value Props */}
          <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: LockKeyhole,
                  title: 'Private & Secure',
                  text: 'Your photos and graphics are processed entirely on your device. We do not store, view, or upload your media.'
                },
                {
                  icon: Sliders,
                  title: 'Precision Control',
                  text: 'Target specific KB file sizes, resize to exact social presets, and convert formats with full quality controls.'
                },
                {
                  icon: Sparkles,
                  title: 'Free Without Limits',
                  text: 'Batch process as many images as you need with no subscriptions, accounts, or watermarks.'
                }
              ].map(({ icon: Icon, title, text }) => (
                <Card key={title} className="p-6 bg-card border-border">
                  <Icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-lg font-bold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* FAQs */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <FAQAccordion faqs={faqs} />
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ImageToolsPage;
