"use client";

import { useState, FormEvent } from "react";
import axios from "axios";
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
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("/api/auth/send-verification", {
        email,
        type: "PASSWORD_RESET",
      });

      if (response.data.success) {
        setSuccess("Password reset link sent! Please check your inbox.");
        setEmail("");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/30 px-4">
      <Card className="w-full max-w-[420px] shadow-sm border-gray-100">
        <CardHeader className="space-y-4 pt-10 px-10 pb-0">
          <CardTitle className="text-2xl text-center font-semibold tracking-tight">Reset Password</CardTitle>
          <CardDescription className="text-center text-sm text-gray-500">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-10 space-y-6">
          {error && (
            <div className="p-4 rounded-lg mb-4 text-sm bg-red-50 text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 rounded-lg mb-4 text-sm bg-green-50 text-green-600">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="h-10"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 font-medium"
            >
              {loading ? "Sending Link..." : "Send Reset Link"}
            </Button>

            <div className="text-center text-sm">
              <Link href="/signin" className="text-blue-600 font-medium hover:text-blue-800 hover:underline">
                Back to Sign In
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
