import { Router } from 'express';
import multer from 'multer';
import {
  getWritingAssist,
  processVoiceSuggestion,
  analyzeSuggestion,
  checkDuplicate
} from '../controllers/ai.controller';

const router = Router();

// Multer memory storage for parsing incoming files as buffers
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB limit
  }
});

router.post('/writing-assist', getWritingAssist);
router.post('/voice', upload.single('audio'), processVoiceSuggestion);
router.post('/analyze-suggestion', upload.single('image'), analyzeSuggestion);
router.post('/duplicate-check', checkDuplicate);

export default router;
