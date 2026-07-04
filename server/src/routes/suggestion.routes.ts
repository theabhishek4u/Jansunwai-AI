import { Router } from 'express';
import multer from 'multer';
import {
  createSuggestion,
  getSuggestions,
  getSuggestionDetails,
  addTimelineStatus,
  syncProfile,
  getProfileDetails
} from '../controllers/suggestion.controller';

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB limit
  }
});

// Suggestions Routing
router.post('/suggestions', upload.single('image'), createSuggestion);
router.get('/suggestions', getSuggestions);
router.get('/suggestions/:id', getSuggestionDetails);
router.post('/suggestions/:id/timeline', addTimelineStatus);

// Profile Routing
router.post('/profile/sync', syncProfile);
router.get('/profile/:id', getProfileDetails);

export default router;
