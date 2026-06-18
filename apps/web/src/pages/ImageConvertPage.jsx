import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ImageIcon, Upload, X, ArrowRight, AlertCircle,
  CheckCircle2, Download, Plus, Loader2, Shield, Zap,
  UserCheck, RefreshCw, Sparkles, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { convertImageFormat } from '@/lib/image-converter-client.js';

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(i >= 2 ? 1 : 0) + ' ' + units[i];
};

const ImageConvertPage = () => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  // Conversion configurations
  const [targetFormat, setTargetFormat] = useState('png'); // 'png', 'jpeg', or 'webp'
  const [quality, setQuality] = useState(90); // 1-100 (for jpeg/webp)
  
  // Results: array of { fileName: string, originalSize: number, convertedSize: number, convertedBlob: Blob, targetFormat: string, error?: string }
  const [results, setResults] = useState(null);

  const fileInputRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.droppedFiles && location.state.droppedFiles.length > 0) {
      handleFileSelect(location.state.droppedFiles);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleFileSelect = (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    const validFiles = [];
    const maxFilesLimit = 20;

    if (files.length + selectedFiles.length > maxFilesLimit) {
      setError(`You can upload a maximum of ${maxFilesLimit} images at a time.`);
      toast.warning(`File limit is ${maxFilesLimit} images.`);
      return;
    }

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      if (file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp|tiff)$/i.test(file.name)) {
        if (file.size <= 50 * 1024 * 1024) { // 50MB per file limit
          validFiles.push(file);
        } else {
          toast.error(`"${file.name}" exceeds the 50MB file size limit.`);
        }
      } else {
        toast.error(`"${file.name}" is not a supported image file.`);
      }
    }

    if (validFiles.length > 0) {
      setError('');
      setFiles((prev) => [...prev, ...validFiles]);
      setResults(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (files.length === 1) {
      setResults(null);
    }
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsConverting(true);
    setError('');
    setProgress(0);
    setCurrentFileIndex(0);

    const convertedResults = [];
    const qValue = quality / 100;

    try {
      for (let i = 0; i < files.length; i++) {
        setCurrentFileIndex(i);
        const file = files[i];
        
        try {
          const res = await convertImageFormat(file, targetFormat, qValue);
          convertedResults.push(res);
        } catch (err) {
          console.error(`Error converting ${file.name}:`, err);
          convertedResults.push({
            fileName: file.name,
            originalSize: file.size,
            convertedSize: 0,
            convertedBlob: null,
            targetFormat,
            error: err.message || 'Conversion failed.'
          });
        }
        
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      setResults(convertedResults);
      
      const successCount = convertedResults.filter(r => !r.error).length;
      const failCount = convertedResults.filter(r => r.error).length;
      
      if (successCount > 0) {
        if (files.length === 1) {
          toast.success('Image format converted successfully!');
        } else {
          toast.success(`Successfully converted ${successCount} image(s)!`);
        }
      }
      if (failCount > 0) {
        toast.error(`Failed to convert ${failCount} image(s).`);
      }
    } catch (err) {
      const errMsg = err.message || 'An error occurred during conversion.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = (index) => {
    if (!results || !results[index] || results[index].error) return;
    const item = results[index];
    const url = URL.createObjectURL(item.convertedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = item.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${item.fileName}`);
  };

  const handleDownloadAll = async () => {
    if (!results || results.length === 0) return;
    
    const validResults = results.filter(r => !r.error);
    if (validResults.length === 0) return;

    if (validResults.length === 1) {
      handleDownload(results.findIndex(r => !r.error));
      return;
    }

    toast.info('Bundling images into ZIP archive...');
    try {
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();

      validResults.forEach((item) => {
        zip.file(item.fileName, item.convertedBlob);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'compressbit-converted-images.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Downloaded compressbit-converted-images.zip');
    } catch (err) {
      toast.error('Failed to create ZIP package.');
    }
  };

  const handleReset = () => {
    setFiles([]);
    setResults(null);
    setTargetFormat('png');
    setQuality(90);
    setProgress(0);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.info('Cleared files and settings');
  };

  const features = [
    {
      icon: Shield,
      title: '100% Secure',
      description: 'Your images are processed right inside your browser session. Zero uploads to external servers.'
    },
    {
      icon: RefreshCw,
      title: 'Batch Conversions',
      description: 'Upload up to 20 images at once and convert them to PNG, JPG, or WebP in a single batch.'
    },
    {
      icon: Zap,
      title: 'Adjustable Quality',
      description: 'Control JPG/WebP quality percentage using slider to balance output file size and resolution.'
    },
    {
      icon: UserCheck,
      title: 'Completely Free',
      description: 'No daily conversions caps, no watermark, and no registration required. Runs entirely offline.'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Free Image Converter - Convert PNG, JPG, WebP Online | CompressBit</title>
        <meta name="description" content="Convert your images to PNG, JPG, or WebP format instantly in your browser. Batch conversion supported, 100% private and secure." />
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
                  Image Converter
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Convert image formats (JPG, PNG, WebP) in bulk locally in your browser. <br className="hidden md:block" />
                  <span className="text-primary font-medium">Fast, free, and fully private.</span>
                </p>
              </motion.div>
            </div>
          </section>

          {/* Core Workspace Section */}
          <section className="py-12 bg-card/30 border-y border-border">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="space-y-6">

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
                          <Loader2 className="w-10 h-10 text-primary animate-spin" />
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
                        <h3 className="text-xl font-bold text-foreground">Converting Images</h3>
                        <p className="text-sm text-muted-foreground h-5">
                          Processing image {currentFileIndex + 1} of {files.length}...
                        </p>
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

                {/* Completed Results Display */}
                {results && !isConverting && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="bg-card border border-border rounded-3xl p-6 md:p-8 space-y-6">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-6">
                        <div className="text-center sm:text-left space-y-1">
                          <h3 className="text-2xl font-bold text-foreground">Conversion Complete!</h3>
                          <p className="text-sm text-muted-foreground">
                            Successfully processed {results.filter(r => !r.error).length} of {results.length} images.
                          </p>
                        </div>
                        {results.filter(r => !r.error).length > 1 && (
                          <Button
                            onClick={handleDownloadAll}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-6 h-12 flex items-center gap-2 active:scale-95 transition-all shadow-md shadow-primary/10"
                          >
                            <Download className="w-4 h-4" /> Download All (ZIP)
                          </Button>
                        )}
                      </div>

                      {/* Result Items List */}
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        {results.map((result, idx) => {
                          const savedBytes = result.originalSize - result.convertedSize;
                          const savedPct = result.originalSize > 0 ? ((savedBytes / result.originalSize) * 100).toFixed(0) : 0;
                          const isSuccess = !result.error;

                          return (
                            <div
                              key={idx}
                              className="flex flex-col sm:flex-row items-center justify-between p-4 bg-muted/20 border border-border rounded-2xl gap-4 text-center sm:text-left"
                            >
                              <div className="flex items-center gap-3 min-w-0 self-start sm:self-center">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSuccess ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                                  {isSuccess ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                </div>
                                <div className="truncate">
                                  <p className="text-sm font-semibold text-foreground truncate">{result.fileName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatSize(result.originalSize)}
                                    {isSuccess && ` ➔ ${formatSize(result.convertedSize)}`}
                                  </p>
                                </div>
                              </div>

                              {isSuccess ? (
                                <div className="flex items-center gap-4 ml-auto">
                                  <Badge variant="secondary" className="bg-primary/5 border border-primary/20 text-primary font-semibold">
                                    {savedBytes > 0 ? `Saved ${savedPct}%` : 'Output format converted'}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDownload(idx)}
                                    className="text-primary hover:bg-primary/10 rounded-xl"
                                    title="Download this converted file"
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-xs text-destructive font-medium self-end sm:self-center ml-auto">
                                  {result.error}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button
                          variant="outline"
                          onClick={handleReset}
                          className="bg-card h-12 rounded-xl px-8 active:scale-95"
                        >
                          Convert More Images
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Upload Drop Zone (Empty State) */}
                {files.length === 0 && !isConverting && !results && (
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
                      onChange={(e) => handleFileSelect(e.target.files)}
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
                      Select Image Files
                    </Button>
                    
                    <p className="text-sm text-muted-foreground mt-6 font-medium">
                      Supports: JPG, PNG, WebP, GIF, BMP (Max 50MB per file)
                    </p>
                  </motion.div>
                )}

                {/* Configurations & File List Panel */}
                {files.length > 0 && !isConverting && !results && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Selected Files List */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Uploaded Files ({files.length})</label>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {files.map((file, index) => (
                          <div
                            key={`${file.name}-${file.size}-${index}`}
                            className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-2xl"
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <ImageIcon className="w-4 h-4 text-primary" />
                              </div>
                              <div className="truncate pr-4">
                                <p className="text-sm font-semibold text-foreground truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFile(index)}
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 rounded-lg w-7 h-7"
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Add More Strip */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border border-dashed border-border rounded-2xl p-4 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/10 transition duration-200 flex items-center justify-center gap-2"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleFileSelect(e.target.files)}
                          className="hidden"
                        />
                        <Plus className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground">Add more images</span>
                      </div>
                    </div>

                    {/* Settings Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border border-border bg-muted/10 rounded-2xl">
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground">Target Format</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['png', 'jpeg', 'webp'].map((fmt) => (
                            <button
                              key={fmt}
                              type="button"
                              onClick={() => setTargetFormat(fmt)}
                              className={`py-2.5 rounded-xl border text-sm font-semibold transition-all uppercase ${
                                targetFormat === fmt
                                  ? 'bg-primary border-primary text-primary-foreground'
                                  : 'bg-card border-border text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {fmt === 'jpeg' ? 'jpg' : fmt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-semibold text-foreground">Quality</label>
                          <span className="text-xs font-bold text-primary">{quality}%</span>
                        </div>
                        <div className="pt-2">
                          <input
                            type="range"
                            min="10"
                            max="100"
                            value={quality}
                            disabled={targetFormat === 'png'}
                            onChange={(e) => setQuality(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-30 disabled:cursor-not-allowed"
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-snug">
                          {targetFormat === 'png' 
                            ? 'Lossless compression selected. Quality slider is inactive.'
                            : 'Higher quality yields clearer images but results in larger file sizes.'
                          }
                        </p>
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
                        <Layers className="w-5 h-5 mr-2" />
                        Convert {files.length} Image{files.length > 1 ? 's' : ''}
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={handleReset}
                        className="sm:w-32 bg-card h-14 active:scale-[0.98]"
                      >
                        Reset
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
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ImageConvertPage;
