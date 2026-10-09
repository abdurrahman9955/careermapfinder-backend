import { Router } from 'express';
import { CareerExplorerController } from './careerExplorer.controller';
import { validateCreateIntake, validateUpdateIntake, validateUpdateReport,
validateId } from './careerExplorer.middleware';
import { authenticateUser } from "../utils/authMiddleware";

const careerExplorerRouter = Router();

// ==========================================
// INTAKE ROUTES
// ==========================================
careerExplorerRouter.post( '/intakes', authenticateUser, validateCreateIntake, CareerExplorerController.createIntakeAndGenerateReport);
careerExplorerRouter.get('/intakes', authenticateUser, CareerExplorerController.getAllIntakes);
careerExplorerRouter.get('/intakes/:userId', authenticateUser, CareerExplorerController.getIntakeByUserId);
careerExplorerRouter.get('/intakes/:id', authenticateUser, validateId, CareerExplorerController.getIntakeById);
careerExplorerRouter.patch('/intakes/:id', authenticateUser, validateId, validateUpdateIntake, CareerExplorerController.updateIntake);
careerExplorerRouter.delete('/intakes/:id', authenticateUser, validateId, CareerExplorerController.deleteIntake);

// ==========================================
// REPORT ROUTES
// ==========================================
careerExplorerRouter.post('/reports/regenerate/:intakeId', authenticateUser, CareerExplorerController.regenerateReport);
careerExplorerRouter.get('/reports', authenticateUser, CareerExplorerController.getAllReports);
careerExplorerRouter.get('/reports/:id', authenticateUser, validateId, CareerExplorerController.getReportById);
careerExplorerRouter.get('/reports/intake/:intakeId', authenticateUser, CareerExplorerController.getReportsByIntakeId);
careerExplorerRouter.get('/reports/user/:userId', authenticateUser, CareerExplorerController.getReportsByUserId);
careerExplorerRouter.patch('/reports/:id', authenticateUser, validateId, validateUpdateReport, CareerExplorerController.updateReport);
careerExplorerRouter.delete('/reports/:id', authenticateUser, validateId, CareerExplorerController.deleteReport);

export default careerExplorerRouter;