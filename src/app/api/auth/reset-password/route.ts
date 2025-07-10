import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prismaClient";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const { email, otp, newPassword } = await request.json();

        if (!email || !otp || !newPassword) {
            return NextResponse.json(
                { success: false, message: "Email, OTP, and new password are required" },
                { status: 400 }
            );
        }

        // finding otp record
        const otpRecord = await prisma.oTP.findFirst({
            where: {
                email,
                otp,
                type: 'PASSWORD_RESET',
                used: false,
                expiresAt: {
                    gt: new Date(),
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (!otpRecord) {
            return NextResponse.json(
                { success: false, message: "Invalid or expired OTP" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        });

        await prisma.oTP.update({
            where: { id: otpRecord.id },
            data: { used: true },
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
