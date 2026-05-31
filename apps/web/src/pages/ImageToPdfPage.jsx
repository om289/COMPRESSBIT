import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Upload, X, ImageIcon, ArrowRight, AlertCircle,
  CheckCircle2, Download, Plus, Loader2, Shield, Zap,
  UserCheck, Sparkles, GripVertical, FileSpreadsheet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { convertImagesToPdf } from '@/lib/image-to-pdf-client.js';

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(i >= 2 ? 1 : 0) + ' ' + units[i];
};

let imageIdCounter = 0;

const ImageToPdfPage = () => {
  const [images, setImages] = useState([]); // Array of { id: number, file: File, preview: string }
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [error, setError] = useState('');

  // Configurations
  const [pageSize, setPageSize] = useState('a4'); // 'a4' | 'letter' | 'fit'
  const [margin, setMargin] = useState('none'); // 'none' | 'small' | 'large'
  const [orientation, setOrientation] = useState('auto'); // 'auto' | 'portrait' | 'landscape'

  const [dragSrcId, setDragSrcId] = useState(null);
  const [result, setResult] = useState(null); // { blob: Blob, name: string, pageCount: number }

  const fileInputRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  const validateAndAddImages = useCallback((files) => {
    setError('');
    const validImages = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError(`"${file.name}" is not an image. Skipped.`);
        continue;
      }
      if (file.size > 50 * 1024 * 1024) {
        setError(`"${file.name}" is too large (max 50MB). Skipped.`);
        continue;
      }

      const preview = URL.createObjectURL(file);
      validImages.push({
        id: ++imageIdCounter,
        file,
        name: file.name,
        size: file.size,
        preview
      });
    }

    if (validImages.length > 0) {
      setImages(prev => [...prev, ...validImages]);
      setResult(null);
    }
  }, []);

  useEffect(() => {
    if (location.state?.droppedFiles && location.state.droppedFiles.length > 0) {
      validateAndAddImages(location.state.droppedFiles);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, validateAndAddImages]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      validateAndAddImages(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files.length > 0) {
      validateAndAddImages(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const removeImage = (id) => {
    setImages(prev => {
      const target = prev.find(img => img.id === id);
      if (target && target.preview) {
        URL.revokeObjectURL(target.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  // Drag and drop reordering
  const handleDragStart = (id) => {
    setDragSrcId(id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleReorderDrop = (targetId) => {
    if (dragSrcId === null || dragSrcId === targetId) return;
    setImages(prev => {
      const arr = [...prev];
      const srcIdx = arr.findIndex(img => img.id === dragSrcId);
      const targetIdx = arr.findIndex(img => img.id === targetId);
      if (srcIdx === -1 || targetIdx === -1) return prev;
      
      const [item] = arr.splice(srcIdx, 1);
      arr.splice(targetIdx, 0, item);
      return arr;
    });
    setDragSrcId(null);
  };

  const handleConvert = async () => {
    if (images.length === 0) return;
    setIsConverting(true);
    setError('');
    setProgress(0);
    setProgressLabel('Starting PDF generation...');

    try {
      const imageFiles = images.map(img => img.file);
      const pdfBlob = await convertImagesToPdf(
        imageFiles,
        { pageSize, margin, orientation },
        (pct, label) => {
          setProgress(pct);
          setProgressLabel(label);
        }
      );

      setResult({
        blob: pdfBlob,
        name: 'images-compiled.pdf',
        pageCount: images.length
      });
      toast.success('Successfully compiled images into PDF!');
    } catch (err) {
      const errMsg = err.message || 'Failed to compile PDF.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
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
    images.forEach(img => {
      if (img.preview) URL.revokeObjectURL(img.preview);
    });
    setImages([]);
    setResult(null);
    setPageSize('a4');
    setMargin('none');
    setOrientation('auto');
    setProgress(0);
    setError('');
    imageIdCounter = 0;
    toast.info('Reset page compilation');
  };

  const features = [
    {
      icon: Shield,
      title: 'Completely Private',
      description: 'Your photos and visual designs are processed in-memory locally. No cloud uploads.'
    },
    {
      icon: GripVertical,
      title: 'Drag and Drop Sorting',
      description: 'Rearrange page sequences easily by dragging cards around the workspace.'
    },
    {
      icon: Zap,
      title: 'Layout Adjustments',
      description: 'Configure standard page dimensions (A4, Letter), page orientation, and margin offsets.'
    },
    {
      icon: Sparkles,
      title: 'Crisp Rendering',
      description: 'Images are drawn natively without extra rasterizations, keeping final sizes optimized.'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Convert Images to PDF - Combine JPG/PNG to PDF Free | CompressBit</title>
        <meta name="description" content="Combine and compile multiple images into a single PDF document instantly in your browser. 100% free, secure, and private." />
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
                Image to PDF
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Combine JPG, PNG, and WebP images into a single PDF. Customize page setups. <br className="hidden md:block" />
                <span className="text-primary font-medium">No uploads, works entirely client-side.</span>
              </p>
            </motion.div>
          </div>
        </section>

        {/* Workspace zone */}
        <section className="py-12 bg-card/30 border-y border-border backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">

              {/* Converted Result */}
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
                    <h3 className="text-2xl font-bold text-foreground">PDF Generated!</h3>
                    
                    <div className="grid grid-cols-2 gap-8 w-full py-4 border-y border-border">
                      <div className="text-center">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pages Created</div>
                        <div className="text-2xl font-bold text-primary mt-1">{result.pageCount}</div>
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
                        Download Compiled PDF
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={handleReset}
                        className="sm:w-40 bg-card h-14 active:scale-[0.98]"
                      >
                        Compile More
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
                        <FileSpreadsheet className="w-10 h-10 text-primary animate-pulse" />
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
                      <h3 className="text-xl font-bold text-foreground">Compiling PDF Document</h3>
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

              {/* Upload Panel (Empty State) */}
              {images.length === 0 && !isConverting && !result && (
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
                    accept="image/*"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 ${
                    isDragging ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-muted text-muted-foreground shadow-sm'
                  }`}>
                    {isDragging ? <ImageIcon className="w-10 h-10" /> : <Upload className="w-10 h-10" />}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {isDragging ? 'Drop your images here' : 'Drag and drop your images'}
                  </h3>
                  <p className="text-base text-muted-foreground mb-8">
                    or click to browse your device
                  </p>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="pointer-events-none bg-background shadow-sm px-8 h-12"
                  >
                    Select Images
                  </Button>
                  
                  <p className="text-sm text-muted-foreground mt-6 font-medium">
                    Supports: JPG, PNG, WebP (Max 50MB each) • Choose multiple files
                  </p>
                </motion.div>
              )}

              {/* Workspace with grid reordering & settings */}
              {images.length > 0 && !isConverting && !result && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* File Upload strip */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 flex items-center justify-center gap-3 ${
                      isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 bg-card/30'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileInput}
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Plus className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground">Add more images</p>
                      <p className="text-xs text-muted-foreground">Drop files or click to browse</p>
                    </div>
                  </div>

                  {/* Settings Panel */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 border border-border bg-muted/10 rounded-2xl text-left">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Page Size</label>
                      <select
                        value={pageSize}
                        onChange={(e) => setPageSize(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl bg-card border border-border text-foreground text-sm font-medium focus:outline-none focus:border-primary/50"
                      >
                        <option value="a4">A4 (Standard)</option>
                        <option value="letter">US Letter</option>
                        <option value="fit">Fit to Image Size</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Page Margins</label>
                      <select
                        value={margin}
                        onChange={(e) => setMargin(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl bg-card border border-border text-foreground text-sm font-medium focus:outline-none focus:border-primary/50"
                      >
                        <option value="none">No Margin (Borderless)</option>
                        <option value="small">Small Margin</option>
                        <option value="large">Large Margin</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Page Orientation</label>
                      <select
                        value={orientation}
                        onChange={(e) => setOrientation(e.target.value)}
                        disabled={pageSize === 'fit'}
                        className="w-full h-11 px-3 rounded-xl bg-card border border-border text-foreground text-sm font-medium focus:outline-none focus:border-primary/50 disabled:opacity-50"
                      >
                        <option value="auto">Auto (Match Image Ratio)</option>
                        <option value="portrait">Portrait</option>
                        <option value="landscape">Landscape</option>
                      </select>
                    </div>
                  </div>

                  {/* Drag Reorder Grid */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm font-semibold text-foreground">
                      <span>Arrange Image Sequence</span>
                      <span className="text-xs text-muted-foreground">{images.length} images loaded</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 border border-border p-4 bg-muted/20 rounded-2xl max-h-96 overflow-y-auto">
                      <AnimatePresence>
                        {images.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            draggable
                            onDragStart={() => handleDragStart(item.id)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => { e.preventDefault(); handleReorderDrop(item.id); }}
                            className={`group relative aspect-square border rounded-xl overflow-hidden cursor-grab active:cursor-grabbing bg-card hover:border-primary/30 transition-all ${
                              dragSrcId === item.id ? 'opacity-40 scale-[0.98]' : ''
                            }`}
                          >
                            <img
                              src={item.preview}
                              alt={item.name}
                              className="w-full h-full object-cover select-none"
                            />
                            
                            {/* Overlay tag for sequence index */}
                            <div className="absolute top-2 left-2 w-6 h-6 rounded-lg bg-black/60 backdrop-blur-sm border border-border/30 flex items-center justify-center text-xs font-bold text-foreground">
                              {index + 1}
                            </div>

                            {/* Delete button overlay */}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removeImage(item.id); }}
                              className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-black/60 hover:bg-red-500/90 text-foreground border border-border/30 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>

                            {/* Info strip */}
                            <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-xs py-1.5 px-2 text-left border-t border-border/20 truncate">
                              <p className="text-[10px] text-muted-foreground truncate">{item.name}</p>
                              <p className="text-[9px] text-muted-foreground/60">{formatSize(item.size)}</p>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center justify-center space-x-2 text-destructive bg-destructive/10 p-4 rounded-xl border border-destructive/20">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p className="text-sm font-medium">{error}</p>
                    </div>
                  )}

                  {/* Trigger buttons */}
                  <div className="flex gap-4 pt-2">
                    <Button
                      size="lg"
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 text-lg h-14 shadow-lg shadow-primary/20 active:scale-[0.98]"
                      onClick={handleConvert}
                    >
                      <ImageIcon className="w-5 h-5 mr-2" />
                      Compile into PDF
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleReset}
                      className="sm:w-32 bg-card h-14 active:scale-[0.98]"
                    >
                      Clear All
                    </Button>
                  </div>
                </motion.div>
              )}

            </div>
          </div>
        </section>

        {/* Features lists */}
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
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default ImageToPdfPage;
