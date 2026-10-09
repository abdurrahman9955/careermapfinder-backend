import { Router } from "express";
import { ExamSessionController } from "./exam-session.controller";
import { validateCreateSession, validateUpdateSession } from "./exam-session.middleware";
import { authenticateUser } from "../../utils/authMiddleware";

const assessmentSessionRouter = Router();

assessmentSessionRouter.post("/assessment-sessions", authenticateUser, validateCreateSession, ExamSessionController.createSession);
assessmentSessionRouter.get("/assessment-sessions", authenticateUser, ExamSessionController.getAllSessions);
assessmentSessionRouter.get("/assessment-sessions/user/:userId", authenticateUser, ExamSessionController.getSessionByUserId);
assessmentSessionRouter.get("/assessment-sessions/:id", authenticateUser, ExamSessionController.getSessionById);
assessmentSessionRouter.patch("/assessment-sessions/:id", authenticateUser, validateUpdateSession, ExamSessionController.updateSession);
assessmentSessionRouter.patch("/assessment-sessions/:id/submit", authenticateUser,  ExamSessionController.submitSession);
assessmentSessionRouter.delete("/assessment-sessions/:id", authenticateUser, ExamSessionController.deleteSession);

export default assessmentSessionRouter;