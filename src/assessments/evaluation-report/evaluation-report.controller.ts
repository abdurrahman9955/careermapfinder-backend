import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { EvaluationReportAIService } from "./evaluation-report.ai";

export class EvaluationReportController {
  // CREATE / GENERATE AI Evaluation Report
  static async generateReport(req: Request, res: Response): Promise<void> {
    try {
      const { examSessionId } = req.body;

      // 1. Fetch complete Session, Questions, and User Responses
      const session = await prisma.examSession.findUnique({
        where: { id: examSessionId },
        include: {
          questions: {
            orderBy: { questionNumber: "asc" },
            include: { userResponses: true }
          }
        }
      });

      if (!session) {
        res.status(404).json({ success: false, message: "Exam Session not found" });
        return;
      }

      // 2. Compute Evaluation using Gemini AI
      const aiResult = await EvaluationReportAIService.evaluateSessionSubmission(session);

      // 3. Upsert Evaluation Report into DB
      const report = await prisma.evaluationReport.upsert({
        where: { examSessionId },
        create: {
          examSessionId,
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
      });

      // Update session state
      await prisma.examSession.update({
        where: { id: examSessionId },
        data: { status: "EVALUATED", submittedAt: new Date() }
      });

      res.status(201).json({ success: true, data: report });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // READ Evaluation Report by Session ID
  static async getReportBySessionId(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params as any;
      const report = await prisma.evaluationReport.findUnique({
        where: { examSessionId: sessionId },
        include: { examSession: true }
      });

      if (!report) {
        res.status(404).json({ success: false, message: "Evaluation report not found" });
        return;
      }

      res.status(200).json({ success: true, data: report });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // UPDATE Evaluation Report
  static async updateReport(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as any;
      const updatedReport = await prisma.evaluationReport.update({
        where: { id },
        data: req.body
      });

      res.status(200).json({ success: true, data: updatedReport });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // DELETE Evaluation Report
  static async deleteReport(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as any;
      await prisma.evaluationReport.delete({ where: { id } });

      res.status(200).json({ success: true, message: "Evaluation report deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}