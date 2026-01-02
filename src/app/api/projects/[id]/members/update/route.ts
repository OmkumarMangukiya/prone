import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prismaClient";
import { z } from "zod";
import { ProjectRole } from "@prisma/client";

const updateRoleSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    role: z.enum(["ADMIN", "MEMBER", "VIEWER"]),
});

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const projectId = (await params).id;
        const body = await req.json();

        const validationResult = updateRoleSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                { error: "Invalid input", details: validationResult.error.issues },
                { status: 400 }
            );
        }

        const { userId, role } = validationResult.data;

        // Check if requester is Owner or Admin of the project
        const requester = await prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId: session.user.id,
                },
            },
            include: { project: true },
        });

        // Also check if requester is the project owner directly (schema redundancy check)
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const isOwner = project.ownerId === session.user.id;
        // If not owner, check if admin member
        const isAdmin = requester?.role === "ADMIN";

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: "Permission denied" }, { status: 403 });
        }

        // Cannot change role of the Project Owner
        if (userId === project.ownerId) {
            return NextResponse.json({ error: "Cannot change role of the project owner" }, { status: 403 });
        }

        // Verify the target user is a member of the project
        const targetMember = await prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId,
                },
            },
        });

        if (!targetMember) {
            return NextResponse.json({ error: "User is not a member of this project" }, { status: 404 });
        }

        // Update the member's role
        const updatedMember = await prisma.projectMember.update({
            where: {
                projectId_userId: {
                    projectId,
                    userId,
                },
            },
            data: {
                role: role as ProjectRole,
            },
        });

        return NextResponse.json({
            message: "Member role updated successfully",
            member: updatedMember
        });

    } catch (error) {
        console.error("Error updating member role:", error);
        return NextResponse.json(
            { error: "Failed to update member role" },
            { status: 500 }
        );
    }
}
