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
  Github
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
      id: 'pdf',
      title: 'PDF Compressor',
      description: 'Optimize PDF files with advanced rasterization. Perfect for large documents.',
      icon: FileText,
      path: '/pdf',
      color: 'bg-red-500/10 text-red-500',
      active: true
    },
    {
      id: 'image',
      title: 'Image Compressor',
      description: 'Compress JPG, PNG, and WebP images while maintaining high visual quality.',
      icon: ImageIcon,
      path: '/image',
      color: 'bg-blue-500/10 text-blue-500',
      active: true
    },
    {
      id: 'merge',
      title: 'PDF Merger',
      description: 'Combine multiple PDF files into a single document. Coming soon.',
      icon: Layers,
      path: '#',
      color: 'bg-purple-500/10 text-purple-500',
      active: false
    },
    {
      id: 'encrypt',
      title: 'File Encryptor',
      description: 'Secure your files with client-side AES-256 encryption. Coming soon.',
      icon: Lock,
      path: '#',
      color: 'bg-emerald-500/10 text-emerald-500',
      active: false
    }
  ];

  return (
    <>
      <Helmet>
        <title>CompressBit - Professional Client-Side Tools</title>
        <meta name="description" content="100% Private, client-side file compression and optimization tools. Files never leave your browser." />
      </Helmet>

      <div className="dark min-h-screen bg-background">
        <Header />

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
                <Button variant="outline" size="lg" className="h-12 px-8 rounded-xl bg-card border-border">
                  Learn how it works
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tools Grid */}
        <section id="tools" className="py-20 bg-card/30 border-y border-border backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        <Footer />
      </div>
    </>
  );
};

export default DashboardPage;
