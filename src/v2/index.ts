import express from 'express';
import ping from './routes/ping';
import echo from './routes/echo';

const router = express.Router();

// todo : use fs to automatically fetch all files from './routes'
router.use(echo);
router.use(ping);

export default router;
