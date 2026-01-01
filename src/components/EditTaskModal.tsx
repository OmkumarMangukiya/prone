import { useState } from "react";
import { Task, User } from "@/types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import TaskForm, { TaskFormData } from "./TaskForm";

interface EditTaskModalProps {
    task: Task;
    members: Array<{ id: string; role: string; user: User }>;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditTaskModal({
    task,
    members,
    onClose,
    onSuccess,
}: EditTaskModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleUpdateTask = async (data: TaskFormData) => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`/api/tasks/${task.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...data,
                    assigneeId: data.assigneeId || null,
                    dueDate: data.dueDate || null,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                onSuccess();
            } else {
                setError(result.error || "Failed to update task");
            }
        } catch (err) {
            setError("An error occurred while updating the task");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                    <DialogDescription>
                        Modify task details and properties.
                    </DialogDescription>
                </DialogHeader>
                <TaskForm
                    initialData={{
                        title: task.title,
                        description: task.description || "",
                        status: task.status,
                        priority: task.priority,
                        dueDate: task.dueDate
                            ? new Date(task.dueDate).toISOString().split("T")[0]
                            : "",
                        assigneeId: task.assignee?.id || "",
                    }}
                    members={members}
                    onSubmit={handleUpdateTask}
                    onCancel={onClose}
                    loading={loading}
                    submitLabel="Update Task"
                    loadingLabel="Updating..."
                    error={error}
                />
            </DialogContent>
        </Dialog>
    );
}

