"use client";

import { useState, useEffect, Suspense } from "react";

import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

function VerifyEmailContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    async function verifyToken(tokenToVerify: string) {
      setLoading(true);
      setError("");
      try {
        const response = await axios.post("/api/auth/verify-token", { token: tokenToVerify });
        if (response.data.success) {
          setSuccess("Email verified successfully! You can now sign in.");
          setTimeout(() => {
            router.push("/signin?verified=true");
          }, 2000);
        } else {
          setError(response.data.message || "Invalid token");
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.response?.data?.message || "Verification failed");
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      verifyToken(token);
    }
  }, [token, router]);

  async function handleResend() {
    if (!email) {
      setError("Please enter your email");
      return;
    }
    setResending(true);
    setError("");
    try {
      const response = await axios.post("/api/auth/send-verification", {
        email,
        type: 'EMAIL_VERIFICATION'
      });
      if (response.data.success) {
        setSuccess("Verification link sent! Check your email.");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send link");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/30 px-4">
      <Card className="w-full max-w-[420px] shadow-sm border-gray-100">
        <CardHeader className="space-y-4 pt-10 px-10 pb-0">
          <CardTitle className="text-2xl text-center font-semibold tracking-tight">Email Verification</CardTitle>
          <CardDescription className="text-center text-sm text-gray-500">
            {token ? "Verifying your email..." : "Verify your email address"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-10 space-y-6">
          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Verifying...</p>
            </div>
          )}

          {!loading && error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 text-sm">
              {error}
              {token && <p className="mt-2 text-xs">The link may be expired. Try requesting a new one below.</p>}
            </div>
          )}

          {!loading && success && (
            <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-4 text-sm">
              {success}
            </div>
          )}

          {!loading && (!token || error) && (
            <div className="space-y-6">
              <p className="text-sm text-center text-gray-500">Enter your email to receive a new verification link.</p>
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10"
              />
              <Button className="w-full h-10 font-medium" onClick={handleResend} disabled={resending}>
                {resending ? "Sending..." : "Send Verification Link"}
              </Button>
            </div>
          )}

          {!loading && success && !token && (
            <Button className="w-full mt-4 h-10 font-medium" onClick={() => router.push("/signin")}>
              Go to Sign In
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
