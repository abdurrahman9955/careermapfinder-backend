// src/routes/classContactRoutes.ts
import { Router } from 'express';
import { ClassContactController } from './contact';

const contactRouter = Router();
const contactController = new ClassContactController();

contactRouter.get('/contacts/get-all', contactController.getAll);
contactRouter.get('/contacts/get/:id', contactController.getById);
contactRouter.post('/contacts/create', contactController.create);
contactRouter.put('/contacts/update/:id', contactController.update);
contactRouter.delete('/contacts/delete/:id', contactController.delete);

export default contactRouter;
