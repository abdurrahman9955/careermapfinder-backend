import { Router } from "express";
import { EvaluationReportController } from "./evaluation-report.controller";
import { validateGenerateReport, validateUpdateReport } from "./evaluation-report.middleware";
import { authenticateUser } from "../../utils/authMiddleware";

const assessmentReportRouter = Router();

assessmentReportRouter.post("/assessment-reports/generate", authenticateUser, validateGenerateReport, EvaluationReportController.generateReport);
assessmentReportRouter.get("/assessment-reports/session/:sessionId", authenticateUser, EvaluationReportController.getReportBySessionId);
assessmentReportRouter.patch("/assessment-reports/:id", authenticateUser, validateUpdateReport, EvaluationReportController.updateReport);
assessmentReportRouter.delete("/assessment-reports/:id", authenticateUser, EvaluationReportController.deleteReport);

export default assessmentReportRouter;