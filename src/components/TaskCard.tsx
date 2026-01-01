import { useState } from "react";
import {
    MoreVertical,
    GripVertical,
    Edit2,
    Trash2,
    Calendar,
    User as UserIcon,
} from "lucide-react";
import { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Task, User, TaskStatus, TaskPriority } from "@/types";
import EditTaskModal from "./EditTaskModal";

interface TaskCardProps {
    task: Task;
    members: Array<{ id: string; role: string; user: User }>;
    onUpdate: () => void;
    canEdit: boolean;
    dragHandleProps?: DraggableProvidedDragHandleProps | null;
    isDragging?: boolean;
    onSelect: () => void;
}

export default function TaskCard({
    task,
    members,
    onUpdate,
    canEdit,
    dragHandleProps,
    isDragging = false,
    onSelect,
}: TaskCardProps) {
    const [showEditModal, setShowEditModal] = useState(false);

    const getPriorityColor = (priority: TaskPriority) => {
        switch (priority) {
            case "URGENT":
                return "destructive";
            case "HIGH":
                return "secondary";
            case "MEDIUM":
                return "outline";
            default:
                return "outline";
        }
    };

    const getPriorityIcon = (priority: TaskPriority) => {
        switch (priority) {
            case "URGENT":
                return "🔥";
            case "HIGH":
                return "🔴";
            case "MEDIUM":
                return "🟡";
            case "LOW":
                return "🟢";
            default:
                return "";
        }
    };

    const handleStatusChange = async (newStatus: TaskStatus) => {
        try {
            const response = await fetch(`/api/tasks/${task.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                onUpdate();
            }
        } catch (err) {
            console.error("Failed to update task status:", err);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this task?")) return;

        try {
            const response = await fetch(`/api/tasks/${task.id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                onUpdate();
            }
        } catch (err) {
            console.error("Failed to delete task:", err);
        }
    };

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

    return (
        <Card
            className={`
      transition-all duration-200 
      ${isDragging
                    ? "shadow-xl bg-white border-blue-300 scale-105"
                    : "hover:shadow-md border-border"
                }
      ${isOverdue ? "border-red-300 bg-red-50/30" : ""}
    `}
            onClick={onSelect}
        >
            <CardContent className="p-2">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-1 flex-1">
                        <div
                            {...dragHandleProps}
                            className="mt-0.5 cursor-grab active:cursor-grabbing opacity-60 hover:opacity-100 transition-opacity"
                        >
                            <GripVertical className="w-3 h-3" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium text-sm line-clamp-2 leading-tight">
                                {task.title}
                            </h4>
                            {task.description && (
                                <p className="text-muted-foreground text-xs mt-1 line-clamp-2 leading-tight">
                                    {task.description}
                                </p>
                            )}
                        </div>
                    </div>
                    {canEdit && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0 opacity-60 hover:opacity-100"
                                >
                                    <MoreVertical className="w-3 h-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShowEditModal(true); }}>
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                                    className="text-destructive"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {/* Priority and Due Date */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                        <Badge
                            variant={getPriorityColor(task.priority)}
                            className="text-xs px-1.5 py-0"
                        >
                            <span className="mr-1">{getPriorityIcon(task.priority)}</span>
                            {task.priority}
                        </Badge>
                    </div>

                    {task.dueDate && (
                        <div
                            className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-600" : "text-muted-foreground"
                                }`}
                        >
                            <Calendar className="w-3 h-3" />
                            <span suppressHydrationWarning>{new Date(task.dueDate).toLocaleDateString()}</span>
                            {isOverdue && (
                                <span className="text-red-600 font-medium">⚠️</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Assignee */}
                <div className="flex items-center justify-between mb-2">
                    {task.assignee ? (
                        <div className="flex items-center gap-1.5">
                            <Avatar className="w-5 h-5">
                                <AvatarImage src={task.assignee.avatar} />
                                <AvatarFallback className="text-xs">
                                    {task.assignee.name?.charAt(0) ||
                                        task.assignee.email.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground truncate">
                                {task.assignee.name || task.assignee.email}
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <UserIcon className="w-3 h-3" />
                            <span className="text-xs">Unassigned</span>
                        </div>
                    )}

                    {/* Task metadata */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {task._count.comments > 0 && (
                            <span className="flex items-center gap-0.5">
                                💬 {task._count.comments}
                            </span>
                        )}
                    </div>
                </div>

                {/* Quick Status Update - Only show if not dragging */}
                {!isDragging && (
                    <div className="pt-2 border-t">
                        <Select
                            value={task.status}
                            onValueChange={(value) => handleStatusChange(value as TaskStatus)}
                        >
                            <SelectTrigger
                                className="w-full h-6 text-xs"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TODO">To Do</SelectItem>
                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                <SelectItem value="IN_REVIEW">In Review</SelectItem>
                                <SelectItem value="DONE">Done</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </CardContent>

            {/* Edit Task Modal */}
            {showEditModal && (
                <EditTaskModal
                    task={task}
                    members={members}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={() => {
                        setShowEditModal(false);
                        onUpdate();
                    }}
                />
            )}
        </Card>
    );
}
