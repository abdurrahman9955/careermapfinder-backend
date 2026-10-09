import { Router } from 'express';
import { AlertController } from './alert.controller';
import { validateRequest } from './validate.middleware';
import { authenticateUser } from '../middleware/authMiddleware';
import { CreateAlertSchema, UpdateAlertSchema, SubmitResponseSchema } from './alert.schema';

const alertRoutes = Router();

alertRoutes.post('/', authenticateUser, validateRequest(CreateAlertSchema), AlertController.createAlert);
alertRoutes.get('/user/:userId', authenticateUser, AlertController.getUserAlerts);
alertRoutes.get('/:id', authenticateUser, AlertController.getAlertById);
alertRoutes.patch('/:id', authenticateUser, validateRequest(UpdateAlertSchema), AlertController.updateAlert);
alertRoutes.delete('/:id', authenticateUser, AlertController.deleteAlert);

// Single Active Response Check-in Endpoint
alertRoutes.post('/response/checkin', authenticateUser, validateRequest(SubmitResponseSchema), AlertController.submitCheckInResponse);

export default alertRoutes;