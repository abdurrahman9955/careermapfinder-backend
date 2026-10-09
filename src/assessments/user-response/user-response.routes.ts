import { Router } from "express";
import { UserResponseController } from "./user-response.controller";
import { validateCreateUserResponse, validateUpdateUserResponse } from "./user-response.middleware";
import { authenticateUser } from "../../utils/authMiddleware";

const assessmentResponseRouter = Router();

assessmentResponseRouter.post("/assessment-responses",  authenticateUser, validateCreateUserResponse, UserResponseController.submitOrUpdateResponse);
assessmentResponseRouter.get("/assessment-responses/question/:questionId",  authenticateUser, UserResponseController.getResponsesByQuestion);
assessmentResponseRouter.get("/assessment-responses/:id", authenticateUser, UserResponseController.getResponseById);
assessmentResponseRouter.patch("/assessment-responses/:id", authenticateUser, validateUpdateUserResponse, UserResponseController.updateResponse);
assessmentResponseRouter.delete("/assessment-responses/:id", authenticateUser, UserResponseController.deleteResponse);

export default assessmentResponseRouter;