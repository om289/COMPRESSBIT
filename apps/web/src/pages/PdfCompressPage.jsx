import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Zap, Shield, UserCheck, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import FileUploadZone from '@/components/FileUploadZone.jsx';
import CompressionResults from '@/components/CompressionResults.jsx';
import { compressPdfClient } from '@/lib/pdf-compressor-client.js';
import { getWebApplicationSchema } from '@/lib/seo-helper.js';
import { FAQAccordion } from '@/components/FAQAccordion.jsx';
import { trackEvent, trackPageView } from '@/lib/analytics.js';

const PdfCompressPage = () => {
  const [compressionResults, setCompressionResults] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [droppedFiles, setDroppedFiles] = useState(location.state?.droppedFiles || []);

  useEffect(() => {
    trackPageView('/pdf');
  }, []);

  useEffect(() => {
    if (location.state?.droppedFiles) {
      setDroppedFiles(location.state.droppedFiles);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleCompressionComplete = (results) => {
    if (results && results.length > 0) {
      setCompressionResults(results);
      
      const successCount = results.filter(r => !r.error).length;
      const failCount = results.filter(r => r.error).length;
      
      let totalOriginal = 0;
      let totalCompressed = 0;
      results.forEach(r => {
        if (!r.error) {
          totalOriginal += r.originalSize;
          totalCompressed += r.compressedSize;
        }
      });
      const totalSavedPct = totalOriginal > 0 ? (((totalOriginal - totalCompressed) / totalOriginal) * 100).toFixed(1) : 0;

      trackEvent('compress_pdf_success', {
        count: results.length,
        success_count: successCount,
        fail_count: failCount,
        original_size_bytes: totalOriginal,
        compressed_size_bytes: totalCompressed,
        saved_percent: totalSavedPct,
        preset: results[0]?.preset || 'default'
      });

      if (successCount > 0) {
        if (results.length === 1) {
          const res = results[0];
          if (res.error) {
            toast.error(`Failed to compress PDF: ${res.error}`);
          } else {
            const savedPct = res.actualPercentage > 0 ? `${res.actualPercentage}%` : '0%';
            toast.success(`PDF compressed successfully! (Reduced by ${savedPct})`);
          }
        } else {
          if (failCount > 0) {
            toast.success(`Compressed ${successCount} of ${results.length} PDFs (Reduced total by ${totalSavedPct}%)`);
            toast.error(`Failed to compress ${failCount} PDF(s)`);
          } else {
            toast.success(`Successfully compressed all ${results.length} PDFs! (Reduced total by ${totalSavedPct}%)`);
          }
        }
      } else {
        toast.error('Failed to compress the PDF file(s).');
      }
    }
  };

  const handleDownload = (index) => {
    if (!compressionResults || !compressionResults[index]) return;
    const result = compressionResults[index];
    if (!result.compressedData) return;

    trackEvent('compress_pdf_download', {
      fileName: result.fileName,
      size: result.compressedData.size,
      preset: result.preset
    });

    const blob = result.compressedData;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const suffix = result.actualPercentage > 0 ? '-compressed.pdf' : '-processed.pdf';
    link.download = `compressed-${result.fileName.replace('.pdf', '')}${suffix}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`Downloaded ${result.fileName}`);
  };

  const handleDownloadAll = async () => {
    if (!compressionResults || compressionResults.length === 0) return;

    trackEvent('compress_pdf_download_all', {
      count: compressionResults.length
    });

    toast.info('Creating ZIP archive...');
    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();

    compressionResults.forEach((result) => {
      if (result.compressedData) {
        const suffix = result.actualPercentage > 0 ? '-compressed.pdf' : '-processed.pdf';
        const name = `compressed-${result.fileName.replace('.pdf', '')}${suffix}`;
        zip.file(name, result.compressedData);
      }
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'compressbit-pdfs.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Downloaded compressbit-pdfs.zip');
  };

  const handleReset = () => {
    trackEvent('compress_pdf_reset');
    setCompressionResults(null);
    toast.info('Cleared files and results');
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

  const faqs = [
    {
      question: "Is it safe to compress my PDFs here?",
      answer: "Yes, 100% safe. Unlike other online tools, CompressBit processes your files entirely on your local machine using client-side JavaScript. Your files are never uploaded to any server, keeping your sensitive information completely private."
    },
    {
      question: "Will the PDF lose quality after compression?",
      answer: "We offer multiple compression presets. The 'Good' quality setting reduces file size using lossless structural optimizations like subsetting fonts and removing duplicate elements. The 'Extreme' setting uses lossy compression to resize and downsample images, which significantly reduces file size with minimal visual degradation."
    },
    {
      question: "What is the maximum file size limit?",
      answer: "Since compression runs locally in your browser's memory, there are no hard platform limits! It is only restricted by your computer's RAM. We recommend compressing files up to 2GB for the smoothest experience."
    },
    {
      question: "Can I compress multiple PDFs at once?",
      answer: "Absolutely. You can drag and drop multiple PDF files into the upload zone to compress them simultaneously. Once completed, you can download them individually or as a single ZIP package."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Compress PDF - Free & Local | CompressBit</title>
        <meta name="description" content="Compress PDF files instantly and privately in your browser. Shrink PDF file sizes locally without uploading them to external servers." />
        
        {/* Open Graph / Social Sharing Tags */}
        <meta property="og:title" content="Compress PDF - Free & Local | CompressBit" />
        <meta property="og:description" content="Compress PDF files instantly and privately in your browser. Shrink PDF file sizes locally without uploading them to external servers." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.compressbit.com/pdf" />
        <meta property="og:image" content="https://www.compressbit.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Compress PDF - Free & Local | CompressBit" />
        <meta name="twitter:description" content="Compress PDF files instantly and privately in your browser. Shrink PDF file sizes locally without uploading them to external servers." />
        <meta name="twitter:image" content="https://www.compressbit.com/og-image.png" />
        
        <script type="application/ld+json">
          {JSON.stringify(getWebApplicationSchema(
            "PDF Compressor",
            "/pdf",
            "Compress PDF files instantly and privately in your browser. Shrink PDF file sizes locally without uploading them to external servers."
          ))}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between pb-20 md:pb-0">
        <Header />

        <main className="flex-grow">
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

          <section id="compress" className="py-12 bg-card/30 border-y border-border">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="space-y-6">
                {!compressionResults ? (
                  <FileUploadZone 
                    type="pdf" 
                    compressionFn={compressPdfClient}
                    onCompressionComplete={handleCompressionComplete} 
                    initialFiles={droppedFiles}
                  />
                ) : (
                  <CompressionResults
                    results={compressionResults}
                    preset={compressionResults[0]?.preset}
                    type="pdf"
                    onDownload={handleDownload}
                    onDownloadAll={handleDownloadAll}
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

              <FAQAccordion faqs={faqs} />
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PdfCompressPage;
