import puppeteer from 'puppeteer';
import { Buffer } from 'buffer';

const PUPPETEER_AUTH_SECRET = process.env.PUPPETEER_AUTH_SECRET!; 
const NEXTJS_BASE_URL = 'http://localhost:3000';

export class PDFGeneratorService {
    
    /** * 
     * @returns 
     */
    public async generateReportPdf(id:string): Promise<Buffer> {
     
        if (!PUPPETEER_AUTH_SECRET) {
            throw new Error('PUPPETEER_AUTH_SECRET environment variable is missing.');
        }

        const browser = await puppeteer.launch({
          headless: true, 
          args: [
            "--no-sandbox", 
            "--disable-setuid-sandbox", 
            "--disable-dev-shm-usage",
          ],
        });
        
        try {
            const page = await browser.newPage();
            
            await page.setViewport({ width: 1060, height: 2120, deviceScaleFactor: 1});

            await page.emulateMediaType('screen');

            await page.setExtraHTTPHeaders({
                'Authorization': `Bearer ${PUPPETEER_AUTH_SECRET}`,
            });
           
            const reportUrl = `${NEXTJS_BASE_URL}/dashboard/career-explorer/download/${id}`;

            await page.goto(reportUrl, {  waitUntil: "networkidle0", timeout: 60000 });

            await page.waitForNetworkIdle({ idleTime: 1000, timeout: 30000 });
            await page.waitForSelector("#root, main, body");
           
            const pdfBuffer = await page.pdf({
                format: 'A4',
                scale: 0.75,
                printBackground: true, 
                preferCSSPageSize: true,
                margin: { top: '0px', right: '0px', bottom: '0px', left: '0px', },
            });

            return pdfBuffer as Buffer; 
            
        } catch (error) {
            console.error('Error during PDF generation:', error);
            throw new Error('Failed to generate PDF due to rendering or navigation error.'); 
        } finally {
            await browser.close();
        }
    }
}

export const pdfGenerator = new PDFGeneratorService();


