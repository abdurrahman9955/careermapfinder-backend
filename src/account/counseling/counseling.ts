// src/controllers/classContactController.ts
import { Request, Response, NextFunction } from 'express';
import { ClassCounselingService } from './createCounseling';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!); 


async function sendReply(email: string, subject: any): Promise<void> {
  try {
    await resend.emails.send({
      from: 'support@careermapfinder.com',
      to: email,
      subject: subject,
      html: `
       <!DOCTYPE html>
   <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Thank You for Reaching Out</title>
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
        <h1>Thank You for Contacting Carrer Map Finder</h1>
      </div>
      <div class="body">
        <p>Hi there,</p>

        <p>We’ve received your message and want to thank you for getting in touch with us.</p>

        <p>One of our support team members will review your inquiry and respond to you as soon as possible.</p>

        <p>We aim to get back to all inquiries within <strong>24 hours</strong> (often much sooner).</p>

        <p>In the meantime, feel free to explore our platform and learn more about how Career Map FInder helps
        students and instructors grow through smart and powerful e-learning solutions.</p>

        <a href="https://www.careermapfinder.com" class="button">Visit Our Website</a>

        <p class="signature">Warm regards,<br />
        The CareerMapFinder Team</p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} CareerMapFinder. All rights reserved.<br/>
        <a href="https://www.infobeatlive.com">CareerMapFinder</a>
      </div>
    </div>
  </body>
  </html>`,});

    console.log(`Resend: OTP email sent to ${email}`);
  } catch (error) {
    console.error('Resend email error:', error);
    throw new Error('Failed to send OTP via Resend');
  }
}


async function sendCounseling(
      fullName:string,
      emailAddress:string,
      phoneNumber:string,
      country:string,
      state:string,
      academicStatus:string,
      primaryFocus:string,
      biggestPainPoint:string,
      questions:string,
      sessionMode:string,
      timeWindow:string,
      targetUniversity?:string,
      fieldofStudy?:string,
      graduationYear?:string,
): Promise<void> {
  try {
    await resend.emails.send({
      from: 'counseling@careermapfinder.com',
      to:'careermapfinder@gmail.com',
      subject: 'New Counseling Just Arrived',
      html: `
       <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>New Counseling Just Recieved</title>
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
        <h1>New Couseling From User Just Arrived</h1>
      </div>
      <div class="body">

      <p>:Full Name: ${fullName}</p>

      <p>Email: ${emailAddress}</p>

      <p>Phone Number: ${phoneNumber}</p>

      <p>Country: ${country}</p>

      <p>State: ${state}</p>

      <p>Academic Status: ${academicStatus}</p>

      <p>Primary Focus: ${primaryFocus}</p>

      <p>Biggest Pain Point: ${biggestPainPoint}</p>

      <p>Questions: ${questions}</p>

      <p>:Session Mode: ${sessionMode}</p>

      <p>Time Window: ${timeWindow}</p>

      <p>Target University: ${targetUniversity}</p>

      <p>Field Of Study: ${fieldofStudy}</p>

      <p>Graduation Year: ${graduationYear}</p>


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


const counselingService = new ClassCounselingService();

export class ClassCounselingController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
     
      const counselings = await counselingService.getAllCounselings();
      res.status(200).json({  success:true, counselings });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success:false, error:'Failed to get all counseling message.' });
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {

      const { id } = req.params
    
      const counseling = await counselingService.getCounselingById(id as any);
      if (!counseling) return res.status(404).json({ message: 'Counseling not found' });
      res.status(200).json({ success:true, counseling });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success:false, error:'Failed to get counseling message.' });
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {

      const counselingData = req.body; // Ensure req.body contains name, email, reason, and statement
 
      const newCounseling = await counselingService.createCounseling(counselingData);
      await sendReply(counselingData.email, counselingData.reason );
      await sendCounseling(

      counselingData.fullName,
      counselingData.emailAddress,
      counselingData.phoneNumber,
      counselingData.country,
      counselingData.state,
      counselingData.academicStatus,
      counselingData.primaryFocus,
      counselingData.biggestPainPoint,
      counselingData.questions,
      counselingData.sessionMode,
      counselingData.timeWindow,
      counselingData.targetUniversity,
      counselingData.fieldofStudy,
      counselingData.graduationYear,

      );
      res.status(201).json({  success:true, newCounseling });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success:false, error:'Failed to create counseling message.' });
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {

      const id = req.params.id

      const updatedCounseling = await counselingService.updateCounseling(id as any, req.body);
      res.status(200).json({  success:true, updatedCounseling });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success:false, error:'Failed to update counseling message.' });
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {

      const id = req.params.id

      const  counseling =  await counselingService.deleteCounseling(id as any);
      res.status(204).send({ success:true, counseling });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success:false, error:'Failed to delete counseling message.' });

    }
  }
}


export default new ClassCounselingController();