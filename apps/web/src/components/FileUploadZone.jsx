import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, X, Loader2, CheckCircle2, Server, DownloadCloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import PresetCompressionButtons from './PresetCompressionButtons.jsx';
import CompressionPreview from './CompressionPreview.jsx';
import { compressPdfClient } from '@/lib/pdf-compressor-client.js';

const FileUploadZone = ({ onCompressionComplete }) => {
  const [file, setFile] = useState(null);
  const [preset, setPreset] = useState('recommended');
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionStage, setCompressionStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const stages = [
    { icon: FileText, text: 'Reading document...' },
    { icon: Server, text: 'Applying compression algorithms...' },
    { icon: CheckCircle2, text: 'Finalizing optimization...' }
  ];

  const validateFile = (selectedFile) => {
    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a valid PDF file');
      return false;
    }
    if (selectedFile.size > 100 * 1024 * 1024) {
      setError('File size must be less than 100MB');
      return false;
    }
    setError('');
    return true;
  };

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsCompressing(true);
    setError('');
    setProgress(0);
    setCompressionStage(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('compressionLevel', preset);

    // Simulate progress since standard fetch doesn't support upload progress
    const progressInterval = setInterval(() => {
      setProgress(p => {
        if (p < 40) {
          setCompressionStage(0);
          return p + 5;
        }
        if (p < 85) {
          setCompressionStage(1);
          return p + 2;
        }
        return p;
      });
    }, 400);

    try {
      setCompressionStage(0);
      setProgress(10);

      // Brief delay to show reading stage
      await new Promise(r => setTimeout(r, 800));
      
      setCompressionStage(1);
      setProgress(30);

      const compressedPdfBytes = await compressPdfClient(file, preset);
      
      setProgress(80);
      setCompressionStage(2);

      const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
      
      clearInterval(progressInterval);
      setProgress(100);

      const originalSize = file.size;
      const compressedSize = blob.size;
      const actualPercentage = ((originalSize - compressedSize) / originalSize) * 100;

      // Brief delay to show 100% completion
      setTimeout(() => {
        onCompressionComplete({
          originalSize,
          compressedSize,
          actualPercentage: Number(actualPercentage.toFixed(2)),
          fileName: file.name,
          compressedData: blob,
          preset
        });
      }, 600);

    } catch (err) {
      clearInterval(progressInterval);
      console.error('Compression error:', err);
      let errorMsg = err.message;
      if (err.message === 'Failed to fetch') {
        errorMsg = 'Network error. Please check your connection and try again.';
      }
      setError(errorMsg);
      setIsCompressing(false);
    }
  };

  const resetFlow = () => {
    setFile(null);
    setError('');
    setPreset('recommended');
  };

  if (isCompressing) {
    const CurrentIcon = stages[compressionStage]?.icon || Loader2;
    
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 md:p-12 bg-card border border-border rounded-3xl shadow-lg max-w-2xl mx-auto w-full"
      >
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-muted flex items-center justify-center">
              <CurrentIcon className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <svg className="absolute inset-0 w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-primary transition-all duration-300 ease-out"
                strokeDasharray={`${progress * 2.89} 289`}
              />
            </svg>
          </div>

          <div className="space-y-3 w-full">
            <h3 className="text-xl font-bold text-foreground">
              {progress === 100 ? 'Processing complete' : 'Optimizing document'}
            </h3>
            <p className="text-sm text-muted-foreground h-5 transition-all">
              {stages[compressionStage]?.text || 'Finalizing...'}
            </p>
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full pt-4">
            {stages.map((stage, idx) => {
              const isCompleted = idx < compressionStage || progress === 100;
              const isCurrent = idx === compressionStage && progress < 100;
              const StageIcon = stage.icon;
              
              return (
                <div key={idx} className={`flex items-center space-x-3 p-3 rounded-xl border transition-colors ${
                  isCurrent ? 'bg-primary/5 border-primary/30' : 
                  isCompleted ? 'bg-muted/30 border-border' : 'bg-transparent border-transparent opacity-50'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  ) : (
                    <StageIcon className={`w-5 h-5 shrink-0 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
                  )}
                  <span className={`text-xs font-medium text-left leading-tight ${
                    isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {stage.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  }

  if (file) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex items-center justify-between p-4 bg-muted/50 border border-border rounded-2xl">
          <div className="flex items-center space-x-4 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div className="truncate pr-4">
              <p className="text-base font-semibold text-foreground truncate">{file.name}</p>
              <p className="text-sm text-muted-foreground">Ready to process</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={resetFlow} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 rounded-xl">
            <X className="w-5 h-5" />
            <span className="sr-only">Remove file</span>
          </Button>
        </div>

        <PresetCompressionButtons value={preset} onChange={setPreset} />
        
        <CompressionPreview fileSize={file.size} preset={preset} />

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button 
            size="lg" 
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 text-lg h-14 shadow-lg shadow-primary/20 active:scale-[0.98]"
            onClick={handleCompress}
          >
            Compress PDF
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
          <div className="flex items-center justify-center space-x-2 text-destructive bg-destructive/10 p-4 rounded-xl border border-destructive/20 mt-4">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
      </motion.div>
    );
  }

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
          accept=".pdf,application/pdf"
          onChange={(e) => handleFileSelect(e.target.files[0])}
          className="hidden"
        />
        
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 ${
          isDragging ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-muted text-muted-foreground shadow-sm'
        }`}>
          {isDragging ? <FileText className="w-10 h-10" /> : <Upload className="w-10 h-10" />}
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
          Select PDF file
        </Button>
        
        <p className="text-sm text-muted-foreground mt-6 font-medium">
          Maximum file size: 100MB
        </p>
      </motion.div>
    </div>
  );
};

export default FileUploadZone;