import express from 'express';
import Ping from '../controllers/ping';

const router = express.Router();
router.get('/', async (_req, res) => {
  const response = await new Ping().getMessage();
  return res.send(response);
});

export default router;