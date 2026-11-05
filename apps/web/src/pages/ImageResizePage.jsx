import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon, Upload, X, Download, CheckCircle2,
  AlertCircle, RefreshCw, ShieldCheck, Zap, Lock, Unlock,
  Sliders, Maximize2, Sparkles, Ratio, RotateCcw, FlipHorizontal2, FlipVertical2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { loadImageMeta, resizeImage } from '@/lib/image-resizer-client.js';
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

const SOCIAL_PRESETS = [
  { name: 'Instagram Square', width: 1080, height: 1080, label: '1:1 Square' },
  { name: 'Instagram Story / Reel', width: 1080, height: 1920, label: '9:16 Vertical' },
  { name: 'YouTube Thumbnail', width: 1280, height: 720, label: '16:9 Landscape' },
  { name: 'Twitter / X Post', width: 1200, height: 675, label: '16:9 Banner' },
  { name: 'Facebook Post', width: 1200, height: 630, label: '1.91:1 Post' },
  { name: 'Full HD (1080p)', width: 1920, height: 1080, label: 'Standard HD' },
];

const CROP_PRESETS = [
  { name: 'Square', ratio: 1 },
  { name: 'Portrait 4:5', ratio: 4 / 5 },
  { name: 'Landscape 16:9', ratio: 16 / 9 },
  { name: 'Photo 3:2', ratio: 3 / 2 },
];

const MM_PER_INCH = 25.4;
const mmToPx = (millimetres, dpi) => Math.max(1, Math.round((millimetres / MM_PER_INCH) * dpi));
const pxToMm = (pixels, dpi) => Number(((pixels / dpi) * MM_PER_INCH).toFixed(2));

const ImageResizePage = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [origWidth, setOrigWidth] = useState(0);
  const [origHeight, setOrigHeight] = useState(0);
  const [targetWidth, setTargetWidth] = useState(0);
  const [targetHeight, setTargetHeight] = useState(0);
  const [dimensionUnit, setDimensionUnit] = useState('px');
  const [dpi, setDpi] = useState(300);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [resizeMode, setResizeMode] = useState('dimensions'); // 'dimensions' | 'percentage' | 'preset'
  const [percentage, setPercentage] = useState(50);
  const [outputFormat, setOutputFormat] = useState('image/jpeg'); // 'image/jpeg' | 'image/png' | 'image/webp'
  const [quality, setQuality] = useState(90); // 10 to 100
  const [fitMode, setFitMode] = useState('exact'); // 'exact' | 'cover' | 'contain'
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [cropPreset, setCropPreset] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    trackPageView('/image/resize');
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

    if (!selected.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (selected.size > 50 * 1024 * 1024) {
      setError('File size exceeds the 50MB limit.');
      return;
    }

    setError('');
    setFile(selected);
    setResult(null);

    try {
      const meta = await loadImageMeta(selected);
      setPreviewUrl(meta.url);
      setOrigWidth(meta.width);
      setOrigHeight(meta.height);
      setTargetWidth(meta.width);
      setTargetHeight(meta.height);
      setPercentage(100);
      setOutputFormat(selected.type || 'image/jpeg');
    } catch (err) {
      console.error(err);
      setError('Could not read image file.');
      toast.error('Failed to load image.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleWidthChange = (val) => {
    const measurement = parseFloat(val) || 0;
    const num = dimensionUnit === 'mm' ? mmToPx(measurement, dpi) : Math.round(measurement);
    setTargetWidth(num);
    if (lockAspectRatio && origWidth > 0 && num > 0) {
      const calculatedH = Math.round((num / origWidth) * origHeight);
      setTargetHeight(calculatedH);
    }
  };

  const handleHeightChange = (val) => {
    const measurement = parseFloat(val) || 0;
    const num = dimensionUnit === 'mm' ? mmToPx(measurement, dpi) : Math.round(measurement);
    setTargetHeight(num);
    if (lockAspectRatio && origHeight > 0 && num > 0) {
      const calculatedW = Math.round((num / origHeight) * origWidth);
      setTargetWidth(calculatedW);
    }
  };

  const handleDpiChange = (value) => {
    const nextDpi = Math.min(1200, Math.max(72, parseInt(value, 10) || 300));
    if (dimensionUnit === 'mm' && dpi > 0) {
      const scale = nextDpi / dpi;
      setTargetWidth((current) => Math.max(1, Math.round(current * scale)));
      setTargetHeight((current) => Math.max(1, Math.round(current * scale)));
    }
    setDpi(nextDpi);
  };

  const handlePercentageChange = (pct) => {
    setPercentage(pct);
    if (origWidth > 0 && origHeight > 0) {
      setTargetWidth(Math.round((origWidth * pct) / 100));
      setTargetHeight(Math.round((origHeight * pct) / 100));
    }
  };

  const handleApplyPreset = (preset) => {
    setTargetWidth(preset.width);
    setTargetHeight(preset.height);
    setFitMode('cover');
    toast.success(`Applied ${preset.name} (${preset.width}x${preset.height})`);
  };

  const handleCropPreset = (preset) => {
    const width = targetWidth || origWidth;
    if (!width) return;
    setTargetWidth(width);
    setTargetHeight(Math.max(1, Math.round(width / preset.ratio)));
    setFitMode('cover');
    setCropPreset(preset.name);
    toast.success(`${preset.name} crop applied`);
  };

  const handleResize = async () => {
    if (!file || targetWidth <= 0 || targetHeight <= 0) {
      toast.error('Please specify valid target dimensions.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const res = await resizeImage(file, {
        width: targetWidth,
        height: targetHeight,
        format: outputFormat,
        quality: quality / 100,
        fitMode,
        rotation,
        flipHorizontal,
        flipVertical,
        backgroundColor
      });

      const ext = outputFormat === 'image/png' ? 'png' : outputFormat === 'image/webp' ? 'webp' : 'jpg';
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const fileName = `${baseName}_${res.width}x${res.height}.${ext}`;

      setResult({
        ...res,
        fileName
      });

      toast.success('Image successfully resized!');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to resize image.');
      toast.error('An error occurred during resizing.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.url;
    link.download = result.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetAll = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setResult(null);
    setError('');
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
    setCropPreset('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const faqs = [
    {
      q: 'How does the Image Resizer work?',
      a: 'The Image Resizer uses high-performance HTML5 Canvas and bicubic interpolation running entirely in your browser. It scales images smoothly without uploading any file data to a server.'
    },
    {
      q: 'Will resizing reduce image quality?',
      a: 'We use high-quality image smoothing algorithms to maintain crisp lines and sharp details when downscaling. You can also adjust output quality and format (PNG for lossless, WebP for compact size).'
    },
    {
      q: 'What is the Lock Aspect Ratio toggle?',
      a: 'When aspect ratio is locked, changing the width automatically updates the height proportionally (and vice versa) so your image doesn’t appear stretched or squashed.'
    },
    {
      q: 'How do I resize an image in millimetres for printing?',
      a: 'Choose Millimetres (mm), enter the final width and height, then select the printer’s DPI. For example, 100 × 150 mm at 300 DPI exports at roughly 1181 × 1772 pixels.'
    },
    {
      q: 'What formats are supported?',
      a: 'You can upload JPG, JPEG, PNG, and WebP files, and export to PNG, JPG, or modern WebP format.'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Resize Image Online - Free, Fast & 100% Private | CompressBit</title>
        <meta
          name="description"
          content="Resize JPG, PNG, and WebP images by pixels, millimetres and DPI, percentage, or social media presets. Rotate, flip, and export privately in your browser."
        />
        <script type="application/ld+json">
          {JSON.stringify(getWebApplicationSchema({
            name: 'CompressBit Image Resizer',
            description: 'Client-side image resizing and scaling tool with zero server uploads.',
            url: 'https://www.compressbit.com/image/resize'
          }))}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between pb-20 md:pb-0">
        <Header />

        <main className="flex-grow pt-24 pb-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            {/* Title & Description */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                <Maximize2 className="w-3.5 h-3.5" />
                Client-Side Image Resizer
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                Resize Image
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
                Resize images by pixels or print-ready millimetres and DPI, then rotate, mirror, or prepare them for social media — entirely on your device.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Upload Zone */}
            {!file && (
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
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />

                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Upload className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <p className="text-lg font-semibold text-foreground">
                    Click to upload an image or drag and drop here
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, WebP up to 50MB • Completely private, no server upload
                  </p>
                </div>

                <Button variant="outline" className="rounded-xl mt-2 pointer-events-none">
                  Select Image
                </Button>
              </Card>
            )}

            {/* Controls & Preview Layout */}
            {file && !result && (
              <div className="grid md:grid-cols-12 gap-8 items-start">
                {/* Left Preview Box */}
                <div className="md:col-span-5 space-y-4">
                  <Card className="p-4 bg-card border-border rounded-2xl space-y-3">
                    <div className="aspect-square bg-muted/40 rounded-xl overflow-hidden flex items-center justify-center p-2 relative">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain rounded-lg drop-shadow-md"
                      />
                    </div>

                    <div className="p-3 bg-muted/30 rounded-xl space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">File Name:</span>
                        <span className="font-medium truncate max-w-[180px] text-foreground">{file.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Original Dimensions:</span>
                        <span className="font-semibold text-foreground">{origWidth} × {origHeight} px</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Original Size:</span>
                        <span className="font-medium text-foreground">{formatSize(file.size)}</span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetAll}
                      className="w-full text-xs text-destructive hover:bg-destructive/10 rounded-lg gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      Choose Different Image
                    </Button>
                  </Card>
                </div>

                {/* Right Settings Form */}
                <div className="md:col-span-7 space-y-6">
                  <Card className="p-6 bg-card border-border rounded-2xl space-y-6">
                    {/* Mode Tabs */}
                    <div className="flex rounded-xl bg-muted p-1 gap-1">
                      <button
                        type="button"
                        onClick={() => setResizeMode('dimensions')}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                          resizeMode === 'dimensions'
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        By Dimensions
                      </button>
                      <button
                        type="button"
                        onClick={() => setResizeMode('percentage')}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                          resizeMode === 'percentage'
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        By Percentage
                      </button>
                      <button
                        type="button"
                        onClick={() => setResizeMode('preset')}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                          resizeMode === 'preset'
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Social Presets
                      </button>
                    </div>

                    {/* Mode 1: By Dimensions */}
                    {resizeMode === 'dimensions' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">Measurement unit</label>
                            <select
                              value={dimensionUnit}
                              onChange={(event) => setDimensionUnit(event.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                              <option value="px">Pixels (px)</option>
                              <option value="mm">Millimetres (mm)</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">DPI</label>
                            <input
                              type="number"
                              min="72"
                              max="1200"
                              value={dpi}
                              onChange={(event) => handleDpiChange(event.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 items-center">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">Width ({dimensionUnit})</label>
                            <input
                              type="number"
                              min="1"
                              step={dimensionUnit === 'mm' ? '0.01' : '1'}
                              value={dimensionUnit === 'mm' ? pxToMm(targetWidth, dpi) : targetWidth}
                              onChange={(e) => handleWidthChange(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">Height ({dimensionUnit})</label>
                            <input
                              type="number"
                              min="1"
                              step={dimensionUnit === 'mm' ? '0.01' : '1'}
                              value={dimensionUnit === 'mm' ? pxToMm(targetHeight, dpi) : targetHeight}
                              onChange={(e) => handleHeightChange(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setLockAspectRatio(!lockAspectRatio)}
                          className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                            lockAspectRatio
                              ? 'border-primary/40 bg-primary/5 text-primary'
                              : 'border-border text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {lockAspectRatio ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          {lockAspectRatio ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
                        </button>
                        {dimensionUnit === 'mm' && (
                          <p className="text-xs text-muted-foreground">
                            At {dpi} DPI: <strong className="text-foreground">{targetWidth} × {targetHeight} px</strong>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Mode 2: By Percentage */}
                    {resizeMode === 'percentage' && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-foreground">Scaling:</span>
                          <span className="font-bold text-primary text-sm">{percentage}%</span>
                        </div>

                        <input
                          type="range"
                          min="10"
                          max="200"
                          value={percentage}
                          onChange={(e) => handlePercentageChange(parseInt(e.target.value, 10))}
                          className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                        />

                        <div className="flex gap-2">
                          {[25, 50, 75, 100].map((pct) => (
                            <Button
                              key={pct}
                              type="button"
                              variant={percentage === pct ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handlePercentageChange(pct)}
                              className="flex-1 text-xs rounded-lg"
                            >
                              {pct}%
                            </Button>
                          ))}
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Resulting size: <strong className="text-foreground">{targetWidth} × {targetHeight} px</strong>
                        </p>
                      </div>
                    )}

                    {/* Mode 3: Social Presets */}
                    {resizeMode === 'preset' && (
                      <div className="grid grid-cols-2 gap-2.5">
                        {SOCIAL_PRESETS.map((p) => {
                          const isSelected = targetWidth === p.width && targetHeight === p.height;
                          return (
                            <button
                              key={p.name}
                              type="button"
                              onClick={() => handleApplyPreset(p)}
                              className={`p-3 text-left rounded-xl border transition-all text-xs space-y-1 ${
                                isSelected
                                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                  : 'border-border hover:border-foreground/30 bg-background'
                              }`}
                            >
                              <div className="font-semibold text-foreground">{p.name}</div>
                              <div className="text-[11px] text-muted-foreground">{p.width} × {p.height} ({p.label})</div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Format & Quality Settings */}
                    <div className="pt-4 border-t border-border space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground">Output Format</label>
                          <select
                            value={outputFormat}
                            onChange={(e) => setOutputFormat(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground font-semibold text-xs focus:outline-none"
                          >
                            <option value="image/jpeg">JPG (Standard)</option>
                            <option value="image/png">PNG (Lossless)</option>
                            <option value="image/webp">WebP (Modern/Small)</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground">Fit Method</label>
                          <select
                            value={fitMode}
                            onChange={(e) => setFitMode(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground font-semibold text-xs focus:outline-none"
                          >
                            <option value="exact">Exact Stretch</option>
                            <option value="cover">Crop to Fill (Cover)</option>
                            <option value="contain">Pad to Fit (Contain)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="block text-xs font-semibold text-muted-foreground">Rotate & Mirror</span>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setRotation((current) => (current + 270) % 360)}
                            className="rounded-lg gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Rotate left
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setRotation((current) => (current + 90) % 360)}
                            className="rounded-lg gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5 -scale-x-100" />
                            Rotate right
                          </Button>
                          <Button
                            type="button"
                            variant={flipHorizontal ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFlipHorizontal((current) => !current)}
                            className="rounded-lg gap-1.5"
                          >
                            <FlipHorizontal2 className="w-3.5 h-3.5" />
                            Flip horizontal
                          </Button>
                          <Button
                            type="button"
                            variant={flipVertical ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFlipVertical((current) => !current)}
                            className="rounded-lg gap-1.5"
                          >
                            <FlipVertical2 className="w-3.5 h-3.5" />
                            Flip vertical
                          </Button>
                          {(rotation !== 0 || flipHorizontal || flipVertical) && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => { setRotation(0); setFlipHorizontal(false); setFlipVertical(false); }}
                              className="rounded-lg"
                            >
                              Reset transform
                            </Button>
                          )}
                        </div>
                        {(rotation !== 0 || flipHorizontal || flipVertical) && (
                          <p className="text-xs text-muted-foreground">
                            {rotation !== 0 && `Rotation: ${rotation}°`}
                            {rotation !== 0 && (flipHorizontal || flipVertical) && ' • '}
                            {flipHorizontal && 'Mirrored horizontally'}
                            {flipHorizontal && flipVertical && ' • '}
                            {flipVertical && 'Mirrored vertically'}
                          </p>
                        )}
                      </div>

                      {outputFormat === 'image/jpeg' && (
                        <div className="flex items-center justify-between gap-4 rounded-xl bg-muted/30 p-3">
                          <div>
                            <span className="block text-xs font-semibold text-foreground">JPEG background</span>
                            <span className="text-xs text-muted-foreground">Used where transparent space needs filling.</span>
                          </div>
                          <input
                            type="color"
                            value={backgroundColor}
                            onChange={(event) => setBackgroundColor(event.target.value)}
                            aria-label="JPEG background color"
                            className="w-10 h-10 rounded-lg bg-transparent border border-border cursor-pointer"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs font-semibold text-muted-foreground">Crop to ratio</span>
                          {cropPreset && <span className="text-xs text-primary font-medium">{cropPreset}</span>}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {CROP_PRESETS.map((preset) => (
                            <Button
                              key={preset.name}
                              type="button"
                              variant={cropPreset === preset.name ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleCropPreset(preset)}
                              className="text-xs rounded-lg"
                            >
                              {preset.name}
                            </Button>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">Uses “Crop to Fill” to preserve the chosen frame without stretching.</p>
                      </div>

                      {outputFormat !== 'image/png' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-muted-foreground">Quality:</span>
                            <span className="font-bold text-foreground">{quality}%</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            value={quality}
                            onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                            className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                          />
                        </div>
                      )}
                    </div>

                    {/* Resize Action Button */}
                    <Button
                      size="lg"
                      onClick={handleResize}
                      disabled={isProcessing}
                      className="w-full rounded-xl font-semibold shadow-lg shadow-primary/20 gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Resizing Image...
                        </>
                      ) : (
                        <>
                          <Maximize2 className="w-4 h-4" />
                          Resize Image Now
                        </>
                      )}
                    </Button>
                  </Card>
                </div>
              </div>
            )}

            {/* Step 3: Success Card */}
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
                    <h3 className="text-2xl font-bold text-foreground">Image Resized!</h3>
                    <p className="text-xs text-muted-foreground">
                      Successfully scaled to {result.width} × {result.height} px
                    </p>
                  </div>

                  <div className="aspect-video bg-muted/30 rounded-xl overflow-hidden flex items-center justify-center p-2">
                    <img
                      src={result.url}
                      alt="Resized Result"
                      className="max-w-full max-h-full object-contain rounded-lg drop-shadow-md"
                    />
                  </div>

                  <div className="p-4 bg-muted/40 rounded-xl space-y-2 text-left text-sm border border-border/50">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">New Dimensions:</span>
                      <span className="font-bold text-foreground">{result.width} × {result.height} px</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Original Dimensions:</span>
                      <span className="text-muted-foreground">{result.originalWidth} × {result.originalHeight} px</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">New Size:</span>
                      <span className="font-semibold text-emerald-500">{formatSize(result.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Original Size:</span>
                      <span className="text-muted-foreground">{formatSize(result.originalSize)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                      size="lg"
                      onClick={handleDownload}
                      className="flex-1 rounded-xl font-semibold gap-2 shadow-lg shadow-primary/20"
                    >
                      <Download className="w-4 h-4" />
                      Download Image
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={resetAll}
                      className="rounded-xl"
                    >
                      Resize Another Image
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Features */}
            <div className="grid sm:grid-cols-3 gap-6 pt-12">
              <Card className="p-6 space-y-3 bg-card/60 border-border">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-foreground">Exact Pixels & Percentages</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Input custom width and height with aspect ratio locking or scale by precise percentages.
                </p>
              </Card>

              <Card className="p-6 space-y-3 bg-card/60 border-border">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Ratio className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-foreground">Social Media Presets</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Instant dimensions for Instagram square, Instagram stories, YouTube thumbnails, Twitter posts, and banners.
                </p>
              </Card>

              <Card className="p-6 space-y-3 bg-card/60 border-border">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-foreground">Private & Local</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Images never leave your machine. Processing happens entirely within your web browser using HTML5 Canvas.
                </p>
              </Card>
            </div>

            {/* FAQ Section */}
            <div className="pt-8">
              <div className="text-center space-y-2 mb-8">
                <h2 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
                <p className="text-xs text-muted-foreground">Common questions about client-side image resizing.</p>
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

export default ImageResizePage;
