import express from 'express';
import Echo from '../controllers/echo';

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post('/echo', async (req: any, res) => {
  if (req.body && req.body.message)
    return res.send(await new Echo().postMessage(req.body));

  return res.sendStatus(await new Echo().getMessage());
});

export default router;
