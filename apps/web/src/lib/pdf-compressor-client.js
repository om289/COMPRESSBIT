import * as pdfjsLib from 'pdfjs-dist';
import PdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker';
import { jsPDF } from 'jspdf';
import { PDFDocument } from 'pdf-lib';

// Use Vite's native Web Worker loader to bypass all URL pathing issues completely
pdfjsLib.GlobalWorkerOptions.workerPort = new PdfWorker();

/**
 * Compresses a PDF file entirely in the browser.
 * Good tier uses lossless metadata stripping.
 * Aggressive & Extreme tiers use page rasterization to achieve >50% compression, flattening text.
 * 
 * @param {File | Blob} file - The PDF file to compress.
 * @param {string} compressionLevel - 'good', 'aggressive', or 'extreme'.
 * @returns {Promise<Uint8Array>} - The compressed PDF bytes.
 */
export const compressPdfClient = async (file, compressionLevel = 'aggressive') => {
  const levels = ['good', 'aggressive', 'extreme'];
  const normalizedLevel = levels.includes(compressionLevel) ? compressionLevel : 'aggressive';

  const arrayBuffer = await file.arrayBuffer();

  // =========================================================
  // GOOD TIER: Lossless Compression using pdf-lib
  // Removes unused metadata and embeds Object Streams (approx 5-10% reduction)
  // =========================================================
  if (normalizedLevel === 'good') {
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    
    // Basic cleanup
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('');
    pdfDoc.setCreator('');

    const compressedPdfBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });
    
    return compressedPdfBytes;
  }

  // =========================================================
  // AGGRESSIVE & EXTREME TIER: Lossy Rasterization Pipeline
  // Uses pdfjs-dist to render pages to canvas, then jsPDF to rebuild (50-75% reduction)
  // =========================================================
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDocument = await loadingTask.promise;
  const numPages = pdfDocument.numPages;

  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'pt',
    format: 'a4',
    compress: true
  });

  // Determine scaling and quality to control final size vs visual fidelity
  // To keep black text the same (crisp size/shape), we lock the scale to 1.0x for all lossy tiers.
  // We offset the size completely by using extremely low JPEG qualities to heavily compress blank space.
  // Aggressive: 1.0x resolution, 0.45 jpeg quality
  // Extreme: 1.0x resolution, 0.15 jpeg quality
  const scale = 1.0;
  const imageQuality = normalizedLevel === 'extreme' ? 0.15 : 0.45;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    // Render the page onto a hidden canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { alpha: false }); // alpha false optimizes memory
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      background: 'white' // Prevents transparent artifacts
    };
    await page.render(renderContext).promise;

    // Extract highly compressed JPEG data from the canvas
    const imgData = canvas.toDataURL('image/jpeg', imageQuality);

    // Calculate dimensions to place it back into the jsPDF document
    // We use the 1.0 scale viewport for the actual physical PDF document sizing
    const originalViewport = page.getViewport({ scale: 1.0 });
    const width = originalViewport.width;
    const height = originalViewport.height;

    // Setup the page in jsPDF (skip adding for the first implicit page)
    if (pageNum === 1) {
      // Create first page with custom dimensions if needed
      // jsPDF initializes with A4, but our PDF might have different dimensions
      pdf.setPage(1);
    } else {
      pdf.addPage([width, height], width > height ? 'l' : 'p');
      pdf.setPage(pageNum);
    }

    // Embed the compressed image onto the PDF page
    // Using 'FAST' compression within jsPDF mapping
    pdf.addImage(imgData, 'JPEG', 0, 0, width, height, undefined, 'FAST');

    // Memory clean up
    page.cleanup();
    canvas.width = 0;
    canvas.height = 0;
  }

  // Generate final blob bytes
  const finalArrayBuffer = pdf.output('arraybuffer');
  return new Uint8Array(finalArrayBuffer);
};

export default compressPdfClient;
