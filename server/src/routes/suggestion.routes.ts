import { Router } from 'express';
import multer from 'multer';
import {
  createSuggestion,
  getSuggestions,
  getSuggestionDetails,
  deleteSuggestion,
  addTimelineStatus,
  syncProfile,
  getProfileDetails
} from '../controllers/suggestion.controller';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB limit
  }
});

// Suggestions Routing
router.post('/suggestions', upload.any(), asyncHandler(createSuggestion));
router.get('/suggestions', asyncHandler(getSuggestions));
router.get('/suggestions/:id', asyncHandler(getSuggestionDetails));
router.delete('/suggestions/:id', asyncHandler(deleteSuggestion));
router.post('/suggestions/:id/timeline', asyncHandler(addTimelineStatus));

// Profile Routing
router.post('/profile/sync', asyncHandler(syncProfile));
router.get('/profile/:id', asyncHandler(getProfileDetails));

export default router;
