import { useState, useEffect } from "react";
import {
    Calendar,
    User,
    MessageSquare,
    Send,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";

type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    author: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
    };
}

interface TaskDetails {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
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
    comments: Comment[];
}

interface TaskDetailsModalProps {
    taskId: string;
    onClose: () => void;
}

export default function TaskDetailsModal({
    taskId,
    onClose,
}: TaskDetailsModalProps) {
    const [task, setTask] = useState<TaskDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [newComment, setNewComment] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);

    useEffect(() => {
        fetchTaskDetails();
    }, [taskId]);

    const fetchTaskDetails = async () => {
        try {
            const response = await fetch(`/api/tasks/${taskId}`);
            const data = await response.json();

            if (response.ok) {
                setTask(data.task);
            } else {
                setError(data.error || "Failed to fetch task details");
            }
        } catch (err) {
            setError("An error occurred while fetching task details");
        } finally {
            setLoading(false);
        }
    };

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmittingComment(true);
        try {
            const response = await fetch("/api/comments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    taskId,
                    content: newComment,
                }),
            });

            if (response.ok) {
                setNewComment("");
                fetchTaskDetails(); // Refresh to show new comment
            }
        } catch (err) {
            console.error("Failed to post comment");
        } finally {
            setSubmittingComment(false);
        }
    };

    const getPriorityColor = (priority: TaskPriority) => {
        switch (priority) {
            case "URGENT":
                return "bg-red-100 text-red-800 border-red-200";
            case "HIGH":
                return "bg-orange-100 text-orange-800 border-orange-200";
            case "MEDIUM":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "LOW":
                return "bg-green-100 text-green-800 border-green-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getStatusColor = (status: TaskStatus) => {
        switch (status) {
            case "TODO":
                return "bg-slate-100 text-slate-800 border-slate-200";
            case "IN_PROGRESS":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "IN_REVIEW":
                return "bg-amber-100 text-amber-800 border-amber-200";
            case "DONE":
                return "bg-green-100 text-green-800 border-green-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    if (loading) {
        return (
            <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="sm:max-w-md">
                    <DialogTitle className="sr-only">Loading Task Details</DialogTitle>
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (error || !task) {
        return (
            <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="sm:max-w-md">
                    <div className="text-center py-4">
                        <DialogTitle className="text-lg font-semibold text-gray-900 mb-2">Error</DialogTitle>
                        <p className="text-gray-600 mb-6">{error || "Task not found"}</p>
                        <Button onClick={onClose}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-4xl h-[85vh] p-0 flex flex-col gap-0 overflow-hidden">
                <DialogHeader className="p-6 border-b border-gray-100 bg-white/50 shrink-0">
                    <div className="flex items-center justify-between pr-6">
                        <div className="flex items-center gap-3">
                            <Badge
                                variant="outline"
                                className={`${getStatusColor(task.status)} border px-3 py-1 font-medium`}
                            >
                                {task.status.replace("_", " ")}
                            </Badge>
                            <div className="h-4 w-px bg-gray-300" />
                            <span className="text-sm text-gray-500 font-medium">{task.project.name}</span>
                        </div>
                    </div>
                    {/* Accessibly hidden title/description for Radix compliance */}
                    <DialogTitle className="sr-only">{task.title}</DialogTitle>
                    <DialogDescription className="sr-only">Task details and comments</DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">{task.title}</h1>
                            {task.description ? (
                                <div className="prose prose-sm max-w-none text-gray-600">
                                    <p className="whitespace-pre-wrap leading-relaxed">{task.description}</p>
                                </div>
                            ) : (
                                <p className="text-gray-400 italic">No description provided.</p>
                            )}
                        </div>

                        {/* Comments Section */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Comments
                            </h3>

                            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                                <form onSubmit={handlePostComment} className="flex gap-4">
                                    <div className="flex-1">
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Write a comment..."
                                            className="w-full bg-transparent border-0 focus:ring-0 text-sm resize-none p-0 placeholder:text-gray-400 focus:outline-none"
                                            rows={2}
                                        />
                                        <div className="flex justify-end mt-2">
                                            <Button
                                                type="submit"
                                                size="sm"
                                                disabled={!newComment.trim() || submittingComment}
                                                className="h-8"
                                            >
                                                {submittingComment ? "Sending..." : "Send"}
                                                <Send className="w-3 h-3 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="space-y-6">
                                {task.comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-4 group">
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage src={comment.author.avatar} />
                                            <AvatarFallback>
                                                {comment.author.name?.charAt(0) || comment.author.email.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {comment.author.name || comment.author.email}
                                                </span>
                                                <span suppressHydrationWarning className="text-xs text-gray-500">
                                                    {new Date(comment.createdAt).toLocaleString(undefined, {
                                                        month: "short",
                                                        day: "numeric",
                                                        hour: "numeric",
                                                        minute: "numeric",
                                                    })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 leading-relaxed bg-white/50 p-2 rounded-lg inline-block min-w-[200px]">
                                                {comment.content}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {task.comments.length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-sm text-gray-500">No comments yet. Be the first to say something!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="w-full md:w-72 bg-gray-50/50 border-t md:border-t-0 md:border-l border-gray-100 p-6 space-y-6 overflow-y-auto">
                        {/* Status & Priority */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
                                    Priority
                                </label>
                                <Badge className={`${getPriorityColor(task.priority)} text-xs border`}>
                                    {task.priority}
                                </Badge>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
                                    Assignee
                                </label>
                                {task.assignee ? (
                                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                                        <Avatar className="w-6 h-6">
                                            <AvatarImage src={task.assignee.avatar} />
                                            <AvatarFallback>
                                                {task.assignee.name?.charAt(0) || task.assignee.email.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium text-gray-900 truncate">
                                            {task.assignee.name || task.assignee.email}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <User className="w-4 h-4" />
                                        <span className="text-sm">Unassigned</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
                                    Due Date
                                </label>
                                {task.dueDate ? (
                                    <div className="flex items-center gap-2 text-sm text-gray-900">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span suppressHydrationWarning>{new Date(task.dueDate).toLocaleDateString(undefined, {
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                        })}</span>
                                    </div>
                                ) : (
                                    <span className="text-sm text-gray-500">No due date</span>
                                )}
                            </div>
                        </div>

                        <div className="h-px bg-gray-200" />

                        {/* Metadata */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>Created</span>
                                <span suppressHydrationWarning>{new Date(task.createdAt).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>Updated</span>
                                <span suppressHydrationWarning>{new Date(task.updatedAt).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>Task ID</span>
                                <span className="font-mono text-[10px]">{task.id.slice(-8)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

