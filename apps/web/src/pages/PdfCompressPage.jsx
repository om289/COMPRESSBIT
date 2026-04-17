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
import { compressPdfClient } from '@/lib/pdf-compressor-client.js';

const PdfCompressPage = () => {
  const [compressionResult, setCompressionResult] = useState(null);

  const handleCompressionComplete = (result) => {
    if (result) {
      setCompressionResult(result);
    }
  };

  const handleDownload = () => {
    if (!compressionResult) return;
    
    const blob = compressionResult.compressedData;
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
      title: 'Fast local processing',
      description: 'Compress PDF files in seconds using your browser\'s power. No server waiting times.'
    },
    {
      icon: Shield,
      title: '100% Private',
      description: 'Your PDFs never leave your device. All compression happens locally in your browser.'
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

  return (
    <>
      <Helmet>
        <title>Compress PDF - CompressBit</title>
        <meta name="description" content="Compress PDF files instantly and privately in your browser. Fast, secure, and no uploads." />
      </Helmet>

      <div className="dark min-h-screen bg-background">
        <Header />

        <section className="relative pt-32 pb-16 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight">
                Compress PDF
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Shrink your PDF documents without compromising quality. <br className="hidden md:block" />
                <span className="text-primary font-medium">100% Private. No files uploaded to servers.</span>
              </p>
            </motion.div>
          </div>
        </section>

        <section id="compress" className="py-12 bg-card/30 border-y border-border backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
              {!compressionResult ? (
                <FileUploadZone 
                  type="pdf" 
                  compressionFn={compressPdfClient}
                  onCompressionComplete={handleCompressionComplete} 
                />
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

        {/* Features & How it works - Compact Versions */}
        <section className="py-20 bg-background border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <Card key={feature.title} className="p-8 bg-card border-border hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default PdfCompressPage;
