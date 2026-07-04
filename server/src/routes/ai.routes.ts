import { Router } from 'express';
import multer from 'multer';
import {
  getWritingAssist,
  processVoiceSuggestion,
  analyzeSuggestion,
  checkDuplicate
} from '../controllers/ai.controller';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

// Multer memory storage for parsing incoming files as buffers
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB limit
  }
});

router.post('/writing-assist', asyncHandler(getWritingAssist));
router.post('/voice', upload.single('audio'), asyncHandler(processVoiceSuggestion));
router.post('/analyze-suggestion', upload.single('image'), asyncHandler(analyzeSuggestion));
router.post('/duplicate-check', asyncHandler(checkDuplicate));

export default router;
