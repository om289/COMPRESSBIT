import { Router } from 'express';
import healthCheck from './health-check.js';
import compressPdfRouter from './compress-pdf.js';

const router = Router();

export default () => {
    router.get('/health', healthCheck);
    router.use('/compress-pdf', compressPdfRouter);

    return router;
};