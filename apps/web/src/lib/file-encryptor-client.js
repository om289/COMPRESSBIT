import { encryptPDF } from '@pdfsmaller/pdf-encrypt-lite';

// PBKDF2 Key Derivation Function (for general files)
async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a file. If it's a PDF, we use standard PDF password protection so it outputs a valid .pdf.
 * Otherwise, we use client-side AES-256 GCM encryption (.enc).
 *
 * @param {File} file - The file to encrypt.
 * @param {string} password - The password to encrypt the file with.
 * @returns {Promise<{blob: Blob, name: string, isStandardPdf: boolean}>} - The encrypted file details.
 */
export async function encryptFile(file, password) {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  if (isPdf) {
    const arrayBuffer = await file.arrayBuffer();
    const existingPdfBytes = new Uint8Array(arrayBuffer);
    
    // Encrypt the PDF using standard PDF encryption
    const encryptedBytes = await encryptPDF(existingPdfBytes, password);
    
    const lastDot = file.name.lastIndexOf('.');
    const baseName = lastDot !== -1 ? file.name.substring(0, lastDot) : file.name;
    
    return {
      blob: new Blob([encryptedBytes], { type: 'application/pdf' }),
      name: `${baseName}-protected.pdf`,
      isStandardPdf: true
    };
  }

  // Non-PDF general files (AES-256-GCM)
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const metadata = {
    name: file.name,
    type: file.type,
    size: file.size
  };
  
  const encoder = new TextEncoder();
  const metadataBytes = encoder.encode(JSON.stringify(metadata));
  const metadataLength = metadataBytes.byteLength;

  const fileBytes = new Uint8Array(await file.arrayBuffer());

  const payload = new Uint8Array(4 + metadataLength + fileBytes.byteLength);
  const view = new DataView(payload.buffer);
  view.setUint32(0, metadataLength, false);
  
  payload.set(metadataBytes, 4);
  payload.set(fileBytes, 4 + metadataLength);

  const key = await deriveKey(password, salt);
  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    payload
  );

  const combined = new Uint8Array(salt.byteLength + iv.byteLength + ciphertext.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.byteLength);
  combined.set(new Uint8Array(ciphertext), salt.byteLength + iv.byteLength);

  return {
    blob: new Blob([combined], { type: 'application/octet-stream' }),
    name: `${file.name}.enc`,
    isStandardPdf: false
  };
}

/**
 * Decrypt an encrypted file (.enc) using the correct password.
 *
 * @param {File | Blob} file - The encrypted file to decrypt.
 * @param {string} password - The password to decrypt the file.
 * @returns {Promise<{blob: Blob, name: string, size: number, type: string}>} - The decrypted file details.
 */
export async function decryptFile(file, password) {
  const combinedBuffer = await file.arrayBuffer();
  if (combinedBuffer.byteLength < 28) {
    throw new Error('Invalid or corrupted encrypted file.');
  }

  // Check if it's a standard PDF file
  const headerBytes = new Uint8Array(combinedBuffer, 0, 4);
  const headerString = String.fromCharCode(...headerBytes);
  if (headerString === '%PDF') {
    throw new Error(
      'This is a standard password-protected PDF. You can open and view this PDF directly in Chrome, Adobe Acrobat Reader, or Safari using your password!'
    );
  }

  const salt = new Uint8Array(combinedBuffer, 0, 16);
  const iv = new Uint8Array(combinedBuffer, 16, 12);
  const ciphertext = new Uint8Array(combinedBuffer, 28);

  // Derive AES-GCM key and decrypt
  const key = await deriveKey(password, salt);

  let decryptedBuffer;
  try {
    decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      ciphertext
    );
  } catch (err) {
    throw new Error('Incorrect password or corrupted file.');
  }

  const decryptedBytes = new Uint8Array(decryptedBuffer);
  const view = new DataView(decryptedBytes.buffer);
  const metadataLength = view.getUint32(0, false);

  if (decryptedBytes.byteLength < 4 + metadataLength) {
    throw new Error('Corrupted decryption payload or wrong file version.');
  }

  // Parse original file metadata
  const decoder = new TextDecoder();
  const metadataBytes = decryptedBytes.subarray(4, 4 + metadataLength);
  let metadata;
  try {
    metadata = JSON.parse(decoder.decode(metadataBytes));
  } catch (err) {
    throw new Error('Failed to parse file metadata.');
  }

  // Extract raw file contents
  const fileBytes = decryptedBytes.subarray(4 + metadataLength);
  const fileBlob = new Blob([fileBytes], { type: metadata.type || 'application/octet-stream' });

  return {
    blob: fileBlob,
    name: metadata.name,
    size: metadata.size,
    type: metadata.type
  };
}
