import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

/**
 * CREATE
 * Creates a new UpdateResponse for a user
 * All update fields default to current timestamp
 */
export const createUpdateResponse = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || req.body.userId;

    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'userId is required',
      });
    }

    const now = new Date().toISOString();

    const updateResponse = await prisma.updateResponse.create({
      data: {
        userId,
        careerUpdate: now,
        assessmentUpdate: now,
        interviewUpdate: now,
        dashboardsUpdate: now,
        settingsUpdate: now,
        notificationUpdate: now,
      },
    });

    return res.status(201).json({
      status: 'success',
      data: updateResponse,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

/**
 * GET ALL (optionally by user)
 */
export const getAllUpdateResponses = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const data = await prisma.updateResponse.findMany({
      where: userId ? { userId } : {},

      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      status: 'success',
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const getUpdateResponseByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params as any;

    const data = await prisma.updateResponse.findMany({
      where: { userId },
      include:{ user:true },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      status: 'success',
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

/**
 * GET ONE BY ID
 */
export const getUpdateResponseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as any;

    const data = await prisma.updateResponse.findUnique({
      where: { id },
    });

    if (!data) {
      return res.status(404).json({
        status: 'error',
        message: 'Not found',
      });
    }

    return res.json({
      status: 'success',
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

/**
 * PATCH (update specific field)
 * Frontend sends which field to update
 */
export const updateUpdateResponse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as any;
    const { field } = req.body;

    const allowedFields = [
      'careerUpdate',
      'assessmentUpdate',
      'interviewUpdate',
      'dashboardsUpdate',
      'settingsUpdate',
      'notificationUpdate',
    ];

    if (!allowedFields.includes(field)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid field',
      });
    }

    const now = new Date().toISOString();

    const updated = await prisma.updateResponse.update({
      where: { id },
      data: {
        [field]: now,
      },
    });

    return res.json({
      status: 'success',
      message: `${field} updated`,
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

/**
 * DELETE
 */
export const deleteUpdateResponse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as any;

    await prisma.updateResponse.delete({
      where: { id },
    });

    return res.json({
      status: 'success',
      message: 'Deleted successfully',
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};