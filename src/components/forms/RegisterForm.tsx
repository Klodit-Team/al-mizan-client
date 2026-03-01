"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "next/navigation";
import { type Locale } from "@/i18n/config";
import { zodResolver } from "@hookform/resolvers/zod";

import { registerSchema, type RegisterFormData } from "@/lib/validations/registerSchema";

export default function RegisterForm() {
    const params = useParams();
    const locale = (params?.locale as Locale) || "fr";
    const [step, setStep] = useState(1);
    const totalSteps = 3;
    const progress = (step / totalSteps) * 100;

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        console.log(data);
        // TODO: go to step 2 or connect to API
        if (step < totalSteps) setStep(step + 1);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="p-8 pb-0">
                    <h1 className="text-2xl font-bold text-gray-900">Operator Registration</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Welcome to the sovereign B2B procurement ecosystem. Register your organization to start participating in tenders.
                    </p>
                </div>

                {/* Step indicator */}
                <div className="px-8 pt-6">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Step {step} of {totalSteps}
                            </span>
                            <h2 className="text-base font-bold text-gray-800 mt-0.5">
                                {step === 1 ? "Organization Details" : step === 2 ? "Contact Information" : "Documents"}
                            </h2>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {step === 1 ? "General Information & Fiscal Identifiers" : step === 2 ? "Representative & contact details" : "Upload required documents"}
                            </p>
                        </div>
                        <span className="text-sm font-bold" style={{ color: "#4CAF50" }}>
                            {Math.round(progress)}% Complete
                        </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%`, backgroundColor: "#4CAF50" }}
                        />
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-5">
                    {/* Legal Organization Name */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                            Legal Organization Name
                        </label>
                        <input
                            {...register("legalName")}
                            type="text"
                            placeholder="e.g. Al-Mizan Solutions Ltd."
                            className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 ${errors.legalName
                                ? "border-red-400 focus:ring-red-100"
                                : "border-gray-200 focus:ring-green-100 focus:border-[#4CAF50]"
                                }`}
                        />
                        {errors.legalName && (
                            <p className="text-red-500 text-xs mt-1">{errors.legalName.message}</p>
                        )}
                    </div>

                    {/* NIF + NIS row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                                NIF <span className="normal-case font-normal">(Fiscal Identification Number)</span>
                            </label>
                            <input
                                {...register("nif")}
                                type="text"
                                placeholder="15-digit NIF code"
                                maxLength={15}
                                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 ${errors.nif
                                    ? "border-red-400 focus:ring-red-100"
                                    : "border-gray-200 focus:ring-green-100 focus:border-[#4CAF50]"
                                    }`}
                            />
                            {errors.nif && (
                                <p className="text-red-500 text-xs mt-1">{errors.nif.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                                NIS
                            </label>
                            <input
                                {...register("nis")}
                                type="text"
                                placeholder="Enter NIS"
                                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 ${errors.nis
                                    ? "border-red-400 focus:ring-red-100"
                                    : "border-gray-200 focus:ring-green-100 focus:border-[#4CAF50]"
                                    }`}
                            />
                            {errors.nis && (
                                <p className="text-red-500 text-xs mt-1">{errors.nis.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Commercial Register */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                            Commercial Register Number
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </span>
                            <input
                                {...register("commercialRegister")}
                                type="text"
                                placeholder="RC Number"
                                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 ${errors.commercialRegister
                                    ? "border-red-400 focus:ring-red-100"
                                    : "border-gray-200 focus:ring-green-100 focus:border-[#4CAF50]"
                                    }`}
                            />
                        </div>
                        {errors.commercialRegister && (
                            <p className="text-red-500 text-xs mt-1">{errors.commercialRegister.message}</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                        <button
                            type="button"
                            onClick={() => setStep(Math.max(1, step - 1))}
                            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
                        >
                            ← Back to Welcome
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 flex items-center gap-2"
                            style={{ backgroundColor: "#4CAF50" }}
                        >
                            {isSubmitting ? "Processing..." : `Continue to Step ${step + 1} →`}
                        </button>
                    </div>
                </form>

                {/* Footer info bar */}
                <div className="border-t border-gray-100 bg-gray-50 px-8 py-4 grid grid-cols-3 gap-4">
                    {[
                        { icon: "🔒", title: "Secure Data", desc: "Your organization's data is encrypted and sovereign." },
                        { icon: "❓", title: "Need Help?", desc: "Consult our registration guide for NIF/NIS details." },
                        { icon: "✅", title: "Verification", desc: "Official documents will be required in step 3." },
                    ].map((item) => (
                        <div key={item.title} className="flex items-start gap-2">
                            <span className="text-base mt-0.5">{item.icon}</span>
                            <div>
                                <p className="text-xs font-semibold text-gray-700">{item.title}</p>
                                <p className="text-xs text-gray-400 leading-snug">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}