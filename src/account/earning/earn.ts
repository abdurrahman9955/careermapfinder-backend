import express from 'express';
import prisma from '../../utils/prisma';
import { authenticateUser } from '../middleware/authMiddleware';

const earningRouter = express.Router();

earningRouter.post('/earn/:userId', authenticateUser, async (req, res) => {
  try {
     const { userId } = req.params;
    const {  planType, billingCycle, nextBillingDate, status, isCompleted, amount  } = req.body;

    const classEarning = await prisma.earning.create({
      data: { 
        userId:String(userId), 
        planType, 
        billingCycle, 
        nextBillingDate, 
        status, 
        isCompleted, 
        amount 
      },
    });

    res.status(201).json(classEarning);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create class earning', details: error });
  }
});

earningRouter.get('/earn/get', authenticateUser, async (_req, res) => {
  try {
    const earnings = await prisma.earning.findMany();
    res.json(earnings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch class earnings', details: error });
  }
});

earningRouter.get('/earn/get/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const earning = await prisma.earning.findUnique({ where: { id: String(id) } });

    if (!earning) return res.status(404).json({ error: 'Class earning not found' });

    res.json(earning);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch class earning', details: error });
  }
});

earningRouter.put('/earn/update/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { planType,  billingCycle,  nextBillingDate,  status,  isCompleted,  amount  } = req.body;

    const updated = await prisma.earning.update({
      where: { id:String(id) },
      data: {  
        planType,  
        billingCycle, 
        nextBillingDate, 
        status, 
        isCompleted, 
        amount  
       },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update class earning', details: error });
  }
});

earningRouter.delete('/earn/delete/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.earning.delete({ where: { id: String(id) } });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete class earning', details: error });
  }
});

export default earningRouter;
