"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Settings,
  Users,
  MoreVertical,
  Calendar,
  CheckCircle,
  Clock,
  Pause,
  Archive,
  Edit2,
  Trash2,
  Plus,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TaskManagement from "../../../components/TaskManagement";
import EditProjectModal from "@/components/EditProjectModal";
import InviteMemberModal from "@/components/InviteMemberModal";

interface Project {
  id: string;
  name: string;
  description?: string;
  status: "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED";
  color?: string;
  category?: {
    id: string;
    name: string;
    color: string;
  };
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
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
    title: string;
    status: string;
    priority: string;
    dueDate?: string;
    assignee?: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
  }>;
  _count: {
    tasks: number;
    members: number;
  };
}

interface ProjectCategory {
  id: string;
  name: string;
  color: string;
}

export default function ProjectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
      return;
    }

    if (status === "authenticated" && projectId) {
      fetchProject();
      fetchCategories();
    }
  }, [status, router, projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();

      if (response.ok) {
        setProject(data.project);
      } else {
        setError(data.error || "Failed to fetch project");
      }
    } catch (err) {
      setError("An error occurred while fetching the project");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/project-categories");
      const data = await response.json();

      if (response.ok) {
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setCategories([]);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "ON_HOLD":
        return <Pause className="w-5 h-5 text-yellow-500" />;
      case "COMPLETED":
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case "ARCHIVED":
        return <Archive className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "ON_HOLD":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800";
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
      case "LOW":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const canEditProject = () => {
    if (!project || !session?.user) return false;
    const userRole = project.members.find(
      (m) => m.user.id === session.user.id
    )?.role;
    return project.owner.id === session.user.id || userRole === "ADMIN";
  };

  const canCreateContent = () => {
    if (!project || !session?.user) return false;
    const userRole = project.members.find(
      (m) => m.user.id === session.user.id
    )?.role;
    return (
      project.owner.id === session.user.id ||
      userRole === "ADMIN" ||
      userRole === "MEMBER"
    );
  };

  const isOwner = project?.owner.id === session?.user?.id;

  const handleDeleteProject = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/projects");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete project");
      }
    } catch (err) {
      setError("An error occurred while deleting the project");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        fetchProject();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to remove member");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to remove member");
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/members/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (response.ok) {
        fetchProject();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update role");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update role");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {error || "Project not found"}
          </h2>
          <button
            onClick={() => router.push("/projects")}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push("/projects")}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold text-xl"
              style={{ backgroundColor: project.color || "#3B82F6" }}
            >
              {project.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {project.name}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    project.status
                  )}`}
                >
                  {getStatusIcon(project.status)}
                  {project.status.replace("_", " ")}
                </span>
                <span suppressHydrationWarning className="text-gray-500 text-sm">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            {canEditProject() && (
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                {showSettings && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                    <div className="py-1">
                      <>
                        <button
                          onClick={() => {
                            setShowEditModal(true);
                            setShowSettings(false);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit Project
                        </button>
                        <button
                          onClick={() => {
                            setShowSettings(false);
                            // Open settings modal
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Settings className="w-4 h-4" />
                          Project Settings
                        </button>
                      </>
                      {project.owner.id === session?.user?.id && (
                        <button
                          onClick={() => {
                            setShowSettings(false);
                            handleDeleteProject();
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Project
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {project.description && (
            <p className="text-gray-600 text-lg">{project.description}</p>
          )}
        </div>


        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tasks Section - Takes 3 columns */}
          <div className="lg:col-span-3">
            <TaskManagement
              projectId={project.id}
              members={project.members}
              canCreateTasks={canCreateContent()}
            />
          </div>

          {/* Right Sidebar - Takes 1 column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Project Details */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Project Details
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Total Tasks</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{project._count.tasks}</span>
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Completed</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {project.tasks.filter((task) => task.status === "DONE").length}
                    </span>
                    <CheckCircle className="w-4 h-4 text-purple-500" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Members</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{project._count.members}</span>
                    <Users className="w-4 h-4 text-green-500" />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      {project.owner.avatar ? (
                        <img
                          src={project.owner.avatar}
                          alt={project.owner.name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <span className="text-xs font-medium text-gray-600">
                          {project.owner.name?.charAt(0) || project.owner.email.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{project.owner.name || project.owner.email}</p>
                      <p className="text-xs text-gray-500">Project Owner</p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 flex justify-between items-center">
                    <span>Created</span>
                    <span suppressHydrationWarning>{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="bg-white rounded-lg shadow-sm border p-4 h-fit">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-900">
                  Team Members
                </h3>
                {(isOwner || canEditProject()) && (
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {project.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-2 justify-between group">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {member.user.avatar ? (
                          <img
                            src={member.user.avatar}
                            alt={member.user.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <span className="text-xs font-medium text-gray-600">
                            {member.user.name?.charAt(0) ||
                              member.user.email.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {member.user.name || member.user.email}
                        </p>
                        {/* Only show role change if user has permission and target is not owner */}
                        {(isOwner || canEditProject()) && member.user.id !== project.owner.id ? (
                          <div className="h-6">
                            <Select
                              value={member.role}
                              onValueChange={(val) => { void handleUpdateRole(member.user.id, val) }}
                            >
                              <SelectTrigger className="h-6 text-xs w-[100px] p-1 border-gray-200">
                                <SelectValue placeholder={member.role} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                                <SelectItem value="MEMBER">Member</SelectItem>
                                <SelectItem value="VIEWER">Viewer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">{member.role}</p>
                        )}
                      </div>
                    </div>
                    {isOwner && member.user.id !== project.owner.id && (
                      <button
                        onClick={() => {
                          void handleRemoveMember(member.user.id);
                        }}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Project Modal */}
        {showEditModal && project && (
          <EditProjectModal
            project={project}
            categories={categories}
            onClose={() => setShowEditModal(false)}
            onSuccess={() => {
              setShowEditModal(false);
              fetchProject();
            }}
          />
        )}

        {/* Invite Member Modal */}
        {showInviteModal && (
          <InviteMemberModal
            projectId={projectId}
            onClose={() => { setShowInviteModal(false) }}
            onSuccess={() => {
              setShowInviteModal(false);
              fetchProject();
            }}
          />
        )}
      </div>
    </div>
  );
}
