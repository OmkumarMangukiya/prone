"use client";

import { useState, FormEvent, Suspense } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function ResetPasswordContent() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    async function handleResetPassword(e: FormEvent) {
        e.preventDefault();
        if (!token) {
            setError("Invalid reset link");
            return;
        }

        if (!newPassword || !confirmPassword) {
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
                token,
                newPassword,
            });

            if (response.data.success) {
                setSuccess("Password reset successfully! Redirecting to sign in...");
                setTimeout(() => {
                    router.push("/signin?message=Password reset successfully");
                }, 2000);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            setError(
                error.response?.data?.message || "Password reset failed"
            );
        } finally {
            setLoading(false);
        }
    }

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/30 px-4">
                <div className="max-w-[420px] w-full p-6 bg-red-50 text-red-700 rounded-lg text-center border border-red-100 shadow-sm">
                    Invalid or missing reset token. Please request a new password reset link.
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/30 px-4">
            <Card className="w-full max-w-[420px] shadow-sm border-gray-100">
                <CardHeader className="space-y-4 pt-10 px-10 pb-0">
                    <CardTitle className="text-2xl text-center font-semibold tracking-tight">Set New Password</CardTitle>
                    <CardDescription className="text-center text-sm text-gray-500">
                        Enter your new password below.
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

                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={loading || !!success}
                                className="h-10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={loading || !!success}
                                className="h-10"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || !!success}
                            className="w-full h-10 font-medium"
                        >
                            {loading ? "Resetting Password..." : "Reset Password"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function ResetPassword() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
