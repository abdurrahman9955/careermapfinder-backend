import { Request, Response } from 'express';
import prisma from '../../utils/prisma';
import { generateInterviewQuestionsAI } from './interviewAi.service';
import { evaluateInterviewSessionAI } from '../evaluation-reports/evaluationAi.service';

export const createInterviewSession = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || req.body.userId;

    // 1. Create the base session record
    const session = await prisma.interviewSession.create({
      data: {
        userId,
        ...req.body,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });

    // 2. Generate questions via AI
    const generatedQuestions = await generateInterviewQuestionsAI(req.body);

    // 3. Save generated questions with rich supplementary data & rubrics
    await prisma.interviewQuestion.createMany({
      data: generatedQuestions.map((q: any) => ({
        interviewSessionId: session.id,
        questionNumber: q.questionNumber,
        category: q.category,
        visualLayout: q.visualLayout || 'TEXT_MARKDOWN',
        title: q.title,
        prompt: q.prompt,
        timeAllocationMins: q.timeAllocationMins,
        codeStarterSnippet: q.codeStarterSnippet || null,
        codeLanguage: q.codeLanguage || null,
        supplementaryData: q.supplementaryData || undefined,
        rubricCriteria: q.rubricCriteria,
      })),
    });

    // 4. Return full session along with questions
    const fullSession = await prisma.interviewSession.findUnique({
      where: { id: session.id },
      include: { questions: true },
    });

    
                          await prisma.user.update({
                              where: {id: userId},
                              data:{
                                interviewCreation:{ increment: 1 }
                              }
                          })

    
            const existingResponse = await prisma.updateResponse.findFirst({ where:{userId}});
                          
              const dashboardsUpdate = new Date().toISOString();
                            
              if(existingResponse){
                await prisma.updateResponse.update({
                  where:{id:existingResponse.id},
                data: {  
                  interviewUpdate:dashboardsUpdate, 
                }, });
              }

    return res.status(201).json({ status: 'success', data: fullSession });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getAllSessions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const sessions = await prisma.interviewSession.findMany({
      where: userId ? { userId } : {},
      include: { questions: true, evaluationReport: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ status: 'success', data: sessions });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};


export const getSessionByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params as any;
    const session = await prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { questions: { include: { candidateResponses: true } }, evaluationReport: true },
    });
    if (!session) return res.status(404).json({ status: 'error', message: 'Session not found' });
    return res.json({ status: 'success', data: session });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getSessionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as any;
    const session = await prisma.interviewSession.findUnique({
      where: { id },
      include: { questions: { include: { candidateResponses: true } }, evaluationReport: true },
    });
    if (!session) return res.status(404).json({ status: 'error', message: 'Session not found' });
    return res.json({ status: 'success', data: session });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateSession = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params as any;

    const existingSession = await prisma.interviewSession.findUnique({
      where: { id },
    });

    if (!existingSession) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found',
      });
    }

    const updatedSession = await prisma.interviewSession.update({
      where: { id },
      data: req.body,
      include: {
        questions: {
          include: {
            candidateResponses: true,
          },
        },
        evaluationReport: true,
      },
    });

    
            const existingResponse = await prisma.updateResponse.findFirst({ where:{userId:updatedSession.userId}});
                          
              const dashboardsUpdate = new Date().toISOString();
                            
              if(existingResponse){
                await prisma.updateResponse.update({
                  where:{id:existingResponse.id},
                data: {  
                  interviewUpdate:dashboardsUpdate, 
                }, });
              }

    return res.json({
      status: 'success',
      message: 'Session updated successfully',
      data: updatedSession,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

/**
 * POST /api/interview-sessions/:id/submit
 * Submits the interview session, runs AI evaluation synchronously, 
 * and stores the evaluation report using InterviewEvaluationReport model.
 */
export const submitSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    // 1. Fetch Session with all questions and candidate responses
    const session = await prisma.interviewSession.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { questionNumber: 'asc' },
          include: { candidateResponses: true },
        },
      },
    });

    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Interview session not found.',
      });
    }

    if (session.status === 'EVALUATED') {
      return res.status(400).json({
        status: 'error',
        message: 'Interview session has already been submitted and evaluated.',
      });
    }

    // 2. Mark Session status as SUBMITTED prior to running AI evaluation
    await prisma.interviewSession.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        completedAt: new Date(),
      },
    });

    // 3. Evaluate Session using Gemini AI
    const aiResult = await evaluateInterviewSessionAI(session);

    // 4. Upsert InterviewEvaluationReport & update session status to EVALUATED in a transaction
    const [report, updatedSession] = await prisma.$transaction([
      prisma.interviewEvaluationReport.upsert({
        where: { interviewSessionId: id },
        create: {
          interviewSessionId: id,
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
      }),
      prisma.interviewSession.update({
        where: { id },
        data: { 
          status: 'EVALUATED',
          completedAt: new Date(),
        },
        include: {
          questions: {
            include: { candidateResponses: true },
          },
        },
      }),
    ]);

    
            const existingResponse = await prisma.updateResponse.findFirst({ where:{userId:session.userId}});
                          
              const dashboardsUpdate = new Date().toISOString();
                            
              if(existingResponse){
                await prisma.updateResponse.update({
                  where:{id:existingResponse.id},
                data: {  
                  interviewUpdate:dashboardsUpdate, 
                }, });
              }

    return res.status(200).json({
      status: 'success',
      message: 'Interview session submitted and evaluated successfully.',
      data: {
        session: updatedSession,
        report,
      },
    });
  } catch (error: any) {
    console.error('Error submitting interview session:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'An error occurred during submission and AI evaluation.',
    });
  }
};

export const deleteSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as any;
    await prisma.interviewSession.delete({ where: { id } });
    return res.json({ status: 'success', message: 'Session deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};