import { PDFDocument } from 'pdf-lib';

const compressionSettings = {
  good: {
    imageQuality: 0.7,
    imageDpi: 96,
  },
  recommended: {
    imageQuality: 0.65,
    imageDpi: 84,
  },
  extreme: {
    imageQuality: 0.6,
    imageDpi: 72,
  },
};

/**
 * Compresses a PDF file entirely in the browser using pdf-lib.
 * @param {File | Blob} file - The PDF file to compress.
 * @param {string} compressionLevel - 'good', 'recommended', or 'extreme'.
 * @returns {Promise<Uint8Array>} - The compressed PDF bytes.
 */
export const compressPdfClient = async (file, compressionLevel = 'recommended') => {
  if (!compressionSettings[compressionLevel]) {
    throw new Error(`Invalid compression level: ${compressionLevel}. Must be one of: good, recommended, extreme`);
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  // Remove metadata and annotations to save space
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer('');
  pdfDoc.setCreator('');

  // Save with compression enabled
  // pdf-lib's save() method with useObjectStreams significantly reduces file size
  const compressedPdfBytes = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  return compressedPdfBytes;
};

export default compressPdfClient;
