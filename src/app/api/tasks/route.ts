import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prismaClient";
import { z } from "zod";

// Schema for task validation
const createTaskSchema = z.object({
    title: z.string().min(1, "Task title is required").max(200, "Task title must be less than 200 characters"),
    description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).default("TODO"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
    dueDate: z.string().optional().nullable(),
    projectId: z.string().min(1, "Project ID is required"),
    assigneeId: z.string().optional(),
    position: z.number().default(0),
});

// Get tasks for a project
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get("projectId");
        const status = searchParams.get("status");
        const assigneeId = searchParams.get("assigneeId");

        if (!projectId) {
            return NextResponse.json(
                { error: "Project ID is required" },
                { status: 400 }
            );
        }

        // Check if user has access to the project
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                OR: [
                    { ownerId: session.user.id },
                    {
                        members: {
                            some: { userId: session.user.id },
                        },
                    },
                ],
            },
        });

        if (!project) {
            return NextResponse.json(
                { error: "Project not found or access denied" },
                { status: 404 }
            );
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const whereClause: Record<string, any> = {
            projectId,
        };

        if (status && status !== "all") {
            whereClause.status = status;
        }

        if (assigneeId && assigneeId !== "all") {
            whereClause.assigneeId = assigneeId;
        }

        const tasks = await prisma.task.findMany({
            where: whereClause,
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
            orderBy: [
                { position: "asc" },
                { createdAt: "desc" },
            ],
        });

        return NextResponse.json({ tasks });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Create a new task
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validationResult = createTaskSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: "Invalid input",
                    details: validationResult.error.issues,
                },
                { status: 400 }
            );
        }

        const { title, description, status, priority, dueDate, projectId, assigneeId, position } = validationResult.data;

        // Check if user has access to the project
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
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
        });

        if (!project) {
            return NextResponse.json(
                { error: "Project not found or insufficient permissions" },
                { status: 404 }
            );
        }

        // Validate assignee is a project member if provided
        if (assigneeId) {
            const projectMembers = await prisma.projectMember.findMany({
                where: { projectId },
                select: { userId: true },
            });

            const isValidAssignee = projectMembers.some(member => member.userId === assigneeId);
            if (!isValidAssignee) {
                return NextResponse.json(
                    { error: "Assignee must be a project member" },
                    { status: 400 }
                );
            }
        }

        const task = await prisma.task.create({
            data: {
                title,
                description,
                status,
                priority,
                dueDate: dueDate ? new Date(dueDate) : null,
                projectId,
                assigneeId,
                position,
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
            message: "Task created successfully",
            task,
        });
    } catch (error) {
        console.error("Error creating task:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
