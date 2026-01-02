"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


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


  if (status === "loading" || statsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to signin
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-3xl">
                Welcome to Prone Project Management
              </CardTitle>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Welcome back,</p>
                <p className="font-semibold">
                  {session.user.name || session.user.email}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push("/projects")}
              >
                <CardContent className="p-6">
                  <CardTitle className="text-xl mb-4">Projects</CardTitle>
                  <p className="text-muted-foreground mb-4">
                    Create and manage your projects with ease.
                  </p>
                  <div className="flex justify-between text-sm">
                    <span>{activeProjects} Active Projects</span>
                    <span>View All →</span>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push("/tasks")}
              >
                <CardContent className="p-6">
                  <CardTitle className="text-xl mb-4">Tasks</CardTitle>
                  <p className="text-muted-foreground mb-4">
                    Organize and track your tasks efficiently.
                  </p>
                  <div className="flex justify-between text-sm">
                    <span>{totalTasks} Total Tasks</span>
                    <span>View All →</span>
                  </div>
                </CardContent>
              </Card>


            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
