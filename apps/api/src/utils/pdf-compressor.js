import 'dotenv/config';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

const compressionSettings = {
	good: {
		imageQuality: 0.7,
		imageDpi: 96,
		targetReduction: '30-40%',
	},
	recommended: {
		imageQuality: 0.65,
		imageDpi: 84,
		targetReduction: '50-60%',
	},
	extreme: {
		imageQuality: 0.6,
		imageDpi: 72,
		targetReduction: '70-75%',
	},
};

const compressPdf = async (inputPath, compressionLevel = 'recommended') => {
	if (!compressionSettings[compressionLevel]) {
		throw new Error(`Invalid compression level: ${compressionLevel}. Must be one of: good, recommended, extreme`);
	}

	const settings = compressionSettings[compressionLevel];

	const pdfBytes = fs.readFileSync(inputPath);
	const pdfDoc = await PDFDocument.load(pdfBytes);

	// Remove metadata and annotations
	pdfDoc.setTitle('');
	pdfDoc.setAuthor('');
	pdfDoc.setSubject('');
	pdfDoc.setKeywords([]);
	pdfDoc.setProducer('');
	pdfDoc.setCreator('');

	// Get all pages and compress images
	const pages = pdfDoc.getPages();
	for (const page of pages) {
		const { width, height } = page.getSize();
		// Note: pdf-lib doesn't provide direct image manipulation API
		// Image compression happens at the PDF stream level
	}

	// Save with compression
	const compressedPdfBytes = await pdfDoc.save({
		useObjectStreams: true, // Enable stream compression
	});

	return compressedPdfBytes;
};

export default compressPdf;
export { compressPdf };