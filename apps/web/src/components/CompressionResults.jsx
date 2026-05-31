import React, { useState } from 'react';
import { CheckCircle2, Download, RefreshCw, FileText, TrendingDown, AlertTriangle, ShieldCheck, Package, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { AnimatedSizeCounter, AnimatedPercentageCounter } from './AnimatedCounter.jsx';
import { ImageCompareSlider } from './ImageCompareSlider.jsx';

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const CompressionResults = ({ results = [], preset, type = 'pdf', onDownload, onDownloadAll, onReset }) => {
  const [compareIndex, setCompareIndex] = useState(null);
  const isImage = type === 'image' || type === 'png' || type === 'jpg';
  const isBatch = results.length > 1;

  // Totals
  const successResults = results.filter(r => !r.error);
  const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
  const totalCompressed = results.reduce((sum, r) => sum + (r.error ? r.originalSize : r.compressedSize), 0);
  const overallPercentage = totalOriginal > 0 ? Number((((totalOriginal - totalCompressed) / totalOriginal) * 100).toFixed(2)) : 0;
  const isOverallLarger = totalCompressed >= totalOriginal;
  const errorCount = results.filter(r => r.error).length;

  const getTarget = (p) => {
    if (p === 'extreme') return 70;
    if (p === 'aggressive') return 50;
    return 30;
  };

  const targetPercentage = getTarget(preset);
  const metTarget = overallPercentage >= targetPercentage && !isOverallLarger;

  const presetLabels = {
    good: 'Good',
    aggressive: 'Aggressive',
    extreme: 'Extreme'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col items-center justify-center space-y-2 mb-8 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-2">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          {isBatch
            ? `${successResults.length} ${successResults.length === 1 ? 'File' : 'Files'} Optimized`
            : 'Optimization Complete'}
        </h2>
        <p className="text-muted-foreground font-medium flex items-center gap-1.5 justify-center">
          <ShieldCheck className="w-4 h-4 text-primary" />
          Processed locally in your browser
        </p>
      </div>

      <Card className="p-8 space-y-8 bg-card border-border shadow-lg rounded-2xl overflow-hidden relative">
        {metTarget && (
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        )}

        {/* File info bar */}
        <div className="flex items-start justify-between bg-muted/50 p-4 rounded-xl relative z-10">
          <div className="flex items-center space-x-4 min-w-0">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              {isBatch ? <Package className="w-6 h-6 text-primary" /> : <FileText className="w-6 h-6 text-primary" />}
            </div>
            <div className="flex-1 min-w-0 py-1">
              <p className="text-base font-semibold text-foreground truncate">
                {isBatch ? `${results.length} files processed` : results[0]?.fileName}
              </p>
              <p className="text-sm text-muted-foreground">
                Preset: <span className="font-medium text-foreground">{presetLabels[preset] || preset}</span>
                {errorCount > 0 && (
                  <span className="text-destructive ml-2">• {errorCount} failed</span>
                )}
              </p>
            </div>
          </div>

          {metTarget && (
            <div className="hidden sm:flex items-center space-x-1 text-green-600 bg-green-500/10 px-3 py-1 rounded-full text-sm font-medium shrink-0">
              <TrendingDown className="w-4 h-4" />
              <span>Perfect Optim</span>
            </div>
          )}
        </div>

        {/* Overall size stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
          <div className="flex flex-col space-y-2">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {isBatch ? 'Total Original' : 'Original'}
            </span>
            <span className="text-3xl font-bold text-foreground">
              <AnimatedSizeCounter value={totalOriginal} />
            </span>
          </div>

          <div className="flex flex-col space-y-2 border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-6">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {isBatch ? 'Total Compressed' : 'Compressed'}
            </span>
            <span className="text-3xl font-bold text-foreground">
              {isOverallLarger ? <AnimatedSizeCounter value={totalOriginal} /> : <AnimatedSizeCounter value={totalCompressed} />}
            </span>
          </div>

          <div className="flex flex-col space-y-2 border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-6">
            <span className={`text-sm font-medium uppercase tracking-wide ${metTarget ? 'text-green-500' : 'text-primary'}`}>
              Saving
            </span>
            <div className="flex items-baseline space-x-2">
              <span className={`text-3xl font-bold ${metTarget ? 'text-green-500' : 'text-primary'}`}>
                {isOverallLarger ? '0%' : <AnimatedPercentageCounter value={overallPercentage} />}
              </span>
            </div>
          </div>
        </div>

        {/* Per-file breakdown (batch only) */}
        {isBatch && (
          <div className="space-y-3 relative z-10">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">File Breakdown</span>
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {results.map((result, index) => {
                const fileIsLarger = !result.error && result.compressedSize >= result.originalSize;
                const fileSaving = fileIsLarger ? 0 : result.actualPercentage;

                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      {result.error ? (
                        <AlertCircle className="w-4 h-4 text-destructive" />
                      ) : isImage ? (
                        <ImageIcon className="w-4 h-4 text-primary" />
                      ) : (
                        <FileText className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{result.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {result.error
                          ? <span className="text-destructive">{result.error}</span>
                          : `${formatFileSize(result.originalSize)} → ${formatFileSize(result.compressedSize)}`
                        }
                      </p>
                    </div>
                    {!result.error && (
                      <>
                        <span
                          className={`text-xs font-bold shrink-0 ${fileSaving >= targetPercentage ? 'text-green-500' : 'text-primary'}`}
                          style={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                          -{fileSaving}%
                        </span>
                        {isImage && result.originalFile && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCompareIndex(index)}
                            className="shrink-0 w-8 h-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
                            title={`Compare quality for ${result.fileName}`}
                          >
                            <ImageIcon className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDownload(index)}
                          className="shrink-0 w-8 h-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
                          title={`Download ${result.fileName}`}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Already-optimized warning */}
        {isOverallLarger && (
          <div className="p-4 bg-secondary text-secondary-foreground rounded-xl text-sm border border-border flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <strong>Maximized Optimization</strong>
              <p className="text-muted-foreground mt-1">
                {isBatch ? 'These files are' : 'This file is'} already perfectly optimized. Browser-level compression cannot reduce {isBatch ? 'them' : 'it'} further without significant quality loss.
              </p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border relative z-10">
          {isBatch && successResults.length > 0 ? (
            <>
              <Button
                onClick={onDownloadAll}
                size="lg"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg h-14 text-base"
              >
                <Download className="w-5 h-5 mr-2" />
                Download All as ZIP
              </Button>
              <Button
                onClick={onReset}
                size="lg"
                variant="outline"
                className="sm:w-auto transition-all duration-200 bg-background hover:bg-muted h-14 text-base px-8"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                New Files
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => onDownload(0)}
                size="lg"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg h-14 text-base"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Result
              </Button>
              {isImage && results[0]?.originalFile && (
                <Button
                  onClick={() => setCompareIndex(0)}
                  size="lg"
                  variant="outline"
                  className="flex-1 border-primary text-primary hover:bg-primary/10 transition-all duration-200 h-14 text-base rounded-xl"
                >
                  <ImageIcon className="w-5 h-5 mr-2" />
                  Compare Quality
                </Button>
              )}
              <Button
                onClick={onReset}
                size="lg"
                variant="outline"
                className="sm:w-auto transition-all duration-200 bg-background hover:bg-muted h-14 text-base px-8"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                New File
              </Button>
            </>
          )}
        </div>
      </Card>

      {compareIndex !== null && (
        <ImageCompareSlider
          isOpen={compareIndex !== null}
          onClose={() => setCompareIndex(null)}
          originalFile={results[compareIndex]?.originalFile}
          compressedBlob={results[compareIndex]?.compressedData}
          fileName={results[compareIndex]?.fileName}
        />
      )}
    </motion.div>
  );
};

export default CompressionResults;