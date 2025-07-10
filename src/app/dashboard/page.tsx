"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DevTools from "../../components/DevTools";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  if (status === "loading") {
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
              <button
                onClick={() => signOut({ callbackUrl: "/signin" })}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Sign Out
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">
                Projects
              </h2>
              <p className="text-gray-600">
                Create and manage your projects with ease.
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-green-800 mb-4">
                Tasks
              </h2>
              <p className="text-gray-600">
                Organize and track your tasks efficiently.
              </p>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-purple-800 mb-4">
                Collaboration
              </h2>
              <p className="text-gray-600">
                Work together with your team in real-time.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Welcome! Your authentication system is now set up with NextAuth.js
              session management, email verification via OTP, and password reset
              functionality.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">
                ✅ Authentication Features:
              </h3>
              <ul className="text-sm text-green-700 text-left">
                <li>• Secure session management with NextAuth.js</li>
                <li>• Email verification using OTP system</li>
                <li>• Password reset functionality</li>
                <li>• Automatic session handling and CSRF protection</li>
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
