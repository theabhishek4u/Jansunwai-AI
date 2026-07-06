import { Request, Response } from 'express';
import { mockDb } from '../db/mockDb';

/**
 * GET /api/admin/command-center-stats
 */
export const getCommandCenterStats = async (_req: Request, res: Response) => {
  try {
    const stats = await mockDb.getStats();
    
    // Add Super Admin specific platform monitoring metrics
    const activeConstituencies = 12;
    const aiRequestsProcessed = 15420;
    const serverHealth = '99.98%';
    const serverCpu = 42;
    const serverRam = 58;
    const apiLatency = 120; // 120ms
    const activeMpsOnline = 8;
    const storageUsage = '34%';

    const stateStats = [
      { state: 'Uttar Pradesh', performanceScore: 78, activeConstituencies: 4, suggestions: 1420, activeMps: 3 },
      { state: 'Maharashtra', performanceScore: 82, activeConstituencies: 3, suggestions: 920, activeMps: 2 },
      { state: 'Karnataka', performanceScore: 85, activeConstituencies: 2, suggestions: 840, activeMps: 1 },
      { state: 'Delhi', performanceScore: 90, activeConstituencies: 1, suggestions: 540, activeMps: 1 },
      { state: 'Bihar', performanceScore: 68, activeConstituencies: 2, suggestions: 1200, activeMps: 1 }
    ];

    return res.json({
      ...stats,
      activeConstituencies,
      aiRequestsProcessed,
      serverHealth,
      serverCpu,
      serverRam,
      apiLatency,
      activeMpsOnline,
      storageUsage,
      stateStats
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch Admin Command Center stats' });
  }
};

/**
 * GET /api/admin/prompts
 */
export const getPrompts = async (_req: Request, res: Response) => {
  try {
    const prompts = await mockDb.getPrompts();
    return res.json(prompts);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch AI prompts' });
  }
};

/**
 * POST /api/admin/prompts
 */
export const updatePrompt = async (req: Request, res: Response) => {
  const { id, content } = req.body;
  if (!id || !content) return res.status(400).json({ error: 'ID and Content are required' });

  try {
    const updated = await mockDb.updatePrompt(id, content);
    if (!updated) return res.status(404).json({ error: 'Prompt template not found' });
    return res.json({ message: 'Prompt template updated successfully', prompt: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update prompt template' });
  }
};

/**
 * GET /api/admin/datasets
 */
export const getDatasets = async (_req: Request, res: Response) => {
  try {
    const datasets = await mockDb.getDatasets();
    return res.json(datasets);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch dataset registry' });
  }
};

/**
 * POST /api/admin/datasets
 */
export const addDataset = async (req: Request, res: Response) => {
  const { name, category, fileSize, format } = req.body;
  if (!name || !category || !fileSize || !format) {
    return res.status(400).json({ error: 'All dataset parameters are required' });
  }

  try {
    const newRecord = await mockDb.addDataset({ name, category, fileSize, format });
    return res.status(201).json({ message: 'Dataset indexed and embedded successfully', dataset: newRecord });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to upload and index dataset' });
  }
};

/**
 * GET /api/admin/audit-logs
 */
export const getAuditLogs = async (_req: Request, res: Response) => {
  try {
    const logs = await mockDb.getAuditLogs();
    return res.json(logs);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch system audit logs' });
  }
};

/**
 * GET /api/admin/mps
 */
export const getMps = async (_req: Request, res: Response) => {
  try {
    const mps = await mockDb.getMps();
    return res.json(mps);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch MP accounts' });
  }
};

/**
 * POST /api/admin/mps/status
 */
export const updateMpStatus = async (req: Request, res: Response) => {
  const { id, status } = req.body;
  if (!id || !status) return res.status(400).json({ error: 'ID and Status are required' });

  try {
    const mp = await mockDb.updateMpStatus(id, status);
    if (!mp) return res.status(404).json({ error: 'MP profile not found' });
    return res.json({ message: `MP account status changed to ${status}`, mp });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update MP status' });
  }
};

/**
 * POST /api/admin/notifications/broadcast
 */
export const broadcastNotification = async (req: Request, res: Response) => {
  const { message, targetGroup, targetConstituency } = req.body;
  if (!message) return res.status(400).json({ error: 'Message content is required' });

  try {
    await mockDb.addAuditLog('System', `Admin broadcast message queued to ${targetGroup || 'all'} in ${targetConstituency || 'all constituencies'}`);
    return res.json({ message: 'Global system announcement broadcasted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Broadcast failed' });
  }
};

/**
 * GET /api/admin/citizens
 */
export const getCitizens = async (_req: Request, res: Response) => {
  try {
    const citizens = await mockDb.getCitizens();
    return res.json(citizens);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch citizen accounts' });
  }
};

/**
 * POST /api/admin/citizens/verify
 */
export const verifyCitizen = async (req: Request, res: Response) => {
  const { id, status } = req.body;
  if (!id || !status) return res.status(400).json({ error: 'ID and Status are required' });

  try {
    const citizen = await mockDb.updateVerificationStatus(id, status);
    if (!citizen) return res.status(404).json({ error: 'Citizen profile not found' });
    
    await mockDb.addAuditLog('System', `Admin verified citizen ${citizen.full_name} status to ${status}`);
    
    return res.json({ message: `Citizen account status changed to ${status}`, citizen });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update citizen status' });
  }
};
