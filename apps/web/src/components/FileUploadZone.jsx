import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, X, Loader2, CheckCircle2, Image as ImageIcon, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import PresetCompressionButtons from './PresetCompressionButtons.jsx';
import { compressPdfClient } from '@/lib/pdf-compressor-client.js';

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(i >= 2 ? 1 : 0) + ' ' + units[i];
};

const FileUploadZone = ({ onCompressionComplete, type = 'pdf', compressionFn, initialFiles = [] }) => {
  const [files, setFiles] = useState([]);
  const [preset, setPreset] = useState('aggressive');
  const [isCompressing, setIsCompressing] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      const validFiles = initialFiles.filter(f => {
        // Simple inline validation since validateFile is defined inside but doesn't set error
        if (type === 'image' || type === 'png' || type === 'jpg') {
          if (!f.type.startsWith('image/') && !/\.(jpe?g|png|webp|gif|bmp|tiff)$/i.test(f.name)) return false;
        } else {
          if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) return false;
        }
        return f.size <= 100 * 1024 * 1024;
      });
      
      if (validFiles.length > 0) {
        setFiles(prev => {
          const existingNames = new Set(prev.map(item => item.name));
          const uniqueNew = validFiles.filter(item => !existingNames.has(item.name));
          return [...prev, ...uniqueNew];
        });
      }
    }
  }, [initialFiles]);

  const isImage = type === 'image' || type === 'png' || type === 'jpg';
  const typeLabel = isImage ? 'Image' : 'PDF';
  const typeLabelPlural = isImage ? 'Images' : 'PDFs';
  const acceptTypes = isImage ? 'image/jpeg,image/png,image/webp' : 'application/pdf';
  const fileExtension = isImage ? '.jpg, .png, .webp' : '.pdf';

  const validateFile = (selectedFile) => {
    if (isImage) {
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please upload valid image files (JPG, PNG, WebP)');
        return false;
      }
    } else {
      if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setError('Please upload valid PDF files');
        return false;
      }
    }
    if (selectedFile.size > 100 * 1024 * 1024) {
      setError(`"${selectedFile.name}" exceeds the 100MB limit`);
      return false;
    }
    return true;
  };

  const handleFileSelect = (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    setError('');
    const newFiles = Array.from(selectedFiles).filter(f => validateFile(f));
    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCompress = async () => {
    if (files.length === 0) return;
    setIsCompressing(true);
    setError('');
    setProgress(0);
    setCurrentFileIndex(0);

    const results = [];

    for (let i = 0; i < files.length; i++) {
      setCurrentFileIndex(i);
      const baseProgress = Math.round((i / files.length) * 95);
      setProgress(baseProgress);

      try {
        const file = files[i];
        const compressedData = await (compressionFn ? compressionFn(file, preset) : compressPdfClient(file, preset));

        const resultBlob = compressedData instanceof Blob
          ? compressedData
          : new Blob([compressedData], { type: isImage ? file.type : 'application/pdf' });

        const originalSize = file.size;
        const compressedSize = resultBlob.size;
        const actualPercentage = ((originalSize - compressedSize) / originalSize) * 100;

        results.push({
          originalSize,
          compressedSize,
          actualPercentage: Number(actualPercentage.toFixed(2)),
          fileName: file.name,
          compressedData: resultBlob,
          preset,
          originalFile: file
        });
      } catch (err) {
        results.push({
          originalSize: files[i].size,
          compressedSize: files[i].size,
          actualPercentage: 0,
          fileName: files[i].name,
          compressedData: null,
          preset,
          error: err.message || 'Compression failed'
        });
      }

      setProgress(Math.round(((i + 1) / files.length) * 95));
    }

    setProgress(100);

    setTimeout(() => {
      onCompressionComplete(results);
    }, 600);
  };

  const resetFlow = () => {
    setFiles([]);
    setError('');
    setPreset('aggressive');
    setIsCompressing(false);
    setProgress(0);
  };

  // ─── RENDER: Compressing ───────────────────────────────────────────
  if (isCompressing) {
    const totalFiles = files.length;
    const currentFile = files[currentFileIndex];

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 md:p-12 bg-card border border-border rounded-3xl shadow-lg max-w-2xl mx-auto w-full"
      >
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          {/* Circular progress */}
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

          <div className="space-y-2 w-full">
            <h3 className="text-xl font-bold text-foreground">
              {progress === 100 ? 'Processing complete' : `Optimizing ${typeLabelPlural.toLowerCase()}`}
            </h3>
            <p className="text-sm text-muted-foreground">
              {progress < 100
                ? `Processing file ${currentFileIndex + 1} of ${totalFiles}`
                : 'Finalizing...'}
            </p>
            {currentFile && progress < 100 && (
              <p className="text-xs text-muted-foreground truncate max-w-sm mx-auto">
                {currentFile.name}
              </p>
            )}
          </div>

          {/* Linear progress */}
          <div className="w-full space-y-2">
            <div className="flex justify-between text-xs font-medium text-muted-foreground px-1">
              <span>Overall Progress</span>
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

          {/* Per-file status list (only for batch) */}
          {totalFiles > 1 && (
            <div className="w-full space-y-1.5 max-h-48 overflow-y-auto">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm ${
                    idx < currentFileIndex
                      ? 'bg-muted/30'
                      : idx === currentFileIndex
                        ? 'bg-primary/5 border border-primary/20'
                        : 'opacity-40'
                  }`}
                >
                  {idx < currentFileIndex ? (
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  ) : idx === currentFileIndex ? (
                    <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                  )}
                  <span className="truncate text-foreground">{file.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto shrink-0">{formatSize(file.size)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // ─── RENDER: Files selected ────────────────────────────────────────
  if (files.length > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* File list */}
        <div className="space-y-2">
          {files.map((file, index) => (
            <motion.div
              key={`${file.name}-${file.size}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-2xl"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {isImage
                    ? <ImageIcon className="w-5 h-5 text-primary" />
                    : <FileText className="w-5 h-5 text-primary" />}
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
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 rounded-xl w-8 h-8"
              >
                <X className="w-4 h-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Add-more strip */}
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
            accept={acceptTypes}
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
            <Plus className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">Add more {typeLabelPlural.toLowerCase()}</p>
            <p className="text-xs text-muted-foreground">Drop files or click to browse</p>
          </div>
        </div>

        <PresetCompressionButtons value={preset} onChange={setPreset} />

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            size="lg"
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 text-lg h-14 shadow-lg shadow-primary/20 active:scale-[0.98]"
            onClick={handleCompress}
          >
            Compress {files.length > 1 ? `${files.length} ${typeLabelPlural}` : typeLabel}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={resetFlow}
            className="sm:w-32 bg-card h-14 active:scale-[0.98]"
          >
            Cancel
          </Button>
        </div>

        {error && (
          <div className="flex items-center justify-center space-x-2 text-destructive bg-destructive/10 p-4 rounded-xl border border-destructive/20">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
      </motion.div>
    );
  }

  // ─── RENDER: Empty drop zone ───────────────────────────────────────
  return (
    <div className="w-full">
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
          accept={acceptTypes}
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 ${
          isDragging ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-muted text-muted-foreground shadow-sm'
        }`}>
          {isDragging
            ? (isImage ? <ImageIcon className="w-10 h-10" /> : <FileText className="w-10 h-10" />)
            : <Upload className="w-10 h-10" />}
        </div>

        <h3 className="text-2xl font-bold text-foreground mb-2">
          {isDragging ? `Drop your ${typeLabelPlural.toLowerCase()} here` : `Drag and drop your ${typeLabelPlural.toLowerCase()}`}
        </h3>
        <p className="text-base text-muted-foreground mb-8">
          or click to browse your device
        </p>

        <Button
          type="button"
          variant="outline"
          className="pointer-events-none bg-background shadow-sm px-8 h-12"
        >
          Select {typeLabel} files
        </Button>

        <p className="text-sm text-muted-foreground mt-6 font-medium">
          Supports: {fileExtension} (Max 100MB) • Select multiple files
        </p>
      </motion.div>
    </div>
  );
};

export default FileUploadZone;