import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

// Create the extended client type
type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>

function createPrismaClient() {
    return new PrismaClient({
        accelerateUrl: process.env.DATABASE_URL,
    }).$extends(withAccelerate())
}

//globalThis is a global object that persists across hot reloads (so that we don't create a new PrismaClient on every hot reload and hence no duplicate database connection )
const globalForPrisma = globalThis as unknown as {
    prisma: ExtendedPrismaClient | undefined
}

export const prisma =
    globalForPrisma.prisma ??
    createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}