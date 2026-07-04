import { Router } from 'express';
import {
  getCommandCenterStats,
  getPrompts,
  updatePrompt,
  getDatasets,
  addDataset,
  getAuditLogs,
  getMps,
  updateMpStatus,
  broadcastNotification
} from '../controllers/admin.controller';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

router.get('/command-center-stats', asyncHandler(getCommandCenterStats));
router.get('/prompts', asyncHandler(getPrompts));
router.post('/prompts', asyncHandler(updatePrompt));
router.get('/datasets', asyncHandler(getDatasets));
router.post('/datasets', asyncHandler(addDataset));
router.get('/audit-logs', asyncHandler(getAuditLogs));
router.get('/mps', asyncHandler(getMps));
router.post('/mps/status', asyncHandler(updateMpStatus));
router.post('/notifications/broadcast', asyncHandler(broadcastNotification));

export default router;
