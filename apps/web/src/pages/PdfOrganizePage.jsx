import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Upload, X, RotateCw, RotateCcw, ArrowLeft, ArrowRight,
  Trash2, Copy, Download, CheckCircle2, AlertCircle, RefreshCw,
  ShieldCheck, Zap, Layers, Sparkles, MoveLeft, MoveRight, GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { loadPdfPagesWithThumbnails, reorganizePdf } from '@/lib/pdf-organizer-client.js';
import { getWebApplicationSchema } from '@/lib/seo-helper.js';
import { FAQAccordion } from '@/components/FAQAccordion.jsx';
import { trackPageView } from '@/lib/analytics.js';

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(i >= 2 ? 1 : 0) + ' ' + units[i];
};

const PdfOrganizePage = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingThumbs, setIsLoadingThumbs] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadStatus, setLoadStatus] = useState('');
  const [pages, setPages] = useState([]);
  const [originalPages, setOriginalPages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [processStatus, setProcessStatus] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [draggedPageId, setDraggedPageId] = useState(null);
  const [addPageNumbers, setAddPageNumbers] = useState(false);
  const [watermarkText, setWatermarkText] = useState('');

  const fileInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    trackPageView('/pdf/organize');
  }, []);

  useEffect(() => {
    if (location.state?.droppedFiles && location.state.droppedFiles.length > 0) {
      handleFileSelect(location.state.droppedFiles);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;
    const selected = files[0];

    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a valid PDF document.');
      return;
    }

    if (selected.size > 100 * 1024 * 1024) {
      setError('File size exceeds the 100MB limit.');
      return;
    }

    setError('');
    setFile(selected);
    setResult(null);
    setPages([]);
    setIsLoadingThumbs(true);
    setLoadProgress(0);

    try {
      const data = await loadPdfPagesWithThumbnails(selected, (pct, msg) => {
        setLoadProgress(pct);
        setLoadStatus(msg);
      });
      setPages(data.pages);
      setOriginalPages(JSON.parse(JSON.stringify(data.pages)));
      toast.success(`Loaded ${data.totalPages} pages successfully.`);
    } catch (err) {
      console.error(err);
      setFile(null);
      setPages([]);
      setOriginalPages([]);
      setError('Failed to render PDF pages. The file may be password protected or corrupted.');
      toast.error('Could not load PDF document.');
    } finally {
      setIsLoadingThumbs(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRotatePage = (index, delta) => {
    setPages((prev) => {
      const copy = [...prev];
      const current = copy[index].rotation || 0;
      copy[index] = {
        ...copy[index],
        rotation: (current + delta + 360) % 360
      };
      return copy;
    });
  };

  const handleRotateAll = (delta) => {
    setPages((prev) =>
      prev.map((p) => ({
        ...p,
        rotation: ((p.rotation || 0) + delta + 360) % 360
      }))
    );
    toast.success(`Rotated all pages ${delta > 0 ? '90° clockwise' : '90° counter-clockwise'}`);
  };

  const handleMovePage = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= pages.length) return;
    setPages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, item);
      return copy;
    });
  };

  const handlePageDragStart = (event, pageId) => {
    setDraggedPageId(pageId);
    event.dataTransfer.effectAllowed = 'move';
    // Firefox requires data to be set before it will begin a drag operation.
    event.dataTransfer.setData('text/plain', pageId);
  };

  const handlePageDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handlePageDrop = (event, targetPageId) => {
    event.preventDefault();
    const sourcePageId = draggedPageId || event.dataTransfer.getData('text/plain');

    if (!sourcePageId || sourcePageId === targetPageId) {
      setDraggedPageId(null);
      return;
    }

    setPages((previousPages) => {
      const sourceIndex = previousPages.findIndex((page) => page.id === sourcePageId);
      const targetIndex = previousPages.findIndex((page) => page.id === targetPageId);
      if (sourceIndex === -1 || targetIndex === -1) return previousPages;

      const reordered = [...previousPages];
      const [page] = reordered.splice(sourceIndex, 1);
      reordered.splice(targetIndex, 0, page);
      return reordered;
    });
    setDraggedPageId(null);
  };

  const handleDeletePage = (index) => {
    if (pages.length <= 1) {
      toast.error('The document must contain at least one page.');
      return;
    }
    setPages((prev) => prev.filter((_, i) => i !== index));
    toast.info('Page removed');
  };

  const handleDuplicatePage = (index) => {
    setPages((prev) => {
      const copy = [...prev];
      const target = copy[index];
      const clone = {
        ...target,
        id: `page-clone-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
      };
      copy.splice(index + 1, 0, clone);
      return copy;
    });
    toast.success('Page duplicated');
  };

  const handleResetOrder = () => {
    setPages(JSON.parse(JSON.stringify(originalPages)));
    toast.info('Reset to original page order and rotation');
  };

  const handleReverseOrder = () => {
    setPages((prev) => [...prev].reverse());
    toast.info('Reversed page order');
  };

  const handleExport = async () => {
    if (!file || pages.length === 0) return;
    setIsProcessing(true);
    setError('');
    setProcessProgress(0);

    try {
      const pageConfigs = pages.map((p) => ({
        originalIndex: p.originalIndex,
        rotation: p.rotation || 0
      }));

      const res = await reorganizePdf(
        file,
        pageConfigs,
        (pct, status) => {
          setProcessProgress(pct);
          setProcessStatus(status);
        },
        { addPageNumbers, watermarkText }
      );

      setResult({
        blob: res.blob,
        fileName: file.name.replace(/\.pdf$/i, '') + '_organized.pdf',
        size: res.size,
        totalPages: res.totalPages
      });

      toast.success('PDF successfully reorganized!');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to reorganize PDF.');
      toast.error('An error occurred during export.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    setFile(null);
    setPages([]);
    setOriginalPages([]);
    setResult(null);
    setError('');
    setAddPageNumbers(false);
    setWatermarkText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const faqs = [
    {
      q: 'How does the PDF Organizer work?',
      a: 'The PDF Organizer renders interactive previews of your document pages directly in your browser. You can rotate individual or all pages, delete unneeded pages, reorder them, or duplicate pages, then save the reorganized PDF instantly.'
    },
    {
      q: 'Does organizing or rotating affect PDF quality?',
      a: 'No. Page vectors, fonts, images, and form fields are preserved losslessly using client-side PDF document manipulation.'
    },
    {
      q: 'Are my PDF files uploaded to any servers?',
      a: 'Never. All rendering, page rotation, and reordering happen 100% locally in your browser’s memory using WebAssembly and Javascript. Your files never leave your computer.'
    },
    {
      q: 'Is there a page count limit?',
      a: 'You can organize documents of any size. For large documents with dozens or hundreds of pages, processing runs smoothly in your browser with optimized thumbnail rendering.'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Organize & Rotate PDF Online - Free & 100% Private | CompressBit</title>
        <meta
          name="description"
          content="Reorder, rotate, delete, or duplicate PDF pages directly in your browser. Free client-side PDF organizer with zero server uploads."
        />
        <script type="application/ld+json">
          {JSON.stringify(getWebApplicationSchema({
            name: 'CompressBit PDF Organizer',
            description: 'Rotate, reorder, and remove PDF pages 100% locally and privately.',
            url: 'https://www.compressbit.com/pdf/organize'
          }))}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between pb-20 md:pb-0">
        <Header />

        <main className="flex-grow pt-24 pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            {/* Header / Intro */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                <Layers className="w-3.5 h-3.5" />
                Client-Side PDF Organizer
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                Organize & Rotate PDF
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
                Rotate pages, reorder by dragging or clicking, remove unwanted pages, and export your new PDF document privately in seconds.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Step 1: Upload Zone (when no file loaded) */}
            {!file && !isLoadingThumbs && (
              <Card
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-12 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-200 text-center flex flex-col items-center justify-center space-y-4 ${
                  isDragging
                    ? 'border-primary bg-primary/5 scale-[1.01]'
                    : 'border-border hover:border-primary/50 bg-card/50 hover:bg-card'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />

                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Upload className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <p className="text-lg font-semibold text-foreground">
                    Click to select PDF or drag and drop here
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF documents up to 100MB • 100% Private, client-side processing
                  </p>
                </div>

                <Button variant="outline" className="rounded-xl mt-2 pointer-events-none">
                  Choose PDF File
                </Button>
              </Card>
            )}

            {/* Loading Page Thumbnails */}
            {isLoadingThumbs && (
              <Card className="p-12 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg text-foreground">Preparing Document</h3>
                  <p className="text-xs text-muted-foreground">{loadStatus || 'Generating page previews...'}</p>
                </div>
                <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-200"
                    style={{ width: `${loadProgress}%` }}
                  />
                </div>
              </Card>
            )}

            {/* Step 2: Interactive Page Grid & Controls */}
            {file && !isLoadingThumbs && pages.length > 0 && !result && (
              <div className="space-y-6">
                {/* File Info Bar & Toolbar */}
                <Card className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 bg-card border-border shadow-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold truncate text-foreground">{file.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {pages.length} pages • {formatSize(file.size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRotateAll(90)}
                      className="gap-1.5 text-xs rounded-lg"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      Rotate All +90°
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReverseOrder}
                      className="gap-1.5 text-xs rounded-lg"
                    >
                      Reverse Order
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetOrder}
                      className="gap-1.5 text-xs rounded-lg"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Reset
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetAll}
                      className="gap-1 text-xs text-destructive hover:bg-destructive/10 rounded-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                      Clear
                    </Button>
                  </div>
                </Card>

                <Card className="p-4 sm:p-5 bg-card border-border space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Export additions</h4>
                    <p className="text-xs text-muted-foreground">Add page numbers and a visible watermark or typed signature to the exported PDF.</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 items-end">
                    <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer h-10">
                      <input
                        type="checkbox"
                        checked={addPageNumbers}
                        onChange={(event) => setAddPageNumbers(event.target.checked)}
                        className="accent-primary"
                      />
                      Add page numbers
                    </label>
                    <div className="space-y-1">
                      <label htmlFor="pdf-watermark" className="text-xs font-semibold text-muted-foreground">Watermark or signature text</label>
                      <input
                        id="pdf-watermark"
                        type="text"
                        maxLength="80"
                        value={watermarkText}
                        onChange={(event) => setWatermarkText(event.target.value)}
                        placeholder="e.g. CONFIDENTIAL or Your Name"
                        className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm"
                      />
                    </div>
                  </div>
                </Card>

                {/* Grid of Pages */}
                <p className="text-xs text-muted-foreground">Drag a page preview by its handle to reorder it, or use the left and right buttons on touch devices.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {pages.map((p, idx) => (
                    <Card
                      key={p.id}
                      className={`group p-3 flex flex-col justify-between space-y-3 bg-card border-border hover:border-primary/40 transition-all rounded-2xl relative overflow-hidden shadow-sm ${
                        draggedPageId === p.id ? 'opacity-50 scale-[0.98]' : ''
                      }`}
                    >
                      {/* Page Thumbnail Box */}
                      <div
                        draggable
                        onDragStart={(event) => handlePageDragStart(event, p.id)}
                        onDragOver={handlePageDragOver}
                        onDrop={(event) => handlePageDrop(event, p.id)}
                        onDragEnd={() => setDraggedPageId(null)}
                        title="Drag to reorder this page"
                        aria-label={`Drag page ${idx + 1} to reorder`}
                        className="relative aspect-[3/4] bg-muted/40 rounded-xl overflow-hidden flex items-center justify-center p-2 cursor-grab active:cursor-grabbing"
                      >
                        <img
                          src={p.url}
                          alt={`Page ${idx + 1}`}
                          draggable={false}
                          style={{ transform: `rotate(${p.rotation || 0}deg)` }}
                          className="max-w-full max-h-full object-contain transition-transform duration-300 drop-shadow-md select-none pointer-events-none"
                        />
                        <div className="absolute bottom-2 right-2 p-1 rounded-md bg-background/85 text-muted-foreground border border-border/70 pointer-events-none">
                          <GripVertical className="w-3.5 h-3.5" />
                        </div>
                        {/* Page Number Badge */}
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-background/90 backdrop-blur-md text-[11px] font-semibold text-foreground border border-border/80">
                          #{idx + 1}
                        </div>
                        {p.rotation !== 0 && (
                          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-primary text-[10px] font-bold text-primary-foreground">
                            {p.rotation}°
                          </div>
                        )}
                      </div>

                      {/* Controls Toolbar */}
                      <div className="flex items-center justify-between gap-1 pt-1">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Rotate Left -90°"
                            className="w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground"
                            onClick={() => handleRotatePage(idx, -90)}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Rotate Right +90°"
                            className="w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground"
                            onClick={() => handleRotatePage(idx, 90)}
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Move Left"
                            disabled={idx === 0}
                            className="w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30"
                            onClick={() => handleMovePage(idx, idx - 1)}
                          >
                            <MoveLeft className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Move Right"
                            disabled={idx === pages.length - 1}
                            className="w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30"
                            onClick={() => handleMovePage(idx, idx + 1)}
                          >
                            <MoveRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Duplicate Page"
                            className="w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground"
                            onClick={() => handleDuplicatePage(idx)}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete Page"
                            className="w-7 h-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeletePage(idx)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Bottom Action Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-card border border-border rounded-2xl">
                  <div>
                    <h4 className="text-base font-bold text-foreground">Ready to export?</h4>
                    <p className="text-xs text-muted-foreground">
                      Document will contain {pages.length} pages arranged exactly as shown above.
                    </p>
                  </div>

                  <Button
                    size="lg"
                    onClick={handleExport}
                    disabled={isProcessing}
                    className="w-full sm:w-auto px-8 rounded-xl font-semibold shadow-lg shadow-primary/20 gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        {processStatus || 'Exporting...'}
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Save & Download PDF
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Result Card */}
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 max-w-xl mx-auto text-center"
              >
                <Card className="p-8 space-y-6 border-border bg-card shadow-xl rounded-3xl">
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-foreground">PDF Ready!</h3>
                    <p className="text-xs text-muted-foreground">
                      {result.totalPages} pages organized and generated locally.
                    </p>
                  </div>

                  <div className="p-4 bg-muted/40 rounded-xl space-y-2 text-left text-sm border border-border/50">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">File Name:</span>
                      <span className="font-medium text-foreground truncate max-w-[240px]">{result.fileName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">File Size:</span>
                      <span className="font-medium text-foreground">{formatSize(result.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Pages:</span>
                      <span className="font-medium text-foreground">{result.totalPages}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                      size="lg"
                      onClick={handleDownload}
                      className="flex-1 rounded-xl font-semibold gap-2 shadow-lg shadow-primary/20"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={resetAll}
                      className="rounded-xl"
                    >
                      Organize Another File
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Feature Highlights */}
            <div className="grid sm:grid-cols-3 gap-6 pt-12">
              <Card className="p-6 space-y-3 bg-card/60 border-border">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <RotateCw className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-foreground">Individual & Bulk Rotation</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Rotate specific landscape pages or turn all pages 90°, 180°, or 270° degrees in a single click.
                </p>
              </Card>

              <Card className="p-6 space-y-3 bg-card/60 border-border">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-foreground">Reorder & Duplicate</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Easily adjust the flow of your document by shifting pages, duplicating key sheets, or removing clutter.
                </p>
              </Card>

              <Card className="p-6 space-y-3 bg-card/60 border-border">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-foreground">100% Client-Side Privacy</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Zero files uploaded to any servers. All processing runs in your browser with high performance.
                </p>
              </Card>
            </div>

            {/* FAQ Section */}
            <div className="pt-8">
              <div className="text-center space-y-2 mb-8">
                <h2 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
                <p className="text-xs text-muted-foreground">Everything you need to know about organizing PDFs.</p>
              </div>
              <FAQAccordion faqs={faqs} />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PdfOrganizePage;
