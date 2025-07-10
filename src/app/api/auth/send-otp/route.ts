import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prismaClient";
import { sendEmail, generateOTP, emailTemplates } from "../../../../../lib/emailService";

export async function POST(request: Request) {
    try {
        const { email, type } = await request.json();

        if (!email || !type) {
            return NextResponse.json(
                { success: false, message: "Email and type are required" },
                { status: 400 }
            );
        }

        // Check if user exists for email verification
        if (type === 'EMAIL_VERIFICATION') {
            const user = await prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                return NextResponse.json(
                    { success: false, message: "User not found" },
                    { status: 404 }
                );
            }

            if (user.emailVerified) {
                return NextResponse.json(
                    { success: false, message: "Email already verified" },
                    { status: 400 }
                );
            }
        }

        // Check if user exists for password reset
        if (type === 'PASSWORD_RESET') {
            const user = await prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                return NextResponse.json(
                    { success: false, message: "User not found" },
                    { status: 404 }
                );
            }
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Store OTP in database
        await prisma.oTP.create({
            data: {
                email,
                otp,
                type,
                expiresAt,
            },
        });

        // Get user name for email template
        const user = await prisma.user.findUnique({
            where: { email },
            select: { name: true },
        });

        const userName = user?.name || 'User';

        // Send email based on type
        let emailContent;
        let subject;

        if (type === 'EMAIL_VERIFICATION') {
            emailContent = emailTemplates.verifyEmail(otp, userName);
            subject = 'Verify Your Email - Prone Project Management';
        } else if (type === 'PASSWORD_RESET') {
            emailContent = emailTemplates.resetPassword(otp, userName);
            subject = 'Reset Your Password - Prone Project Management';
        } else {
            return NextResponse.json(
                { success: false, message: "Invalid OTP type" },
                { status: 400 }
            );
        }

        // Send email
        const emailResult = await sendEmail({
            from: process.env.SMTP_USER!,
            to: email,
            subject,
            html: emailContent,
        });

        if (!emailResult.success) {
            return NextResponse.json(
                { success: false, message: "Failed to send email" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "OTP sent successfully",
        });

    } catch (error) {
        console.error("Send OTP error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
