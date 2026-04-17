import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Zap, Shield, UserCheck, Sparkles, Upload, Minimize2, Download, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import FileUploadZone from '@/components/FileUploadZone.jsx';
import CompressionResults from '@/components/CompressionResults.jsx';
import { compressImageClient } from '@/lib/image-compressor-client.js';

const ImageCompressPage = () => {
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
    
    // Determine extension from blob type or keep original but add suffix
    const type = blob.type.split('/')[1] || 'jpg';
    const fileNameBase = compressionResult.fileName.substring(0, compressionResult.fileName.lastIndexOf('.')) || compressionResult.fileName;
    
    link.download = `compressed-${fileNameBase}.${type}`;
    
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
      title: 'Lossy & Lossless Presets',
      description: 'Choose from multiple levels of compression to balance file size and visual fidelity.'
    },
    {
      icon: Shield,
      title: 'Private Browser Engine',
      description: 'Your photos and sensitive images never leave your computer. 100% Client-side.'
    },
    {
      icon: UserCheck,
      title: 'Universal Support',
      description: 'Works with JPG, PNG, and WebP. Automatically optimizes for the best output format.'
    },
    {
      icon: Sparkles,
      title: 'Bulk Ready',
      description: 'Optimized for speed, allowing you to compress large images instantly in your browser.'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Compress Images - JPG, PNG, WebP Optimization | CompressBit</title>
        <meta name="description" content="Compress JPG and PNG images instantly. Secure, private, and 100% client-side image optimization tool." />
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
                Compress Images
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Optimize JPG, PNG, and WebP images with ease. <br className="hidden md:block" />
                <span className="text-primary font-medium">Your images stay on your device. Zero server uploads.</span>
              </p>
            </motion.div>
          </div>
        </section>

        <section id="compress" className="py-12 bg-card/30 border-y border-border backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
              {!compressionResult ? (
                <FileUploadZone 
                  type="image" 
                  compressionFn={compressImageClient}
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

export default ImageCompressPage;
