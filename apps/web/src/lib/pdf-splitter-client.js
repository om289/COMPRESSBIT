import { PDFDocument } from 'pdf-lib';

/**
 * Parses page range string (e.g., '1-3, 5, 8-6') and returns 0-indexed page indices.
 * @param {string} rangeStr
 * @param {number} maxPages
 * @returns {number[]} Array of 0-indexed page numbers
 */
export function parsePageRanges(rangeStr, maxPages) {
  const indices = [];
  const parts = rangeStr.split(',');
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if (trimmed.includes('-')) {
      const [startStr, endStr] = trimmed.split('-');
      const start = parseInt(startStr.trim(), 10);
      const end = parseInt(endStr.trim(), 10);
      if (!isNaN(start) && !isNaN(end)) {
        const step = start <= end ? 1 : -1;
        for (let p = start; start <= end ? p <= end : p >= end; p += step) {
          if (p >= 1 && p <= maxPages) {
            indices.push(p - 1);
          }
        }
      }
    } else {
      const page = parseInt(trimmed, 10);
      if (!isNaN(page) && page >= 1 && page <= maxPages) {
        indices.push(page - 1);
      }
    }
  }
  return indices;
}

/**
 * Splits a PDF file by extracting pages based on ranges.
 * Returns a single merged PDF Blob.
 * 
 * @param {File | Blob} file - The source PDF file
 * @param {string} rangeStr - The range string (e.g., '1-3, 5')
 * @param {function} onProgress - Optional callback for tracking progress (pct, label)
 * @returns {Promise<Blob>}
 */
export async function extractPages(file, rangeStr, onProgress) {
  const arrayBuffer = await file.arrayBuffer();
  if (onProgress) onProgress(10, 'Loading PDF...');
  
  let srcPdf;
  try {
    srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  } catch (err) {
    throw new Error(`Failed to load "${file.name}". It may be corrupted or password-protected.`);
  }

  const maxPages = srcPdf.getPageCount();
  const indices = parsePageRanges(rangeStr, maxPages);
  if (indices.length === 0) {
    throw new Error('No valid pages found in specified range.');
  }

  if (onProgress) onProgress(30, `Extracting ${indices.length} pages...`);
  
  const newPdf = await PDFDocument.create();
  
  // Copy pages in chunks to keep the UI responsive and provide progress updates
  const chunkSize = 5;
  for (let i = 0; i < indices.length; i += chunkSize) {
    const chunk = indices.slice(i, i + chunkSize);
    const copiedPages = await newPdf.copyPages(srcPdf, chunk);
    copiedPages.forEach(page => newPdf.addPage(page));
    
    if (onProgress) {
      const pct = 30 + Math.round((i / indices.length) * 50);
      onProgress(pct, `Copying pages ${i + 1} to ${Math.min(i + chunkSize, indices.length)}...`);
    }
  }
  
  if (onProgress) onProgress(90, 'Saving PDF...');
  const bytes = await newPdf.save();
  if (onProgress) onProgress(100, 'Done!');
  
  return new Blob([bytes], { type: 'application/pdf' });
}

/**
 * Splits a PDF file into individual pages.
 * Returns an array of objects: { name: string, blob: Blob }
 * 
 * @param {File | Blob} file - The source PDF file
 * @param {function} onProgress - Optional callback for tracking progress (pct, label)
 * @returns {Promise<Array<{name: string, blob: Blob}>>}
 */
export async function splitAllPages(file, onProgress) {
  const arrayBuffer = await file.arrayBuffer();
  if (onProgress) onProgress(10, 'Loading PDF...');
  
  let srcPdf;
  try {
    srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  } catch (err) {
    throw new Error(`Failed to load "${file.name}". It may be corrupted or password-protected.`);
  }

  const maxPages = srcPdf.getPageCount();
  const results = [];
  const baseName = file.name.replace(/\.pdf$/i, '');
  
  for (let i = 0; i < maxPages; i++) {
    if (onProgress) {
      const pct = 10 + Math.round((i / maxPages) * 80);
      onProgress(pct, `Splitting page ${i + 1} of ${maxPages}...`);
    }
    
    const newPdf = await PDFDocument.create();
    const [page] = await newPdf.copyPages(srcPdf, [i]);
    newPdf.addPage(page);
    
    const bytes = await newPdf.save();
    const blob = new Blob([bytes], { type: 'application/pdf' });
    results.push({
      name: `${baseName}-page-${i + 1}.pdf`,
      blob
    });
  }
  
  if (onProgress) onProgress(100, 'Done!');
  return results;
}
