"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  Filter,
} from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import TaskDetailsModal from "./TaskDetailsModal";
import TaskCard from "./TaskCard";
import CreateTaskModal from "./CreateTaskModal";
import { Task, User, TaskStatus } from "@/types";

// Kanban column configuration
const KANBAN_COLUMNS = [
  {
    id: "TODO" as TaskStatus,
    title: "To Do",
    color: "bg-slate-100 border-slate-300",
    badgeStyle: "bg-white border border-slate-300 text-slate-700",
    icon: Clock,
  },
  {
    id: "IN_PROGRESS" as TaskStatus,
    title: "In Progress",
    color: "bg-blue-50 border-blue-300",
    badgeStyle: "bg-white border border-blue-300 text-blue-700",
    icon: Clock,
  },
  {
    id: "IN_REVIEW" as TaskStatus,
    title: "In Review",
    color: "bg-amber-50 border-amber-300",
    badgeStyle: "bg-white border border-amber-300 text-amber-700",
    icon: AlertCircle,
  },
  {
    id: "DONE" as TaskStatus,
    title: "Done",
    color: "bg-green-50 border-green-300",
    badgeStyle: "bg-white border border-green-300 text-green-700",
    icon: CheckCircle,
  },
] as const;

interface TaskManagementProps {
  projectId: string;
  members: Array<{
    id: string;
    role: string;
    user: User;
  }>;
  canCreateTasks: boolean;
}

export default function TaskManagement({
  projectId,
  members,
  canCreateTasks,
}: TaskManagementProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [projectId, statusFilter, assigneeFilter]);

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams({
        projectId,
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(assigneeFilter !== "all" && { assigneeId: assigneeFilter }),
      });

      const response = await fetch(`/api/tasks?${params}`);
      const data = await response.json();

      if (response.ok) {
        setTasks(data.tasks);
      } else {
        setError(data.error || "Failed to fetch tasks");
      }
    } catch (err: any) {
      setError("An error occurred while fetching tasks");
    } finally {
      setLoading(false);
    }
  };

  const getTasksByStatus = () => {
    const groupedTasks: Record<TaskStatus, Task[]> = {
      TODO: [],
      IN_PROGRESS: [],
      IN_REVIEW: [],
      DONE: [],
    };
    tasks.forEach((task) => {
      groupedTasks[task.status].push(task);
    });
    return groupedTasks;
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area
    if (!destination) return;

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as TaskStatus;
    const taskId = draggableId;

    // Optimistically update the UI
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );

    // Update the task status on the server
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        // Revert the optimistic update on error
        fetchTasks();
        setError("Failed to update task status");
      }
    } catch (err) {
      // Revert the optimistic update on error
      fetchTasks();
      setError("An error occurred while updating the task");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="h-8 bg-muted rounded"></div>
                  <div className="space-y-3">
                    {[1, 2].map((j) => (
                      <div key={j} className="h-32 bg-muted rounded"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tasksByStatus = getTasksByStatus();
  return (
    <div className="w-full">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Tasks
              <Badge variant="outline" className="ml-2">
                {tasks.length} total
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (showFilters) {
                    setStatusFilter("all");
                    setAssigneeFilter("all");
                  }
                  setShowFilters(!showFilters);
                }}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                <ChevronDown
                  className={`w-4 h-4 ml-2 transition-transform ${showFilters ? "rotate-180" : ""
                    }`}
                />
              </Button>
              {canCreateTasks && (
                <Button size="sm" onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              )}
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-4 p-4 bg-muted rounded-lg">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="IN_REVIEW">In Review</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Assignee</Label>
                <Select
                  value={assigneeFilter}
                  onValueChange={setAssigneeFilter}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assignees</SelectItem>
                    {members.map((member) => (
                      <SelectItem key={member.user.id} value={member.user.id}>
                        {member.user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-4 rounded-md mb-4 text-sm bg-red-50 border border-red-200 text-red-800">
              {error}
            </div>
          )}

          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start organizing your project by creating your first task. You
                can drag and drop tasks between columns to update their status.
              </p>
              {canCreateTasks && (
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Task
                </Button>
              )}
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                {KANBAN_COLUMNS.map((column) => {
                  const columnTasks = tasksByStatus[column.id];
                  return (
                    <div key={column.id} className="flex flex-col min-w-0">
                      <div
                        className={`rounded-t-lg border-2 border-b-0 ${column.color} p-2`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <column.icon className="w-4 h-4" />
                            <h3 className="font-medium text-sm">
                              {column.title}
                            </h3>
                          </div>
                          <Badge className={`text-xs ${column.badgeStyle}`}>
                            {columnTasks.length}
                          </Badge>
                        </div>
                      </div>

                      <Droppable droppableId={column.id}>
                        {(provided, snapshot) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`flex-1 min-h-[300px] border-2 border-t-0 rounded-b-lg p-2 space-y-2 transition-colors ${snapshot.isDraggingOver
                              ? "bg-blue-50 border-blue-300"
                              : column.color
                              }`}
                          >
                            {columnTasks.map((task, index) => (
                              <Draggable
                                key={task.id}
                                draggableId={task.id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`transition-shadow ${snapshot.isDragging
                                      ? "rotate-3 shadow-lg"
                                      : ""
                                      }`}
                                  >
                                    <TaskCard
                                      task={task}
                                      members={members}
                                      onUpdate={fetchTasks}
                                      canEdit={canCreateTasks}
                                      dragHandleProps={provided.dragHandleProps}
                                      isDragging={snapshot.isDragging}
                                      onSelect={() => setSelectedTaskId(task.id)}
                                    />
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  );
                })}
              </div>
            </DragDropContext>
          )}
        </CardContent>

        {/* Create Task Modal */}
        {showCreateModal && (
          <CreateTaskModal
            projectId={projectId}
            members={members}
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              fetchTasks();
            }}
          />
        )}

        {/* Task Details Modal */}
        {selectedTaskId && (
          <TaskDetailsModal
            taskId={selectedTaskId}
            onClose={() => setSelectedTaskId(null)}
          />
        )}
      </Card>
    </div>
  );
}
