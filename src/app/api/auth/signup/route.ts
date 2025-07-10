import bcrypt from "bcryptjs";
import { prisma } from "../../../../../lib/prismaClient";
import { NextResponse } from "next/server";
import { sendEmail, generateOTP, emailTemplates } from "../../../../../lib/emailService";

export async function POST(request: Request) {
    try {
        const { email, password, name } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: "Email and password are required" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { success: false, message: "User already exists" },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || null,
            },
        });

        // Generate and send verification email
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store OTP in database
        await prisma.oTP.create({
            data: {
                email,
                otp,
                type: 'EMAIL_VERIFICATION',
                expiresAt,
            },
        });

        // Send verification email
        const emailResult = await sendEmail({
            from: process.env.SMTP_USER!,
            to: email,
            subject: 'Verify Your Email - Prone Project Management',
            html: emailTemplates.verifyEmail(otp, name || 'User'),
        });

        // Return user data (excluding password)
        const { password: _, ...userData } = user;

        return NextResponse.json({
            success: true,
            message: "Signup successful! Please check your email to verify your account.",
            user: userData,
            emailSent: emailResult.success,
        });

    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}