import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prismaClient";
import { z } from "zod";

const createCommentSchema = z.object({
    taskId: z.string().min(1, "Task ID is required"),
    content: z.string().min(1, "Comment content cannot be empty").max(1000, "Comment cannot exceed 1000 characters"),
});

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validationResult = createCommentSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: "Invalid input", details: validationResult.error.issues },
                { status: 400 }
            );
        }

        const { taskId, content } = validationResult.data;

        // Verify user has access to the task's project
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: {
                project: {
                    include: {
                        members: {
                            where: { userId: session.user.id },
                        },
                    },
                },
            },
        });

        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        const isOwner = task.project.ownerId === session.user.id;
        const isMember = task.project.members.length > 0;

        if (!isOwner && !isMember) {
            return NextResponse.json(
                { error: "You do not have permission to comment on this task" },
                { status: 403 }
            );
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                taskId,
                authorId: session.user.id,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
        });

        return NextResponse.json(comment, { status: 201 });
    } catch (error) {
        console.error("Error creating comment:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
