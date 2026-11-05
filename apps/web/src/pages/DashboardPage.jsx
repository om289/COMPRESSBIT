import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Image as ImageIcon, 
  ShieldCheck, 
  Zap, 
  Lock, 
  Layers, 
  ArrowRight,
  Sparkles,
  Github,
  Scissors,
  RotateCw,
  Maximize2,
  CheckCircle2,
  FileSearch,
  Download,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const tools = [
    {
      id: 'pdf-compress',
      title: 'PDF Compressor',
      description: 'Optimize PDF files with advanced rasterization. Perfect for large documents.',
      icon: FileText,
      path: '/pdf',
      color: 'bg-red-500/10 text-red-500',
      active: true
    },
    {
      id: 'pdf-merge',
      title: 'PDF Merger',
      description: 'Combine multiple PDF files into a single document. Zero quality loss, 100% private.',
      icon: Layers,
      path: '/pdf/merge',
      color: 'bg-purple-500/10 text-purple-500',
      active: true
    },
    {
      id: 'pdf-split',
      title: 'PDF Splitter',
      description: 'Extract specific page ranges or split all pages into separate PDFs locally.',
      icon: Scissors,
      path: '/pdf/split',
      color: 'bg-orange-500/10 text-orange-500',
      active: true
    },
    {
      id: 'pdf-organize',
      title: 'Organize PDF',
      description: 'Rotate, reorder, duplicate, and delete pages of your PDF documents visually.',
      icon: RotateCw,
      path: '/pdf/organize',
      color: 'bg-rose-500/10 text-rose-500',
      active: true
    },
    {
      id: 'pdf-to-image',
      title: 'PDF to Image',
      description: 'Convert PDF pages into high-quality PNG or JPEG images in your browser.',
      icon: ImageIcon,
      path: '/pdf/to-image',
      color: 'bg-yellow-500/10 text-yellow-500',
      active: true
    },
    {
      id: 'image-compress',
      title: 'Image Compressor',
      description: 'Compress JPG, PNG, and WebP images while maintaining high visual quality.',
      icon: ImageIcon,
      path: '/image',
      color: 'bg-blue-500/10 text-blue-500',
      active: true
    },
    {
      id: 'image-resize',
      title: 'Image Resizer',
      description: 'Scale and resize images by dimensions, percentages, or social media presets.',
      icon: Maximize2,
      path: '/image/resize',
      color: 'bg-cyan-500/10 text-cyan-500',
      active: true
    },
    {
      id: 'image-to-pdf',
      title: 'Image to PDF',
      description: 'Combine multiple JPG, PNG, or WebP images into a single PDF document.',
      icon: FileText,
      path: '/image/to-pdf',
      color: 'bg-indigo-500/10 text-indigo-500',
      active: true
    },
    {
      id: 'pdf-protect',
      title: 'Protect PDF',
      description: 'Secure PDF files with Adobe-compliant client-side password protection.',
      icon: Lock,
      path: '/pdf/protect',
      color: 'bg-pink-500/10 text-pink-500',
      active: true
    },
    {
      id: 'image-convert',
      title: 'Image Converter',
      description: 'Convert images between PNG, JPG, and WebP formats in batch locally.',
      icon: Layers,
      path: '/image/convert',
      color: 'bg-teal-500/10 text-teal-500',
      active: true
    },
    {
      id: 'encrypt',
      title: 'File Encryptor',
      description: 'Secure your files with military-grade client-side AES-256 encryption. 100% private.',
      icon: Lock,
      path: '/encrypt',
      color: 'bg-emerald-500/10 text-emerald-500',
      active: true
    }
  ];

  return (
    <>
      <Helmet>
        <title>CompressBit - Professional Client-Side Tools</title>
        <meta name="description" content="100% Private, client-side file compression and optimization tools. Files never leave your browser." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between pb-20 md:pb-0">
        <Header />

        <main className="flex-grow">
          {/* Hero Section */}
          <section className="relative pt-32 pb-20 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/5 blur-[120px] pointer-events-none rounded-full" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <Badge variant="outline" className="px-4 py-1.5 border-primary/20 text-primary bg-primary/5 backdrop-blur-sm animate-pulse">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  100% Client-Side Processing
                </Badge>
                
                <div className="space-y-4">
                  <h1 className="text-5xl md:text-7xl font-extrabold text-foreground tracking-tight text-balance">
                    Optimize your files <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
                      without the cloud.
                    </span>
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Fast, secure, and private. Files are processed entirely in your browser. 
                    <span className="text-foreground font-medium"> No uploads to servers, guaranteed.</span>
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4 pt-4">
                  <Button size="lg" asChild className="h-12 px-8 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                    <a href="#tools">Explore Tools</a>
                  </Button>
                  <Button variant="outline" size="lg" asChild className="h-12 px-8 rounded-xl bg-card border-border">
                    <a href="#how-it-works">Learn how it works</a>
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>

          <section id="how-it-works" className="py-20 border-y border-border bg-card/20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto text-center mb-12 space-y-4">
                <Badge variant="outline" className="text-primary border-primary/20">A simple, private workflow</Badge>
                <h2 className="text-3xl md:text-4xl font-bold">How CompressBit works</h2>
                <p className="text-muted-foreground leading-relaxed">Choose a tool, select a file from your device, and download the result when it is ready. File processing takes place in your browser, so there is no account setup or cloud upload queue.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: FileSearch, title: '1. Choose your file', text: 'Pick the PDF or image you want to compress, convert, organise, or protect. You can also drag files into a supported tool.' },
                  { icon: Zap, title: '2. Process in your browser', text: 'The selected tool uses your browser to transform the file. Processing speed depends on the file, your device, and the selected settings.' },
                  { icon: Download, title: '3. Save the result', text: 'Review the result and download it directly to your device. You stay in control of where your output is stored.' }
                ].map(({ icon: Icon, title, text }) => (
                  <Card key={title} className="p-7 bg-card border-border">
                    <Icon className="w-7 h-7 text-primary mb-5" />
                    <h3 className="text-lg font-bold mb-2">{title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Tools Grid */}
          <section id="tools" className="py-20 bg-card/30 border-y border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tools.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link 
                      to={tool.active ? tool.path : '#'} 
                      className={`block group h-full cursor-pointer pointer-events-${tool.active ? 'auto' : 'none'}`}
                    >
                      <Card className={`p-6 h-full flex flex-col space-y-4 bg-card border-border hover:border-primary/50 transition-all duration-300 relative overflow-hidden ${!tool.active ? 'opacity-75 grayscale-[0.5]' : 'hover:shadow-2xl hover:shadow-primary/5'}`}>
                        {!tool.active && (
                          <div className="absolute top-3 right-3">
                            <Badge variant="secondary" className="bg-muted text-muted-foreground border-none">Coming Soon</Badge>
                          </div>
                        )}
                        
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tool.color}`}>
                          <tool.icon className="w-6 h-6" />
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <h3 className="text-xl font-bold text-foreground flex items-center">
                            {tool.title}
                            {tool.active && <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {tool.description}
                          </p>
                        </div>

                        {tool.active && (
                          <div className="pt-4 flex items-center text-xs font-semibold text-primary">
                            <Zap className="w-3 h-3 mr-1" />
                            Processed Locally
                          </div>
                        )}
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1.1fr_.9fr] gap-12 items-start">
              <div className="space-y-5">
                <Badge variant="outline" className="text-primary border-primary/20">Made for everyday file tasks</Badge>
                <h2 className="text-3xl md:text-4xl font-bold">Useful when file size, sharing, or privacy matters</h2>
                <p className="text-muted-foreground leading-relaxed">CompressBit is designed for practical work: making a PDF small enough to attach to an email, preparing website images, combining scanned pages, or keeping a sensitive document protected before you share it.</p>
                <p className="text-muted-foreground leading-relaxed">Each tool explains its supported formats and options before you begin. For a deeper explanation of compression choices and browser-based privacy, visit our <Link to="/blog" className="text-primary font-semibold hover:underline">guides and resources</Link>.</p>
              </div>
              <Card className="p-7 bg-card border-border space-y-5">
                {[
                  'Reduce a large PDF before sending it by email or uploading it to a portal.',
                  'Resize and convert images for websites, forms, presentations, and social posts.',
                  'Merge, split, rotate, or reorder document pages without creating an account.',
                  'Use password protection or file encryption when you need an extra layer of control.'
                ].map((item) => <div key={item} className="flex gap-3 text-sm text-muted-foreground leading-relaxed"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" />{item}</div>)}
              </Card>
            </div>
          </section>

          {/* Highlight Section */}
          <section className="py-32">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="bg-gradient-to-br from-card to-background border-border overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                
                <div className="grid md:grid-cols-2 items-center p-8 md:p-12 gap-12">
                  <div className="space-y-6">
                    <Badge variant="outline" className="text-primary border-primary/20">The Privacy Promise</Badge>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                      Your files never touch our servers.
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Unlike other compression tools, CompressBit performs all operations directly in your browser's memory using WebAssembly and Javascript. Your data is never uploaded, stored, or seen by anyone.
                    </p>
                    <ul className="space-y-4">
                      {[
                        'Zero data retention',
                        'No login required',
                        'Works offline after loading',
                        'High-performance processing'
                      ].map((item) => (
                        <li key={item} className="flex items-center text-sm font-medium text-foreground">
                          <Sparkles className="w-4 h-4 mr-2 text-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="relative">
                    <div className="w-full aspect-square rounded-3xl bg-primary/5 flex items-center justify-center border border-primary/10 overflow-hidden">
                      <motion.div 
                        animate={{ 
                          scale: [1, 1.05, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 8,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <ShieldCheck className="w-32 h-32 text-primary/40" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          <section className="py-20 bg-card/30 border-y border-border">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <HelpCircle className="w-8 h-8 text-primary mx-auto mb-3" />
                <h2 className="text-3xl font-bold">Common questions</h2>
              </div>
              <div className="space-y-5">
                {[
                  ['Do I need an account?', 'No. CompressBit tools are available without account registration or a login.'],
                  ['Are my files uploaded to CompressBit?', 'The tools are designed to process selected files in your browser. The file itself is not sent to a CompressBit processing server. See our Privacy Policy for details about analytics and third-party services.'],
                  ['Which tool should I use?', 'Start with PDF Compressor or Image Compressor to reduce file size. Use Merge, Split, Organize, or Convert when you need to change the document structure or format.'],
                  ['Can I use CompressBit on mobile?', 'Yes. Modern mobile browsers can use the tools, although very large files may be faster and more reliable on a desktop computer.']
                ].map(([question, answer]) => <Card key={question} className="p-6 bg-card border-border"><h3 className="font-bold mb-2">{question}</h3><p className="text-sm text-muted-foreground leading-relaxed">{answer}</p></Card>)}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default DashboardPage;
