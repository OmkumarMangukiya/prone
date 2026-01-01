import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prismaClient";
import { sendEmail, emailTemplates } from "../../../../../lib/emailService";
import { generateToken } from "../../../../../lib/tokens";

export async function POST(request: Request) {
    try {
        const { email, type } = await request.json();

        if (!email || !type) {
            return NextResponse.json(
                { success: false, message: "Email and type are required" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        let subject = '';
        let html = '';
        let tokenType: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';

        if (type === 'EMAIL_VERIFICATION') {
            subject = 'Verify Your Email - Prone Project Management';
            tokenType = 'EMAIL_VERIFICATION';
            const token = generateToken({ email, type: tokenType });
            const link = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;
            html = emailTemplates.verifyEmail(link, user.name || 'User');
        } else if (type === 'PASSWORD_RESET') {
            subject = 'Reset Your Password - Prone Project Management';
            tokenType = 'PASSWORD_RESET';
            const token = generateToken({ email, type: tokenType });
            const link = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
            html = emailTemplates.resetPassword(link, user.name || 'User');
        } else {
            return NextResponse.json(
                { success: false, message: "Invalid type" },
                { status: 400 }
            );
        }

        const emailResult = await sendEmail({
            // from: process.env.SMTP_USER, // Handled by default in emailService
            to: email,
            subject,
            html,
        });

        if (emailResult.success) {
            return NextResponse.json({
                success: true,
                message: "Email sent successfully",
            });
        } else {
            return NextResponse.json(
                { success: false, message: "Failed to send email" },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error("Send verification error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
