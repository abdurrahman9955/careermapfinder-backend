import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { ExamSessionAIService } from "./exam-session.ai";
import { EvaluationReportAIService } from "../evaluation-report/evaluation-report.ai";

export class ExamSessionController {
  // CREATE Session + Generate AI Questions + Sync AI Metadata
  static async createSession(req: Request, res: Response): Promise<void> {
    try {
      const { questionCountOverride, ...sessionPayload } = req.body;

      // 1. Persist Exam Session Initial Record
      const session = await prisma.examSession.create({
        data: {
          ...sessionPayload,
          status: "GENERATED"
        }
      });

      // 2. Invoke Gemini AI to generate exam metadata and questions based on context
      const aiResult = await ExamSessionAIService.generateQuestionsForSession(
        session,
        questionCountOverride
      );

      // 3. Update the ExamSession with AI-determined format and time limit
      const updatedSession = await prisma.examSession.update({
        where: { id: session.id },
        data: {
          format: aiResult.format,
          timeLimitMinutes: aiResult.timeLimitMinutes
        }
      });

      // 4. Persist Generated Questions Transactionally
      const savedQuestions = await prisma.$transaction(
        aiResult.questions.map((q, index) =>
          prisma.examQuestion.create({
            data: {
              examSessionId: session.id,
              questionNumber: q.questionNumber || index + 1,
              sectionTitle: q.sectionTitle || null,
              questionType: q.questionType,
              visualType: q.visualType || "TEXT",
              prompt: q.prompt,
              supplementaryData: q.supplementaryData ? (q.supplementaryData as any) : null,
              options: q.options ? (q.options as any) : null,
              maxMarks: q.maxMarks || 1,
              rubric: q.rubric ? (q.rubric as any) : null,
              correctAnswer: q.correctAnswer || null
            }
          })
        )
      );

      
                      await prisma.user.update({
                          where: {id: session.userId},
                          data:{
                            assessmentCreation:{ increment: 1 }
                          }
                      })

      
        const existingResponse = await prisma.updateResponse.findFirst({ where:{userId:session.userId}});
                      
          const dashboardsUpdate = new Date().toISOString();
                        
          if(existingResponse){
            await prisma.updateResponse.update({
              where:{id:existingResponse.id},
            data: {  
              assessmentUpdate:dashboardsUpdate, 
            }, });
          }

      res.status(201).json({
        success: true,
        data: {
          session: updatedSession,
          totalQuestions: savedQuestions.length,
          questions: savedQuestions
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // READ All Sessions (with pagination)
  static async getAllSessions(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = req.query.userId as string;

      const where = userId ? { userId } : {};

      const [total, sessions] = await Promise.all([
        prisma.examSession.count({ where }),
        prisma.examSession.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            _count: { select: { questions: true } },
            evaluationReport: { select: { id: true, percentage: true, grade: true } }
          }
        })
      ]);

      res.status(200).json({
        success: true,
        data: sessions,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // READ Session by User ID
  static async getSessionByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params as any;
      const session = await prisma.examSession.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          questions: {
            orderBy: { questionNumber: "asc" },
            include: { userResponses: true }
          },
          evaluationReport: true
        },
      });

      if (!session) {
        res.status(404).json({ success: false, message: "Exam session not found" });
        return;
      }

      res.status(200).json({ success: true, data: session });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // READ Session by ID
  static async getSessionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as any;
      const session = await prisma.examSession.findUnique({
        where: { id },
        include: {
          questions: {
            orderBy: { questionNumber: "asc" },
            include: { userResponses: true }
          },
          evaluationReport: true
        }
      });

      if (!session) {
        res.status(404).json({ success: false, message: "Exam session not found" });
        return;
      }

      res.status(200).json({ success: true, data: session });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // UPDATE Session
  static async updateSession(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as any;
      const updatedSession = await prisma.examSession.update({
        where: { id },
        data: req.body
      });

      
        const existingResponse = await prisma.updateResponse.findFirst({ where:{userId:updatedSession.userId}});
                      
          const dashboardsUpdate = new Date().toISOString();
                        
          if(existingResponse){
            await prisma.updateResponse.update({
              where:{id:existingResponse.id},
            data: {  
              assessmentUpdate:dashboardsUpdate, 
            }, });
          }

      res.status(200).json({ success: true, data: updatedSession });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /api/exam-sessions/:id/submit
static async submitSession(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as any;

    // 1. Fetch Session with questions and user responses
    const session = await prisma.examSession.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { questionNumber: "asc" },
          include: { userResponses: true }
        }
      }
    });

    if (!session) {
      res.status(404).json({ success: false, message: "Exam session not found." });
      return;
    }

    //session.status === "SUBMITTED" || 
    if (session.status === "EVALUATED") {
      res.status(400).json({ success: false, message: "Exam session has already been submitted." });
      return;
    }

    // 2. Mark Session as SUBMITTED with submittedAt timestamp
    await prisma.examSession.update({
      where: { id },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date()
      }
    });

    // 3. Evaluate Session using Gemini AI
    const aiResult = await EvaluationReportAIService.evaluateSessionSubmission(session);

    // 4. Save Evaluation Report & update session state to EVALUATED in a transaction
    const [report, updatedSession] = await prisma.$transaction([
      prisma.evaluationReport.upsert({
        where: { examSessionId: id },
        create: {
          examSessionId: id,
          subject: session.subject || "General Subject",
          totalMarksObtained: aiResult.totalMarksObtained,
          totalMaxMarks: aiResult.totalMaxMarks,
          percentage: aiResult.percentage,
          grade: aiResult.grade || "N/A",
          overallFeedback: aiResult.overallFeedback,
          strengths: aiResult.strengths,
          improvementAreas: aiResult.improvementAreas,
          categoryBreakdown: aiResult.categoryBreakdown
        },
        update: {
          totalMarksObtained: aiResult.totalMarksObtained,
          totalMaxMarks: aiResult.totalMaxMarks,
          percentage: aiResult.percentage,
          grade: aiResult.grade || "N/A",
          overallFeedback: aiResult.overallFeedback,
          strengths: aiResult.strengths,
          improvementAreas: aiResult.improvementAreas,
          categoryBreakdown: aiResult.categoryBreakdown
        }
      }),
      prisma.examSession.update({
        where: { id },
        data: { status: "EVALUATED" }
      })
    ]);

    
        const existingResponse = await prisma.updateResponse.findFirst({ where:{userId:session.userId}});
                      
          const dashboardsUpdate = new Date().toISOString();
                        
          if(existingResponse){
            await prisma.updateResponse.update({
              where:{id:existingResponse.id},
            data: {  
              assessmentUpdate:dashboardsUpdate, 
            }, });
          }

    res.status(200).json({
      success: true,
      message: "Exam submitted and evaluated successfully.",
      data: {
        session: updatedSession,
        report
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

  // DELETE Session
  static async deleteSession(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as any;
      await prisma.examSession.delete({ where: { id } });

      res.status(200).json({ success: true, message: "Exam session deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

