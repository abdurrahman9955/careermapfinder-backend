import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

export const submitResponse = async (req: Request, res: Response) => {
  try {
    const { questionId, responseText, submittedCode, selectedChoices, timeSpentSeconds } = req.body;

    const response = await prisma.candidateResponse.create({
      data: {
        questionId,
        responseText,
        submittedCode,
        selectedChoices,
        timeSpentSeconds,
      },
    });

    return res.status(201).json({ status: 'success', data: response });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};


export const getResponseByQuestionId = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params as any;
    const response = await prisma.candidateResponse.findMany({ where: { questionId } });
    if (!response) return res.status(404).json({ status: 'error', message: 'Response not found' });
    return res.json({ status: 'success', data: response });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getResponseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as any;
    const response = await prisma.candidateResponse.findUnique({ where: { id } });
    if (!response) return res.status(404).json({ status: 'error', message: 'Response not found' });
    return res.json({ status: 'success', data: response });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateResponse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as any;
    const updated = await prisma.candidateResponse.update({
      where: { id },
      data: req.body,
    });
    return res.json({ status: 'success', data: updated });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const deleteResponse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as any;
    await prisma.candidateResponse.delete({ where: { id } });
    return res.json({ status: 'success', message: 'Response deleted' });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};