import React from 'react';
import { CheckCircle2, Download, RefreshCw, FileText, TrendingDown, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

const CompressionResults = ({ originalSize, compressedSize, actualPercentage, fileName, preset, onDownload, onReset }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isLarger = compressedSize >= originalSize;

  const getTarget = (p) => {
    if (p === 'extreme') return 70;
    if (p === 'recommended') return 50;
    return 30; // good
  };

  const targetPercentage = getTarget(preset);
  const metTarget = actualPercentage >= targetPercentage && !isLarger;

  const presetLabels = {
    good: 'Good',
    recommended: 'Recommended',
    extreme: 'Extreme'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full space-y-6"
    >
      <div className="flex flex-col items-center justify-center space-y-2 mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-2">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">Compression Complete</h2>
        <p className="text-muted-foreground">Your document has been processed on the server.</p>
      </div>

      <Card className="p-8 space-y-8 bg-card border-border shadow-lg rounded-2xl overflow-hidden relative">
        {/* Dynamic Background Highlight based on result */}
        {metTarget && (
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        )}

        <div className="flex items-start justify-between bg-muted/50 p-4 rounded-xl relative z-10">
          <div className="flex items-center space-x-4 min-w-0">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0 py-1">
              <p className="text-base font-semibold text-foreground truncate">{fileName}</p>
              <p className="text-sm text-muted-foreground">Preset used: <span className="font-medium text-foreground">{presetLabels[preset]}</span></p>
            </div>
          </div>
          
          {metTarget && (
            <div className="hidden sm:flex items-center space-x-1 text-green-600 bg-green-500/10 px-3 py-1 rounded-full text-sm font-medium">
              <TrendingDown className="w-4 h-4" />
              <span>Target Met</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
          <div className="flex flex-col space-y-2">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Original size</span>
            <span className="text-3xl font-bold text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatFileSize(originalSize)}
            </span>
          </div>
          
          <div className="flex flex-col space-y-2 border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-6">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Output size</span>
            <span className="text-3xl font-bold text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {isLarger ? formatFileSize(originalSize) : formatFileSize(compressedSize)}
            </span>
          </div>
          
          <div className="flex flex-col space-y-2 border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-6">
            <span className={`text-sm font-medium uppercase tracking-wide ${metTarget ? 'text-green-500' : 'text-primary'}`}>
              Space saved
            </span>
            <div className="flex items-baseline space-x-2">
              <span className={`text-3xl font-bold ${metTarget ? 'text-green-500' : 'text-primary'}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
                {isLarger ? '0%' : `${actualPercentage}%`}
              </span>
            </div>
          </div>
        </div>

        {isLarger && (
          <div className="p-4 bg-secondary text-secondary-foreground rounded-xl text-sm border border-border flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <strong>Highly Optimized File</strong>
              <p className="text-muted-foreground mt-1">This file is already highly optimized. Our server-side compression could not reduce it further without unacceptably degrading quality.</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border relative z-10">
          <Button
            onClick={onDownload}
            size="lg"
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg h-14 text-base"
          >
            <Download className="w-5 h-5 mr-2" />
            Download {isLarger ? 'original' : 'compressed'} PDF
          </Button>
          
          <Button
            onClick={onReset}
            size="lg"
            variant="outline"
            className="sm:w-auto transition-all duration-200 bg-background hover:bg-muted h-14 text-base"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Compress Another File
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default CompressionResults;