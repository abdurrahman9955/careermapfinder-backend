// src/controllers/classContactController.ts
import { Request, Response, NextFunction } from 'express';
import { ClassFeedbackService } from './createFeedback';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!); 


async function sendFeedback(fullName: string, email: string, subject: any, statement: string, rating: string,): Promise<void> {
  try {
    await resend.emails.send({
      from: 'feedback@careermapfinder.com',
      to:'careermapfinder@gmail.com',
      subject: subject,
      html: `
       <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>New Feed Just Recieved</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f9f9f9;
        margin: 0;
        padding: 0;
      }
      .container {
        background-color: #ffffff;
        max-width: 600px;
        margin: 30px auto;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 0 10px rgba(0,0,0,0.05);
      }
      .header {
        background-color: #599334;
        color: #ffffff;
        padding: 30px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
      }
      .body {
        padding: 30px;
        color: #333333;
        line-height: 1.6;
      }
      .footer {
        background-color: #f1f1f1;
        text-align: center;
        padding: 15px;
        font-size: 13px;
        color: #888;
      }
      .button {
        display: inline-block;
        margin-top: 20px;
        background-color: #599334;
        color: #ffffff !important;
        padding: 12px 25px;
        text-decoration: none;
        border-radius: 5px;
      }
      .signature {
        margin-top: 25px;
        font-style: italic;
        color: #555;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>New Feedback From User Just Arrived</h1>
      </div>
      <div class="body">
        <p>Full Name: ${fullName}</p>

        <p>Email Address: ${email}</p>

        <p><strong>Reason: ${subject}</strong></p>

        <p>Statement: ${statement}.</p>

        <p>The user rating: ${rating}.</p>

        <a href="https://www.careermapfinder.com" class="button">Visit Our Website</a>

        <p class="signature">Warm regards,<br />
        The CareerMapFinder Team</p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} CareerMapFInder. All rights reserved.<br/>
        <a href="https://www.careermapfinder.com">CareerMapFinder</a>
      </div>
    </div>
  </body>
  </html>`,});

    console.log(`Resend: OTP email sent to ${'careermapfinder@gmail.com'}`);
  } catch (error) {
    console.error('Resend email error:', error);
    throw new Error('Failed to send OTP via Resend');
  }
}

const feedbackService = new ClassFeedbackService();

export class ClassFeedbackController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
     
      const feedbacks = await feedbackService.getAllFeedbacks();
      res.status(200).json({  success:true, feedbacks });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success:false, error:'Failed to get all feedback message.' });
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {

      const { id } = req.params
    
      const feedback = await feedbackService.getFeedbackById(id as any);
      if (!feedback) return res.status(404).json({ message: 'Contact not found' });
      res.status(200).json({ success:true, feedback });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success:false, error:'Failed to get feedback message.' });
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {

      const feedbackData = req.body; // Ensure req.body contains name, email, reason, and statement
 
      const newFeedback = await feedbackService.createFeedback(feedbackData);
      await sendFeedback(feedbackData.fullName,
      feedbackData.email, feedbackData.reason, feedbackData.statement, feedbackData.rating );
      res.status(201).json({  success:true, newFeedback});
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success:false, error:'Failed to create feedback message.' });
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {

      const id = req.params.id

      const updatedFeedback = await feedbackService.updateFeedback(id as any, req.body);
      res.status(200).json({  success:true, updatedFeedback });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success:false, error:'Failed to update feedback message.' });
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {

      const id = req.params.id

      const  feedback =  await feedbackService.deleteFeedback(id as any);
      res.status(204).send({ success:true, feedback });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success:false, error:'Failed to delete feedback message.' });

    }
  }
}

export default new ClassFeedbackController();