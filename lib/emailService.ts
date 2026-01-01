import nodemailer from 'nodemailer';

interface EmailConfig {
  from: string;
  to: string;
  subject: string;
  html: string;
}

// cached transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

// send email function
export async function sendEmail({ from, to, subject, html }: Partial<EmailConfig> & { to: string; subject: string; html: string }) {
  try {
    const transport = getTransporter();

    const info = await transport.sendMail({
      from: from || process.env.SMTP_USER,
      to,
      subject,
      html,
    });

    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}



// email templates
export const emailTemplates = {
  verifyEmail: (link: string, userName: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; text-align: center;">Email Verification</h2>
      <p>Hello ${userName},</p>
      <p>Thank you for registering with Prone Project Management. Please click the button below to verify your email address:</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${link}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
      </div>
      <p style="text-align: center; color: #666; font-size: 14px;">Or copy this link to your browser: <br><a href="${link}" style="color: #2563eb;">${link}</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't create an account, please ignore this email.</p>
      <br>
      <p>Best regards,<br>Prone Team</p>
    </div>
  `,

  resetPassword: (link: string, userName: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
      <p>Hello ${userName},</p>
      <p>You have requested to reset your password. Please click the button below to reset your password:</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${link}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
      </div>
      <p style="text-align: center; color: #666; font-size: 14px;">Or copy this link to your browser: <br><a href="${link}" style="color: #dc2626;">${link}</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
      <br>
      <p>Best regards,<br>Prone Team</p>
    </div>
  `,
};
