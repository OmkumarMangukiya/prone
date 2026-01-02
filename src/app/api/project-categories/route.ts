import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prismaClient";
import { z } from "zod";

// Schema for category creation validation
const createCategorySchema = z.object({
    name: z.string().min(1, "Category name is required").max(50, "Category name must be less than 50 characters"),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format").optional(),
});

// Get all categories
export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: "asc" },
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Create a new category
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validationResult = createCategorySchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: "Invalid input",
                    details: validationResult.error.issues,
                },
                { status: 400 }
            );
        }

        const { name, color = "#3B82F6" } = validationResult.data;

        // Check if category already exists
        const existingCategory = await prisma.category.findUnique({
            where: { name },
        });

        if (existingCategory) {
            return NextResponse.json(
                { error: "Category with this name already exists" },
                { status: 409 }
            );
        }

        const category = await prisma.category.create({
            data: {
                name,
                color,
            },
        });

        return NextResponse.json({
            message: "Category created successfully",
            category,
        });
    } catch (error) {
        console.error("Error creating category:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
