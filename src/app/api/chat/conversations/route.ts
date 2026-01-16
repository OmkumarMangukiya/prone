
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prismaClient";

// GET: Fetch all conversations for the current user
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        userId: session.user.id,
                    },
                },
            },
            include: {
                participants: {
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
                messages: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 1, // Last message
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

        return NextResponse.json(conversations);
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return NextResponse.json(
            { error: "Failed to fetch conversations" },
            { status: 500 }
        );
    }
}

// POST: Create or get an existing one-on-one conversation
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        if (userId === session.user.id) {
            return NextResponse.json(
                { error: "Cannot chat with yourself" },
                { status: 400 }
            );
        }



        // Detailed check if needed, but for now simplistic approach:
        // If we find a conversation where ALL participants are in [A, B], and it's 1-on-1, it's the one.
        // Actually, 'every' logic: Every participant must be either A or B. 
        // AND must have 2 participants.

        // Better query:
        const conversations = await prisma.conversation.findMany({
            where: {
                startOneToOne: true,
                participants: {
                    every: {
                        userId: { in: [session.user.id, userId] }
                    }
                }
            },
            include: { participants: true }
        });

        const exist = conversations.find(c => c.participants.length === 2);

        if (exist) {
            return NextResponse.json(exist);
        }

        // Create new conversation
        const newConversation = await prisma.conversation.create({
            data: {
                startOneToOne: true,
                participants: {
                    create: [
                        { userId: session.user.id },
                        { userId: userId },
                    ],
                },
            },
            include: {
                participants: {
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
        });

        return NextResponse.json(newConversation);
    } catch (error) {
        console.error("Error creating conversation:", error);
        return NextResponse.json(
            { error: "Failed to create conversation" },
            { status: 500 }
        );
    }
}
