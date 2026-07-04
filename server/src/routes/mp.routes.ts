import { Router } from 'express';
import {
  getDashboardStats,
  getConstituencyHealth,
  getPriorityEngine,
  aiCopilot,
  budgetPlanner,
  developmentSimulator,
  getInfrastructureGaps,
  getAnalytics
} from '../controllers/mp.controller';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

router.get('/dashboard-stats', asyncHandler(getDashboardStats));
router.get('/constituency-health', asyncHandler(getConstituencyHealth));
router.get('/priority-engine', asyncHandler(getPriorityEngine));
router.post('/ai-copilot', asyncHandler(aiCopilot));
router.post('/budget-planner', asyncHandler(budgetPlanner));
router.post('/development-simulator', asyncHandler(developmentSimulator));
router.get('/infrastructure-gaps', asyncHandler(getInfrastructureGaps));
router.get('/analytics', asyncHandler(getAnalytics));

export default router;
