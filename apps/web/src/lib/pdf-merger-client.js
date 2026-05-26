import { PDFDocument } from 'pdf-lib';

/**
 * Merge multiple PDF files into a single PDF document.
 * Uses pdf-lib's copyPages for zero quality loss.
 * 
 * @param {File[]} files - Array of PDF File objects to merge
 * @param {function} onProgress - Optional callback (percent, label)
 * @returns {Promise<{blob: Blob, totalPages: number, fileCount: number}>}
 */
export async function mergePdfs(files, onProgress) {
  if (!files || files.length < 2) {
    throw new Error('At least 2 PDF files are required to merge.');
  }

  const mergedPdf = await PDFDocument.create();
  let totalPages = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    if (onProgress) {
      const pct = Math.round(((i) / files.length) * 90) + 5;
      onProgress(pct, `Processing file ${i + 1}/${files.length}: ${file.name}`);
    }

    const arrayBuffer = await file.arrayBuffer();
    
    let srcPdf;
    try {
      srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    } catch (err) {
      throw new Error(`Failed to load "${file.name}". It may be corrupted or password-protected.`);
    }

    const pageIndices = srcPdf.getPageIndices();
    const copiedPages = await mergedPdf.copyPages(srcPdf, pageIndices);

    copiedPages.forEach((page) => {
      mergedPdf.addPage(page);
    });

    totalPages += pageIndices.length;
  }

  if (onProgress) {
    onProgress(95, 'Saving merged PDF...');
  }

  const mergedBytes = await mergedPdf.save();
  const blob = new Blob([mergedBytes], { type: 'application/pdf' });

  if (onProgress) {
    onProgress(100, 'Done!');
  }

  return {
    blob,
    totalPages,
    fileCount: files.length,
    size: blob.size,
  };
}
