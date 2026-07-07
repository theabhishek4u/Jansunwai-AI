import { Router } from 'express';
import { getUserNotifications, markNotificationRead } from '../controllers/notification.controller';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

router.get('/', asyncHandler(getUserNotifications));
router.post('/:id/read', asyncHandler(markNotificationRead));

export default router;
