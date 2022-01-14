import express from 'express';
import Echo from '../controllers/echo';

const router = express.Router();

router.get('/echo', async (_req, res) => {
  let response;

  if (_req.body.message != undefined) {
    response = await new Echo().postMessage(_req.body);
  } else {
    response = await new Echo().getMessage();
  }

  return res.send(response);
});

export default router;
