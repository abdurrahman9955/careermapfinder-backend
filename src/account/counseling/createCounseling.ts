// src/services/classContactService.ts
import prisma from "../../utils/prisma";
export class ClassCounselingService {

  async getAllCounselings( ) {
    return await prisma.counseling.findMany({ });
  }


  async createCounseling(data: {
      fullName:string;
      emailAddress:string;
      phoneNumber:string;
      country:string;
      state:string;
      academicStatus:string;
      targetUniversity?:string
      fieldofStudy?:string
      graduationYear?:string
      primaryFocus:string;
      biggestPainPoint:string;
      questions:string;
      sessionMode:string;
      timeWindow:string;
  }, ) {
    return await prisma.counseling.create({
      data: { ...data, },
    });
  }
  

  async getCounselingById( id: string) {
    return await prisma.counseling.findUnique({
      where: { id,},
    });
  }

  async updateCounseling(id: string, data: { name?: string; email?: string; reason?: string; statement?: string }, ) {
    return await prisma.counseling.update({
      where: { id },
      data,
    });
  }

  async deleteCounseling(id: string) {
    return await prisma.counseling.delete({
      where: { id, },
    });
  }
}

export default new ClassCounselingService();