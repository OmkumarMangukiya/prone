import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prismaClient";
import { z } from "zod";

// Schema for project update validation
const updateProjectSchema = z.object({
    name: z.string().min(1, "Project name is required").max(100, "Project name must be less than 100 characters").optional(),
    description: z.string().max(500, "Description must be less than 500 characters").optional(),
    status: z.enum(["ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"]).optional(),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format").optional(),
    categoryId: z.string().optional(),
});

// Get a specific project
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

        const project = await prisma.project.findUnique({
            where: { id, members: { some: { userId: session.user.id } } },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                    },
                },
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
                tasks: {
                    include: {
                        assignee: {
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
                        tasks: true,
                        members: true,
                    },
                },
            },
        });

        if (!project) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ project });
    } catch (error) {
        console.error("Error fetching project:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Update a project
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

        // Check if user has permission to update the project (owner or admin)
        const project = await prisma.project.findFirst({
            where: {
                id,
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
        });

        if (!project) {
            return NextResponse.json(
                { error: "Project not found or insufficient permissions" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const validationResult = updateProjectSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: "Invalid input",
                    details: validationResult.error.issues,
                },
                { status: 400 }
            );
        }

        const projectData = validationResult.data;

        const updatedProject = await prisma.project.update({
            where: { id },
            data: projectData,
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                    },
                },
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
                tasks: {
                    include: {
                        assignee: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        tasks: true,
                        members: true,
                    },
                },
            },
        });

        return NextResponse.json({
            message: "Project updated successfully",
            project: updatedProject,
        });
    } catch (error) {
        console.error("Error updating project:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Delete a project
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

        // Check if user is the owner of the project
        const project = await prisma.project.findFirst({
            where: {
                id,
                ownerId: session.user.id,
            },
        });

        if (!project) {
            return NextResponse.json(
                { error: "Project not found or insufficient permissions" },
                { status: 404 }
            );
        }

        // Delete the project (this will cascade delete related records)
        await prisma.project.delete({
            where: { id },
        });

        return NextResponse.json({
            message: "Project deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting project:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
