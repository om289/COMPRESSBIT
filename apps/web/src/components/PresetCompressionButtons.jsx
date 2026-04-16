import React from 'react';
import { Leaf, Zap, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

const presets = [
  { 
    id: 'good', 
    label: 'Good', 
    desc: 'Normal compression',
    icon: Leaf,
    details: 'Best for preserving document elements and structure'
  },
  { 
    id: 'aggressive', 
    label: 'Aggressive', 
    desc: 'High compression',
    icon: Zap,
    details: 'Good balance of size reduction and quality'
  },
  { 
    id: 'extreme', 
    label: 'Extreme', 
    desc: 'Maximum compression',
    icon: Flame,
    details: 'Smallest possible size by aggressive flattening'
  }
];

const PresetCompressionButtons = ({ value, onChange }) => {
  return (
    <div className="w-full space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">Compression Level</h3>
        <p className="text-sm text-muted-foreground">Select how much you want to reduce the file size.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {presets.map((preset) => {
          const isSelected = value === preset.id;
          const Icon = preset.icon;
          
          return (
            <motion.button
              key={preset.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(preset.id)}
              className={`relative flex flex-col items-start p-5 rounded-2xl border transition-all duration-200 text-left ${
                isSelected 
                  ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm' 
                  : 'border-border bg-card hover:border-primary/50 hover:bg-muted/30'
              }`}
              aria-pressed={isSelected}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="block font-semibold text-foreground leading-none">{preset.label}</span>
                  <span className={`text-xs mt-1 block ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                    {preset.desc}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {preset.details}
              </p>
              
              {isSelected && (
                <motion.div 
                  layoutId="active-preset-indicator"
                  className="absolute inset-0 rounded-2xl border-2 border-primary pointer-events-none"
                  initial={false}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default PresetCompressionButtons;