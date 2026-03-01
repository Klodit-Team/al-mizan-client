"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "next/navigation";
import { type Locale } from "@/i18n/config";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema, type LoginFormData } from "@/lib/validations/loginSchema";

export default function LoginForm() {
    const params = useParams();
    const locale = (params?.locale as Locale) || "fr";
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        console.log(data);

    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4" style={{ backgroundColor: "#4CAF50" }}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
                    <p className="text-sm text-gray-500 mt-1">Sign in to your elMizane account</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            {...register("email")}
                            type="email"
                            placeholder="you@example.com"
                            className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 ${errors.email
                                ? "border-red-400 focus:ring-red-100"
                                : "border-gray-200 focus:ring-green-100 focus:border-[#4CAF50]"
                                }`}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                        )}
                    </div>


                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <a href={`/${locale}/auth/forgot-password`} className="text-xs font-medium" style={{ color: "#4CAF50" }}>
                                Forgot password?
                            </a>
                        </div>
                        <div className="relative">
                            <input
                                {...register("password")}
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 pr-11 ${errors.password
                                    ? "border-red-400 focus:ring-red-100"
                                    : "border-gray-200 focus:ring-green-100 focus:border-[#4CAF50]"
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? (

                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (

                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                        )}
                    </div>


                    <div className="flex items-center gap-2">
                        <input
                            {...register("rememberMe")}
                            type="checkbox"
                            id="rememberMe"
                            className="w-4 h-4 rounded border-gray-300 accent-[#4CAF50] cursor-pointer"
                        />
                        <label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer select-none">
                            Remember me
                        </label>
                    </div>


                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                        style={{ backgroundColor: "#4CAF50" }}
                    >
                        {isSubmitting ? "Signing in..." : "Sign In →"}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Don't have an account?{" "}
                    <a href={`/${locale}/auth/register`} className="font-semibold" style={{ color: "#4CAF50" }}>
                        Create one
                    </a>
                </p>
            </div>
        </div>
    );
}