import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Settings2 } from 'lucide-react';
import { motion } from 'framer-motion';

const CompressionQualitySlider = ({ value, onChange }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-card border border-border rounded-2xl p-6 shadow-sm mb-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Settings2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Compression Level</h3>
            <p className="text-xs text-muted-foreground">Adjust the balance between file size and quality</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
          <span className="text-sm font-bold text-primary" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {value}%
          </span>
        </div>
      </div>

      <div className="px-2">
        <Slider
          defaultValue={[50]}
          value={[value]}
          onValueChange={(vals) => onChange(vals[0])}
          max={100}
          step={1}
          className="py-4"
        />
        
        <div className="flex justify-between items-center mt-2 text-xs font-medium text-muted-foreground">
          <span>Smaller File</span>
          <span>Higher Quality</span>
        </div>
      </div>
    </motion.div>
  );
};

export default CompressionQualitySlider;