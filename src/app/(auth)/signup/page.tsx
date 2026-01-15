"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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

export default function Signup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  async function handleSignup() {
    if (!email || !password || !name) {
      setError("Please fill in all fields");
      return;
    }

    // Password validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    if (password.length > 18) {
      setError("Password must be less than 18 characters long");
      return;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, and one number");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/auth/signup", {
        email: email,
        name: name,
        password: password,
      });

      if (response.data.success) {
        // Redirect to email verification page with email parameter
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="max-w-md mx-auto mt-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/30 px-4">
      <Card className="w-full max-w-[420px] shadow-sm border-gray-100">
        <CardHeader className="space-y-4 pt-10 px-10 pb-0">
          <CardTitle className="text-2xl text-center font-semibold tracking-tight">Sign Up</CardTitle>
          <CardDescription className="text-center text-sm text-gray-500">
            Create your account to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="p-10 space-y-6">
          {error && (
            <div className="p-4 rounded-lg mb-4 text-sm bg-red-50 text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                disabled={loading}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                disabled={loading}
                className="h-10"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSignup();
                  }
                }}
              />
            </div>

            <Button
              onClick={handleSignup}
              disabled={loading}
              className="w-full h-10 font-medium"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </Button>

            <div className="text-center">
              <span className="text-sm text-gray-500">
                Already have an account?{" "}
              </span>
              <Button
                variant="link"
                onClick={() => router.push("/signin")}
                className="p-0 h-auto text-sm text-blue-600 font-medium hover:text-blue-800"
              >
                Sign in
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
