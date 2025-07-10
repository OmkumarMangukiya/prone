"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import axios from "axios";

export default function DevTools() {
  const [deleteEmail, setDeleteEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const handleDeleteUser = async () => {
    if (!deleteEmail) {
      setMessage("Please enter an email");
      return;
    }

    if (!confirm(`Are you sure you want to delete user: ${deleteEmail}?`)) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.delete("/api/dev/delete-user", {
        data: { email: deleteEmail },
      });

      if (response.data.success) {
        setMessage("User deleted successfully");
        setDeleteEmail("");
      } else {
        setMessage(response.data.message || "Failed to delete user");
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Error deleting user");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    if (confirm("Are you sure you want to sign out?")) {
      signOut({ callbackUrl: "/signin" });
    }
  };

  return (
    <div className="mt-8 p-6 bg-red-50 border-2 border-red-200 rounded-lg">
      <div className="flex items-center mb-4">
        <span className="text-red-600 font-bold text-lg">
          DEVELOPMENT TOOLS
        </span>
        <span className="ml-2 text-sm text-red-500">
          (Remove in production)
        </span>
      </div>

      <div className="space-y-4">
        {/* Sign Out Button */}
        <div>
          <h3 className="font-semibold text-red-800 mb-2">
            Session Management
          </h3>
          <button
            onClick={handleSignOut}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Sign Out (NextAuth)
          </button>
        </div>

        {/* Delete User */}
        <div>
          <h3 className="font-semibold text-red-800 mb-2">User Management</h3>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter email to delete"
              value={deleteEmail}
              onChange={(e) => setDeleteEmail(e.target.value)}
              className="flex-1 px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              onClick={handleDeleteUser}
              disabled={loading}
              className="bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Delete User"}
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`p-3 rounded ${
              message.includes("success")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <div className="text-xs text-red-600 mt-4">
          <p>
            <strong>Note:</strong> These tools are only available in development
            mode.
          </p>
          <p>
            Make sure to remove this component and related API routes before
            deploying to production.
          </p>
        </div>
      </div>
    </div>
  );
}
