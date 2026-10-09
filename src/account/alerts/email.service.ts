import { Resend } from 'resend';
import { GeneratedFocusAssignment } from './ai.service';

const resend = new Resend(process.env.RESEND_API_KEY!);

export class EmailService {
  public static async sendFocusAlertEmail(
    to: string,
    goalName: string,
    assignment: GeneratedFocusAssignment,
    alertId: string,
    isFinalWarning: boolean = false
  ): Promise<void> {
    const checkInUrl = `${process.env.FRONTEND_URL || 
    'https://www.careermapfinder.com'}/dashboard/alerts/checkin/${alertId}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Focus Assignment</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, 
    Arial, sans-serif; background-color: #f4f7f9; margin: 0; padding: 0; color: #1e293b; }
    .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; 
    overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
    .header { background: #0f172a; padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    .badge { display: inline-block; background: #2563eb; color: #ffffff; font-size: 12px; 
    font-weight: 600; padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px; text-transform: uppercase; }
    .warning-badge { background: #dc2626; }
    .content { padding: 32px 24px; }
    .task-card { background: #f8fafc; border-left: 4px solid #2563eb; padding: 20px; 
    border-radius: 0 8px 8px 0; margin-bottom: 24px; }
    .task-title { margin: 0 0 8px 0; color: #0f172a; font-size: 18px; font-weight: 600; }
    .task-desc { margin: 0; color: #475569; line-height: 1.6; font-size: 15px; }
    .action-list { margin: 20px 0; padding-left: 20px; }
    .action-list li { margin-bottom: 8px; color: #334155; font-size: 14px; }
    .cta-container { text-align: center; margin: 36px 0 24px 0; }
    .cta-button { background-color: #2563eb; color: #ffffff !important; text-decoration: none; 
    padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; 
    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); }
    .warning-box { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; 
    margin-bottom: 24px; color: #991b1b; font-size: 14px; line-height: 1.5; }
    .footer { background: #f8fafc; padding: 20px 24px; text-align: center; font-size: 12px; 
    color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge ${isFinalWarning ? 'warning-badge' : ''}">
      ${isFinalWarning ? 'Final Notice' : 'Focus Assignment'}</span>
      <h1>${goalName}</h1>
    </div>
    <div class="content">
      ${
        isFinalWarning
          ? `
        <div class="warning-box">
          <strong>⚠️ Account Inactivity Alert:</strong> You have missed 3 
          consecutive dispatches. This is your final automated alert. Please 
          complete your check-in to prevent auto-pausing.
        </div>`
          : ''
      }
      
      <div class="task-card">
        <h2 class="task-title">${assignment.title}</h2>
        <p class="task-desc">${assignment.description}</p>
      </div>

      <h3 style="font-size: 15px; color: #0f172a; margin-bottom: 12px;">Key Action Items:</h3>
      <ul class="action-list">
        ${assignment.actionItems.map((item) => `<li>${item}</li>`).join('')}
      </ul>

      <p style="font-style: italic; color: #64748b; font-size: 13px; margin-top: 24px;">
      "${assignment.motivationQuote}"</p>

      <div class="cta-container">
        <a href="${checkInUrl}" class="cta-button">Submit 60-Sec Check-in Reply</a>
      </div>
    </div>
    <div class="footer">
      Autonomous Progress & Focus Engine • Dedicated to your target goal execution.
    </div>
  </div>
</body>
</html>
`;

    await resend.emails.send({
      from:'alerts@careermapfinder.com',
      to,
      subject: isFinalWarning ? `ACTION REQUIRED Final Alert: ${goalName}` 
      : `Focus Directive: ${assignment.title}`,
      html: htmlContent,
    });
  }
}