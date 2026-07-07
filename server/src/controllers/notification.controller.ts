import { Request, Response } from 'express';
import { db } from '../db/db';

export const getUserNotifications = async (req: Request, res: Response) => {
  const { citizen_id } = req.query;
  
  if (!citizen_id) {
    return res.status(400).json({ error: 'citizen_id is required' });
  }

  try {
    const notifications = await db.getNotifications(citizen_id as string);
    return res.json(notifications);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch notifications', details: error.message });
  }
};

export const markNotificationRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const notif = await db.markNotificationRead(id);
    return res.json(notif);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to mark notification as read', details: error.message });
  }
};
