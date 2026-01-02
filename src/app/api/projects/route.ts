import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prismaClient";
import { z } from "zod";

// Schema for project validation
const createProjectSchema = z.object({
    name: z.string().min(1, "Project name is required").max(100, "Project name must be less than 100 characters"),
    description: z.string().max(500, "Description must be less than 500 characters").optional(),
    status: z.enum(["ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"]).default("ACTIVE"),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format").optional(),
    categoryId: z.string().optional(),
});



// Get all projects for the authenticated user
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const category = searchParams.get("category");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const whereClause: any = {
            OR: [
                { ownerId: session.user.id },
                {
                    members: {
                        some: { userId: session.user.id },
                    },
                },
            ],
        };

        if (status && status !== "all") {
            whereClause.status = status;
        }

        if (category && category !== "all") {
            whereClause.categoryId = category;
        }

        const projects = await prisma.project.findMany({
            where: whereClause,
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
                    select: {
                        id: true,
                        status: true,
                    },
                },
                _count: {
                    select: {
                        tasks: true,
                        members: true,
                    },
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

        return NextResponse.json({ projects });
    } catch (error) {
        console.error("Error fetching projects:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Create a new project
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validationResult = createProjectSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: "Invalid input",
                    details: validationResult.error.issues,
                },
                { status: 400 }
            );
        }

        const { name, description, status, color, categoryId } = validationResult.data;

        // Create project with owner as admin member
        const project = await prisma.project.create({
            data: {
                name,
                description,
                status,
                color: color || "#3B82F6", // Default blue color
                categoryId,
                ownerId: session.user.id,
                members: {
                    create: {
                        userId: session.user.id,
                        role: "OWNER",
                    },
                },
            },
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
                _count: {
                    select: {
                        tasks: true,
                        members: true,
                    },
                },
            },
        });

        return NextResponse.json({
            message: "Project created successfully",
            project,
        });
    } catch (error) {
        console.error("Error creating project:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
