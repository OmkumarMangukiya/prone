import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Create default categories
    const defaultCategories = [
        { name: "Software Development", color: "#3B82F6" },
        { name: "Marketing Campaign", color: "#10B981" },
        { name: "Product Launch", color: "#8B5CF6" },
        { name: "Website Redesign", color: "#F59E0B" },
        { name: "Data Analysis", color: "#EF4444" },
        { name: "Research & Development", color: "#06B6D4" },
        { name: "Event Planning", color: "#EC4899" },
        { name: "Content Creation", color: "#84CC16" },
        { name: "Business Development", color: "#6366F1" },
        { name: "HR Initiatives", color: "#F97316" },
        { name: "Customer Support Improvement", color: "#14B8A6" },
        { name: "Other", color: "#6B7280" },
    ];

    console.log('Creating default categories...')
    for (const categoryData of defaultCategories) {
        await prisma.category.upsert({
            where: { name: categoryData.name },
            update: {},
            create: categoryData,
        });
    }

    // Create demo users
    const hashedPassword = await bcrypt.hash('password123', 10)

    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            password: hashedPassword,
        },
    })

    const demoUser = await prisma.user.upsert({
        where: { email: 'demo@example.com' },
        update: {},
        create: {
            email: 'demo@example.com',
            name: 'Demo User',
            password: hashedPassword,
        },
    })

    // Create demo project
    const demoProject = await prisma.project.create({
        data: {
            name: 'Demo Project',
            description: 'A sample project to get you started',
            status: 'ACTIVE',
            color: '#3B82F6',
            ownerId: adminUser.id,
            members: {
                create: [
                    {
                        userId: adminUser.id,
                        role: 'OWNER',
                    },
                    {
                        userId: demoUser.id,
                        role: 'MEMBER',
                    },
                ],
            },
        },
    })

    // Create demo labels
    // using Promise.all to create labels in parallel for better performance
    const labels = await Promise.all([
        prisma.label.create({
            data: { name: 'Bug', color: '#EF4444' },
        }),
        prisma.label.create({
            data: { name: 'Feature', color: '#10B981' },
        }),
        prisma.label.create({
            data: { name: 'Enhancement', color: '#8B5CF6' },
        }),
    ])

    // Create demo tasks
    const tasks = await Promise.all([
        prisma.task.create({
            data: {
                title: 'Set up project structure',
                description: 'Initialize the project with necessary folders and configurations',
                status: 'DONE',
                priority: 'HIGH',
                projectId: demoProject.id,
                assigneeId: adminUser.id,
                position: 1,
            },
        }),
        prisma.task.create({
            data: {
                title: 'Design user interface',
                description: 'Create wireframes and mockups for the main dashboard',
                status: 'IN_PROGRESS',
                priority: 'MEDIUM',
                projectId: demoProject.id,
                assigneeId: demoUser.id,
                position: 2,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            },
        }),
        prisma.task.create({
            data: {
                title: 'Implement authentication',
                description: 'Add user login and registration functionality',
                status: 'TODO',
                priority: 'HIGH',
                projectId: demoProject.id,
                assigneeId: adminUser.id,
                position: 3,
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
            },
        }),
    ])

    // Add labels to tasks
    await prisma.taskLabel.createMany({
        data: [
            { taskId: tasks[1].id, labelId: labels[1].id }, // Feature label
            { taskId: tasks[2].id, labelId: labels[1].id }, // Feature label
        ],
    })

    // Create demo comments
    await prisma.comment.create({
        data: {
            content: 'Great progress on the project setup! 🎉',
            taskId: tasks[0].id,
            authorId: demoUser.id,
        },
    })

    // Create demo notification
    await prisma.notification.create({
        data: {
            title: 'Welcome to the Project Management Tool!',
            message: 'You have been added to the Demo Project. Start by exploring the dashboard.',
            type: 'PROJECT_INVITE',
            userId: demoUser.id,
        },
    })

    console.log('✅ Database seeded successfully!')
    console.log('\n📧 Demo accounts created:')
    console.log('   Admin: admin@example.com (password: password123)')
    console.log('   Demo:  demo@example.com (password: password123)')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error('❌ Seeding failed:', e)
        await prisma.$disconnect()
        process.exit(1)
    })