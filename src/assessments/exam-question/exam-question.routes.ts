import { Router } from "express";
import { ExamQuestionController } from "./exam-question.controller";
import { validateCreateQuestion, validateUpdateQuestion } from "./exam-question.middleware";
import { authenticateUser } from "../../utils/authMiddleware";

const assessmentQuestionRouter = Router();

assessmentQuestionRouter.post("/assessment-questions", authenticateUser, validateCreateQuestion, ExamQuestionController.createQuestion);
assessmentQuestionRouter.get("/assessment-questions/session/:sessionId", authenticateUser, ExamQuestionController.getQuestionsBySession);
assessmentQuestionRouter.get("/assessment-questions/:id", authenticateUser, ExamQuestionController.getQuestionById);
assessmentQuestionRouter.patch("/assessment-questions/:id", authenticateUser, validateUpdateQuestion, ExamQuestionController.updateQuestion);
assessmentQuestionRouter.delete("/assessment-questions/:id", authenticateUser, ExamQuestionController.deleteQuestion);

export default assessmentQuestionRouter;