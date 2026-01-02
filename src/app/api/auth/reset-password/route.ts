import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismaClient";
import bcrypt from "bcryptjs";
import { verifyToken } from "@/lib/tokens";

export async function POST(request: Request) {
    try {
        const { token, newPassword } = await request.json();

        if (!token || !newPassword) {
            return NextResponse.json(
                { success: false, message: "Token and new password are required" },
                { status: 400 }
            );
        }

        const payload = verifyToken(token);

        if (!payload || payload.type !== 'PASSWORD_RESET') {
            return NextResponse.json(
                { success: false, message: "Invalid or expired token" },
                { status: 400 }
            );
        }

        const { email } = payload;

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        });

        return NextResponse.json({
            success: true,
            message: "Password reset successfully",
        });

    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
