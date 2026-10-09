import { Router } from 'express';
import {
  createUpdateResponse,
  getAllUpdateResponses,
  getUpdateResponseById,
  updateUpdateResponse,
  deleteUpdateResponse,
  getUpdateResponseByUserId,
} from './controller';

const updateResponseRouter = Router();

updateResponseRouter.post('/update-responses', createUpdateResponse);

updateResponseRouter.get('/update-responses', getAllUpdateResponses);

updateResponseRouter.get('/update-responses/:id', getUpdateResponseById);

updateResponseRouter.patch('/update-responses/:id', updateUpdateResponse);
updateResponseRouter.get('/update-responses/user/:userId', getUpdateResponseByUserId);

updateResponseRouter.delete('/update-responses/:id', deleteUpdateResponse);

export default updateResponseRouter;