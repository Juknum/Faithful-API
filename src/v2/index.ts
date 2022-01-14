import express from 'express';
import ping from './routes/ping';
import echo from './routes/echo';
import raw from './routes/raw';

const router = express.Router();

// todo : use fs to automatically fetch all files from './routes'
router.use(echo);
router.use(ping);
router.use(raw);

export default router;
