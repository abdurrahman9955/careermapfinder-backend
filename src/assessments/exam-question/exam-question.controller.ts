import { Request, Response } from "express";
import prisma from "../../utils/prisma";

export class ExamQuestionController {
  // CREATE Question manually
  static async createQuestion(req: Request, res: Response): Promise<void> {
    try {
      const question = await prisma.examQuestion.create({ data: req.body });
      res.status(201).json({ success: true, data: question });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // READ Questions by Exam Session ID
  static async getQuestionsBySession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params  as any;
      const questions = await prisma.examQuestion.findMany({
        where: { examSessionId: sessionId },
        orderBy: { questionNumber: "asc" }
      });

      res.status(200).json({ success: true, data: questions });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // READ Single Question by ID
  static async getQuestionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params  as any;
      const question = await prisma.examQuestion.findUnique({
        where: { id },
        include: { userResponses: true }
      });

      if (!question) {
        res.status(404).json({ success: false, message: "Question not found" });
        return;
      }

      res.status(200).json({ success: true, data: question });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // UPDATE Question
  static async updateQuestion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params  as any;
      const updatedQuestion = await prisma.examQuestion.update({
        where: { id },
        data: req.body
      });

      res.status(200).json({ success: true, data: updatedQuestion });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // DELETE Question
  static async deleteQuestion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as any;
      await prisma.examQuestion.delete({ where: { id } });
      res.status(200).json({ success: true, message: "Question deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}