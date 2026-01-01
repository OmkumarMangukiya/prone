import { useState } from "react";
import { User, TaskStatus, TaskPriority } from "@/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export interface TaskFormData {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string;
    assigneeId: string;
}

interface TaskFormProps {
    initialData?: TaskFormData;
    members: Array<{ id: string; role: string; user: User }>;
    onSubmit: (data: TaskFormData) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
    submitLabel: string;
    loadingLabel?: string;
    error?: string;
}

export default function TaskForm({
    initialData,
    members,
    onSubmit,
    onCancel,
    loading = false,
    submitLabel,
    loadingLabel = "Saving...",
    error,
}: TaskFormProps) {
    const [formData, setFormData] = useState<TaskFormData>(
        initialData || {
            title: "",
            description: "",
            status: "TODO",
            priority: "MEDIUM",
            dueDate: "",
            assigneeId: "",
        }
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="title">Task Title *</Label>
                <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter task title"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter task description"
                    rows={3}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                        value={formData.status}
                        onValueChange={(value) =>
                            setFormData({ ...formData, status: value as TaskStatus })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TODO">To Do</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="IN_REVIEW">In Review</SelectItem>
                            <SelectItem value="DONE">Done</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                        value={formData.priority}
                        onValueChange={(value) =>
                            setFormData({
                                ...formData,
                                priority: value as TaskPriority,
                            })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                            <SelectItem value="URGENT">Urgent</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Assignee</Label>
                    <Select
                        value={formData.assigneeId}
                        onValueChange={(value) =>
                            setFormData({ ...formData, assigneeId: value === "unassigned" ? "" : value })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {members.map((member) => (
                                <SelectItem key={member.user.id} value={member.user.id}>
                                    {member.user.name || member.user.email}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) =>
                            setFormData({ ...formData, dueDate: e.target.value })
                        }
                    />
                </div>
            </div>

            <div className="flex gap-3 pt-4 justify-end">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {loading ? loadingLabel : submitLabel}
                </Button>
            </div>
        </form>
    );
}
