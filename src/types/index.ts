export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string;
    assignee?: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
    };
    project: {
        id: string;
        name: string;
    };
    _count: {
        comments: number;
    };
    createdAt: string;
    updatedAt: string;
}

export interface Project {
    id: string;
    name: string;
    description?: string;
    status: "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED";
    color?: string;
    createdAt: string;
    updatedAt: string;
    owner: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
    };
    category?: {
        id: string;
        name: string;
        color: string;
    };
    members: Array<{
        id: string;
        role: string;
        user: {
            id: string;
            name: string;
            email: string;
            avatar?: string;
        };
    }>;
    tasks: Array<{
        id: string;
        status: string;
    }>;
    _count: {
        tasks: number;
        members: number;
    };
}

export interface ProjectCategory {
    id: string;
    name: string;
    color: string;
}
