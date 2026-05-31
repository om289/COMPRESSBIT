import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { parsePageRanges } from './pdf-splitter-client.js';

// Setup worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/**
 * Converts PDF pages into images (PNG/JPEG) locally in the browser.
 * 
 * @param {File | Blob} file - The source PDF file.
 * @param {object} options - Configuration options:
 * @param {string} options.format - 'png' or 'jpeg'
 * @param {number} options.scale - Canvas scale factor (default: 1.5)
 * @param {string} options.rangeStr - Page range to convert (e.g. '1-3, 5')
 * @param {function} onProgress - Optional callback for tracking progress (pct, label)
 * @returns {Promise<Array<{name: string, blob: Blob, pageNum: number}>>}
 */
export async function convertPdfToImages(file, options = {}, onProgress) {
  const format = options.format === 'png' ? 'png' : 'jpeg';
  const scale = options.scale || 1.5;
  const rangeStr = options.rangeStr || '';
  const quality = format === 'jpeg' ? 0.92 : undefined;
  
  const arrayBuffer = await file.arrayBuffer();
  if (onProgress) onProgress(10, 'Loading PDF...');
  
  let pdfDocument;
  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    pdfDocument = await loadingTask.promise;
  } catch (err) {
    throw new Error(`Failed to load "${file.name}". It may be corrupted or password-protected.`);
  }

  const totalPages = pdfDocument.numPages;
  
  // Resolve page indices to render
  let indices = [];
  if (rangeStr.trim()) {
    indices = parsePageRanges(rangeStr, totalPages);
  } else {
    for (let i = 0; i < totalPages; i++) {
      indices.push(i);
    }
  }
  
  if (indices.length === 0) {
    throw new Error('No valid pages found to convert.');
  }

  const results = [];
  const baseName = file.name.replace(/\.pdf$/i, '');
  const mimeType = `image/${format}`;
  const extension = format === 'png' ? 'png' : 'jpg';
  
  for (let i = 0; i < indices.length; i++) {
    const pageIdx = indices[i];
    const pageNum = pageIdx + 1;
    
    if (onProgress) {
      const pct = 10 + Math.round((i / indices.length) * 85);
      onProgress(pct, `Converting page ${pageNum} of ${totalPages}...`);
    }
    
    const page = await pdfDocument.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { alpha: format === 'png' });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      background: format === 'png' ? undefined : 'white'
    };
    
    await page.render(renderContext).promise;
    
    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, mimeType, quality);
    });
    
    results.push({
      name: `${baseName}-page-${pageNum}.${extension}`,
      blob,
      pageNum
    });
    
    // Explicit cleanup
    page.cleanup();
    canvas.width = 0;
    canvas.height = 0;
  }
  
  if (onProgress) onProgress(100, 'Done!');
  return results;
}
