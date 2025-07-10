import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prismaClient";

export async function POST(request: Request) {
    try {
        const { email, otp, type } = await request.json();

        if (!email || !otp || !type) {
            return NextResponse.json(
                { success: false, message: "Email, OTP, and type are required" },
                { status: 400 }
            );
        }

        // Find the OTP record
        const otpRecord = await prisma.oTP.findFirst({
            where: {
                email,
                otp,
                type,
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

        // Mark OTP as used
        await prisma.oTP.update({
            where: { id: otpRecord.id },
            data: { used: true },
        });

        // If email verification, update user's emailVerified status
        if (type === 'EMAIL_VERIFICATION') {
            await prisma.user.update({
                where: { email },
                data: { emailVerified: new Date() },
            });

            return NextResponse.json({
                success: true,
                message: "Email verified successfully",
            });
        }

        return NextResponse.json({
            success: true,
            message: "OTP verified successfully",
        });

    } catch (error) {
        console.error("Verify OTP error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
