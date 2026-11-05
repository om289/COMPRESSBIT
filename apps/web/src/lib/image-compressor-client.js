/**
 * Compresses an image file (JPG, PNG, WebP) entirely in the browser using the Canvas API.
 * 
 * @param {File | Blob} file - The image file to compress.
 * @param {string} compressionLevel - 'good', 'aggressive', or 'extreme'.
 * @param {object} options
 * @param {number} options.targetSizeBytes - Optional maximum output size per image.
 * @returns {Promise<Blob>} - The compressed image as a Blob.
 */
const canvasToBlob = (canvas, type, quality) => new Promise((resolve, reject) => {
  canvas.toBlob((blob) => {
    if (blob) resolve(blob);
    else reject(new Error('Failed to compress image.'));
  }, type, quality);
});

const loadImage = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => resolve({ image, url });
  image.onerror = () => {
    URL.revokeObjectURL(url);
    reject(new Error('Failed to load image.'));
  };
  image.src = url;
});

export const compressImageClient = async (file, compressionLevel = 'aggressive', options = {}) => {
  const levels = ['good', 'aggressive', 'extreme'];
  const normalizedLevel = levels.includes(compressionLevel) ? compressionLevel : 'aggressive';
  const targetSizeBytes = Number(options.targetSizeBytes) > 0 ? Number(options.targetSizeBytes) : null;
  const { image, url } = await loadImage(file);
  const canvas = document.createElement('canvas');

  try {
    let quality = 0.85;
    let maxWidth = Infinity;
    let maxHeight = Infinity;
    let outputType = 'image/jpeg';

    if (normalizedLevel === 'good' && file.type === 'image/png') {
      outputType = 'image/png';
    } else if (normalizedLevel === 'aggressive') {
      quality = 0.65;
      maxWidth = 1920;
      maxHeight = 1920;
    } else if (normalizedLevel === 'extreme') {
      quality = 0.4;
      maxWidth = 1280;
      maxHeight = 1280;
    }

    // PNG ignores a quality setting. JPEG gives the target-size control a
    // predictable way to make every supported source format smaller.
    if (targetSizeBytes) outputType = 'image/jpeg';

    let width = image.naturalWidth || image.width;
    let height = image.naturalHeight || image.height;
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.max(1, Math.floor(width * ratio));
      height = Math.max(1, Math.floor(height * ratio));
    }

    let bestBlob = null;
    for (let attempt = 0; attempt < (targetSizeBytes ? 6 : 1); attempt += 1) {
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d', { alpha: outputType === 'image/png' });
      if (!context) throw new Error('Your browser could not create the image canvas.');
      if (outputType === 'image/jpeg') {
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, width, height);
      }
      context.drawImage(image, 0, 0, width, height);

      if (!targetSizeBytes || outputType === 'image/png') {
        bestBlob = await canvasToBlob(canvas, outputType, quality);
        break;
      }

      let low = 0.1;
      let high = quality;
      let closestUnderTarget = null;
      let smallestBlob = null;

      for (let pass = 0; pass < 8; pass += 1) {
        const candidateQuality = (low + high) / 2;
        const candidate = await canvasToBlob(canvas, outputType, candidateQuality);
        if (!smallestBlob || candidate.size < smallestBlob.size) smallestBlob = candidate;
        if (candidate.size <= targetSizeBytes) {
          closestUnderTarget = candidate;
          low = candidateQuality;
        } else {
          high = candidateQuality;
        }
      }

      bestBlob = closestUnderTarget || smallestBlob;
      if (bestBlob.size <= targetSizeBytes || (width <= 64 && height <= 64)) break;

      const scale = Math.max(0.5, Math.min(0.9, Math.sqrt(targetSizeBytes / bestBlob.size) * 0.92));
      width = Math.max(64, Math.floor(width * scale));
      height = Math.max(64, Math.floor(height * scale));
    }

    return bestBlob;
  } finally {
    canvas.width = 0;
    canvas.height = 0;
    URL.revokeObjectURL(url);
  }
};

export default compressImageClient;
