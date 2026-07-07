import { Router, Request, Response } from 'express';
import { db } from '../db/db';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

// GET /api/mp/populations
router.get('/populations', asyncHandler(async (req: Request, res: Response) => {
  try {
    const list = await db.getPopulations();
    return res.json(list);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve population data' });
  }
}));

// POST /api/admin/populations
router.post('/populations', asyncHandler(async (req: Request, res: Response) => {
  const { district, area, total_population } = req.body;
  if (!district || !area || total_population === undefined) {
    return res.status(400).json({ error: 'district, area, and total_population are required fields' });
  }
  try {
    const popRecord = await db.addOrUpdatePopulation(req.body);
    return res.status(200).json(popRecord);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to save population demographics data' });
  }
}));

// DELETE /api/admin/populations/:id
router.delete('/populations/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Population record ID is required' });
  }
  try {
    const success = await db.deletePopulation(id);
    if (success) {
      return res.status(200).json({ message: 'Demographics record deleted successfully' });
    } else {
      return res.status(404).json({ error: 'Population record not found' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete population data' });
  }
}));

export default router;
