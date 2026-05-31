import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Image as ImageIcon, Lock, Upload } from 'lucide-react';

export const GlobalDropZone = ({ children }) => {
  const [dragActive, setDragActive] = useState(false);
  const [detectedType, setDetectedType] = useState('other'); // 'pdf' | 'image' | 'other'
  const dragCounter = useRef(0);
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if dragging files rather than elements
    if (e.dataTransfer && e.dataTransfer.types && !e.dataTransfer.types.includes('Files')) {
      return;
    }

    if (e.type === 'dragenter') {
      dragCounter.current += 1;
      if (dragCounter.current === 1) {
        // Detect drag file type
        const items = Array.from(e.dataTransfer.items || []);
        const hasPdf = items.some(item => item.type === 'application/pdf');
        const hasImage = items.every(item => item.type.startsWith('image/') || item.kind === 'file');

        if (hasPdf) {
          setDetectedType('pdf');
        } else if (hasImage && items.some(item => item.type.startsWith('image/'))) {
          setDetectedType('image');
        } else {
          setDetectedType('other');
        }
        setDragActive(true);
      }
    } else if (e.type === 'dragleave') {
      dragCounter.current -= 1;
      if (dragCounter.current === 0) {
        setDragActive(false);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const hasPdf = files.some(file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
      const hasImage = files.every(file => file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp|tiff)$/i.test(file.name));

      let targetPath = '/encrypt';
      if (hasPdf) {
        targetPath = '/pdf';
      } else if (hasImage) {
        targetPath = '/image';
      }

      navigate(targetPath, { state: { droppedFiles: files } });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    window.addEventListener('dragenter', handleDrag);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDrag);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDrag);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDrag);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {dragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md border-[6px] border-dashed border-primary/50 m-2 rounded-3xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="flex flex-col items-center text-center space-y-6 max-w-md p-8 bg-card border border-border rounded-2xl shadow-2xl relative"
            >
              {/* Type Specific Icon */}
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary animate-bounce">
                {detectedType === 'pdf' ? (
                  <FileText className="w-10 h-10" />
                ) : detectedType === 'image' ? (
                  <ImageIcon className="w-10 h-10" />
                ) : (
                  <Upload className="w-10 h-10" />
                )}
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Drop files to get started!</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Release to instantly open and process your{' '}
                  <span className="font-semibold text-foreground">
                    {detectedType === 'pdf' ? 'PDF document(s)' : detectedType === 'image' ? 'Image file(s)' : 'Files'}
                  </span>{' '}
                  locally.
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 bg-muted border border-border rounded-full text-xs font-medium text-muted-foreground">
                <Lock className="w-3.5 h-3.5" />
                100% Client-Side Processing
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
};
