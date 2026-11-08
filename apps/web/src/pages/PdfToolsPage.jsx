import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Layers, 
  Scissors, 
  RotateCw, 
  Image as ImageIcon, 
  Lock, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  FilePenLine,
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

const pdfTools = [
  {
    id: 'pdf-compress',
    title: 'Compress PDF',
    description: 'Shrink PDF file sizes locally with custom compression levels while preserving clarity.',
    icon: FileText,
    path: '/pdf',
    color: 'bg-red-500/10 text-red-500',
    popular: true
  },
  {
    id: 'pdf-merge',
    title: 'Merge PDF',
    description: 'Combine multiple PDF documents into a single organized file in seconds.',
    icon: Layers,
    path: '/pdf/merge',
    color: 'bg-purple-500/10 text-purple-500'
  },
  {
    id: 'pdf-split',
    title: 'Split PDF',
    description: 'Extract specific page ranges or split each page into its own individual document.',
    icon: Scissors,
    path: '/pdf/split',
    color: 'bg-orange-500/10 text-orange-500'
  },
  {
    id: 'pdf-organize',
    title: 'Organize & Rotate PDF',
    description: 'Rearrange, rotate, delete, or duplicate pages visually with real-time previews.',
    icon: RotateCw,
    path: '/pdf/organize',
    color: 'bg-rose-500/10 text-rose-500'
  },
  {
    id: 'pdf-to-image',
    title: 'PDF to Image',
    description: 'Extract all PDF pages into high-resolution PNG or JPG images directly in your browser.',
    icon: ImageIcon,
    path: '/pdf/to-image',
    color: 'bg-yellow-500/10 text-yellow-500'
  },
  {
    id: 'pdf-protect',
    title: 'Protect PDF',
    description: 'Secure documents with strong, Adobe-compliant client-side AES password encryption.',
    icon: Lock,
    path: '/pdf/protect',
    color: 'bg-pink-500/10 text-pink-500'
  },
  {
    id: 'ocr',
    title: 'OCR Scan to Text',
    description: 'Extract editable text from scanned documents and PDFs using offline Tesseract OCR.',
    icon: FileText,
    path: '/ocr',
    color: 'bg-emerald-500/10 text-emerald-500'
  },
  {
    id: 'pdf-fill',
    title: 'Fill PDF Forms',
    description: 'Edit standard AcroForm PDF fields privately on your machine, then download flattened.',
    icon: FilePenLine,
    path: '/pdf/fill',
    color: 'bg-blue-500/10 text-blue-500'
  }
];

const faqs = [
  {
    question: "Are my PDF files uploaded to any server?",
    answer: "Never. All CompressBit PDF tools run 100% locally in your browser using WebAssembly and client-side JavaScript. Your files stay on your device at all times."
  },
  {
    question: "Do I need to create an account or pay to use PDF tools?",
    answer: "No account, subscription, or email registration is required. All tools are completely free, private, and unlimited."
  },
  {
    question: "What is the file size limit for PDF processing?",
    answer: "You can process PDF documents up to 100MB per file. Because memory is managed by your browser, keeping file sizes reasonable ensures fast and smooth operations without browser crashes."
  },
  {
    question: "Can I combine multiple operations, like merging then compressing?",
    answer: "Yes! You can run a tool (e.g., Merge PDF), download the result, and immediately drop it into another tool (e.g., Compress PDF) for a fully custom workflow."
  }
];

const PdfToolsPage = () => {
  useEffect(() => {
    trackPageView('/pdf-tools');
  }, []);

  return (
    <>
      <Helmet>
        <title>All PDF Tools - 100% Free & Private Online PDF Toolkit | CompressBit</title>
        <meta name="description" content="Free, private client-side PDF tools: compress, merge, split, rotate, convert, protect, and edit PDFs directly in your browser. Zero server uploads." />
        <meta property="og:title" content="All PDF Tools - Free & Private | CompressBit" />
        <meta property="og:description" content="Free, private client-side PDF tools: compress, merge, split, rotate, convert, protect, and edit PDFs directly in your browser." />
        <meta property="og:url" content="https://www.compressbit.com/pdf-tools" />
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
                  100% Local & Private PDF Suite
                </Badge>

                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
                  All-in-One <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
                    PDF Tools
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Compress, merge, split, organize, protect, and convert your PDF documents locally. 
                  Fast, secure, and completely free.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Tools Grid */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pdfTools.map((tool, index) => (
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
                  title: 'Privacy Guaranteed',
                  text: 'Files are processed strictly in your browser memory. Nothing is ever sent to an external server or cloud storage.'
                },
                {
                  icon: Zap,
                  title: 'Zero Waiting Queue',
                  text: 'Direct WebAssembly and client-side processing means instant execution without queueing behind other users.'
                },
                {
                  icon: Sparkles,
                  title: 'Free & Unlimited',
                  text: 'No credit card, no daily limits, and no watermark on your documents. Clean, professional results every time.'
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

export default PdfToolsPage;
