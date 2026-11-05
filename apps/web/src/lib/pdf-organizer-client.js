import { PDFDocument, degrees, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/**
 * Renders thumbnail previews for all pages in a PDF file.
 *
 * @param {File | Blob} file
 * @param {function} onProgress - (pct, label)
 * @param {object} options - Optional annotations to add to exported pages.
 * @param {boolean} options.addPageNumbers - Add sequential page numbers.
 * @param {string} options.watermarkText - Add centered watermark or signature text.
 * @returns {Promise<{ totalPages: number, pages: Array<{ id: string, originalIndex: number, pageNum: number, url: string, rotation: number, width: number, height: number }> }>}
 */
export async function loadPdfPagesWithThumbnails(file, onProgress) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;

  const pages = [];

  for (let i = 1; i <= totalPages; i++) {
    if (onProgress) {
      const pct = Math.round((i / totalPages) * 100);
      onProgress(pct, `Loading preview for page ${i} of ${totalPages}...`);
    }

    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 0.35 });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { alpha: false });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport: viewport,
      background: 'white'
    }).promise;

    pages.push({
      id: `page-${i}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      originalIndex: i - 1, // 0-indexed for pdf-lib copyPages
      pageNum: i,
      url: canvas.toDataURL('image/jpeg', 0.65),
      rotation: 0, // In degrees: 0, 90, 180, 270
      width: viewport.width,
      height: viewport.height
    });

    page.cleanup();
    canvas.width = 0;
    canvas.height = 0;
  }

  return {
    totalPages,
    pages
  };
}

/**
 * Reorganizes, reorders, rotates, and exports a new PDF document client-side.
 *
 * @param {File | Blob} file - Source PDF file
 * @param {Array<{ originalIndex: number, rotation: number }>} pageConfigs - Order and rotation for each page
 * @param {function} onProgress - (pct, label)
 * @returns {Promise<{ blob: Blob, totalPages: number, size: number }>}
 */
export async function reorganizePdf(file, pageConfigs, onProgress, options = {}) {
  if (!pageConfigs || pageConfigs.length === 0) {
    throw new Error('You must keep at least one page in the document.');
  }

  if (onProgress) onProgress(10, 'Preparing document...');
  const arrayBuffer = await file.arrayBuffer();

  let srcPdf;
  try {
    srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  } catch (err) {
    throw new Error('Failed to read PDF file. It might be corrupted or protected.');
  }

  const newPdf = await PDFDocument.create();
  const total = pageConfigs.length;

  for (let i = 0; i < total; i++) {
    const config = pageConfigs[i];
    if (onProgress) {
      const pct = 10 + Math.round(((i + 1) / total) * 75);
      onProgress(pct, `Rebuilding page ${i + 1} of ${total}...`);
    }

    const [copiedPage] = await newPdf.copyPages(srcPdf, [config.originalIndex]);

    // Apply rotation
    if (config.rotation && config.rotation !== 0) {
      const existingRotation = copiedPage.getRotation().angle || 0;
      const finalRotation = (existingRotation + config.rotation) % 360;
      copiedPage.setRotation(degrees(finalRotation));
    }

    const { width, height } = copiedPage.getSize();
    if (options.addPageNumbers) {
      copiedPage.drawText(`Page ${i + 1} of ${total}`, {
        x: 28,
        y: 18,
        size: 9,
        color: rgb(0.28, 0.28, 0.32),
        opacity: 0.85,
      });
    }

    const watermarkText = options.watermarkText?.trim();
    if (watermarkText) {
      const fontSize = Math.max(18, Math.min(width, height) * 0.075);
      copiedPage.drawText(watermarkText, {
        x: Math.max(18, (width - watermarkText.length * fontSize * 0.52) / 2),
        y: height / 2,
        size: fontSize,
        color: rgb(0.35, 0.35, 0.4),
        opacity: 0.2,
        rotate: degrees(45),
      });
    }

    newPdf.addPage(copiedPage);
  }

  if (onProgress) onProgress(92, 'Generating optimized PDF file...');
  const finalBytes = await newPdf.save();
  const blob = new Blob([finalBytes], { type: 'application/pdf' });

  if (onProgress) onProgress(100, 'Complete!');

  return {
    blob,
    totalPages: total,
    size: blob.size
  };
}
