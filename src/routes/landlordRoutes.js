import { Router } from 'express';
import { kycUpload } from '../middleware/upload.js';
import { submitVerification } from '../controllers/verificationcontroller.js';

const router = Router();
router.post('/verifications', kycUpload, submitVerification);
export default router;