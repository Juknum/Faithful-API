import express from 'express';
import Raw from '../controllers/raw';

const router = express.Router();
router.get('/:collection', async (req: any, res) => {
  return res.send(await new Raw().getRawCollection(req.params.collection));
});

export default router;
