"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyEmail() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get email from URL parameter
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
      // Automatically send OTP when component loads
      sendOtp(emailParam);
    } else {
      // If no email parameter, redirect to signup
      router.push("/signup");
    }
  }, [searchParams, router]);

  async function sendOtp(emailToSend: string) {
    setSendingOtp(true);
    setError("");

    try {
      const response = await axios.post("/api/auth/send-otp", {
        email: emailToSend,
        type: "EMAIL_VERIFICATION",
      });

      if (response.data.success) {
        setOtpSent(true);
        setSuccess("OTP sent to your email! Please check your inbox.");
      } else {
        setError(response.data.message || "Failed to send OTP");
      }
    } catch (error: unknown) {
      setError((error as any)?.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleVerifyOtp() {
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/auth/verify-otp", {
        email,
        otp,
        type: "EMAIL_VERIFICATION",
      });

      if (response.data.success) {
        setSuccess("Email verified successfully! Signing you in...");

        // Auto-signin using NextAuth
        const result = await signIn("auto-signin", {
          email,
          verified: "true",
          redirect: false,
        });

        if (result?.ok) {
          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
        } else {
          // Fallback to signin page if auto-signin fails
          setTimeout(() => {
            router.push("/signin?message=Email verified successfully");
          }, 2000);
        }
      } else {
        setError(response.data.message || "Invalid OTP");
      }
    } catch (error: unknown) {
      setError(
        (error as any)?.response?.data?.message || "OTP verification failed"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    if (email) {
      await sendOtp(email);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Verify Your Email
      </h1>

      <div className="mb-4 text-center">
        <p className="text-sm text-gray-600">
          We've sent a verification code to:
        </p>
        <p className="font-medium text-blue-600">{email}</p>
      </div>

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

      {sendingOtp && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          Sending OTP to your email...
        </div>
      )}

      {otpSent && (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            maxLength={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
          />

          <button
            onClick={handleVerifyOtp}
            disabled={loading || !otp}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>

          <button
            onClick={handleResendOtp}
            disabled={sendingOtp}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            {sendingOtp ? "Sending..." : "Resend OTP"}
          </button>
        </div>
      )}
    </div>
  );
}
