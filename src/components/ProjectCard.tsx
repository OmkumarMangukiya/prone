import {
    MoreVertical,
    Users,
    CheckCircle,
    Clock,
    Pause,
    Archive,
    Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Project } from "@/types";

interface ProjectCardProps {
    project: Project;
    viewMode: "grid" | "list";
    onEdit: (project: Project) => void;
    onClick: (id: string) => void;
}

export default function ProjectCard({
    project,
    viewMode,
    onEdit,
    onClick,
}: ProjectCardProps) {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case "ON_HOLD":
                return <Pause className="w-4 h-4 text-yellow-500" />;
            case "COMPLETED":
                return <CheckCircle className="w-4 h-4 text-blue-500" />;
            case "ARCHIVED":
                return <Archive className="w-4 h-4 text-gray-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <Card
            className={`hover:shadow-md transition-shadow cursor-pointer ${viewMode === "list" ? "p-4" : "p-6"
                }`}
            onClick={() => onClick(project.id)}
        >
            {viewMode === "grid" ? (
                // Grid View
                <>
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold"
                                style={{
                                    backgroundColor: project.color || "#000000",
                                }}
                            >
                                {project.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-semibold truncate">{project.name}</h3>
                                <Badge variant="secondary" className="text-xs">
                                    {getStatusIcon(project.status)}
                                    {project.status.replace("_", " ")}
                                </Badge>
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(project);
                                    }}
                                >
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Edit Project
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {project.description && (
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                            {project.description}
                        </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                {project._count.tasks} tasks
                            </span>
                            <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {project._count.members} members
                            </span>
                        </div>
                        <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>
                </>
            ) : (
                // List View
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
                            style={{ backgroundColor: project.color || "#000000" }}
                        >
                            {project.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{project.name}</h3>
                            {project.description && (
                                <p className="text-muted-foreground text-sm truncate">
                                    {project.description}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">
                            {getStatusIcon(project.status)}
                            {project.status.replace("_", " ")}
                        </Badge>
                        <span>{project._count.tasks} tasks</span>
                        <span>{project._count.members} members</span>
                        <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(project);
                                    }}
                                >
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Edit Project
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            )}
        </Card>
    );
}
