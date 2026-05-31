import { PDFDocument } from 'pdf-lib';

/**
 * Encrypts a PDF file using client-side password protection.
 * Powered by pdf-lib.
 * 
 * @param {File} file - The original PDF file
 * @param {string} password - The password to secure the PDF with
 * @returns {Promise<{fileName: string, originalSize: number, protectedSize: number, protectedBlob: Blob}>}
 */
export async function protectPdf(file, password) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    // Encrypt the PDF Document
    pdfDoc.encrypt({
      userPassword: password,
      ownerPassword: password,
      permissions: {
        printing: 'highResolution',
        modifying: true,
        copying: true,
        annotating: true,
        formFilling: true,
        contentAccessibility: true,
        documentAssembly: true
      }
    });
    
    const encryptedBytes = await pdfDoc.save();
    const blob = new Blob([encryptedBytes], { type: 'application/pdf' });
    
    return {
      fileName: file.name,
      originalSize: file.size,
      protectedSize: blob.size,
      protectedBlob: blob
    };
  } catch (error) {
    console.error('Error encrypting PDF:', error);
    throw new Error(error.message || 'Failed to encrypt PDF file.');
  }
}
