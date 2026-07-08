import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { db } from '../db/db';
import { mockDb } from '../db/mockDb';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * GET /api/mp/dashboard-stats
 */
export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    const stats = await db.getStats();
    const budgetAllocated = 1000; // ₹10 Crore in lakhs
    const budgetUsed = 575; // simulated usage
    const constituencyHealthScore = 72;
    const developmentIndex = 68;

    return res.json({
      ...stats,
      budgetAllocated,
      budgetUsed,
      budgetUtilization: Math.round((budgetUsed / budgetAllocated) * 100),
      constituencyHealthScore,
      developmentIndex
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

/**
 * GET /api/mp/constituency-health
 */
export const getConstituencyHealth = async (_req: Request, res: Response) => {
  try {
    const factors = [
      { name: 'Road Infrastructure', score: 62, max: 100, status: 'Needs Improvement' },
      { name: 'Education', score: 55, max: 100, status: 'Below Average' },
      { name: 'Healthcare', score: 48, max: 100, status: 'Critical Gap' },
      { name: 'Water Supply', score: 71, max: 100, status: 'Moderate' },
      { name: 'Electricity', score: 82, max: 100, status: 'Good' },
      { name: 'Citizen Satisfaction', score: 78, max: 100, status: 'Good' },
      { name: 'Environmental Health', score: 65, max: 100, status: 'Moderate' },
      { name: 'Digital Connectivity', score: 45, max: 100, status: 'Poor' },
    ];
    const overallScore = Math.round(factors.reduce((s, f) => s + f.score, 0) / factors.length);
    const grade = overallScore >= 80 ? 'Excellent' : overallScore >= 65 ? 'Good' : overallScore >= 50 ? 'Needs Improvement' : 'Critical';

    const recommendations = [
      'Establish 2 new Primary Health Centers in Harahua and Ramnagar blocks to close the healthcare access gap.',
      'Install BharatNet fiber in 12 panchayats to improve Digital Connectivity score from 45 to 70.',
      'Build primary school in Ramnagar — 4,500 children currently walking 5km+ daily.',
      'Install 120 solar street lights on Sarnath-Varanasi road to improve women safety score.',
      'Construct covered drainage system in Cholapur to reduce annual dengue incidence by 60%.'
    ];

    return res.json({ overallScore, grade, factors, recommendations });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to compute constituency health' });
  }
};

/**
 * GET /api/mp/priority-engine
 */
export const getPriorityEngine = async (_req: Request, res: Response) => {
  try {
    const allSugg = await db.getAllSuggestions();
    const pops = await db.getPopulations();

    // Improved AI Priority Scoring Logic based on situation severity and population impact
    const urgencyWeight: Record<string, number> = { critical: 1.0, high: 0.8, medium: 0.5, low: 0.2 };
    const ranked = await Promise.all(allSugg.map(async s => {
      const profile = await db.getProfile(s.citizen_id);
      const isVerified = profile?.verification_status === 'verified';
      
      const baseUrgency = urgencyWeight[s.urgency] || 0.2;
      
      // Match suggestion area against database area census populations
      const suggestionArea = (s.village || s.block || '').trim().toLowerCase();
      const matchPop = pops.find(p => p.area.trim().toLowerCase() === suggestionArea);
      const totalPop = matchPop ? matchPop.total_population : 50000; // Fallback population
      
      // Impact factor: What percentage of the local population is directly affected?
      const impactRatio = Math.min(1, (s.estimated_beneficiaries || 0) / totalPop);
      
      // Demand factor: Number of unique supporters vs total affected (indicates civic backing)
      const demandRatio = Math.min(1, (s.supporters || 0) / (s.estimated_beneficiaries || 100));
      
      // Cost Efficiency: Beneficiaries per Lakh spent (higher is better for ROI)
      const costEfficiency = s.estimated_cost_lakhs ? Math.min(1, ((s.estimated_beneficiaries || 0) / s.estimated_cost_lakhs) / 500) : 0.5;

      // Weighted AI Model simulating authentic governance evaluation
      const urgencyScore = baseUrgency * 45;       // 45% weight to situational urgency
      const impactScore = impactRatio * 25;        // 25% weight to population impacted
      const demandScore = demandRatio * 20;        // 20% weight to public demand/consensus
      const efficiencyScore = costEfficiency * 10; // 10% weight to cost ROI

      let priorityScore = Math.round(urgencyScore + impactScore + demandScore + efficiencyScore);
      
      // Verification & Completeness adjustments
      if (isVerified) priorityScore += 5;
      priorityScore += ((s.ai_score_completeness || 50) / 100) * 5; // Slight bump for well-documented issues

      return {
        id: s.id,
        title: s.title,
        category: s.category,
        village: s.village || 'Unknown',
        block: s.block || 'Unknown',
        district: s.district || 'Unknown',
        urgency: s.urgency,
        status: s.status,
        priorityScore: Math.min(100, priorityScore),
        populationAffected: s.estimated_beneficiaries,
        supporters: s.supporters || 0,
        estimatedCostLakhs: s.estimated_cost_lakhs || 0,
        aiCompleteness: s.ai_score_completeness || 0,
        aiConfidence: s.ai_score_confidence || 0,
        isVerifiedCitizen: isVerified,
        location_lat: s.location_lat || 26.8500,
        location_lng: s.location_lng || 80.9499
      };
    }));

    const sortedRanked = ranked.sort((a, b) => b.priorityScore - a.priorityScore);
    return res.json(sortedRanked);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to compute priority engine' });
  }
};

/**
 * POST /api/mp/ai-copilot
 */
export const aiCopilot = async (req: Request, res: Response) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'Question is required' });

  try {
    const allSugg = await db.getAllSuggestions();
    const stats = await db.getStats();

    if (!ai) {
      // Simulator: pattern-match common questions
      const q = question.toLowerCase();
      let answer = '';
      let data: Record<string, unknown>[] = [];
      let actions: string[] = [];

      if (q.includes('urgent') || q.includes('priority') || q.includes('critical')) {
        const critical = allSugg.filter(s => s.urgency === 'critical');
        answer = `There are ${critical.length} critical-urgency suggestions across your constituency. The most impactful are concentrated in Ramnagar (hospital upgrade, school), Harahua (road widening, PHC), and Cholapur (women's safety). Combined, these affect over 50,000 citizens.`;
        data = critical.map(s => ({ title: s.title, village: s.village, beneficiaries: s.estimated_beneficiaries, supporters: s.supporters }));
        actions = ['Review Ramnagar hospital upgrade (2,100 supporters)', 'Fast-track Harahua road widening (₹8 Cr sanctioned)', 'Approve Cholapur women safety helpdesk'];
      } else if (q.includes('education') || q.includes('school')) {
        const edu = allSugg.filter(s => s.category === 'School' || s.category === 'College' || s.category === 'Skill Center');
        answer = `Your constituency has ${edu.length} education-related requests. The most urgent is building a primary school in Ramnagar where 4,500 children walk over 5km daily. Cholapur also needs a Skill Development Center — 40% youth unemployment in that block.`;
        data = edu.map(s => ({ title: s.title, village: s.village, urgency: s.urgency, cost: `₹${s.estimated_cost_lakhs} L` }));
        actions = ['Approve Ramnagar primary school (₹1.2 Cr)', 'Allocate ITI funding for Cholapur (₹50 L)'];
      } else if (q.includes('budget') || q.includes('spend') || q.includes('crore') || q.includes('allocat')) {
        const totalCost = allSugg.reduce((s, c) => s + (c.estimated_cost_lakhs || 0), 0);
        answer = `Total estimated development cost across all pending suggestions is ₹${(totalCost / 100).toFixed(1)} Crore. If you have ₹5 Crore available, I recommend prioritizing: Hospital upgrade in Ramnagar (₹3.5 Cr, 18,000 beneficiaries), road widening in Harahua (₹8 Cr — already partially sanctioned under PMGSY), and PHC establishment in Harahua east (₹1.5 Cr, 22,000 beneficiaries).`;
        data = [{ category: 'Healthcare', allocation: '₹3.5 Cr' }, { category: 'Roads', allocation: '₹2 Cr (top-up)' }, { category: 'Water', allocation: '₹0.85 Cr' }, { category: 'Education', allocation: '₹1.2 Cr' }];
        actions = ['Open Budget Planner with ₹5 Cr input', 'Review PMGSY Phase III allocation status'];
      } else if (q.includes('village') || q.includes('which area') || q.includes('where')) {
        const villageMap: Record<string, number> = {};
        allSugg.forEach(s => { villageMap[s.village || 'Unknown'] = (villageMap[s.village || 'Unknown'] || 0) + 1; });
        answer = `Suggestion distribution across villages: ${Object.entries(villageMap).map(([v, c]) => `${v} (${c})`).join(', ')}. Harahua and Sarnath have the highest development demand density. Ramnagar has the highest single-project impact (hospital upgrade affecting 18,000 people).`;
        data = Object.entries(villageMap).map(([village, count]) => ({ village, suggestions: count }));
        actions = ['Open Constituency Heatmap', 'View Harahua village detail'];
      } else if (q.includes('road')) {
        const roads = allSugg.filter(s => s.category === 'Road' || s.category === 'Bridge');
        answer = `There are ${roads.length} road/bridge requests. The critical one is the Harahua-Varanasi 12km road widening (3,200 supporters, ₹8 Cr budget). One road project in Sigra has already been completed. The Sevapuri bridge request was rejected due to alternative route availability.`;
        data = roads.map(s => ({ title: s.title, village: s.village, status: s.status, cost: `₹${s.estimated_cost_lakhs} L` }));
        actions = ['Check PMGSY Phase III progress for Harahua road'];
      } else if (q.includes('ignored') || q.includes('pending') || q.includes('old')) {
        const old = allSugg.filter(s => s.status === 'submitted').sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        answer = `There are ${old.length} suggestions still in 'submitted' status awaiting your review. The oldest is the Ramnagar hospital upgrade (${Math.round((Date.now() - new Date(old[0]?.created_at || '').getTime()) / 86400000)} days old, 2,100 supporters). I recommend batch-reviewing all submitted items this week.`;
        data = old.map(s => ({ title: s.title, village: s.village, daysOld: Math.round((Date.now() - new Date(s.created_at).getTime()) / 86400000), supporters: s.supporters }));
        actions = ['Batch review all submitted suggestions', 'Sort by oldest first'];
      } else {
        answer = `Your constituency currently has ${stats.totalSuggestions} development suggestions from ${stats.citizenCount} registered citizens. ${stats.highPriority} are marked high or critical priority. ${stats.completed} projects have been completed. The top development needs are in Healthcare (2 facilities needed), Roads (1 major widening), and Education (1 school + 1 skill center). Total estimated investment needed: ₹${(stats.totalCostLakhs / 100).toFixed(1)} Crore.`;
        data = [{ metric: 'Total Suggestions', value: stats.totalSuggestions }, { metric: 'High Priority', value: stats.highPriority }, { metric: 'Completed', value: stats.completed }];
        actions = ['Open Priority Engine', 'View constituency health score', 'Start budget planning'];
      }

      return res.json({ answer, data, actions, source: 'ai_simulator' });
    }

    // Real Gemini call
    const summaryPayload = allSugg.map(s => ({
      id: s.id, title: s.title, category: s.category, village: s.village, urgency: s.urgency,
      status: s.status, beneficiaries: s.estimated_beneficiaries, supporters: s.supporters,
      costLakhs: s.estimated_cost_lakhs, completeness: s.ai_score_completeness
    }));

    const prompt = `You are an AI Copilot for an Indian MP managing Varanasi constituency.
The MP asked: "${question}"

Here is the current constituency data (${allSugg.length} citizen development suggestions):
${JSON.stringify(summaryPayload, null, 1)}

Stats: ${JSON.stringify(stats)}

Respond with a JSON object:
{
  "answer": "A clear, actionable answer in 3-5 sentences with specific numbers and village names",
  "data": [{"key": "value"}],
  "actions": ["Suggested action 1", "Suggested action 2"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const result = JSON.parse(response.text || '{}');
    return res.json({ ...result, source: 'gemini' });
  } catch (error) {
    console.error('AI Copilot error:', error);
    return res.status(500).json({ error: 'AI Copilot failed' });
  }
};

/**
 * POST /api/mp/budget-planner
 */
export const budgetPlanner = async (req: Request, res: Response) => {
  const { budgetCrore } = req.body;
  if (!budgetCrore || budgetCrore <= 0) return res.status(400).json({ error: 'Valid budget amount required' });

  try {
    const allSugg = await db.getAllSuggestions();
    const budgetLakhs = budgetCrore * 100;

    // Group by category and calculate need
    const categoryNeeds: Record<string, { totalCost: number; count: number; avgPriority: number; topProject: string }> = {};
    const urgencyWeight: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };

    allSugg.filter(s => s.status !== 'completed' && s.status !== 'rejected').forEach(s => {
      if (!categoryNeeds[s.category]) {
        categoryNeeds[s.category] = { totalCost: 0, count: 0, avgPriority: 0, topProject: '' };
      }
      categoryNeeds[s.category].totalCost += (s.estimated_cost_lakhs || 0);
      categoryNeeds[s.category].count += 1;
      categoryNeeds[s.category].avgPriority += (urgencyWeight[s.urgency] || 1);
      if (!categoryNeeds[s.category].topProject || (s.supporters || 0) > 500) {
        categoryNeeds[s.category].topProject = s.title;
      }
    });

    // Calculate proportional allocation
    const totalPriority = Object.values(categoryNeeds).reduce((s, c) => s + c.avgPriority, 0);
    const allocations = Object.entries(categoryNeeds).map(([category, need]) => {
      const share = need.avgPriority / totalPriority;
      const allocated = Math.round(share * budgetLakhs);
      return {
        category,
        allocatedLakhs: allocated,
        allocatedCrore: (allocated / 100).toFixed(2),
        totalNeededLakhs: need.totalCost,
        projectCount: need.count,
        topProject: need.topProject,
        justification: `${need.count} pending requests with average urgency ${(need.avgPriority / need.count).toFixed(1)}/4. Covers ${Math.min(100, Math.round((allocated / need.totalCost) * 100))}% of total need.`
      };
    }).sort((a, b) => b.allocatedLakhs - a.allocatedLakhs);

    return res.json({
      inputBudgetCrore: budgetCrore,
      inputBudgetLakhs: budgetLakhs,
      allocations,
      summary: `₹${budgetCrore} Crore distributed across ${allocations.length} development categories based on citizen demand urgency, supporter count, and infrastructure gap analysis.`
    });
  } catch (error) {
    return res.status(500).json({ error: 'Budget planning failed' });
  }
};

/**
 * POST /api/mp/development-simulator
 */
export const developmentSimulator = async (req: Request, res: Response) => {
  const { projectIdA, projectIdB } = req.body;

  try {
    const projA = await db.getSuggestionById(projectIdA);
    const projB = await db.getSuggestionById(projectIdB);

    if (!projA || !projB) return res.status(404).json({ error: 'One or both projects not found' });

    const simulate = (proj: typeof projA) => ({
      id: proj!.id,
      title: proj!.title,
      category: proj!.category,
      village: proj!.village,
      populationImpacted: proj!.estimated_beneficiaries,
      estimatedCostCrore: ((proj!.estimated_cost_lakhs || 0) / 100).toFixed(2),
      supporters: proj!.supporters || 0,
      urgency: proj!.urgency,
      travelTimeReduction: proj!.category === 'Road' ? '45 min → 15 min' : proj!.category === 'Bridge' ? '90 min → 20 min' : 'N/A',
      healthcareImprovement: (proj!.category === 'Hospital' || proj!.category === 'PHC') ? 'Major — reduces emergency response time by 70%' : 'Indirect — improved accessibility',
      educationImpact: proj!.category === 'School' ? 'Direct — 4,500 children gain local school access' : proj!.category === 'Skill Center' ? 'Direct — 500 youth gain employable skills annually' : 'Indirect',
      economicBenefit: proj!.category === 'Agriculture' ? 'Saves ₹3 Cr/year in crop spoilage' : proj!.category === 'Road' ? 'Enables market access, reduces transport cost by 40%' : 'Moderate — improved quality of life attracts investment',
      longTermScore: Math.min(100, (proj!.estimated_beneficiaries / 200) + (proj!.supporters || 0) / 30 + (proj!.ai_score_completeness || 50)),
      completionTimeline: (proj!.estimated_cost_lakhs || 0) > 200 ? '18-24 months' : (proj!.estimated_cost_lakhs || 0) > 50 ? '6-12 months' : '3-6 months'
    });

    return res.json({ scenarioA: simulate(projA), scenarioB: simulate(projB) });
  } catch (error) {
    return res.status(500).json({ error: 'Simulation failed' });
  }
};

/**
 * GET /api/mp/infrastructure-gaps
 */
export const getInfrastructureGaps = async (_req: Request, res: Response) => {
  try {
    const gaps = [
      { village: 'Sigra', population: 45000, existingSchools: 3, requiredSchools: 3, schoolGap: 0, existingPHC: 1, requiredPHC: 2, phcGap: 1, roadKmPaved: 12, roadKmNeeded: 15, roadGap: 3, waterConnections: 8500, waterNeeded: 9000, waterGap: 500 },
      { village: 'Ramnagar', population: 32000, existingSchools: 1, requiredSchools: 3, schoolGap: 2, existingPHC: 0, requiredPHC: 2, phcGap: 2, roadKmPaved: 5, roadKmNeeded: 12, roadGap: 7, waterConnections: 3200, waterNeeded: 6400, waterGap: 3200 },
      { village: 'Sarnath', population: 28000, existingSchools: 2, requiredSchools: 2, schoolGap: 0, existingPHC: 1, requiredPHC: 1, phcGap: 0, roadKmPaved: 8, roadKmNeeded: 10, roadGap: 2, waterConnections: 5000, waterNeeded: 5600, waterGap: 600 },
      { village: 'Cholapur', population: 22000, existingSchools: 1, requiredSchools: 2, schoolGap: 1, existingPHC: 1, requiredPHC: 1, phcGap: 0, roadKmPaved: 6, roadKmNeeded: 9, roadGap: 3, waterConnections: 3800, waterNeeded: 4400, waterGap: 600 },
      { village: 'Harahua', population: 38000, existingSchools: 2, requiredSchools: 3, schoolGap: 1, existingPHC: 0, requiredPHC: 2, phcGap: 2, roadKmPaved: 4, roadKmNeeded: 14, roadGap: 10, waterConnections: 4000, waterNeeded: 7600, waterGap: 3600 },
      { village: 'Sevapuri', population: 18000, existingSchools: 1, requiredSchools: 2, schoolGap: 1, existingPHC: 1, requiredPHC: 1, phcGap: 0, roadKmPaved: 7, roadKmNeeded: 8, roadGap: 1, waterConnections: 3200, waterNeeded: 3600, waterGap: 400 },
    ];

    return res.json(gaps);
  } catch (error) {
    return res.status(500).json({ error: 'Infrastructure gap analysis failed' });
  }
};

/**
 * GET /api/mp/analytics
 */
export const getAnalytics = async (_req: Request, res: Response) => {
  try {
    const allSugg = await db.getAllSuggestions();

    // Category distribution
    const categoryDist: Record<string, number> = {};
    allSugg.forEach(s => { categoryDist[s.category] = (categoryDist[s.category] || 0) + 1; });
    const categoryChart = Object.entries(categoryDist).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    // Village distribution
    const villageDist: Record<string, number> = {};
    allSugg.forEach(s => { villageDist[s.village || 'Unknown'] = (villageDist[s.village || 'Unknown'] || 0) + 1; });
    const villageChart = Object.entries(villageDist).map(([name, value]) => ({ name, value }));

    // Urgency distribution
    const urgencyDist: Record<string, number> = {};
    allSugg.forEach(s => { urgencyDist[s.urgency] = (urgencyDist[s.urgency] || 0) + 1; });
    const urgencyChart = Object.entries(urgencyDist).map(([name, value]) => ({ name, value }));

    // Status distribution
    const statusDist: Record<string, number> = {};
    allSugg.forEach(s => { statusDist[s.status] = (statusDist[s.status] || 0) + 1; });
    const statusChart = Object.entries(statusDist).map(([name, value]) => ({ name, value }));

    // Monthly trends (simulated)
    const monthlyTrends = [
      { month: 'Jan', suggestions: 2, completed: 0 },
      { month: 'Feb', suggestions: 3, completed: 0 },
      { month: 'Mar', suggestions: 5, completed: 1 },
      { month: 'Apr', suggestions: 4, completed: 0 },
      { month: 'May', suggestions: 8, completed: 1 },
      { month: 'Jun', suggestions: 12, completed: 2 },
      { month: 'Jul', suggestions: 18, completed: 3 },
    ];

    // Budget by category
    const budgetByCategory: Record<string, number> = {};
    allSugg.forEach(s => { budgetByCategory[s.category] = (budgetByCategory[s.category] || 0) + (s.estimated_cost_lakhs || 0); });
    const budgetChart = Object.entries(budgetByCategory).map(([name, value]) => ({ name, valueLakhs: value, valueCrore: +(value / 100).toFixed(2) })).sort((a, b) => b.valueLakhs - a.valueLakhs);

    // AI confidence scores
    const confidenceScores = allSugg.map(s => ({ name: s.title.substring(0, 30), confidence: s.ai_score_confidence || 50, completeness: s.ai_score_completeness || 50 }));

    return res.json({ categoryChart, villageChart, urgencyChart, statusChart, monthlyTrends, budgetChart, confidenceScores });
  } catch (error) {
    return res.status(500).json({ error: 'Analytics computation failed' });
  }
};
