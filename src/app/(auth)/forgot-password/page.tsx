"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <div className="max-w-md mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            {step === 1
              ? "Enter your email address and we'll send you an OTP to reset your password."
              : "Enter the OTP and your new password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-4 rounded-md mb-4 text-sm bg-red-50 border border-red-200 text-red-800">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 rounded-md mb-4 text-sm bg-green-50 border border-green-200 text-green-800">
              {success}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={sendingOtp}
                />
              </div>

              <Button
                onClick={handleSendOtp}
                disabled={sendingOtp}
                className="w-full"
              >
                {sendingOtp ? "Sending OTP..." : "Send OTP"}
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="p-4 rounded-md mb-4 text-sm bg-green-50 border border-green-200 text-green-800">
                OTP sent to {email}! Please check your inbox.
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">OTP Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </Button>

              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="w-full"
              >
                Back to Email
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
