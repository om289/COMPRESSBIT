/**
 * Compresses an image file (JPG, PNG, WebP) entirely in the browser using the Canvas API.
 * 
 * @param {File | Blob} file - The image file to compress.
 * @param {string} compressionLevel - 'good', 'aggressive', or 'extreme'.
 * @returns {Promise<Blob>} - The compressed image as a Blob.
 */
export const compressImageClient = async (file, compressionLevel = 'aggressive') => {
  const levels = ['good', 'aggressive', 'extreme'];
  const normalizedLevel = levels.includes(compressionLevel) ? compressionLevel : 'aggressive';

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Determine quality and max dimensions
        let quality = 0.85;
        let maxWidth = Infinity;
        let maxHeight = Infinity;
        let outputType = 'image/jpeg'; // Default to JPEG for best compression

        if (normalizedLevel === 'good') {
          quality = 0.85;
          // Keep original dimensions
          // If original was PNG, we can keep it PNG if not resizing, but JPEG is usually better for "compression"
          // However, for 'good' tier, if it's PNG we might want to keep it PNG.
          if (file.type === 'image/png') outputType = 'image/png';
        } else if (normalizedLevel === 'aggressive') {
          quality = 0.65;
          maxWidth = 1920;
          maxHeight = 1920;
          outputType = 'image/jpeg';
        } else if (normalizedLevel === 'extreme') {
          quality = 0.40;
          maxWidth = 1280;
          maxHeight = 1280;
          outputType = 'image/jpeg';
        }

        // Apply resizing
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { alpha: outputType === 'image/png' });
        
        // Fill white background for JPEGs (to prevent black backgrounds for transparent PNGs)
        if (outputType === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
            // Memory cleanup
            canvas.width = 0;
            canvas.height = 0;
          },
          outputType,
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export default compressImageClient;
