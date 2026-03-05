"use client";

import { useState, useTransition, useEffect } from "react";
import Image from "next/image";

type ProfileData = {
    fullName: string | null;
    email: string;
    avatarUrl: string | null;
};

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 border-b border-slate-100 pb-4">
                <h2 className="text-base font-semibold text-slate-900">{title}</h2>
                {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
            </div>
            {children}
        </div>
    );
}

function StatusBanner({ status }: { status: { type: "success" | "error"; message: string } | null }) {
    if (!status) return null;
    return (
        <div className={`mb-1 rounded-xl px-4 py-3 text-sm font-medium ${status.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}>
            {status.message}
        </div>
    );
}

export default function ProfileSettingsPage() {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    // Name form
    const [fullName, setFullName] = useState("");
    const [nameStatus, setNameStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [isPendingName, startNameTransition] = useTransition();

    // Password form
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [isPendingPassword, startPasswordTransition] = useTransition();

    useEffect(() => {
        void fetch("/api/profile")
            .then((r) => r.json() as Promise<ProfileData & { error?: string }>)
            .then((data) => {
                if (!data.error) {
                    setProfile(data);
                    setFullName(data.fullName ?? "");
                }
                setLoading(false);
            });
    }, []);

    const handleNameSave = () => {
        setNameStatus(null);
        startNameTransition(() => {
            void (async () => {
                const res = await fetch("/api/profile", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ fullName: fullName.trim() })
                });
                const data = await res.json() as { success?: boolean; error?: string };
                if (data.success) {
                    setNameStatus({ type: "success", message: "Name updated successfully!" });
                    setProfile((p) => p ? { ...p, fullName: fullName.trim() } : p);
                } else {
                    setNameStatus({ type: "error", message: typeof data.error === "string" ? data.error : "Failed to update name." });
                }
            })();
        });
    };

    const handlePasswordSave = () => {
        setPasswordStatus(null);
        if (newPassword !== confirmPassword) {
            setPasswordStatus({ type: "error", message: "Passwords don't match." });
            return;
        }
        if (newPassword.length < 8) {
            setPasswordStatus({ type: "error", message: "Password must be at least 8 characters." });
            return;
        }
        startPasswordTransition(() => {
            void (async () => {
                const res = await fetch("/api/profile", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ password: newPassword })
                });
                const data = await res.json() as { success?: boolean; error?: string };
                if (data.success) {
                    setPasswordStatus({ type: "success", message: "Password updated successfully!" });
                    setNewPassword("");
                    setConfirmPassword("");
                } else {
                    setPasswordStatus({ type: "error", message: typeof data.error === "string" ? data.error : "Failed to update password." });
                }
            })();
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
            </div>
        );
    }

    const initials = (profile?.fullName ?? profile?.email ?? "?").charAt(0).toUpperCase();

    return (
        <div className="max-w-2xl space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
                <p className="mt-1 text-sm text-slate-500">Manage your personal information and account security.</p>
            </div>

            {/* Avatar + email (read-only) */}
            <Section title="Your Account">
                <div className="flex items-center gap-5">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-2 ring-slate-200">
                        {profile?.avatarUrl ? (
                            <Image src={profile.avatarUrl} alt="Avatar" width={64} height={64} className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-2xl font-semibold text-slate-500">{initials}</span>
                        )}
                    </div>
                    <div>
                        <p className="text-base font-semibold text-slate-900">{profile?.fullName ?? "—"}</p>
                        <p className="text-sm text-slate-500">{profile?.email}</p>
                    </div>
                </div>
            </Section>

            {/* Name */}
            <Section title="Full Name" description="This is the name displayed across the app.">
                <div className="space-y-4">
                    <StatusBanner status={nameStatus} />
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1.5">
                            Full name
                        </label>
                        <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Your full name"
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={handleNameSave}
                            disabled={isPendingName || fullName.trim().length === 0}
                            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
                        >
                            {isPendingName ? "Saving…" : "Save name"}
                        </button>
                    </div>
                </div>
            </Section>

            {/* Password */}
            <Section title="Change Password" description="Choose a strong password with at least 8 characters. Only applies if you use email/password sign-in.">
                <div className="space-y-4">
                    <StatusBanner status={passwordStatus} />

                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-1.5">
                            New password
                        </label>
                        <div className="relative">
                            <input
                                id="newPassword"
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Min. 8 characters"
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 text-sm text-slate-900 placeholder-slate-400 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword((v) => !v)}
                                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-700"
                                aria-label={showNewPassword ? "Hide password" : "Show password"}
                            >
                                {showNewPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1.5">
                            Confirm new password
                        </label>
                        <div className="relative">
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repeat your new password"
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 text-sm text-slate-900 placeholder-slate-400 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword((v) => !v)}
                                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-700"
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                                {showConfirmPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handlePasswordSave}
                            disabled={isPendingPassword || newPassword.length === 0}
                            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
                        >
                            {isPendingPassword ? "Updating…" : "Update password"}
                        </button>
                    </div>
                </div>
            </Section>
        </div>
    );
}
