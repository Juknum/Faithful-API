import express from 'express';
import ping from './routes/ping';
import echo from './routes/echo';
import raw from './routes/raw';
import texture from './routes/texture';

const router = express.Router();

// todo : use fs to automatically fetch all files from './routes'
router.use('/echo', echo);
router.use('/ping', ping);
router.use('/raw', raw);
router.use('/texture', texture);

export default router;
