"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1:email, 2:OTP and new password
  const [sendingOtp, setSendingOtp] = useState(false);
  const [success, setSuccess] = useState("");
  const router = useRouter();

  async function handleSendOtp() {
    if (!email) {
      setError("Please enter your email");
      return;
    }

    setSendingOtp(true);
    setError("");

    try {
      const response = await axios.post("/api/auth/send-otp", {
        email,
        type: "PASSWORD_RESET",
      });

      if (response.data.success) {
        setStep(2);
        setError("");
      }
    } catch (error: unknown) {
      setError((error as any)?.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleResetPassword() {
    if (!email || !otp || !newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/auth/reset-password", {
        email,
        otp,
        newPassword,
      });

      if (response.data.success) {
        setSuccess("Password reset successfully! Signing you in...");

        // Auto-signin using NextAuth with new password
        const result = await signIn("credentials", {
          email,
          password: newPassword,
          redirect: false,
        });

        if (result?.ok) {
          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
        } else {
          // Fallback to signin page if auto-signin fails
          setTimeout(() => {
            router.push("/signin?message=Password reset successfully");
          }, 2000);
        }
      }
    } catch (error: unknown) {
      setError(
        (error as any)?.response?.data?.message || "Password reset failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Reset Password
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Enter your email address and we'll send you an OTP to reset your
            password.
          </p>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleSendOtp}
            disabled={sendingOtp}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {sendingOtp ? "Sending OTP..." : "Send OTP"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            OTP sent to {email}! Please check your inbox.
          </div>

          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleResetPassword}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>

          <button
            onClick={() => setStep(1)}
            className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Back to Email
          </button>
        </div>
      )}
    </div>
  );
}
