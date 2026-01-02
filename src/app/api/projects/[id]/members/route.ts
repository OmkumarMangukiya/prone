import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prismaClient";

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const projectId = (await params).id;
        const { userId } = await req.json(); // ID of the user to remove

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // Check permissions
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { members: true },
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        // Only owner can remove members (or maybe admins too, but let's restrict to owner for now based on prompt)
        // "also the owner of the project can remove the team member"
        if (project.ownerId !== session.user.id) {
            return NextResponse.json({ error: "Only the project owner can remove members" }, { status: 403 });
        }

        if (userId === project.ownerId) {
            return NextResponse.json({ error: "Cannot remove project owner" }, { status: 400 });
        }

        // Remove the member
        await prisma.projectMember.deleteMany({
            where: {
                projectId,
                userId,
            },
        });

        return NextResponse.json({ message: "Member removed successfully" });

    } catch (error) {
        console.error("Error removing member:", error);
        return NextResponse.json(
            { error: "Failed to remove member" },
            { status: 500 }
        );
    }
}
