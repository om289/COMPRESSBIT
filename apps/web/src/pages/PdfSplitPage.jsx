import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Upload, X, Scissors, ArrowRight, AlertCircle,
  CheckCircle2, Download, Plus, Loader2, Shield, Zap,
  UserCheck, Sparkles, LayoutGrid, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { extractPages, splitAllPages, parsePageRanges } from '@/lib/pdf-splitter-client.js';
import * as pdfjsLib from 'pdfjs-dist';
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

// e.g. [1, 2, 3, 5] -> '1-3, 5'
function formatRangeString(pageNumbers) {
  if (pageNumbers.length === 0) return '';
  const sorted = [...pageNumbers].sort((a, b) => a - b);
  const ranges = [];
  let start = sorted[0];
  let end = sorted[0];
  
  for (let i = 1; i <= sorted.length; i++) {
    if (i < sorted.length && sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      if (start === end) {
        ranges.push(`${start}`);
      } else {
        ranges.push(`${start}-${end}`);
      }
      if (i < sorted.length) {
        start = sorted[i];
        end = sorted[i];
      }
    }
  }
  return ranges.join(', ');
}

const PageGridItem = React.memo(({ pageNum, isSelected, thumbUrl, onClick }) => {
  return (
    <div
      onClick={() => onClick(pageNum)}
      className={`relative aspect-[3/4] border rounded-xl overflow-hidden cursor-pointer transition-all duration-200 group flex flex-col justify-between ${
        isSelected
          ? 'border-primary ring-2 ring-primary bg-primary/5'
          : 'border-border hover:border-foreground/30 bg-card'
      }`}
    >
      {thumbUrl ? (
        <img
          src={thumbUrl}
          alt={`Page ${pageNum}`}
          className="w-full h-full object-cover select-none"
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-card">
          <FileText className="w-6 h-6 text-muted-foreground/30" />
        </div>
      )}
      
      {/* Overlay banner for page number */}
      <div className="absolute inset-x-0 bottom-0 bg-background/80 backdrop-blur-xs py-1 text-center text-xs font-semibold border-t border-border/50">
        Page {pageNum}
      </div>

      {/* Selection Check Circle */}
      <div className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-200 ${
        isSelected
          ? 'bg-primary border-primary text-primary-foreground scale-100'
          : 'border-muted-foreground/50 bg-background/50 scale-0 group-hover:scale-90'
      }`}>
        <Check className="w-3 h-3 stroke-[3]" />
      </div>
    </div>
  );
});
PageGridItem.displayName = 'PageGridItem';

const PdfSplitPage = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [error, setError] = useState('');
  
  // Split logic state
  const [pageCount, setPageCount] = useState(0);
  const [splitMode, setSplitMode] = useState('extract'); // 'extract' (ranges) or 'split-all'
  const [rangeInput, setRangeInput] = useState('');
  const [selectedPages, setSelectedPages] = useState([]); // 1-indexed page numbers
  const [thumbnails, setThumbnails] = useState([]);
  const [loadingThumbs, setLoadingThumbs] = useState(false);
  const [result, setResult] = useState(null); // { type: 'single' | 'zip', blob: Blob, count: number, name: string }

  const fileInputRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    trackPageView('/pdf/split');
  }, []);

  useEffect(() => {
    if (location.state?.droppedFiles && location.state.droppedFiles.length > 0) {
      handleFileSelect(location.state.droppedFiles);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Memoized lookups for high performance grid updates
  const selectedSet = React.useMemo(() => new Set(selectedPages), [selectedPages]);
  
  const thumbnailMap = React.useMemo(() => {
    const map = {};
    thumbnails.forEach(t => {
      map[t.num] = t.url;
    });
    return map;
  }, [thumbnails]);

  // Parse custom range text and highlight pages in thumbnail grid
  const handleRangeChange = (value) => {
    setRangeInput(value);
    try {
      const parsedIndices = parsePageRanges(value, pageCount);
      // Map 0-indexed to 1-indexed
      setSelectedPages(parsedIndices.map(idx => idx + 1));
    } catch (e) {
      // Keep input, but don't update highlights on invalid input
    }
  };

  // Toggle selection on thumbnail click (memoized to prevent child re-renders)
  const togglePageSelect = React.useCallback((pageNum) => {
    setSelectedPages(prev => {
      const next = prev.includes(pageNum)
        ? prev.filter(p => p !== pageNum)
        : [...prev, pageNum];
      
      const newRange = formatRangeString(next);
      setRangeInput(newRange);
      return next;
    });
  }, []);

  const handleFileSelect = async (files) => {
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
    setThumbnails([]);
    setSelectedPages([]);
    setRangeInput('');
    setSplitMode('extract');
    
    // Load metadata and thumbnails
    setLoadingThumbs(true);
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;
      setPageCount(totalPages);
      
      // Default to select all pages
      const allPages = Array.from({ length: totalPages }, (_, i) => i + 1);
      setSelectedPages(allPages);
      setRangeInput(formatRangeString(allPages));

      // Asynchronously load thumbnails for first 30 pages
      const renderLimit = Math.min(totalPages, 30);
      const thumbs = [];
      
      for (let i = 1; i <= renderLimit; i++) {
        const page = await pdf.getPage(i);
        // Render small thumbnail
        const viewport = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { alpha: false });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({
          canvasContext: context,
          viewport: viewport,
          background: 'white'
        }).promise;

        thumbs.push({
          url: canvas.toDataURL('image/jpeg', 0.6),
          num: i
        });

        page.cleanup();
        canvas.width = 0;
        canvas.height = 0;
      }
      setThumbnails(thumbs);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load PDF preview.');
    } finally {
      setLoadingThumbs(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError('');
    setProgress(0);

    try {
      if (splitMode === 'extract') {
        if (!rangeInput.trim()) {
          throw new Error('Please select pages or enter page ranges (e.g. 1-3, 5).');
        }
        
        const blob = await extractPages(file, rangeInput, (pct, label) => {
          setProgress(pct);
          setProgressLabel(label);
        });

        setResult({
          type: 'single',
          blob,
          name: `${file.name.replace(/\.pdf$/i, '')}-extracted.pdf`,
          count: selectedPages.length
        });
        trackEvent('split_pdf_success', {
          mode: 'extract',
          pages_count: selectedPages.length,
          total_pages: pageCount
        });
        toast.success('PDF pages extracted successfully!');
      } else {
        // split-all pages into a ZIP
        const splitPages = await splitAllPages(file, (pct, label) => {
          setProgress(pct);
          setProgressLabel(label);
        });

        setProgressLabel('Compressing into ZIP archive...');
        const { default: JSZip } = await import('jszip');
        const zip = new JSZip();
        
        splitPages.forEach(p => {
          zip.file(p.name, p.blob);
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
          setProgress(90 + Math.round(metadata.percent / 10));
        });

        setResult({
          type: 'zip',
          blob: zipBlob,
          name: `${file.name.replace(/\.pdf$/i, '')}-pages.zip`,
          count: splitPages.length
        });
        trackEvent('split_pdf_success', {
          mode: 'split_all',
          pages_count: splitPages.length,
          total_pages: pageCount
        });
        toast.success(`Successfully split PDF into ${splitPages.length} files!`);
      }
    } catch (err) {
      const errMsg = err.message || 'Failed to split PDF.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    trackEvent('split_pdf_download', {
      type: result.type,
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
    trackEvent('split_pdf_reset');
    setFile(null);
    setResult(null);
    setPageCount(0);
    setThumbnails([]);
    setSelectedPages([]);
    setRangeInput('');
    setProgress(0);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.info('Cleared current file');
  };

  const features = [
    {
      icon: Shield,
      title: '100% Secure & Private',
      description: 'Splitting is run directly in your browser. Your sensitive files never leave your computer.'
    },
    {
      icon: Scissors,
      title: 'Precision Splicing',
      description: 'Extract ranges, single pages, or reverse sequences (e.g. 5-1) with zero quality loss.'
    },
    {
      icon: LayoutGrid,
      title: 'Visual Grid Preview',
      description: 'Interact with page thumbnails to select exactly the pages you need to extract.'
    },
    {
      icon: UserCheck,
      title: 'Completely Free',
      description: 'No page limits, no file size up-sells, no email registration required.'
    }
  ];

  const faqs = [
    {
      question: "How can I split a PDF file?",
      answer: "Upload your file, select a split mode: either choose 'Custom ranges' to extract pages (by selecting thumbnails or typing custom numbers like 1-3, 5) or select 'Split all pages' to divide every page of the PDF into a separate file."
    },
    {
      question: "Does splitting a PDF affect its formatting or visual quality?",
      answer: "No. The splitting process is entirely lossless; it extracts and clones the binary data structures for the selected pages exactly, keeping all formatting, embedded fonts, and path vectors intact."
    },
    {
      question: "Can I split password-protected PDFs?",
      answer: "If the PDF is encrypted, you will need to decrypt it first. You can use our 'Protect PDF' tool to remove passwords if you know the credentials, and then upload the unlocked file here."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Split PDF Online - Free Page Extractor | CompressBit</title>
        <meta name="description" content="Split pages from your PDF file or extract specific ranges instantly in your browser. 100% secure, private, and zero uploads." />
        
        {/* Open Graph / Social Sharing Tags */}
        <meta property="og:title" content="Split PDF Online - Free Page Extractor | CompressBit" />
        <meta property="og:description" content="Split pages from your PDF file or extract specific ranges instantly in your browser. 100% secure, private, and zero uploads." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.compressbit.com/pdf/split" />
        <meta property="og:image" content="https://www.compressbit.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Split PDF Online - Free Page Extractor | CompressBit" />
        <meta name="twitter:description" content="Split pages from your PDF file or extract specific ranges instantly in your browser. 100% secure, private, and zero uploads." />
        <meta name="twitter:image" content="https://www.compressbit.com/og-image.png" />
        
        <script type="application/ld+json">
          {JSON.stringify(getWebApplicationSchema(
            "PDF Splitter",
            "/pdf/split",
            "Split pages from your PDF file or extract specific ranges instantly in your browser. 100% secure, private, and zero uploads."
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
                  Split PDF
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Extract specific page ranges or split every page into a standalone PDF. <br className="hidden md:block" />
                  <span className="text-primary font-medium">Processed locally on your device.</span>
                </p>
              </motion.div>
            </div>
          </section>

          {/* Processing zone */}
          <section className="py-12 bg-card/30 border-y border-border">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="space-y-6">
                
                {/* Completed Result */}
                {result && !isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 md:p-12 bg-card border border-border rounded-3xl shadow-lg max-w-2xl mx-auto w-full"
                  >
                    <div className="flex flex-col items-center text-center space-y-6">
                      <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground">Split Completed!</h3>
                      
                      <div className="grid grid-cols-2 gap-8 w-full py-4 border-y border-border">
                        <div className="text-center">
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            {result.type === 'single' ? 'Extracted Pages' : 'Generated Files'}
                          </div>
                          <div className="text-2xl font-bold text-primary mt-1">{result.count}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Output Size</div>
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
                          Download Result
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={handleReset}
                          className="sm:w-40 bg-card h-14 active:scale-[0.98]"
                        >
                          Split Another
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Progress UI */}
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 md:p-12 bg-card border border-border rounded-3xl shadow-lg max-w-2xl mx-auto w-full"
                  >
                    <div className="flex flex-col items-center justify-center space-y-8 text-center">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-muted flex items-center justify-center">
                          <Scissors className="w-10 h-10 text-primary animate-pulse" />
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
                        <h3 className="text-xl font-bold text-foreground">Processing PDF</h3>
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
                {!file && !isProcessing && !result && (
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
                      {isDragging ? <Scissors className="w-10 h-10" /> : <Upload className="w-10 h-10" />}
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

                {/* Configure split mode & selection grid */}
                {file && !isProcessing && !result && (
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
                          <p className="text-xs text-muted-foreground">
                            {formatSize(file.size)} • {pageCount} {pageCount === 1 ? 'page' : 'pages'}
                          </p>
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

                    {/* Mode Select Tabs */}
                    <div className="grid grid-cols-2 p-1.5 bg-muted/50 rounded-2xl border border-border">
                      <button
                        onClick={() => setSplitMode('extract')}
                        className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          splitMode === 'extract'
                            ? 'bg-card text-foreground shadow-md'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Extract Page Range
                      </button>
                      <button
                        onClick={() => setSplitMode('split-all')}
                        className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          splitMode === 'split-all'
                            ? 'bg-card text-foreground shadow-md'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Split All Pages (ZIP)
                      </button>
                    </div>

                    {/* Settings based on mode */}
                    {splitMode === 'extract' ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-foreground">
                            Select pages to extract
                          </label>
                          <input
                            type="text"
                            value={rangeInput}
                            onChange={(e) => handleRangeChange(e.target.value)}
                            placeholder="e.g. 1-3, 5, 8-10"
                            className="w-full h-12 px-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 text-sm font-medium"
                          />
                          <p className="text-xs text-muted-foreground">
                            Type custom page numbers or ranges, or select pages interactively from the grid below.
                          </p>
                        </div>

                        {/* Interactive preview grid */}
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-foreground">
                              Interactive Grid
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {selectedPages.length} of {pageCount} pages selected
                            </span>
                          </div>

                          {loadingThumbs ? (
                            <div className="flex items-center justify-center py-12">
                              <Loader2 className="w-6 h-6 text-primary animate-spin mr-2" />
                              <span className="text-sm text-muted-foreground">Loading preview...</span>
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-96 overflow-y-auto pr-1 border border-border p-4 bg-muted/20 rounded-2xl">
                              {Array.from({ length: pageCount }).map((_, index) => {
                                const pageNum = index + 1;
                                const isSelected = selectedSet.has(pageNum);
                                const thumbUrl = thumbnailMap[pageNum];

                                return (
                                  <PageGridItem
                                    key={pageNum}
                                    pageNum={pageNum}
                                    isSelected={isSelected}
                                    thumbUrl={thumbUrl}
                                    onClick={togglePageSelect}
                                  />
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 border border-border bg-muted/10 rounded-2xl space-y-3">
                        <h4 className="text-sm font-bold text-foreground">Split into Standalone Pages</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Every single page of this PDF will be split into its own independent document. The results will be compiled into a single ZIP file for you to download.
                        </p>
                        <div className="flex items-center text-xs text-primary font-semibold">
                          <Zap className="w-3.5 h-3.5 mr-1.5" />
                          Generates {pageCount} independent PDF files.
                        </div>
                      </div>
                    )}

                    {/* Error display */}
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
                        onClick={handleProcess}
                      >
                        <Scissors className="w-5 h-5 mr-2" />
                        {splitMode === 'extract'
                          ? `Extract ${selectedPages.length} Pages`
                          : `Split all ${pageCount} Pages`
                        }
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

          {/* Features list */}
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

export default PdfSplitPage;
