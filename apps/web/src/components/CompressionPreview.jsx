import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, HardDrive, Cpu, Percent } from 'lucide-react';

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const CompressionPreview = ({ fileSize, preset }) => {
  const multipliers = {
    good: 0.65,
    recommended: 0.45,
    extreme: 0.25
  };
  
  const expectedPercentages = {
    good: '35%',
    recommended: '55%',
    extreme: '75%'
  };

  const expectedSize = fileSize * multipliers[preset];
  const expectedReduction = expectedPercentages[preset];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-6 shadow-sm mt-8"
    >
      <h4 className="text-sm font-semibold text-foreground mb-6 uppercase tracking-wider">Expected Results</h4>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center text-muted-foreground space-x-2">
            <HardDrive className="w-4 h-4" />
            <span className="text-xs font-medium">Original size</span>
          </div>
          <span className="text-2xl font-bold text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatFileSize(fileSize)}
          </span>
        </div>

        <div className="hidden sm:flex justify-center text-muted-foreground">
          <ArrowRight className="w-6 h-6 opacity-30" />
        </div>

        <div className="flex flex-col space-y-2 sm:pl-4">
          <div className="flex items-center text-primary space-x-2">
            <Cpu className="w-4 h-4" />
            <span className="text-xs font-medium">Estimated output</span>
          </div>
          <span className="text-2xl font-bold text-primary" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatFileSize(expectedSize)}
          </span>
        </div>

        <div className="flex flex-col space-y-2 pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l border-border sm:pl-6">
          <div className="flex items-center text-muted-foreground space-x-2">
            <Percent className="w-4 h-4" />
            <span className="text-xs font-medium">Est. reduction</span>
          </div>
          <span className="text-2xl font-bold text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>
            ~{expectedReduction}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default CompressionPreview;