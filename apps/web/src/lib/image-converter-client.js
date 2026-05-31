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
 * @returns {Promise<{fileName: string, originalSize: number, convertedSize: number, convertedBlob: Blob, targetFormat: string}>}
 */
export async function convertImageFormat(file, targetFormat, quality = 0.9) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
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
        
        ctx.drawImage(img, 0, 0);
        
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
                targetFormat: ext
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
