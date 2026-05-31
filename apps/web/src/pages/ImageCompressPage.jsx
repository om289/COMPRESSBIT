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
import { compressImageClient } from '@/lib/image-compressor-client.js';
import { getWebApplicationSchema } from '@/lib/seo-helper.js';
import { FAQAccordion } from '@/components/FAQAccordion.jsx';
import { trackEvent, trackPageView } from '@/lib/analytics.js';

const ImageCompressPage = () => {
  const [compressionResults, setCompressionResults] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [droppedFiles, setDroppedFiles] = useState(location.state?.droppedFiles || []);

  useEffect(() => {
    trackPageView('/image');
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

      trackEvent('compress_image_success', {
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
            toast.error(`Failed to compress image: ${res.error}`);
          } else {
            const savedPct = res.actualPercentage > 0 ? `${res.actualPercentage}%` : '0%';
            toast.success(`Image compressed successfully! (Reduced by ${savedPct})`);
          }
        } else {
          if (failCount > 0) {
            toast.success(`Compressed ${successCount} of ${results.length} images (Reduced total by ${totalSavedPct}%)`);
            toast.error(`Failed to compress ${failCount} image(s)`);
          } else {
            toast.success(`Successfully compressed all ${results.length} images! (Reduced total by ${totalSavedPct}%)`);
          }
        }
      } else {
        toast.error('Failed to compress the image file(s).');
      }
    }
  };

  const handleDownload = (index) => {
    if (!compressionResults || !compressionResults[index]) return;
    const result = compressionResults[index];
    if (!result.compressedData) return;

    trackEvent('compress_image_download', {
      fileName: result.fileName,
      size: result.compressedData.size,
      preset: result.preset
    });

    const blob = result.compressedData;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const type = blob.type.split('/')[1] || 'jpg';
    const fileNameBase = result.fileName.substring(0, result.fileName.lastIndexOf('.')) || result.fileName;
    link.download = `compressed-${fileNameBase}.${type}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`Downloaded ${result.fileName}`);
  };

  const handleDownloadAll = async () => {
    if (!compressionResults || compressionResults.length === 0) return;

    trackEvent('compress_image_download_all', {
      count: compressionResults.length
    });

    toast.info('Creating ZIP archive...');
    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();

    compressionResults.forEach((result) => {
      if (result.compressedData) {
        const type = result.compressedData.type.split('/')[1] || 'jpg';
        const fileNameBase = result.fileName.substring(0, result.fileName.lastIndexOf('.')) || result.fileName;
        zip.file(`compressed-${fileNameBase}.${type}`, result.compressedData);
      }
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'compressbit-images.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Downloaded compressbit-images.zip');
  };

  const handleReset = () => {
    trackEvent('compress_image_reset');
    setCompressionResults(null);
    toast.info('Cleared files and results');
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
      title: 'Batch Ready',
      description: 'Select multiple images at once and compress them all in a single batch — instantly in your browser.'
    }
  ];

  const faqs = [
    {
      question: "Which image formats are supported?",
      answer: "CompressBit supports standard web formats including PNG, JPG/JPEG, WebP, and SVG. Output formats can be tuned based on presets."
    },
    {
      question: "How does local image compression work?",
      answer: "The browser paints your image onto a 2D HTML5 canvas. Depending on the preset, it downscales high-resolution dimension bounds and recompiles the pixel data buffer using low-ratio lossy compression algorithms, keeping the final operations entirely in RAM."
    },
    {
      question: "Can I inspect the compression quality before downloading?",
      answer: "Yes! Once compression finishes, you can click on any image to open an interactive side-by-side comparison slider showing the original vs. compressed image."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Compress Image - Shrink PNG, JPG, WebP | CompressBit</title>
        <meta name="description" content="Compress images instantly and privately in your browser. Reduce file size of PNG, JPG, and WebP images local-first without quality loss." />
        
        {/* Open Graph / Social Sharing Tags */}
        <meta property="og:title" content="Compress Image - Shrink PNG, JPG, WebP | CompressBit" />
        <meta property="og:description" content="Compress images instantly and privately in your browser. Reduce file size of PNG, JPG, and WebP images local-first without quality loss." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.compressbit.com/image" />
        <meta property="og:image" content="https://www.compressbit.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Compress Image - Shrink PNG, JPG, WebP | CompressBit" />
        <meta name="twitter:description" content="Compress images instantly and privately in your browser. Reduce file size of PNG, JPG, and WebP images local-first without quality loss." />
        <meta name="twitter:image" content="https://www.compressbit.com/og-image.png" />
        
        <script type="application/ld+json">
          {JSON.stringify(getWebApplicationSchema(
            "Image Compressor",
            "/image",
            "Compress images instantly and privately in your browser. Reduce file size of PNG, JPG, and WebP images local-first without quality loss."
          ))}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background text-foreground pb-20 md:pb-0">
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
              {!compressionResults ? (
                <FileUploadZone 
                  type="image" 
                  compressionFn={compressImageClient}
                  onCompressionComplete={handleCompressionComplete} 
                  initialFiles={droppedFiles}
                />
              ) : (
                <CompressionResults
                  results={compressionResults}
                  preset={compressionResults[0]?.preset}
                  type="image"
                  onDownload={handleDownload}
                  onDownloadAll={handleDownloadAll}
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

            <FAQAccordion faqs={faqs} />
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default ImageCompressPage;
