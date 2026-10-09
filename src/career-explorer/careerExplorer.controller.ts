import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { CareerExplorerAIService } from './careerExplorer.ai';

export class CareerExplorerController {

  // CREATE Intake & Automatically Generate Report
  static async createIntakeAndGenerateReport(req: Request, res: Response) {
    try {
      const intakeData = req.body;

      // 1. Save intake questionnaire to database
      const intake = await prisma.careerExplorerIntake.create({
        data: intakeData,
      });

      // 2. Generate comprehensive AI Career Report via Gemini
      const aiReport = await CareerExplorerAIService.generateComprehensiveReport(intake);

      // 3. Save Report linked to intake
      const report = await prisma.careerReport.create({
        data: {
          intakeId: intake.id,
          userId: intake.userId,
          ...aiReport,
        },
      });

      
                            await prisma.user.update({
                                where: {id: intake.userId},
                                data:{
                                  careerCreation:{ increment: 1 }
                                }
                            })

      
              const existingResponse = await prisma.updateResponse.findFirst({ where:{userId:intake.userId}});
                            
                const dashboardsUpdate = new Date().toISOString();
                              
                if(existingResponse){
                  await prisma.updateResponse.update({
                    where:{id:existingResponse.id},
                  data: {  
                    careerUpdate:dashboardsUpdate, 
                  }, });
                }

      return res.status(201).json({
        status: 'success',
        data: {
          intake,
          report,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  // READ All Intakes (Paginated)
  static async getAllIntakes(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const [intakes, total] = await Promise.all([
        prisma.careerExplorerIntake.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: { reports: { select: { id: true, careerName: true } } },
        }),
        prisma.careerExplorerIntake.count(),
      ]);

      return res.json({
        status: 'success',
        data: intakes,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  // READ Intake by ID
  static async getIntakeById(req: Request, res: Response) {
    try {
      const { id } = req.params as any;
      const intake = await prisma.careerExplorerIntake.findUnique({
        where: { id },
        include: { reports: true },
      });

      if (!intake) {
        return res.status(404).json({ status: 'error', message: 'Intake record not found' });
      }

      return res.json({ status: 'success', data: intake });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  
  // READ Intake by ID
  static async getIntakeByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params as any;
      const intake = await prisma.careerExplorerIntake.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: { reports: true },
      });

      if (!intake) {
        return res.status(404).json({ status: 'error', message: 'Intake record not found' });
      }

      return res.json({ status: 'success', data: intake });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  // UPDATE Intake
  static async updateIntake(req: Request, res: Response) {
    try {
      const { id } = req.params as any;
      const updatedIntake = await prisma.careerExplorerIntake.update({
        where: { id },
        data: req.body,
      });

      return res.json({ status: 'success', data: updatedIntake });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  // DELETE Intake (Cascade deletes associated report)
  static async deleteIntake(req: Request, res: Response) {
    try {
      const { id } = req.params as any;
      await prisma.careerExplorerIntake.delete({ where: { id } });

      return res.json({
        status: 'success',
        message: 'Intake and associated report deleted successfully',
      });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  // ==========================================
  // CAREER REPORT CRUD & SPECIALIZED GETTERS
  // ==========================================

  // RE-GENERATE Report for existing Intake ID
  static async regenerateReport(req: Request, res: Response) {
    try {
      const { intakeId } = req.params as any;
      const intake = await prisma.careerExplorerIntake.findUnique({
        where: { id: intakeId },
      });

      if (!intake) {
        return res.status(404).json({ status: 'error', message: 'Intake not found' });
      }

      const aiReport = await CareerExplorerAIService.generateComprehensiveReport(intake);

      const report = await prisma.careerReport.create({
        data: {
          intakeId: intake.id,
          ...aiReport,
        },
      });

      return res.status(201).json({ status: 'success', data: report });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  // READ All Reports (Paginated)
  static async getAllReports(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const [reports, total] = await Promise.all([
        prisma.careerReport.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: { intake: true },
        }),
        prisma.careerReport.count(),
      ]);

      return res.json({
        status: 'success',
        data: reports,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  // READ Report by ID
  static async getReportById(req: Request, res: Response) {
    try {
      const { id } = req.params as any;
      const report = await prisma.careerReport.findUnique({
        where: { id },
        include: { intake: true },
      });

      if (!report) {
        return res.status(404).json({ status: 'error', message: 'Report not found' });
      }

      return res.json({ status: 'success', data: report });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  // READ Reports by Intake ID
  static async getReportsByIntakeId(req: Request, res: Response) {
    try {
      const { intakeId } = req.params as any;
      const reports = await prisma.careerReport.findMany({
        where: { intakeId },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ status: 'success', data: reports });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  
  // READ Reports by User ID
  static async getReportsByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params as any;
      const reports = await prisma.careerReport.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ status: 'success', data: reports });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  // UPDATE Report Manually
  static async updateReport(req: Request, res: Response) {
    try {
      const { id } = req.params as any;
      const updatedReport = await prisma.careerReport.update({
        where: { id },
        data: req.body,
      });

      return res.json({ status: 'success', data: updatedReport });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  // DELETE Report by ID
  static async deleteReport(req: Request, res: Response) {
    try {
      const { id } = req.params as any;
      await prisma.careerReport.delete({ where: { id } });

      return res.json({ status: 'success', message: 'Career report deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }
}