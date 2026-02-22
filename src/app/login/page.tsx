"use client";

import React, { Suspense, useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Phone, ArrowRight, Loader2, AlertCircle, ChevronLeft, KeyRound, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Step = "phone" | "otp";

const SLIDE = {
    enter: { opacity: 0, x: 32 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -32 },
};

// ─── OTP Input ─────────────────────────────────────────────────────────────

function OtpInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
    const refs = useRef<(HTMLInputElement | null)[]>([]);

    const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !value[i] && i > 0) {
            refs.current[i - 1]?.focus();
        }
    };

    const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const char = e.target.value.replace(/\D/g, "").slice(-1);
        const next = [...value];
        next[i] = char;
        onChange(next);
        if (char && i < 5) refs.current[i + 1]?.focus();
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted.length === 6) {
            onChange(pasted.split(""));
            refs.current[5]?.focus();
            e.preventDefault();
        }
    };

    return (
        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
            {Array.from({ length: 6 }).map((_, i) => (
                <input
                    key={i}
                    ref={(el) => { refs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value[i] || ""}
                    onChange={(e) => handleChange(i, e)}
                    onKeyDown={(e) => handleKey(i, e)}
                    className={`w-11 h-12 text-center text-lg font-bold rounded-2xl border-2 transition-all focus:outline-none focus:scale-105 ${value[i]
                        ? "border-primary-normal bg-primary-light text-primary-normal"
                        : "border-gray-200 bg-gray-50 text-gray-800 focus:border-primary-normal focus:bg-white"
                        }`}
                />
            ))}
        </div>
    );
}

// ─── Inner form (uses useSearchParams — must be inside Suspense) ───────────────

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get("from") || "/";

    const [step, setStep] = useState<Step>("phone");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resendTimer, setResendTimer] = useState(0);

    // Countdown timer for resend
    useEffect(() => {
        if (resendTimer <= 0) return;
        const t = setTimeout(() => setResendTimer((v) => v - 1), 1000);
        return () => clearTimeout(t);
    }, [resendTimer]);

    const sendOtp = async () => {
        if (!/^\d{10}$/.test(phone)) {
            setError("Enter a valid 10-digit phone number.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone_number: phone }),
            });
            const data = await res.json();
            if (data.success) {
                setStep("otp");
                setResendTimer(30);
            } else {
                setError(data.message || "Failed to send OTP.");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        const otpStr = otp.join("");
        if (otpStr.length !== 6) {
            setError("Please enter the complete 6-digit OTP.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone_number: phone, otp: otpStr }),
            });
            const data = await res.json();
            if (data.success) {
                router.push(from);
                router.refresh();
            } else {
                setError(data.message || "Invalid OTP.");
                setOtp(Array(6).fill(""));
            }
        } catch {
            setError("Verification failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const resendOtp = async () => {
        if (resendTimer > 0) return;
        setError("");
        setOtp(Array(6).fill(""));
        setLoading(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone_number: phone }),
            });
            const data = await res.json();
            if (data.success) {
                setResendTimer(30);
            } else {
                setError(data.message || "Failed to resend OTP.");
            }
        } catch {
            setError("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary-light opacity-40 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary-light opacity-30 blur-3xl pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-sm"
            >
                {/* Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="px-8 pt-8 pb-6 text-center border-b border-gray-50">
                        <div className="h-14 w-14 rounded-2xl bg-primary-normal flex items-center justify-center shadow-lg shadow-primary-light-active mx-auto mb-4">
                            <ShieldCheck size={26} className="text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">Unzolo Admin</h1>
                        <p className="text-xs text-gray-400 mt-1">
                            {step === "phone" ? "Enter your registered phone number" : `OTP sent to +91 ${phone}`}
                        </p>
                    </div>

                    {/* Step content */}
                    <div className="px-8 py-6">
                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex items-center gap-2.5 bg-red-50 border border-red-100 text-red-600 text-xs px-4 py-3 rounded-2xl mb-4 overflow-hidden"
                                >
                                    <AlertCircle size={14} className="shrink-0" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence mode="wait">
                            {/* ── Step 1: Phone ── */}
                            {step === "phone" && (
                                <motion.div key="phone" variants={SLIDE} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22 }}>
                                    <form
                                        onSubmit={(e) => { e.preventDefault(); sendOtp(); }}
                                        className="space-y-4"
                                    >
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-600 ml-1">Phone Number</label>
                                            <div className="relative">
                                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                                                    <Phone size={14} className="text-gray-300" />
                                                    <span className="text-sm font-semibold text-gray-400 border-r border-gray-200 pr-2">+91</span>
                                                </div>
                                                <input
                                                    id="phone"
                                                    type="tel"
                                                    inputMode="numeric"
                                                    maxLength={10}
                                                    required
                                                    autoFocus
                                                    value={phone}
                                                    onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }}
                                                    placeholder="98765 43210"
                                                    className="w-full h-12 pl-[5.5rem] pr-4 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-800 placeholder:text-gray-300 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-primary-normal/20 focus:border-primary-normal transition-all tracking-widest"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading || phone.length !== 10}
                                            className="w-full h-11 rounded-2xl bg-primary-normal text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 shadow-sm shadow-primary-light-active"
                                        >
                                            {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>Send OTP</span><ArrowRight size={15} /></>}
                                        </button>
                                    </form>
                                </motion.div>
                            )}

                            {/* ── Step 2: OTP ── */}
                            {step === "otp" && (
                                <motion.div key="otp" variants={SLIDE} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22 }}>
                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="text-xs font-semibold text-gray-600">Enter 6-digit OTP</label>
                                                <div className="flex items-center gap-1 text-[0.6rem] text-gray-400">
                                                    <KeyRound size={10} />
                                                    <span>Expires in 5 min</span>
                                                </div>
                                            </div>
                                            <OtpInput value={otp} onChange={(v) => { setOtp(v); setError(""); }} />
                                        </div>

                                        <button
                                            onClick={verifyOtp}
                                            disabled={loading || otp.join("").length !== 6}
                                            className="w-full h-11 rounded-2xl bg-primary-normal text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 shadow-sm shadow-primary-light-active"
                                        >
                                            {loading ? <Loader2 size={16} className="animate-spin" /> : "Verify & Sign In"}
                                        </button>

                                        <div className="flex items-center justify-between">
                                            <button
                                                onClick={() => { setStep("phone"); setOtp(Array(6).fill("")); setError(""); }}
                                                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                <ChevronLeft size={13} /> Change number
                                            </button>
                                            <button
                                                onClick={resendOtp}
                                                disabled={resendTimer > 0 || loading}
                                                className="flex items-center gap-1 text-xs font-semibold text-primary-normal disabled:text-gray-300 transition-colors"
                                            >
                                                <RefreshCw size={11} className={resendTimer > 0 ? "" : "group-hover:rotate-180 transition-transform"} />
                                                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <p className="text-center text-[0.65rem] text-gray-400 mt-4">
                    Only accounts with admin role can sign in.
                </p>
                <p className="text-center text-[0.6rem] text-gray-300 mt-1">
                    © {new Date().getFullYear()} Unzolo · Admin Portal
                </p>
            </motion.div>
        </div>
    );
}

// ─── Default export wrapped in Suspense ───────────────────────────────────────

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}
