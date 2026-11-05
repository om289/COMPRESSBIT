/**
 * Client-side image format converter using HTML5 Canvas.
 * Supports PNG, JPG (JPEG), and WebP conversion entirely in the browser.
 */

/**
 * Converts an image file to a specified format and quality.
 * 
 * @param {File} file - The original image file
 * @param {string} targetFormat - The format to convert to ('png', 'jpeg', or 'webp')
 * @param {number} quality - The quality setting from 0 to 1 (only applies to jpeg/webp)
 * @param {object} options - Optional batch edits applied during conversion.
 * @param {number} options.maxWidth - Maximum output width in pixels.
 * @param {number} options.maxHeight - Maximum output height in pixels.
 * @param {boolean} options.enhanceScan - Increase contrast and remove colour for scans.
 * @param {string} options.watermarkText - Optional text watermark.
 * @returns {Promise<{fileName: string, originalSize: number, convertedSize: number, convertedBlob: Blob, targetFormat: string}>}
 */
export async function convertImageFormat(file, targetFormat, quality = 0.9, options = {}) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    
    img.onload = () => {
      try {
        const maxWidth = Number(options.maxWidth) > 0 ? Number(options.maxWidth) : Infinity;
        const maxHeight = Number(options.maxHeight) > 0 ? Number(options.maxHeight) : Infinity;
        const ratio = Math.min(1, maxWidth / img.naturalWidth, maxHeight / img.naturalHeight);
        const outputWidth = Math.max(1, Math.round(img.naturalWidth * ratio));
        const outputHeight = Math.max(1, Math.round(img.naturalHeight * ratio));
        const canvas = document.createElement('canvas');
        canvas.width = outputWidth;
        canvas.height = outputHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Could not get 2D canvas context'));
          return;
        }
        
        // For JPEG, we need a white background because JPEG doesn't support transparency
        if (targetFormat.toLowerCase() === 'jpeg' || targetFormat.toLowerCase() === 'jpg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.drawImage(img, 0, 0, outputWidth, outputHeight);

        if (options.enhanceScan) {
          const imageData = ctx.getImageData(0, 0, outputWidth, outputHeight);
          const pixels = imageData.data;
          for (let i = 0; i < pixels.length; i += 4) {
            const luminance = pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
            const enhanced = luminance > 190 ? 255 : luminance < 85 ? 0 : Math.min(255, Math.max(0, (luminance - 128) * 1.65 + 128));
            pixels[i] = enhanced;
            pixels[i + 1] = enhanced;
            pixels[i + 2] = enhanced;
          }
          ctx.putImageData(imageData, 0, 0);
        }

        if (options.watermarkText?.trim()) {
          const text = options.watermarkText.trim();
          const fontSize = Math.max(14, Math.round(Math.min(outputWidth, outputHeight) * 0.045));
          ctx.save();
          ctx.globalAlpha = 0.6;
          ctx.font = `700 ${fontSize}px sans-serif`;
          ctx.textAlign = 'right';
          ctx.textBaseline = 'bottom';
          ctx.lineWidth = Math.max(2, Math.round(fontSize / 12));
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
          ctx.fillStyle = '#ffffff';
          ctx.strokeText(text, outputWidth - fontSize, outputHeight - fontSize);
          ctx.fillText(text, outputWidth - fontSize, outputHeight - fontSize);
          ctx.restore();
        }
        
        // Map simple format labels to valid mime types
        let mimeType = 'image/jpeg';
        let ext = 'jpg';
        
        if (targetFormat.toLowerCase() === 'png') {
          mimeType = 'image/png';
          ext = 'png';
        } else if (targetFormat.toLowerCase() === 'webp') {
          mimeType = 'image/webp';
          ext = 'webp';
        }
        
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (blob) {
              // Construct clean filename
              const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
              const newFileName = `${originalNameWithoutExt}.${ext}`;
              
              resolve({
                fileName: newFileName,
                originalSize: file.size,
                convertedSize: blob.size,
                convertedBlob: blob,
                targetFormat: ext,
                width: outputWidth,
                height: outputHeight,
                metadataRemoved: true
              });
            } else {
              reject(new Error('Image canvas conversion yielded null blob'));
            }
          },
          mimeType,
          quality
        );
      } catch (error) {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image file source into an Image object'));
    };
    
    img.src = objectUrl;
  });
}
