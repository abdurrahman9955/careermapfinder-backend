// src/routes/classContactRoutes.ts
import { Router } from 'express';
import { ClassCounselingController } from './counseling';
import { authenticateUser } from '../middleware/authMiddleware';

const counselingRouter = Router();
const counselingController = new ClassCounselingController();

counselingRouter.get('/counseling/get-all', authenticateUser, counselingController.getAll);
counselingRouter.get('/counseling/get/:id', authenticateUser,  counselingController.getById);
counselingRouter.post('/counseling/create', authenticateUser,  counselingController.create);
counselingRouter.put('/counseling/update/:id', authenticateUser, counselingController.update);
counselingRouter.delete('/counseling/delete/:id', authenticateUser, counselingController.delete);

export default counselingRouter;
