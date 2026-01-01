import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prismaClient";
import { z } from "zod";

// Schema for task update validation
const updateTaskSchema = z.object({
    title: z.string().min(1, "Task title is required").max(200, "Task title must be less than 200 characters").optional(),
    description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    dueDate: z.string().optional().nullable(),
    assigneeId: z.string().optional().nullable(),
    position: z.number().optional(),
});

// Get a specific task
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const task = await prisma.task.findFirst({
            where: {
                id,
                project: {
                    OR: [
                        { ownerId: session.user.id },
                        {
                            members: {
                                some: { userId: session.user.id },
                            },
                        },
                    ],
                },
            },
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
                project: {
                    select: {
                        id: true,
                        name: true,
                        members: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        avatar: true,
                                    },
                                },
                            },
                        },
                    },
                },
                comments: {
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
                    orderBy: {
                        createdAt: "desc",
                    },
                },

                _count: {
                    select: {
                        comments: true,

                    },
                },
            },
        });

        if (!task) {
            return NextResponse.json(
                { error: "Task not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ task });
    } catch (error) {
        console.error("Error fetching task:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Update a task
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Check if user has permission to update the task
        const task = await prisma.task.findFirst({
            where: {
                id,
                project: {
                    OR: [
                        { ownerId: session.user.id },
                        {
                            members: {
                                some: {
                                    userId: session.user.id,
                                    role: { in: ["OWNER", "ADMIN", "MANAGER"] },
                                },
                            },
                        },
                    ],
                },
            },
        });

        if (!task) {
            return NextResponse.json(
                { error: "Task not found or insufficient permissions" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const validationResult = updateTaskSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: "Invalid input",
                    details: validationResult.error.issues,
                },
                { status: 400 }
            );
        }

        const taskData = validationResult.data;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: Record<string, any> = { ...taskData };
        if (taskData.dueDate !== undefined) {
            updateData.dueDate = taskData.dueDate ? new Date(taskData.dueDate) : null;
        }

        const updatedTask = await prisma.task.update({
            where: { id },
            data: updateData,
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,

                    },
                },
            },
        });

        return NextResponse.json({
            message: "Task updated successfully",
            task: updatedTask,
        });
    } catch (error) {
        console.error("Error updating task:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Delete a task
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Check if user has permission to delete the task (owner or admin)
        const task = await prisma.task.findFirst({
            where: {
                id,
                project: {
                    OR: [
                        { ownerId: session.user.id },
                        {
                            members: {
                                some: {
                                    userId: session.user.id,
                                    role: { in: ["OWNER", "ADMIN"] },
                                },
                            },
                        },
                    ],
                },
            },
        });

        if (!task) {
            return NextResponse.json(
                { error: "Task not found or insufficient permissions" },
                { status: 404 }
            );
        }

        // Delete the task (this will cascade delete related records)
        await prisma.task.delete({
            where: { id },
        });

        return NextResponse.json({
            message: "Task deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting task:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
