import { Router, Request, Response } from 'express';
import { pdfGeneratorService } from './pdfGeneratorService'; 
import { pdfGenerator } from './pdfGenerator'; 
import { authenticateUser } from '../../account/middleware/authMiddleware';

const pdfRouter = Router();

pdfRouter.get('/pdf/demo/:id', async (req: Request, res: Response) => {
   
    try {

        const { id } = req.params;
      
        const pdfBuffer = await pdfGenerator.generateReportPdf(id as any);
        const fileName = `career-report-demo.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader("Content-Encoding", "identity"); 
        res.end(pdfBuffer);  

    } catch (error) {
        console.error(`Failed to generate PDF:`, error);
        res.status(500).send({ message: 'Internal server error while generating PDF.' });
    }
});

pdfRouter.get('/pdf/main/:id', authenticateUser, async (req: Request, res: Response) => {

    try {

        const { id } = req.params;
      
        const pdfBuffer = await pdfGeneratorService.generateReportPdf(id as any);
        const fileName = `career-report.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader("Content-Encoding", "identity"); 
        res.end(pdfBuffer);  

    } catch (error) {
        console.error(`Failed to generate PDF :`, error);
        res.status(500).send({ message: 'Internal server error while generating PDF.' });
    }
});

export default pdfRouter;