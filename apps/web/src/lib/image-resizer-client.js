/**
 * Client-side high performance image resizing utility using HTML5 Canvas.
 */

/**
 * Loads an image file and extracts its natural dimensions.
 * @param {File | Blob} file
 * @returns {Promise<{ img: HTMLImageElement, width: number, height: number, url: string }>}
 */
export function loadImageMeta(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      resolve({
        img,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        url
      });
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image file. Please provide a valid JPG, PNG, or WebP.'));
    };

    img.src = url;
  });
}

/**
 * Resizes an image file client-side.
 *
 * @param {File | Blob} file
 * @param {object} options
 * @param {number} options.width - Target width in px
 * @param {number} options.height - Target height in px
 * @param {string} options.format - 'image/jpeg' | 'image/png' | 'image/webp'
 * @param {number} options.quality - 0.1 to 1.0
 * @param {string} options.fitMode - 'exact' | 'contain' | 'cover'
 * @param {string} options.backgroundColor - Optional background color (e.g. '#ffffff') if contain
 * @param {number} options.rotation - Rotation in degrees: 0, 90, 180, or 270
 * @param {boolean} options.flipHorizontal - Mirror the source image horizontally
 * @param {boolean} options.flipVertical - Mirror the source image vertically
 * @returns {Promise<{ blob: Blob, url: string, width: number, height: number, size: number, originalSize: number, originalWidth: number, originalHeight: number }>}
 */
export async function resizeImage(file, options = {}) {
  const { img, width: origW, height: origH, url: origUrl } = await loadImageMeta(file);

  const targetW = Math.max(1, Math.round(options.width || origW));
  const targetH = Math.max(1, Math.round(options.height || origH));
  const format = options.format || file.type || 'image/jpeg';
  const quality = typeof options.quality === 'number' ? options.quality : 0.9;
  const fitMode = options.fitMode || 'exact';
  const bgColor = options.backgroundColor || '#ffffff';
  const rotation = ((Number(options.rotation) || 0) % 360 + 360) % 360;
  const flipHorizontal = Boolean(options.flipHorizontal);
  const flipVertical = Boolean(options.flipVertical);

  if (![0, 90, 180, 270].includes(rotation)) {
    URL.revokeObjectURL(origUrl);
    throw new Error('Rotation must be 0°, 90°, 180°, or 270°.');
  }

  // Rotate first, then apply the selected fit method. This keeps cover and
  // contain calculations correct for portrait images rotated into landscape.
  const sourceCanvas = document.createElement('canvas');
  const sourceCtx = sourceCanvas.getContext('2d');
  const quarterTurn = rotation === 90 || rotation === 270;
  sourceCanvas.width = quarterTurn ? origH : origW;
  sourceCanvas.height = quarterTurn ? origW : origH;
  if (!sourceCtx) {
    URL.revokeObjectURL(origUrl);
    throw new Error('Failed to prepare the source image.');
  }
  sourceCtx.save();
  sourceCtx.translate(sourceCanvas.width / 2, sourceCanvas.height / 2);
  sourceCtx.rotate((rotation * Math.PI) / 180);
  sourceCtx.drawImage(img, -origW / 2, -origH / 2);
  sourceCtx.restore();

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: false });

  canvas.width = targetW;
  canvas.height = targetH;

  // Configure high-quality smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const drawImage = (x, y, width, height) => {
    ctx.save();
    if (flipHorizontal || flipVertical) {
      ctx.translate(targetW / 2, targetH / 2);
      ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
      ctx.translate(-targetW / 2, -targetH / 2);
    }
    ctx.drawImage(sourceCanvas, x, y, width, height);
    ctx.restore();
  };

  const sourceW = sourceCanvas.width;
  const sourceH = sourceCanvas.height;

  if (fitMode === 'contain') {
    // Fill background for non-transparent formats
    if (format === 'image/jpeg') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, targetW, targetH);
    }
    const hRatio = targetW / sourceW;
    const vRatio = targetH / sourceH;
    const ratio = Math.min(hRatio, vRatio);
    const centerShiftX = (targetW - sourceW * ratio) / 2;
    const centerShiftY = (targetH - sourceH * ratio) / 2;
    drawImage(centerShiftX, centerShiftY, sourceW * ratio, sourceH * ratio);
  } else if (fitMode === 'cover') {
    const hRatio = targetW / sourceW;
    const vRatio = targetH / sourceH;
    const ratio = Math.max(hRatio, vRatio);
    const centerShiftX = (targetW - sourceW * ratio) / 2;
    const centerShiftY = (targetH - sourceH * ratio) / 2;
    drawImage(centerShiftX, centerShiftY, sourceW * ratio, sourceH * ratio);
  } else {
    // 'exact' stretching to requested dimensions
    if (format === 'image/jpeg') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, targetW, targetH);
    }
    drawImage(0, 0, targetW, targetH);
  }

  // Revoke the temporary loader object url
  URL.revokeObjectURL(origUrl);
  sourceCanvas.width = 0;
  sourceCanvas.height = 0;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        // Clean up canvas
        canvas.width = 0;
        canvas.height = 0;

        if (!blob) {
          reject(new Error('Failed to render resized image canvas.'));
          return;
        }

        const resultUrl = URL.createObjectURL(blob);
        resolve({
          blob,
          url: resultUrl,
          width: targetW,
          height: targetH,
          size: blob.size,
          originalSize: file.size,
          originalWidth: origW,
          originalHeight: origH
        });
      },
      format,
      format === 'image/png' ? undefined : quality
    );
  });
}
