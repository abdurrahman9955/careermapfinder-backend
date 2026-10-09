import { Request, Response } from "express";
import prisma from "../../utils/prisma";

export class UserResponseController {
  // CREATE / UPSERT Answer Submission
  static async submitOrUpdateResponse(req: Request, res: Response): Promise<void> {
    try {
      const { questionId, answerText, selectedOptions, timeSpentSeconds } = req.body;

      // Check if response already exists for this question
      const existingResponse = await prisma.userResponse.findFirst({
        where: { questionId }
      });

      let responseRecord;
      if (existingResponse) {
        responseRecord = await prisma.userResponse.update({
          where: { id: existingResponse.id },
          data: {
            answerText,
            selectedOptions,
            timeSpentSeconds: existingResponse.timeSpentSeconds + timeSpentSeconds
          }
        });
      } else {
        responseRecord = await prisma.userResponse.create({
          data: {
            questionId,
            answerText,
            selectedOptions,
            timeSpentSeconds
          }
        });
      }

      res.status(200).json({ success: true, data: responseRecord });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // READ Responses by Question ID
  static async getResponsesByQuestion(req: Request, res: Response): Promise<void> {
    try {
      const { questionId } = req.params as any;
      const responses = await prisma.userResponse.findMany({
        where: { questionId },
        orderBy: { createdAt: "desc" }
      });

      res.status(200).json({ success: true, data: responses });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // READ Single Response by ID
  static async getResponseById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as any;
      const responseRecord = await prisma.userResponse.findUnique({
        where: { id },
        include: { question: true }
      });

      if (!responseRecord) {
        res.status(404).json({ success: false, message: "User response record not found" });
        return;
      }

      res.status(200).json({ success: true, data: responseRecord });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // UPDATE Response
  static async updateResponse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as any;
      const updated = await prisma.userResponse.update({
        where: { id },
        data: req.body
      });

      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // DELETE Response
  static async deleteResponse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as any;
      await prisma.userResponse.delete({ where: { id } });

      res.status(200).json({ success: true, message: "Response deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}