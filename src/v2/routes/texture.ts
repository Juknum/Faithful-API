import express from 'express';
import Texture from '../controllers/texture';

const router = express.Router();
router.get('/:id', async (req: any, res) => {
  return res.send(await new Texture().getId(req.params.id));
})

router.get('/:id/:type', async (req: any, res) => {
  return res.send(await new Texture().getType(req.params.id, req.params.type));
})

export default router;