import { Request, Response } from 'express';
import prisma from '../../utils/prisma';


export const getQuestionBySessionId = async (req: Request, res: Response) => {
  try {
    const { interviewSessionId } = req.params as any;
    const question = await prisma.interviewQuestion.findMany({
      where: { interviewSessionId },
      include: { candidateResponses: true },
    });
    if (!question) return res.status(404).json({ status: 'error', message: 'Question not found' });
    return res.json({ status: 'success', data: question });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getQuestionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as any;
    const question = await prisma.interviewQuestion.findUnique({
      where: { id },
      include: { candidateResponses: true },
    });
    if (!question) return res.status(404).json({ status: 'error', message: 'Question not found' });
    return res.json({ status: 'success', data: question });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as any;
    const updated = await prisma.interviewQuestion.update({
      where: { id },
      data: req.body,
    });
    return res.json({ status: 'success', data: updated });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as any;
    await prisma.interviewQuestion.delete({ where: { id } });
    return res.json({ status: 'success', message: 'Question deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};