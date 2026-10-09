// src/services/classContactService.ts
import prisma from "../../utils/prisma";
export class ClassFeedbackService {

  async createFeedback(data: {
    fullName: string;
    email?: string;
    reason: string;
    statement: string;
    rating: number;
  }, ) {
    return await prisma.feedback.create({
      data: { ...data, },
    });
  }
  
  async updateFeedback(id: string, 
    data: { fullName?: string; email?: string; reason?: string; statement?: string; rating?: number; }, ) {
    return await prisma.feedback.update({
      where: { id },
      data,
    });
  }

  async getFeedbackById( id: string) {
    return await prisma.feedback.findUnique({
      where: { id,},
    });
  }

  async deleteFeedback(id: string) {
    return await prisma.feedback.delete({
      where: { id, },
    });
  }

  async getAllFeedbacks( ) {
    return await prisma.feedback.findMany({ });
  }

}

export default new ClassFeedbackService();