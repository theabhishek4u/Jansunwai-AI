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

const router = Router();

router.get('/dashboard-stats', getDashboardStats);
router.get('/constituency-health', getConstituencyHealth);
router.get('/priority-engine', getPriorityEngine);
router.post('/ai-copilot', aiCopilot);
router.post('/budget-planner', budgetPlanner);
router.post('/development-simulator', developmentSimulator);
router.get('/infrastructure-gaps', getInfrastructureGaps);
router.get('/analytics', getAnalytics);

export default router;
