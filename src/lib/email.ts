import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendInvitationEmail = async (
    email: string,
    projectName: string,
    inviterName: string
) => {
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: `Invitation to join project: ${projectName}`,
        html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Project Invitation</h2>
        <p>Hello,</p>
        <p><strong>${inviterName}</strong> has invited you to join the project <strong>${projectName}</strong> on Prone.</p>
        <p>Please log in to your account to view the project.</p>
        <p>If you don't have an account, please sign up using this email address.</p>
        <br />
        <a href="${process.env.NEXTAUTH_URL}/projects" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Project</a>
      </div>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Invitation email sent to ${email}`);
        return true;
    } catch (error) {
        console.error("Error sending invitation email:", error);
        return false;
    }
};
