"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DevTools from "../../components/DevTools";

// Types for project data
interface Project {
  id: string;
  name: string;
  status: string;
  _count: {
    tasks: number;
    members: number;
  };
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  // Fetch project stats
  useEffect(() => {
    if (status === "authenticated") {
      fetchProjectStats();
    }
  }, [status]);

  const fetchProjectStats = async () => {
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();
      if (response.ok) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error("Failed to fetch project stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Calculate stats
  const activeProjects = projects.filter((p) => p.status === "ACTIVE").length;
  const totalTasks = projects.reduce(
    (sum, project) => sum + project._count.tasks,
    0
  );
  const totalMembers = projects.reduce(
    (sum, project) => sum + project._count.members,
    0
  );

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showUserMenu && !target.closest(".relative")) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  if (status === "loading" || statsLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to signin
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome to Prone Project Management
            </h1>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-semibold text-gray-800">
                  {session.user.name || session.user.email}
                </p>
              </div>

              {/* User Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                      {(session.user.name || session.user.email || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      showUserMenu ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          router.push("/dashboard/profile");
                          setShowUserMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile Settings
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={() => signOut({ callbackUrl: "/signin" })}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              className="bg-blue-50 p-6 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
              onClick={() => router.push("/projects")}
            >
              <h2 className="text-xl font-semibold text-blue-800 mb-4">
                Projects
              </h2>
              <p className="text-gray-600 mb-4">
                Create and manage your projects with ease.
              </p>
              <div className="flex justify-between text-sm text-blue-700">
                <span>{activeProjects} Active Projects</span>
                <span>View All →</span>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
              <h2 className="text-xl font-semibold text-green-800 mb-4">
                Tasks
              </h2>
              <p className="text-gray-600 mb-4">
                Organize and track your tasks efficiently.
              </p>
              <div className="flex justify-between text-sm text-green-700">
                <span>{totalTasks} Total Tasks</span>
                <span>View All →</span>
              </div>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">
              <h2 className="text-xl font-semibold text-purple-800 mb-4">
                Collaboration
              </h2>
              <p className="text-gray-600 mb-4">
                Work together with your team in real-time.
              </p>
              <div className="flex justify-between text-sm text-purple-700">
                <span>{totalMembers} Team Members</span>
                <span>View All →</span>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Welcome! Your project management system is ready. You can now
              create projects, manage tasks, and collaborate with your team.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">
                ✅ Project Management Features:
              </h3>
              <ul className="text-sm text-green-700 text-left">
                <li>• Create and manage projects with categories</li>
                <li>
                  • Project status management (Active, On Hold, Completed)
                </li>
                <li>• Form validation and configuration</li>
                <li>• Team collaboration and member management</li>
              </ul>
            </div>
          </div>

          {/* Development Tools */}
          <DevTools />
        </div>
      </div>
    </div>
  );
}
