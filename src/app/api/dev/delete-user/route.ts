import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prismaClient";


export async function DELETE(request: Request) {
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json(
            { success: false, message: "This endpoint is only available in development" },
            { status: 403 }
        );
    }

    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { success: false, message: "Email is required" },
                { status: 400 }
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        // Delete user (this will cascade delete related records due to foreign key constraints)
        await prisma.user.delete({
            where: { email },
        });

        return NextResponse.json({
            success: true,
            message: "User deleted successfully",
        });

    } catch (error) {
        console.error("Delete user error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
