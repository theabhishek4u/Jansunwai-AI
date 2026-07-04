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

const router = Router();

router.get('/command-center-stats', getCommandCenterStats);
router.get('/prompts', getPrompts);
router.post('/prompts', updatePrompt);
router.get('/datasets', getDatasets);
router.post('/datasets', addDataset);
router.get('/audit-logs', getAuditLogs);
router.get('/mps', getMps);
router.post('/mps/status', updateMpStatus);
router.post('/notifications/broadcast', broadcastNotification);

export default router;
