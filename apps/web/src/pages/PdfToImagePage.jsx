import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import {
  FileText, Upload, X, ImageIcon, ArrowRight, AlertCircle,
  CheckCircle2, Download, Plus, Loader2, Shield, Zap,
  UserCheck, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { convertPdfToImages } from '@/lib/pdf-to-image-client.js';
import { getWebApplicationSchema } from '@/lib/seo-helper.js';
import { FAQAccordion } from '@/components/FAQAccordion.jsx';
import { trackEvent, trackPageView } from '@/lib/analytics.js';

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(i >= 2 ? 1 : 0) + ' ' + units[i];
};

const PdfToImagePage = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [error, setError] = useState('');

  // Conversion configurations
  const [format, setFormat] = useState('png'); // 'png' or 'jpeg'
  const [scale, setScale] = useState(1.5); // 1.0, 1.5, 2.0, 3.0
  const [rangeInput, setRangeInput] = useState('');
  const [result, setResult] = useState(null); // { name: string, blob: Blob, count: number }

  const fileInputRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    trackPageView('/pdf/to-image');
  }, []);

  useEffect(() => {
    if (location.state?.droppedFiles && location.state.droppedFiles.length > 0) {
      handleFileSelect(location.state.droppedFiles);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleFileSelect = (files) => {
    if (!files || files.length === 0) return;
    const selectedFile = files[0];

    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a valid PDF document.');
      return;
    }

    if (selectedFile.size > 100 * 1024 * 1024) {
      setError('File size exceeds the 100MB limit.');
      return;
    }

    setError('');
    setFile(selectedFile);
    setResult(null);
    setProgress(0);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsConverting(true);
    setError('');
    setProgress(0);
    setProgressLabel('Initializing conversion...');

    try {
      const images = await convertPdfToImages(
        file,
        { format, scale, rangeStr: rangeInput },
        (pct, label) => {
          setProgress(pct);
          setProgressLabel(label);
        }
      );

      trackEvent('pdf_to_image_success', {
        format,
        scale,
        count: images.length
      });

      if (images.length === 1) {
        setResult({
          name: images[0].name,
          blob: images[0].blob,
          count: 1,
          isZip: false
        });
        toast.success('Successfully converted PDF page to image!');
      } else {
        setProgressLabel('Creating ZIP archive...');
        const { default: JSZip } = await import('jszip');
        const zip = new JSZip();

        images.forEach((img) => {
          zip.file(img.name, img.blob);
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
          setProgress(90 + Math.round(metadata.percent / 10));
        });

        setResult({
          name: `${file.name.replace(/\.pdf$/i, '')}-images.zip`,
          blob: zipBlob,
          count: images.length,
          isZip: true
        });
        toast.success(`Successfully converted ${images.length} pages to images!`);
      }
    } catch (err) {
      const errMsg = err.message || 'Failed to convert PDF.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    trackEvent('pdf_to_image_download', {
      isZip: result.isZip,
      count: result.count,
      size: result.blob.size
    });
    const url = URL.createObjectURL(result.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${result.name}`);
  };

  const handleReset = () => {
    trackEvent('pdf_to_image_reset');
    setFile(null);
    setResult(null);
    setFormat('png');
    setScale(1.5);
    setRangeInput('');
    setProgress(0);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.info('Cleared current file');
  };

  const features = [
    {
      icon: Shield,
      title: 'Local Privacy',
      description: 'Images are generated 100% inside your browser. No files are uploaded to our servers.'
    },
    {
      icon: ImageIcon,
      title: 'PNG or JPG Formats',
      description: 'Convert to PNG for transparent/vector fidelity, or JPG for lightweight image sizes.'
    },
    {
      icon: Zap,
      title: 'Resolution Controls',
      description: 'Choose scale multipliers (up to 3x) to render ultra-sharp, high-resolution pages.'
    },
    {
      icon: UserCheck,
      title: 'Unlimited Free Conversions',
      description: 'Convert document after document without worrying about limits, signups, or fees.'
    }
  ];

  const faqs = [
    {
      question: "What image formats can I export my PDF pages to?",
      answer: "You can convert PDF pages to standard JPG/JPEG or high-resolution PNG. PNG is best for preserving vector lines and graphics, while JPG is best for smaller file sizes."
    },
    {
      question: "Is the conversion processed on a remote server?",
      answer: "No. The entire process runs 100% inside your browser. The PDF page images are rendered locally onto HTML5 canvas nodes using the PDF.js engine, ensuring absolute privacy."
    },
    {
      question: "Can I choose the resolution of the output images?",
      answer: "Yes, you can adjust the scale multiplier. Options range from 1x to 3x. Selecting 2x or 3x results in ultra-crisp, high-DPI renders ideal for zoomable displays or printing."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Convert PDF to Image - JPG or PNG Free | CompressBit</title>
        <meta name="description" content="Convert your PDF pages into high-quality PNG or JPG images instantly in your browser. 100% free, private, and secure." />
        
        {/* Open Graph / Social Sharing Tags */}
        <meta property="og:title" content="Convert PDF to Image - JPG or PNG Free | CompressBit" />
        <meta property="og:description" content="Convert your PDF pages into high-quality PNG or JPG images instantly in your browser. 100% free, private, and secure." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.compressbit.com/pdf/to-image" />
        <meta property="og:image" content="https://www.compressbit.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Convert PDF to Image - JPG or PNG Free | CompressBit" />
        <meta name="twitter:description" content="Convert your PDF pages into high-quality PNG or JPG images instantly in your browser. 100% free, private, and secure." />
        <meta name="twitter:image" content="https://www.compressbit.com/og-image.png" />
        
        <script type="application/ld+json">
          {JSON.stringify(getWebApplicationSchema(
            "PDF to Image Converter",
            "/pdf/to-image",
            "Convert your PDF pages into high-quality PNG or JPG images instantly in your browser. 100% free, private, and secure."
          ))}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between pb-20 md:pb-0">
        <Header />

        <main className="flex-grow">
          {/* Hero */}
          <section className="relative pt-32 pb-16 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight">
                  PDF to Image
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Convert PDF pages to crisp PNG or JPG images entirely in your browser. <br className="hidden md:block" />
                  <span className="text-primary font-medium">Fast, secure, and private.</span>
                </p>
              </motion.div>
            </div>
          </section>

          {/* Action Section */}
          <section className="py-12 bg-card/30 border-y border-border">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="space-y-6">

                {/* Completed Result */}
                {result && !isConverting && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 md:p-12 bg-card border border-border rounded-3xl shadow-lg max-w-2xl mx-auto w-full"
                  >
                    <div className="flex flex-col items-center text-center space-y-6">
                      <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground">Conversion Complete!</h3>
                      
                      <div className="grid grid-cols-2 gap-8 w-full py-4 border-y border-border">
                        <div className="text-center">
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Images Converted</div>
                          <div className="text-2xl font-bold text-primary mt-1">{result.count}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">File Size</div>
                          <div className="text-2xl font-bold text-foreground mt-1">{formatSize(result.blob.size)}</div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full">
                        <Button
                          size="lg"
                          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-lg h-14 shadow-lg shadow-primary/20 active:scale-[0.98]"
                          onClick={handleDownload}
                        >
                          <Download className="w-5 h-5 mr-2" />
                          {result.isZip ? 'Download Images (ZIP)' : 'Download Image'}
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={handleReset}
                          className="sm:w-40 bg-card h-14 active:scale-[0.98]"
                        >
                          Convert Another
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Progress UI */}
                {isConverting && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 md:p-12 bg-card border border-border rounded-3xl shadow-lg max-w-2xl mx-auto w-full"
                  >
                    <div className="flex flex-col items-center justify-center space-y-8 text-center">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-muted flex items-center justify-center">
                          <ImageIcon className="w-10 h-10 text-primary animate-pulse" />
                        </div>
                        <svg className="absolute inset-0 w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50" cy="50" r="46"
                            fill="none" stroke="currentColor" strokeWidth="4"
                            className="text-primary transition-all duration-300 ease-out"
                            strokeDasharray={`${progress * 2.89} 289`}
                          />
                        </svg>
                      </div>
                      <div className="space-y-3 w-full">
                        <h3 className="text-xl font-bold text-foreground">Converting PDF Pages</h3>
                        <p className="text-sm text-muted-foreground h-5">{progressLabel}</p>
                      </div>
                      <div className="w-full space-y-2">
                        <div className="flex justify-between text-xs font-medium text-muted-foreground px-1">
                          <span>Progress</span>
                          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Upload Drop Zone (Empty State) */}
                {!file && !isConverting && !result && (
                  <motion.div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                    onDrop={handleDrop}
                    whileHover={{ scale: 1.01 }}
                    className={`relative border-2 border-dashed rounded-3xl p-16 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center ${
                      isDragging
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 bg-card/50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => handleFileSelect(e.target.files)}
                      className="hidden"
                    />
                    
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 ${
                      isDragging ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-muted text-muted-foreground shadow-sm'
                    }`}>
                      {isDragging ? <ImageIcon className="w-10 h-10" /> : <Upload className="w-10 h-10" />}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      {isDragging ? 'Drop your PDF here' : 'Drag and drop your PDF'}
                    </h3>
                    <p className="text-base text-muted-foreground mb-8">
                      or click to browse your device
                    </p>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="pointer-events-none bg-background shadow-sm px-8 h-12"
                    >
                      Select PDF File
                    </Button>
                    
                    <p className="text-sm text-muted-foreground mt-6 font-medium">
                      Supports: .pdf (Max 100MB)
                    </p>
                  </motion.div>
                )}

                {/* Configurations Panel */}
                {file && !isConverting && !result && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* File Metadata Card */}
                    <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-2xl">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-red-500" />
                        </div>
                        <div className="truncate pr-4">
                          <p className="text-sm font-semibold text-foreground truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleReset}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 rounded-xl w-8 h-8"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Settings Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border border-border bg-muted/10 rounded-2xl">
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground">Output Format</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setFormat('png')}
                            className={`py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                              format === 'png'
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'bg-card border-border text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            PNG (Lossless)
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormat('jpeg')}
                            className={`py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                              format === 'jpeg'
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'bg-card border-border text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            JPEG (Compressed)
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground">Resolution Scale</label>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { val: 1.0, label: '1x (Low)' },
                            { val: 1.5, label: '1.5x' },
                            { val: 2.0, label: '2x (HD)' },
                            { val: 3.0, label: '3x (UHD)' }
                          ].map((opt) => (
                            <button
                              key={opt.val}
                              type="button"
                              onClick={() => setScale(opt.val)}
                              className={`py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                                scale === opt.val
                                  ? 'bg-primary border-primary text-primary-foreground'
                                  : 'bg-card border-border text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-semibold text-foreground">Page Range (Optional)</label>
                        <input
                          type="text"
                          value={rangeInput}
                          onChange={(e) => setRangeInput(e.target.value)}
                          placeholder="e.g. 1-3, 5 (Leave empty to convert all pages)"
                          className="w-full h-12 px-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 text-sm font-medium"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-center justify-center space-x-2 text-destructive bg-destructive/10 p-4 rounded-xl border border-destructive/20">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                      </div>
                    )}

                    <div className="flex gap-4 pt-2">
                      <Button
                        size="lg"
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 text-lg h-14 shadow-lg shadow-primary/20 active:scale-[0.98]"
                        onClick={handleConvert}
                      >
                        <ImageIcon className="w-5 h-5 mr-2" />
                        Convert to Image
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={handleReset}
                        className="sm:w-32 bg-card h-14 active:scale-[0.98]"
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}

              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section className="py-20 bg-background border-t border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {features.map((feature) => (
                  <Card key={feature.title} className="p-8 bg-card border-border hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                        <p className="text-muted-foreground leading-relaxed mt-1">{feature.description}</p>
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

export default PdfToImagePage;
