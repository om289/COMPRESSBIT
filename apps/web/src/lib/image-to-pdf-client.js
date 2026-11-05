import { jsPDF } from 'jspdf';

const loadImage = (file) => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ img, url, width: img.width, height: img.height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image "${file.name}"`));
    };
    img.src = url;
  });
};

/**
 * Compiles a list of image files into a single PDF document.
 * 
 * @param {File[]} files - Array of image files (JPG, PNG, WebP)
 * @param {object} options - Configuration options:
 * @param {string} options.pageSize - 'a4', 'a5', 'letter', 'photo', or 'fit'
 * @param {string} options.margin - 'none', 'small', 'large'
 * @param {string} options.orientation - 'auto', 'portrait', 'landscape'
 * @param {function} onProgress - Optional callback for tracking progress (pct, label)
 * @returns {Promise<Blob>}
 */
export async function convertImagesToPdf(files, options = {}, onProgress) {
  if (!files || files.length === 0) {
    throw new Error('At least one image is required.');
  }

  const pageSize = options.pageSize || 'a4';
  const margin = options.margin || 'none';
  const orientation = options.orientation || 'auto';

  let doc = null;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (onProgress) {
      const pct = Math.round((i / files.length) * 90);
      onProgress(pct, `Loading image ${i + 1} of ${files.length}: ${file.name}...`);
    }

    try {
      const { img, url, width: imgW, height: imgH } = await loadImage(file);

      let pageOrientation = 'portrait';
      if (orientation === 'auto') {
        pageOrientation = imgW > imgH ? 'landscape' : 'portrait';
      } else {
        pageOrientation = orientation;
      }

      let pageW, pageH;
      if (pageSize === 'a4') {
        pageW = pageOrientation === 'portrait' ? 595.28 : 841.89;
        pageH = pageOrientation === 'portrait' ? 841.89 : 595.28;
      } else if (pageSize === 'a5') {
        pageW = pageOrientation === 'portrait' ? 419.53 : 595.28;
        pageH = pageOrientation === 'portrait' ? 595.28 : 419.53;
      } else if (pageSize === 'letter') {
        pageW = pageOrientation === 'portrait' ? 612 : 792;
        pageH = pageOrientation === 'portrait' ? 792 : 612;
      } else if (pageSize === 'photo') {
        // Standard 4 × 6 inch print at PDF points (72 points per inch).
        pageW = pageOrientation === 'portrait' ? 288 : 432;
        pageH = pageOrientation === 'portrait' ? 432 : 288;
      } else {
        // Fit to image size (72 pt per inch)
        pageW = imgW;
        pageH = imgH;
      }

      let marginPt = 0;
      if (margin === 'small') marginPt = 20;
      if (margin === 'large') marginPt = 40;

      const availableW = pageW - marginPt * 2;
      const availableH = pageH - marginPt * 2;

      const imgRatio = imgW / imgH;
      const availRatio = availableW / availableH;

      let drawW = availableW;
      let drawH = availableH;

      if (imgRatio > availRatio) {
        drawH = availableW / imgRatio;
      } else {
        drawW = availableH * imgRatio;
      }

      const drawX = marginPt + (availableW - drawW) / 2;
      const drawY = marginPt + (availableH - drawH) / 2;

      const formatArg = ['fit', 'photo'].includes(pageSize) ? [pageW, pageH] : pageSize;

      if (i === 0) {
        doc = new jsPDF({
          orientation: pageOrientation,
          unit: 'pt',
          format: formatArg
        });
      } else {
        doc.addPage(formatArg, pageOrientation);
      }

      // jsPDF does not reliably detect every browser-decoded image format (notably
      // WebP). Convert the already decoded image to a known format first so every
      // format accepted by the picker can be written to the PDF.
      const canvas = document.createElement('canvas');
      canvas.width = imgW;
      canvas.height = imgH;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Your browser could not prepare this image for PDF export.');
      context.drawImage(img, 0, 0);
      const hasTransparency = file.type === 'image/png' || file.type === 'image/webp';
      const imageData = canvas.toDataURL(hasTransparency ? 'image/png' : 'image/jpeg', 0.92);
      doc.addImage(imageData, hasTransparency ? 'PNG' : 'JPEG', drawX, drawY, drawW, drawH, undefined, 'FAST');

      canvas.width = 0;
      canvas.height = 0;
      URL.revokeObjectURL(url);
    } catch (err) {
      throw new Error(`Failed to process "${file.name}": ${err.message}`);
    }
  }

  if (onProgress) onProgress(95, 'Generating PDF file...');

  const pdfOutput = doc.output('blob');

  if (onProgress) onProgress(100, 'Done!');

  return pdfOutput;
}
