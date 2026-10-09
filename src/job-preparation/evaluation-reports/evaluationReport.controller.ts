import { Request, Response } from 'express';
import prisma from '../../utils/prisma';
import { evaluateInterviewSessionAI } from './evaluationAi.service';

/**
 * Helper to format DB report output into API response structure
 */
const formatReportResponse = (report: any, targetJobTitle: string = '') => ({
  id: report.id,
  sessionId: report.interviewSessionId,
  targetJobTitle,
  overallScore: report.overallScore,
  hireRecommendation: report.hireRecommendation,
  executiveSummary: report.executiveSummary,
  radarMetrics: {
    technicalProficiency: report.technicalProficiency,
    communicationClarity: report.communicationClarity,
    problemSolvingLogic: report.problemSolvingLogic,
    cultureAndLeadership: report.cultureAndLeadership,
    domainKnowledge: report.domainKnowledge,
  },
  strengths: report.strengths,
  weaknesses: report.weaknesses,
  keyImprovementAreas: report.keyImprovementAreas,
  categoryBreakdowns: report.categoryBreakdowns,
  generatedAt: report.generatedAt ? new Date(report.generatedAt).toISOString() : undefined,
  updatedAt: report.updatedAt ? new Date(report.updatedAt).toISOString() : undefined,
});

// ----------------------------------------------------------------------
// CREATE / GENERATE
// ----------------------------------------------------------------------
export const generateEvaluationReport = async (req: Request, res: Response) => {
  try {
    const { interviewSessionId } = req.body;

    const session = await prisma.interviewSession.findUnique({
      where: { id: interviewSessionId },
      include: {
        questions: {
          include: { candidateResponses: true },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ status: 'error', message: 'Interview session not found' });
    }

    const aiResult = await evaluateInterviewSessionAI(session);

    const report = await prisma.interviewEvaluationReport.upsert({
      where: { interviewSessionId },
      create: {
        interviewSessionId,
        overallScore: aiResult.overallScore,
        hireRecommendation: aiResult.hireRecommendation,
        executiveSummary: aiResult.executiveSummary,
        technicalProficiency: aiResult.radarMetrics.technicalProficiency,
        communicationClarity: aiResult.radarMetrics.communicationClarity,
        problemSolvingLogic: aiResult.radarMetrics.problemSolvingLogic,
        cultureAndLeadership: aiResult.radarMetrics.cultureAndLeadership,
        domainKnowledge: aiResult.radarMetrics.domainKnowledge,
        strengths: aiResult.strengths,
        weaknesses: aiResult.weaknesses,
        keyImprovementAreas: aiResult.keyImprovementAreas,
        categoryBreakdowns: aiResult.categoryBreakdowns,
      },
      update: {
        overallScore: aiResult.overallScore,
        hireRecommendation: aiResult.hireRecommendation,
        executiveSummary: aiResult.executiveSummary,
        technicalProficiency: aiResult.radarMetrics.technicalProficiency,
        communicationClarity: aiResult.radarMetrics.communicationClarity,
        problemSolvingLogic: aiResult.radarMetrics.problemSolvingLogic,
        cultureAndLeadership: aiResult.radarMetrics.cultureAndLeadership,
        domainKnowledge: aiResult.radarMetrics.domainKnowledge,
        strengths: aiResult.strengths,
        weaknesses: aiResult.weaknesses,
        keyImprovementAreas: aiResult.keyImprovementAreas,
        categoryBreakdowns: aiResult.categoryBreakdowns,
      },
    });

    await prisma.interviewSession.update({
      where: { id: interviewSessionId },
      data: { status: 'EVALUATED', completedAt: new Date() },
    });

    return res.status(201).json({
      status: 'success',
      data: formatReportResponse(report, session.targetJobTitle || ''),
    });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

// ----------------------------------------------------------------------
// READ (GET ALL / LIST WITH PAGINATION)
// ----------------------------------------------------------------------
export const getAllEvaluationReports = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      prisma.interviewEvaluationReport.findMany({
        skip,
        take: limit,
        orderBy: { generatedAt: 'desc' },
        include: {
          interviewSession: {
            select: { targetJobTitle: true },
          },
        },
      }),
      prisma.interviewEvaluationReport.count(),
    ]);

    const formattedData = reports.map((r) =>
      formatReportResponse(r, r.interviewSession?.targetJobTitle || '')
    );

    return res.json({
      status: 'success',
      data: formattedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

// ----------------------------------------------------------------------
// READ (GET BY REPORT ID)
// ----------------------------------------------------------------------
export const getEvaluationReportById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as any;

    const report = await prisma.interviewEvaluationReport.findUnique({
      where: { id },
      include: {
        interviewSession: { select: { targetJobTitle: true } },
      },
    });

    if (!report) {
      return res.status(404).json({ status: 'error', message: 'Evaluation report not found' });
    }

    return res.json({
      status: 'success',
      data: formatReportResponse(report, report.interviewSession?.targetJobTitle || ''),
    });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

// ----------------------------------------------------------------------
// READ (GET BY SESSION ID)
// ----------------------------------------------------------------------
export const getEvaluationReportBySessionId = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params as any;

    const report = await prisma.interviewEvaluationReport.findUnique({
      where: { interviewSessionId: sessionId },
      include: {
        interviewSession: { select: { targetJobTitle: true } },
      },
    });

    if (!report) {
      return res.status(404).json({ status: 'error', message: 'Evaluation report not found' });
    }

    return res.json({
      status: 'success',
      data: formatReportResponse(report, report.interviewSession?.targetJobTitle || ''),
    });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

// ----------------------------------------------------------------------
// UPDATE (UPDATE BY REPORT ID)
// ----------------------------------------------------------------------
export const updateEvaluationReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as any;
    const { radarMetrics, ...updateFields } = req.body;

    const existingReport = await prisma.interviewEvaluationReport.findUnique({
      where: { id },
    });

    if (!existingReport) {
      return res.status(404).json({ status: 'error', message: 'Evaluation report not found' });
    }

    // Merge radar metrics fields into upper-level DB columns if updated
    const updateData: any = { ...updateFields };
    if (radarMetrics) {
      if (radarMetrics.technicalProficiency !== undefined)
        updateData.technicalProficiency = radarMetrics.technicalProficiency;
      if (radarMetrics.communicationClarity !== undefined)
        updateData.communicationClarity = radarMetrics.communicationClarity;
      if (radarMetrics.problemSolvingLogic !== undefined)
        updateData.problemSolvingLogic = radarMetrics.problemSolvingLogic;
      if (radarMetrics.cultureAndLeadership !== undefined)
        updateData.cultureAndLeadership = radarMetrics.cultureAndLeadership;
      if (radarMetrics.domainKnowledge !== undefined)
        updateData.domainKnowledge = radarMetrics.domainKnowledge;
    }

    const updatedReport = await prisma.interviewEvaluationReport.update({
      where: { id },
      data: updateData,
      include: {
        interviewSession: { select: { targetJobTitle: true } },
      },
    });

    return res.json({
      status: 'success',
      data: formatReportResponse(updatedReport, updatedReport.interviewSession?.targetJobTitle || ''),
    });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

// ----------------------------------------------------------------------
// DELETE
// ----------------------------------------------------------------------
export const deleteEvaluationReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as any;

    const existingReport = await prisma.interviewEvaluationReport.findUnique({
      where: { id },
    });

    if (!existingReport) {
      return res.status(404).json({ status: 'error', message: 'Evaluation report not found' });
    }

    await prisma.interviewEvaluationReport.delete({
      where: { id },
    });

    return res.json({
      status: 'success',
      message: 'Evaluation report deleted successfully',
    });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};