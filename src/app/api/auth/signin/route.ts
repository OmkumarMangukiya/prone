import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../../lib/prismaClient";

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: "Email and password are required" },
                { status: 400 }
            );
        }

        // Find user by email to check if they exist and are verified
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return NextResponse.json(
                { success: false, message: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Check if email is verified
        if (!user.emailVerified) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Please verify your email before signing in",
                    needsVerification: true,
                    email: user.email
                },
                { status: 403 }
            );
        }

        // Return success - NextAuth will handle the session creation
        return NextResponse.json({
            success: true,
            message: "Credentials validated successfully",
        });

    } catch (error) {
        console.error("Signin validation error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}