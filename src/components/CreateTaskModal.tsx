import { useState } from "react";
import { User } from "@/types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import TaskForm, { TaskFormData } from "./TaskForm";

interface CreateTaskModalProps {
    projectId: string;
    members: Array<{ id: string; role: string; user: User }>;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateTaskModal({
    projectId,
    members,
    onClose,
    onSuccess,
}: CreateTaskModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleCreateTask = async (data: TaskFormData) => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...data,
                    projectId,
                    assigneeId: data.assigneeId || null,
                    dueDate: data.dueDate || null,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                onSuccess();
            } else {
                setError(result.error || "Failed to create task");
            }
        } catch (err) {
            setError("An error occurred while creating the task");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>
                        Add a new task to your project.
                    </DialogDescription>
                </DialogHeader>
                <TaskForm
                    members={members}
                    onSubmit={handleCreateTask}
                    onCancel={onClose}
                    loading={loading}
                    submitLabel="Create Task"
                    loadingLabel="Creating..."
                    error={error}
                />
            </DialogContent>
        </Dialog>
    );
}

