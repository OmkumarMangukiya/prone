"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  User,
  Filter,
  ChevronDown,
  Search,
  Plus,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
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
    attachments: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string;
  name: string;
  status: string;
}

export default function TasksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
      return;
    }

    if (status === "authenticated") {
      fetchProjects();
    }
  }, [status, router]);

  useEffect(() => {
    if (projects.length > 0) {
      fetchAllTasks();
    }
  }, [projects, statusFilter, priorityFilter, projectFilter]);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();

      if (response.ok) {
        setProjects(data.projects);
      } else {
        setError(data.error || "Failed to fetch projects");
      }
    } catch (err) {
      setError("An error occurred while fetching projects");
    }
  };

  const fetchAllTasks = async () => {
    try {
      const taskPromises = projects.map(async (project) => {
        const params = new URLSearchParams({
          projectId: project.id,
          ...(statusFilter !== "all" && { status: statusFilter }),
        });

        const response = await fetch(`/api/tasks?${params}`);
        const data = await response.json();

        if (response.ok) {
          return data.tasks || [];
        }
        return [];
      });

      const allTaskArrays = await Promise.all(taskPromises);
      const allTasks = allTaskArrays.flat();

      // Apply additional filters
      let filteredTasks = allTasks;

      if (priorityFilter !== "all") {
        filteredTasks = filteredTasks.filter(
          (task) => task.priority === priorityFilter
        );
      }

      if (projectFilter !== "all") {
        filteredTasks = filteredTasks.filter(
          (task) => task.project.id === projectFilter
        );
      }

      if (searchTerm.trim()) {
        filteredTasks = filteredTasks.filter(
          (task) =>
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.description &&
              task.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      // Sort by due date and priority
      filteredTasks.sort((a, b) => {
        // First, sort by due date (tasks with due dates first)
        if (a.dueDate && !b.dueDate) return -1;
        if (!a.dueDate && b.dueDate) return 1;
        if (a.dueDate && b.dueDate) {
          const dateA = new Date(a.dueDate);
          const dateB = new Date(b.dueDate);
          if (dateA.getTime() !== dateB.getTime()) {
            return dateA.getTime() - dateB.getTime();
          }
        }

        // Then sort by priority
        const priorityOrder: Record<string, number> = {
          URGENT: 0,
          HIGH: 1,
          MEDIUM: 2,
          LOW: 3,
        };
        return (
          (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4)
        );
      });

      setTasks(filteredTasks);
    } catch (err) {
      setError("An error occurred while fetching tasks");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DONE":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "IN_PROGRESS":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "IN_REVIEW":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return (
          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
        );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DONE":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "IN_REVIEW":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 text-red-800";
      case "HIGH":
        return "bg-orange-100 text-orange-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const handleTaskStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchAllTasks();
      }
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "TODO").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    inReview: tasks.filter((t) => t.status === "IN_REVIEW").length,
    done: tasks.filter((t) => t.status === "DONE").length,
    overdue: tasks.filter((t) => isOverdue(t.dueDate)).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Tasks</h1>

          {/* Task Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900">
                  {taskStats.total}
                </p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-600">
                  {taskStats.todo}
                </p>
                <p className="text-sm text-gray-600">To Do</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-center">
                <p className="text-2xl font-semibold text-blue-600">
                  {taskStats.inProgress}
                </p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-center">
                <p className="text-2xl font-semibold text-yellow-600">
                  {taskStats.inReview}
                </p>
                <p className="text-sm text-gray-600">In Review</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-center">
                <p className="text-2xl font-semibold text-green-600">
                  {taskStats.done}
                </p>
                <p className="text-sm text-gray-600">Done</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-center">
                <p className="text-2xl font-semibold text-red-600">
                  {taskStats.overdue}
                </p>
                <p className="text-sm text-gray-600">Overdue</p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="IN_REVIEW">In Review</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Priorities</option>
                      <option value="URGENT">Urgent</option>
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project
                    </label>
                    <select
                      value={projectFilter}
                      onChange={(e) => setProjectFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Projects</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                        setPriorityFilter("all");
                        setProjectFilter("all");
                      }}
                      className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-lg shadow-sm border">
          {error && (
            <div className="p-6 border-b border-gray-200">
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                {error}
              </div>
            </div>
          )}

          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No tasks found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ||
                statusFilter !== "all" ||
                priorityFilter !== "all" ||
                projectFilter !== "all"
                  ? "Try adjusting your filters or search terms."
                  : "You don't have any tasks assigned yet."}
              </p>
              <button
                onClick={() => router.push("/projects")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Go to Projects
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/projects/${task.project.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(task.status)}
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {task.title}
                        </h3>
                        {isOverdue(task.dueDate) && (
                          <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                            Overdue
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            task.status
                          )}`}
                        >
                          {task.status.replace("_", " ")}
                        </span>

                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>

                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                          {task.project.name}
                        </span>

                        {task.assignee && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>
                              {task.assignee.name || task.assignee.email}
                            </span>
                          </div>
                        )}

                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Due {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-6 flex-shrink-0">
                      <select
                        value={task.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleTaskStatusUpdate(task.id, e.target.value);
                        }}
                        className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="IN_REVIEW">In Review</option>
                        <option value="DONE">Done</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
