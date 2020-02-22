import express from 'express';
import auth from '../middlewares/auth';

import tcrRouter from './tcrs';
import invoiceRouter from './invoices';
import { extractKeys } from '../middlewares/keyExtractor';

const router = express.Router();

router.get('/status', (req, res) => res.send('OK'));
router.use(auth);
router.use(extractKeys);

router.use('/tcrs', tcrRouter);
router.use('/invoices', invoiceRouter);

export default router;
