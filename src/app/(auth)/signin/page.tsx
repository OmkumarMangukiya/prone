"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Signin() {
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
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>

      {error && (
        <div
          className={`px-4 py-3 rounded mb-4 ${
            needsVerification
              ? "bg-yellow-100 border border-yellow-400 text-yellow-700"
              : "bg-red-100 border border-red-400 text-red-700"
          }`}
        >
          <p>{error}</p>
          {needsVerification && (
            <button
              onClick={handleGoToVerification}
              className="mt-2 w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              Verify Email Now
            </button>
          )}
        </div>
      )}

      <div className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSignin()}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleSignin}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div className="text-center mt-4 space-y-2">
          <div>
            <a
              href="/forgot-password"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Forgot your password?
            </a>
          </div>
          <div>
            <span className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
            </span>
            <a
              href="/signup"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
