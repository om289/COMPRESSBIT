import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ChevronsLeftRight, ImageIcon } from 'lucide-react';

export const ImageCompareSlider = ({ isOpen, onClose, originalFile, compressedBlob, fileName }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [originalUrl, setOriginalUrl] = useState('');
  const [compressedUrl, setCompressedUrl] = useState('');

  useEffect(() => {
    if (!originalFile || !compressedBlob) return;

    const origUrl = URL.createObjectURL(originalFile);
    const compUrl = URL.createObjectURL(compressedBlob);

    setOriginalUrl(origUrl);
    setCompressedUrl(compUrl);

    return () => {
      URL.revokeObjectURL(origUrl);
      URL.revokeObjectURL(compUrl);
    };
  }, [originalFile, compressedBlob]);

  if (!originalFile || !compressedBlob) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl w-[95vw] p-4 md:p-6 bg-card border-border rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            Before / After Comparison
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground truncate">
            {fileName} • Drag the slider to compare original vs compressed quality.
          </DialogDescription>
        </DialogHeader>

        <div className="relative aspect-[4/3] w-full max-h-[60vh] rounded-xl overflow-hidden bg-muted border border-border mt-4 select-none">
          {/* Compressed Image (Background) */}
          {compressedUrl && (
            <img
              src={compressedUrl}
              alt="Compressed Result"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />
          )}

          {/* Original Image (Foreground, clipped) */}
          {originalUrl && (
            <img
              src={originalUrl}
              alt="Original File"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              style={{
                clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
              }}
            />
          )}

          {/* Divider Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          />

          {/* Handle Badge/Button */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-black shadow-xl border border-border flex items-center justify-center z-20 pointer-events-none transition-transform duration-100 hover:scale-105"
            style={{ left: `${sliderPosition}%` }}
          >
            <ChevronsLeftRight className="w-4 h-4 text-zinc-700" />
          </div>

          {/* Labels */}
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white text-[10px] md:text-xs font-semibold px-2.5 py-1 rounded-lg border border-white/10 select-none z-20 pointer-events-none">
            Original (Before)
          </div>
          <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-white text-[10px] md:text-xs font-semibold px-2.5 py-1 rounded-lg border border-white/10 select-none z-20 pointer-events-none">
            Compressed (After)
          </div>

          {/* Invisible range input covering image to capture dragging */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={(e) => setSliderPosition(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
            aria-label="Before/after image slider divider"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
