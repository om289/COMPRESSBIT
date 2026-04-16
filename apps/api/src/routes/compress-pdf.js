import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import upload from '../middleware/multer.js';
import compressPdf from '../utils/pdf-compressor.js';
import logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

router.post('/', upload.single('file'), async (req, res) => {
	// Validate file was uploaded
	if (!req.file) {
		return res.status(400).json({ error: 'No file uploaded. Please provide a PDF file.' });
	}

	// Validate compression level
	const { compressionLevel = 'recommended' } = req.body;
	const validLevels = ['good', 'recommended', 'extreme'];
	if (!validLevels.includes(compressionLevel)) {
		// Clean up uploaded file
		fs.unlinkSync(req.file.path);
		return res.status(400).json({
			error: `Invalid compression level: ${compressionLevel}. Must be one of: ${validLevels.join(', ')}`,
		});
	}

	const inputPath = req.file.path;
	const originalSize = req.file.size;

	let compressedPdfBytes;
	try {
		compressedPdfBytes = await compressPdf(inputPath, compressionLevel);
	} catch (error) {
		// Clean up uploaded file
		if (fs.existsSync(inputPath)) {
			fs.unlinkSync(inputPath);
		}
		throw new Error(`PDF compression failed: ${error.message}`);
	}

	const compressedSize = compressedPdfBytes.length;
	const reductionPercent = Math.round(((originalSize - compressedSize) / originalSize) * 100);

	logger.info(`PDF compressed: ${originalSize} bytes → ${compressedSize} bytes (${reductionPercent}% reduction)`);

	// Set response headers
	res.setHeader('Content-Type', 'application/pdf');
	res.setHeader('Content-Disposition', 'attachment; filename="compressed.pdf"');
	res.setHeader('Content-Length', compressedSize);

	// Send compressed PDF
	res.send(Buffer.from(compressedPdfBytes));

	// Clean up uploaded file after response is sent
	res.on('finish', () => {
		if (fs.existsSync(inputPath)) {
			fs.unlinkSync(inputPath);
			logger.info(`Temporary file deleted: ${inputPath}`);
		}
	});
});

export default router;