// src/services/classContactService.ts
import prisma from "../../utils/prisma";
export class ClassContactService {

  async getAllContacts( ) {
    return await prisma.contact.findMany({ });
  }

  async createContact(data: {
    name: string;
    email: string;
    reason: string;
    statement: string;
  }, ) {
    return await prisma.contact.create({
      data: { ...data, },
    });
  }
  

  async getContactById( id: string) {
    return await prisma.contact.findUnique({
      where: { id,},
    });
  }

  async updateContact(id: string, data: { name?: string; email?: string; reason?: string; statement?: string }, ) {
    return await prisma.contact.update({
      where: { id },
      data,
    });
  }

  async deleteContact(id: string) {
    return await prisma.contact.delete({
      where: { id, },
    });
  }
}

export default new ClassContactService();