import express from 'express';
import auth from '../middlewares/auth';

import tcrRouter from './tcrs';

const router = express.Router();

router.get('/status', (req, res) => res.send('OK'));
router.use(auth);

router.use('/tcrs', tcrRouter);

export default router;
