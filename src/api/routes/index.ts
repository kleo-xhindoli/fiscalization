import express from 'express';
import auth from '../middlewares/auth';

import tcrRouter from './tcrs';
import invoiceRouter from './invoices';

const router = express.Router();

router.get('/status', (req, res) => res.send('OK'));
router.use(auth);

router.use('/tcrs', tcrRouter);
router.use('/invoices', invoiceRouter);

export default router;
