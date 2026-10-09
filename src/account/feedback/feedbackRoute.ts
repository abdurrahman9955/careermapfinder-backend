// src/routes/classContactRoutes.ts
import { Router } from 'express';
import { ClassFeedbackController } from './feedback';

const feedbackRouter = Router();
const feedbackController = new ClassFeedbackController();

feedbackRouter.get('/feedbacks/get-all', feedbackController.getAll);
feedbackRouter.get('/feedbacks/get/:id', feedbackController.getById);
feedbackRouter.post('/feedbacks/create', feedbackController.create);
feedbackRouter.put('/feedbacks/update/:id', feedbackController.update);
feedbackRouter.delete('/feedbacks/delete/:id', feedbackController.delete);

export default feedbackRouter;
