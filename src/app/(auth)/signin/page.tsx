"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
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

function SigninContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }

    // Check for NextAuth error
    const authError = searchParams.get("error");
    if (authError) {
      if (authError === "CredentialsSignin") {
        setError("Invalid credentials. Please check your email and password.");
      } else {
        setError("Authentication failed. Please try again.");
      }
    }
  }, [status, router, searchParams]);

  async function handleSignin() {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    setNeedsVerification(false);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "Please verify your email before signing in") {
          setError(result.error);
          setNeedsVerification(true);
          setVerificationEmail(email);
        } else {
          setError(result.error);
        }
      } else if (result?.ok) {
        router.push("/dashboard");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoToVerification() {
    router.push(`/verify-email?email=${encodeURIComponent(verificationEmail)}`);
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
          <CardTitle className="text-2xl text-center font-semibold tracking-tight">Sign In</CardTitle>
          <CardDescription className="text-center text-sm text-gray-500">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="p-10 space-y-6">
          {error && (
            <div
              className={`p-4 rounded-lg text-sm ${needsVerification
                ? "bg-yellow-50 text-yellow-800"
                : "bg-red-50 text-red-600"
                }`}
            >
              <p>{error}</p>
              {needsVerification && (
                <Button
                  variant="link"
                  onClick={handleGoToVerification}
                  className="p-0 h-auto text-yellow-800 underline mt-2 font-medium"
                >
                  Go to email verification
                </Button>
              )}
            </div>
          )}

          <div className="space-y-6">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                <Button
                  variant="link"
                  onClick={() => router.push("/forgot-password")}
                  className="p-0 h-auto text-xs text-blue-600 font-medium hover:text-blue-800"
                  tabIndex={-1}
                >
                  Forgot password?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                className="h-10"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSignin();
                  }
                }}
              />
            </div>

            <Button
              onClick={handleSignin}
              disabled={loading}
              className="w-full h-10 font-medium"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center">
              <span className="text-sm text-gray-500">
                Don&apos;t have an account?{" "}
              </span>
              <Button
                variant="link"
                onClick={() => router.push("/signup")}
                className="p-0 h-auto text-sm text-blue-600 font-medium hover:text-blue-800"
              >
                Sign up
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Signin() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SigninContent />
    </Suspense>
  );
}
