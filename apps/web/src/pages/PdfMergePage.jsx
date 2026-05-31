import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  FileText, Upload, X, Layers, ArrowRight, GripVertical,
  AlertCircle, CheckCircle2, Download, Plus, Loader2,
  Shield, Zap, UserCheck, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { mergePdfs } from '@/lib/pdf-merger-client.js';
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

let fileIdCounter = 0;

const PdfMergePage = () => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [dragSrcId, setDragSrcId] = useState(null);
  const fileInputRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  const validateAndAddFiles = useCallback((newFiles) => {
    setError('');
    const validFiles = [];

    for (const file of newFiles) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setError(`"${file.name}" is not a PDF file. Skipped.`);
        continue;
      }
      if (file.size > 100 * 1024 * 1024) {
        setError(`"${file.name}" is too large (max 100 MB). Skipped.`);
        continue;
      }
      if (file.size === 0) {
        setError(`"${file.name}" appears to be empty. Skipped.`);
        continue;
      }
      validFiles.push({ id: ++fileIdCounter, file, name: file.name, size: file.size });
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      setResult(null);
    }
  }, []);

  useEffect(() => {
    trackPageView('/pdf/merge');
  }, []);

  useEffect(() => {
    if (location.state?.droppedFiles && location.state.droppedFiles.length > 0) {
      validateAndAddFiles(location.state.droppedFiles);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, validateAndAddFiles]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      validateAndAddFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files.length > 0) {
      validateAndAddFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  // --- Drag reorder ---
  const handleDragStart = (id) => {
    setDragSrcId(id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleReorderDrop = (targetId) => {
    if (dragSrcId === null || dragSrcId === targetId) return;
    setFiles(prev => {
      const arr = [...prev];
      const srcIdx = arr.findIndex(f => f.id === dragSrcId);
      const targetIdx = arr.findIndex(f => f.id === targetId);
      if (srcIdx === -1 || targetIdx === -1) return prev;
      const [item] = arr.splice(srcIdx, 1);
      arr.splice(targetIdx, 0, item);
      return arr;
    });
    setDragSrcId(null);
  };

  // --- Merge ---
  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please add at least 2 PDF files to merge.');
      return;
    }

    setIsMerging(true);
    setError('');
    setProgress(0);
    setProgressLabel('Starting merge...');

    try {
      const mergeResult = await mergePdfs(
        files.map(f => f.file),
        (pct, label) => {
          setProgress(pct);
          setProgressLabel(label);
        }
      );

      setResult(mergeResult);
      setIsMerging(false);
      trackEvent('merge_pdf_success', {
        count: files.length,
        total_size_bytes: files.reduce((sum, f) => sum + f.size, 0)
      });
      toast.success(`Successfully merged ${files.length} PDF files!`);
    } catch (err) {
      const errMsg = err.message || 'Merge failed. Please try again.';
      setError(errMsg);
      setIsMerging(false);
      toast.error(errMsg);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    trackEvent('merge_pdf_download', {
      size: result.blob.size
    });
    const url = URL.createObjectURL(result.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'merged.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Downloaded merged.pdf');
  };

  const handleReset = () => {
    trackEvent('merge_pdf_reset');
    setFiles([]);
    setResult(null);
    setError('');
    setProgress(0);
    setIsMerging(false);
    fileIdCounter = 0;
    toast.info('Reset merge flow');
  };

  const features = [
    {
      icon: Shield,
      title: '100% Private',
      description: 'Your PDFs never leave your device. All merging happens locally in your browser.'
    },
    {
      icon: Zap,
      title: 'Zero quality loss',
      description: 'Pages are copied exactly as-is. No re-rendering, no compression, no quality degradation.'
    },
    {
      icon: UserCheck,
      title: 'No sign-up required',
      description: 'Start merging immediately without creating an account or providing personal information.'
    },
    {
      icon: Sparkles,
      title: 'Drag to reorder',
      description: 'Easily rearrange your files by dragging them into the order you want before merging.'
    }
  ];

  const faqs = [
    {
      question: "How does CompressBit merge PDFs without uploading them?",
      answer: "We use client-side libraries (like pdf-lib) that run directly in your browser's execution engine. The code reads the binary data arrays of your files, arranges the page layouts in memory, and compiles them into a single file without communicating with a backend server."
    },
    {
      question: "Can I rearrange the order of the PDFs before merging?",
      answer: "Yes, absolutely! You can drag and drop the file cards up or down to adjust their ordering. The merged document will follow the exact order shown in the interface."
    },
    {
      question: "Is there a limit to how many PDFs I can combine?",
      answer: "No, there are no software limits. It is only restricted by your computer's browser memory (RAM) capacity. We suggest compiling documents up to a total of 500 pages for optimal speed."
    },
    {
      question: "Will the visual quality of my PDFs degrade after merging?",
      answer: "No. The pages from your documents are copied as raw, uncompressed byte streams. They are not re-encoded, which ensures zero quality degradation."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Merge PDF - Combine PDF Files Free & Local | CompressBit</title>
        <meta name="description" content="Merge multiple PDF files into one single document instantly in your browser. 100% free, private, and secure. Drag and drop to reorder pages." />
        
        {/* Open Graph / Social Sharing Tags */}
        <meta property="og:title" content="Merge PDF - Combine PDF Files Free & Local | CompressBit" />
        <meta property="og:description" content="Merge multiple PDF files into one single document instantly in your browser. 100% free, private, and secure. Drag and drop to reorder pages." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.compressbit.com/pdf/merge" />
        <meta property="og:image" content="https://www.compressbit.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Merge PDF - Combine PDF Files Free & Local | CompressBit" />
        <meta name="twitter:description" content="Merge multiple PDF files into one single document instantly in your browser. 100% free, private, and secure. Drag and drop to reorder pages." />
        <meta name="twitter:image" content="https://www.compressbit.com/og-image.png" />
        
        <script type="application/ld+json">
          {JSON.stringify(getWebApplicationSchema(
            "PDF Merger",
            "/pdf/merge",
            "Merge multiple PDF files into one single document instantly in your browser. 100% free, private, and secure. Drag and drop to reorder pages."
          ))}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background text-foreground pb-20 md:pb-0">
        <Header />

        {/* Hero */}
        <section className="relative pt-32 pb-16 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight">
                Merge PDF
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Combine multiple PDF files into one document. Drag to reorder. <br className="hidden md:block" />
                <span className="text-primary font-medium">100% Private. Zero quality loss.</span>
              </p>
            </motion.div>
          </div>
        </section>

        {/* Merge Section */}
        <section id="merge" className="py-12 bg-card/30 border-y border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Result view */}
            {result && !isMerging && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 md:p-12 bg-card border border-border rounded-3xl shadow-lg max-w-2xl mx-auto w-full"
              >
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Merge Complete!</h3>
                  
                  <div className="grid grid-cols-3 gap-6 w-full pt-2">
                    <div className="text-center">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Files</div>
                      <div className="text-2xl font-bold text-primary mt-1">{result.fileCount}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pages</div>
                      <div className="text-2xl font-bold text-primary mt-1">{result.totalPages}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Size</div>
                      <div className="text-2xl font-bold text-foreground mt-1">{formatSize(result.size)}</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full">
                    <Button
                      size="lg"
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-lg h-14 shadow-lg shadow-primary/20 active:scale-[0.98]"
                      onClick={handleDownload}
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Merged PDF
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleReset}
                      className="sm:w-40 bg-card h-14 active:scale-[0.98]"
                    >
                      Merge More
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Merging progress */}
            {isMerging && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 md:p-12 bg-card border border-border rounded-3xl shadow-lg max-w-2xl mx-auto w-full"
              >
                <div className="flex flex-col items-center justify-center space-y-8 text-center">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-muted flex items-center justify-center">
                      <Layers className="w-10 h-10 text-primary animate-pulse" />
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
                    <h3 className="text-xl font-bold text-foreground">Merging PDFs</h3>
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

            {/* Upload + file list */}
            {!result && !isMerging && (
              <div className="space-y-6">
                {/* Drop zone */}
                <motion.div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                  onDrop={handleDrop}
                  whileHover={{ scale: 1.01 }}
                  className={`relative border-2 border-dashed rounded-3xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center ${
                    files.length > 0 ? 'p-8' : 'p-16'
                  } ${
                    isDragging
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 bg-card/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  
                  <div className={`rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300 ${
                    files.length > 0 ? 'w-14 h-14' : 'w-20 h-20 mb-6'
                  } ${
                    isDragging ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-muted text-muted-foreground shadow-sm'
                  }`}>
                    {isDragging ? <Layers className="w-8 h-8" /> : <Upload className={files.length > 0 ? 'w-7 h-7' : 'w-10 h-10'} />}
                  </div>
                  
                  <h3 className={`font-bold text-foreground mb-2 ${files.length > 0 ? 'text-lg' : 'text-2xl'}`}>
                    {isDragging ? 'Drop your PDFs here' : files.length > 0 ? 'Add more PDFs' : 'Drag and drop your PDFs'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {files.length > 0 ? 'or click to browse' : 'or click to browse your device'}
                  </p>
                  
                  {files.length === 0 && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        className="pointer-events-none bg-background shadow-sm px-8 h-12 mt-6"
                      >
                        Select PDF files
                      </Button>
                      <p className="text-sm text-muted-foreground mt-6 font-medium">
                        Supports: .pdf (Max 100MB each) • Select multiple files
                      </p>
                    </>
                  )}
                </motion.div>

                {/* File list */}
                <AnimatePresence>
                  {files.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      {files.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          draggable
                          onDragStart={() => handleDragStart(item.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => { e.preventDefault(); handleReorderDrop(item.id); }}
                          className={`flex items-center gap-3 p-3 bg-card border border-border rounded-2xl cursor-grab active:cursor-grabbing transition-all duration-200 hover:border-primary/30 ${
                            dragSrcId === item.id ? 'opacity-40 scale-[0.98]' : ''
                          }`}
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                          
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary">{index + 1}</span>
                          </div>
                          
                          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-red-500" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{formatSize(item.size)}</p>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); removeFile(item.id); }}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 rounded-xl w-8 h-8"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error */}
                {error && (
                  <div className="flex items-center justify-center space-x-2 text-destructive bg-destructive/10 p-4 rounded-xl border border-destructive/20">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                {/* Merge button */}
                {files.length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row gap-4 pt-2"
                  >
                    <Button
                      size="lg"
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 text-lg h-14 shadow-lg shadow-primary/20 active:scale-[0.98]"
                      onClick={handleMerge}
                    >
                      <Layers className="w-5 h-5 mr-2" />
                      Merge {files.length} PDFs
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleReset}
                      className="sm:w-32 bg-card h-14 active:scale-[0.98]"
                    >
                      Clear All
                    </Button>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Features */}
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

export default PdfMergePage;
