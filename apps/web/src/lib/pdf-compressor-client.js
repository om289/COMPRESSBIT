import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { jsPDF } from 'jspdf';
import { PDFDocument } from 'pdf-lib';

// Use Vite's native Web Worker loader to bypass all URL pathing issues completely
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

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
  // Uses pdfjs-dist to render pages to canvas, then pdf-lib to rebuild (50-75% reduction)
  // =========================================================
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDocument = await loadingTask.promise;
  const numPages = pdfDocument.numPages;

  const newPdf = await PDFDocument.create();

  // Determine scaling and quality to control final size vs visual fidelity
  // To keep black text the same (crisp size/shape), we lock the scale to 1.0x for all lossy tiers.
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
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', imageQuality));
    const jpegBytes = new Uint8Array(await blob.arrayBuffer());

    // Calculate dimensions to place it back into the pdf-lib document
    const originalViewport = page.getViewport({ scale: 1.0 });
    const width = originalViewport.width;
    const height = originalViewport.height;

    // Embed standard JPEG and draw on a custom-sized page to prevent orientation/scaling crops
    const jpegImage = await newPdf.embedJpg(jpegBytes);
    const newPage = newPdf.addPage([width, height]);
    newPage.drawImage(jpegImage, {
      x: 0,
      y: 0,
      width: width,
      height: height,
    });

    // Memory clean up
    page.cleanup();
    canvas.width = 0;
    canvas.height = 0;
  }

  // Generate final blob bytes
  const finalBytes = await newPdf.save();
  return finalBytes;
};

export default compressPdfClient;
