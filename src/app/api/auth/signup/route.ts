import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { sendEmail, emailTemplates } from "@/lib/emailService";
import { generateToken } from "@/lib/tokens";

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
        const token = generateToken({ email, type: 'EMAIL_VERIFICATION' });
        const verifyLink = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

        // Send verification email
        const emailResult = await sendEmail({
            from: process.env.SMTP_USER!,
            to: email,
            subject: 'Verify Your Email - Prone Project Management',
            html: emailTemplates.verifyEmail(verifyLink, name || 'User'),
        });

        // Return user data (excluding password)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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