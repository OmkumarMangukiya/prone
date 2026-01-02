import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismaClient";
import { verifyToken } from "@/lib/tokens";

export async function POST(request: Request) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Token is required" },
                { status: 400 }
            );
        }

        const payload = verifyToken(token);

        if (!payload || payload.type !== 'EMAIL_VERIFICATION') {
            return NextResponse.json(
                { success: false, message: "Invalid or expired token" },
                { status: 400 }
            );
        }

        const { email } = payload;

        // Verify user
        await prisma.user.update({
            where: { email },
            data: { emailVerified: new Date() },
        });

        return NextResponse.json({
            success: true,
            message: "Email verified successfully",
        });

    } catch (error) {
        console.error("Verify token error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
