import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Zap, Shield, UserCheck, Sparkles, Upload, Minimize2, Download, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import FileUploadZone from '@/components/FileUploadZone.jsx';
import CompressionResults from '@/components/CompressionResults.jsx';

const HomePage = () => {
  const [compressionResult, setCompressionResult] = useState(null);

  const handleCompressionComplete = (result) => {
    if (result) {
      setCompressionResult(result);
    }
  };

  const handleDownload = () => {
    if (!compressionResult) return;
    
    // The compressedData is already a Blob from the server response
    const blob = compressionResult.compressedData instanceof Blob 
      ? compressionResult.compressedData 
      : new Blob([compressionResult.compressedData], { type: 'application/pdf' });
      
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const suffix = compressionResult.actualPercentage > 0 ? '-compressed.pdf' : '-processed.pdf';
    link.download = `compressed-${compressionResult.fileName.replace('.pdf', '')}${suffix}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setCompressionResult(null);
  };

  const features = [
    {
      icon: Zap,
      title: 'Fast server processing',
      description: 'Compress PDF files in seconds with optimized backend algorithms that handle heavy lifting.'
    },
    {
      icon: Shield,
      title: 'Secure and private',
      description: 'Files are processed securely and deleted instantly from our servers after compression.'
    },
    {
      icon: UserCheck,
      title: 'No sign-up required',
      description: 'Start compressing immediately without creating an account or providing personal information.'
    },
    {
      icon: Sparkles,
      title: 'High quality output',
      description: 'Reduce file size while maintaining document quality and readability for all your needs.'
    }
  ];

  const steps = [
    {
      number: '01',
      icon: Upload,
      title: 'Upload your PDF',
      description: 'Drag and drop or click to select a PDF file from your device'
    },
    {
      number: '02',
      icon: Minimize2,
      title: 'Choose preset',
      description: 'Select from Good, Recommended, or Extreme compression levels'
    },
    {
      number: '03',
      icon: Download,
      title: 'Download result',
      description: 'Get your compressed PDF instantly and see how much space you saved'
    }
  ];

  return (
    <>
      <Helmet>
        <title>CompressBit - Compress PDFs instantly and securely</title>
        <meta name="description" content="Compress PDF files instantly. Fast, secure, and completely private PDF compression tool." />
      </Helmet>

      <div className="dark min-h-screen bg-background">
        <Header />

        <section id="hero" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1675361770627-763fd7dc3e6f"
              alt="Modern workspace with digital documents"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-background/90 backdrop-blur-[2px]"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight text-balance" style={{ letterSpacing: '-0.02em' }}>
                  Compress PDFs instantly, securely
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Reduce PDF file sizes safely. Files are processed fast and instantly deleted from our servers.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 active:scale-[0.98] text-lg px-8 h-14"
                >
                  <a href="#compress">
                    Start compressing
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="transition-all duration-200 active:scale-[0.98] text-lg px-8 h-14 bg-card/50 backdrop-blur-sm"
                >
                  <a href="#features">Learn more</a>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="compress" className="py-24 bg-card">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance" style={{ letterSpacing: '-0.02em' }}>
                Compress your PDF
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Upload your file to get started. Secure, fast, and optimized.
              </p>
            </motion.div>

            <div className="space-y-6">
              {!compressionResult ? (
                <FileUploadZone onCompressionComplete={handleCompressionComplete} />
              ) : (
                <CompressionResults
                  originalSize={compressionResult.originalSize}
                  compressedSize={compressionResult.compressedSize}
                  actualPercentage={compressionResult.actualPercentage}
                  fileName={compressionResult.fileName}
                  preset={compressionResult.preset}
                  onDownload={handleDownload}
                  onReset={handleReset}
                />
              )}
            </div>
          </div>
        </section>

        <section id="features" className="py-24 bg-background border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance" style={{ letterSpacing: '-0.02em' }}>
                Why choose CompressBit
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Built with privacy and performance in mind
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="p-8 h-full bg-card border-border hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-24 bg-card border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance" style={{ letterSpacing: '-0.02em' }}>
                How it works
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Three simple steps to optimize your files
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="text-center space-y-6">
                    <div className="relative inline-block">
                      <div className="text-7xl font-extrabold text-primary/10 select-none" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {step.number}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center pt-2">
                        <div className="w-16 h-16 rounded-2xl bg-background border border-border shadow-sm flex items-center justify-center">
                          <step.icon className="w-8 h-8 text-primary" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                      <p className="text-muted-foreground leading-relaxed px-4">{step.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-32 bg-background border-t border-border relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[120px] pointer-events-none rounded-full" />
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance" style={{ letterSpacing: '-0.02em' }}>
                Ready to shrink your PDFs?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Join thousands of users who optimize their documents securely every day.
              </p>
              <div className="pt-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 active:scale-[0.98] text-lg px-10 h-14 shadow-xl shadow-primary/20"
                >
                  <a href="#compress">
                    Get started now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default HomePage;