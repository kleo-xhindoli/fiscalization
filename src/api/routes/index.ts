import express from 'express';
import auth from '../middlewares/auth';

const router = express.Router();

router.get('/status', (req, res) => res.send('OK'));
router.use(auth);

export default router;
