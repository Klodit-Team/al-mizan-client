"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useParams, usePathname, useSearchParams } from "next/navigation";
import { type Locale } from "@/i18n/config";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { registerSchema, type RegisterFormData } from "@/lib/validations/registerSchema";
import { useRegisterMutation } from "@/services/auth/queries";
import { ApiClientError } from "@/services/client";

import type { getAuthDictionary } from "@/i18n/get-dictionaries";

type AuthDict = Awaited<ReturnType<typeof getAuthDictionary>>;

type RegistrationRole = "SERVICE_CONTRACTANT" | "OPERATEUR_ECONOMIQUE";

const resolveRegistrationRole = (rawRole: string): RegistrationRole => {
    const normalized = rawRole
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\s-]+/g, "_")
        .toUpperCase();

    if (
        normalized === "SERVICE_CONTRACTANT" ||
        normalized === "CONTRACTANT" ||
        normalized === "SERVICECONTRACTANT"
    ) {
        return "SERVICE_CONTRACTANT";
    }

    if (
        normalized === "OPERATEUR_ECONOMIQUE" ||
        normalized === "OPERATEUR" ||
        normalized === "OPERATEURECONOMIQUE" ||
        (normalized.includes("OPERATEUR") && normalized.includes("ECONOM"))
    ) {
        return "OPERATEUR_ECONOMIQUE";
    }

    // Default this public registration flow to operateur.
    return "OPERATEUR_ECONOMIQUE";
};

const organisationOperateurTypeOptions: Array<{
    value: RegisterFormData["organisationType"];
    label: string;
}> = [
    { value: "ENTREPRISE_PRIVEE", label: "Entreprise privee" },
    { value: "ENTREPRISE_PUBLIQUE", label: "Entreprise publique" },
    { value: "MINISTERE", label: "Ministere" },
    { value: "EPA", label: "EPA" },
    { value: "EPIC", label: "EPIC" },
    { value: "GROUPEMENT", label: "Groupement" },
];

const organisationContractantTypeOptions: Array<{
    value: RegisterFormData["organisationType"];
    label: string;
}> = [
    { value: "ENTREPRISE_PUBLIQUE", label: "Entreprise publique" },
    { value: "MINISTERE", label: "Ministere" },
    { value: "EPA", label: "EPA" },
    { value: "EPIC", label: "EPIC" },
    { value: "GROUPEMENT", label: "Groupement" },
];

interface RegisterFormProps {
    dict: AuthDict["register"];
    initialRole?: RegistrationRole;
}

export default function RegisterForm({ dict, initialRole }: RegisterFormProps) {
    const router = useRouter();
    const params = useParams();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const locale = (params?.locale as Locale) || "fr";
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<{ rc: File | null; nif: File | null; cnas: File | null }>({
        rc: null,
        nif: null,
        cnas: null,
    });
    const registerMutation = useRegisterMutation();
    const totalSteps = 3;
    const progress = (step / totalSteps) * 100;

    const requestedRole = searchParams.get("role") || searchParams.get("type") || "";
    const [registrationRole, setRegistrationRole] = useState<RegistrationRole>(
        initialRole || resolveRegistrationRole(requestedRole),
    );

    useEffect(() => {
        if (initialRole) {
            setRegistrationRole(initialRole);
        }
    }, [initialRole]);

    const updateRole = (nextRole: RegistrationRole) => {
        setRegistrationRole(nextRole);

        const targetPath =
            nextRole === "SERVICE_CONTRACTANT"
                ? `/${locale}/auth/register/contractant`
                : `/${locale}/auth/register/operateur`;

        if (pathname !== targetPath) {
            router.replace(targetPath);
        }
    };

    const {
        register,
        handleSubmit,
        trigger,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            organisationType: "ENTREPRISE_PRIVEE",
        },
    });

    const handleNext = async () => {
        let fields: (keyof RegisterFormData)[] = [];
        if (step === 1) {
            fields = ["legalName", "organisationType", "nif", "nis", "commercialRegister"];
        } else if (step === 2) {
            fields = [
                "firstName",
                "lastName",
                "address",
                "wilaya",
                "commune",
                "phone",
                "email",
                "password",
            ];
        }
        const isValid = await trigger(fields);
        if (isValid) setStep(step + 1);
    };
   
    const onSubmit = async (data: RegisterFormData) => {
        setApiError(null);

        try {
            // 1. Create the user in the database
            const result = await registerMutation.mutateAsync({
                email: data.email,
                password: data.password,
                role: registrationRole,
                langue: "fr",
                nom: data.lastName,
                prenom: data.firstName,
                telephone: data.phone,
                denomination: data.legalName,
                nif: data.nif,
                nis: data.nis,
                registre_commerce: data.commercialRegister,
                adresse: data.address,
                wilaya: data.wilaya,
                commune: data.commune,
                type: data.organisationType,
                ...(registrationRole === "SERVICE_CONTRACTANT"
                    ? {
                        secteur_activite: data.sectorActivity,
                        ordonnateur: data.ordonnateur,
                        code_service: "SVC-MOCK-001",
                    }
                    : {}),
            });

            // 2. Trigger the OTP Email
            await fetch('/api/v1/auth/otp/send', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: data.email }),
            });

            // 3. Redirect to the Verify page, passing the email in the URL
            router.push(`/${locale}/auth/verify?email=${encodeURIComponent(data.email)}`);
            
        } catch (error) {
            if (error instanceof ApiClientError) {
                setApiError(error.message);
                return;
            }
            setApiError("Registration failed. Please try again.");
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            router.push(`/${locale}`);
        }
    };

    const stepTitles = [dict.stepTitles["1"], dict.stepTitles["2"], dict.stepTitles["3"]];
    const stepDescs = [dict.stepSubtitles["1"], dict.stepSubtitles["2"], dict.stepSubtitles["3"]];
    const backLabels = [dict.actions.back, `← ${dict.stepTitles["1"]}`, `← ${dict.stepTitles["2"]}`];

    return (
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden mx-auto">

            {/* Header + Progress */}
            <div className="px-8 pt-6">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            {dict.step} {step} {dict.of} {totalSteps}
                        </span>
                        <h2 className="text-base font-bold text-gray-800 mt-0.5">
                            {stepTitles[step - 1]}
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {stepDescs[step - 1]}
                        </p>
                    </div>
                    <span className="text-sm font-bold" style={{ color: "#0F172A" }}>
                        {Math.round(progress)}% {dict.complete}
                    </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%`, backgroundColor: "#30E86E" }}
                    />
                </div>
            </div>

            {/* ── STEP 1 ── */}
            {step === 1 && (
                <div className="p-8 space-y-5">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                            {dict.fields.registrationRole}
                        </label>
                        <div className="grid grid-cols-2 gap-2 rounded-xl border border-gray-200 bg-gray-50 p-1">
                            <button
                                type="button"
                                onClick={() => updateRole("OPERATEUR_ECONOMIQUE")}
                                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                                    registrationRole === "OPERATEUR_ECONOMIQUE"
                                        ? "bg-white text-[#0F172A] shadow-sm"
                                        : "text-gray-500 hover:text-[#0F172A]"
                                }`}
                            >
                                {dict.fields.roleOperateurEconomique}
                            </button>
                            <button
                                type="button"
                                onClick={() => updateRole("SERVICE_CONTRACTANT")}
                                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                                    registrationRole === "SERVICE_CONTRACTANT"
                                        ? "bg-white text-[#0F172A] shadow-sm"
                                        : "text-gray-500 hover:text-[#0F172A]"
                                }`}
                            >
                                {dict.fields.roleServiceContractant}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                            {dict.fields.legalName}
                        </label>
                        <input
                            {...register("legalName")}
                            type="text"
                            placeholder={dict.fields.legalNamePlaceholder}
                            className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 text-[#94A3B8] placeholder:text-[#94A3B8] ${errors.legalName ? "border-red-400 focus:ring-red-100" : "border-gray-200 focus:ring-green-100 focus:border-[#4CAF50]"}`}
                        />
                        {errors.legalName && <p className="text-red-500 text-xs mt-1">{errors.legalName.message}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                            {dict.fields.organisationType}
                        </label>
                        <select
                            {...register("organisationType")}
                            className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 text-[#0F172A] bg-white ${errors.organisationType ? "border-red-400 focus:ring-red-100" : "border-gray-200 focus:ring-green-100 focus:border-[#4CAF50]"}`}
                        >
                            {registrationRole === "SERVICE_CONTRACTANT" && organisationContractantTypeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}

                            {registrationRole === "OPERATEUR_ECONOMIQUE" && organisationOperateurTypeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {errors.organisationType && <p className="text-red-500 text-xs mt-1">{errors.organisationType.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                                {dict.fields.nif}
                            </label>
                            <input
                                {...register("nif")}
                                type="text"
                                placeholder={dict.fields.nifPlaceholder}
                                maxLength={15}
                                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 text-[#94A3B8] placeholder:text-[#94A3B8] ${errors.nif ? "border-red-400 focus:ring-red-100" : "border-gray-200 focus:ring-green-100 focus:border-[#4CAF50]"}`}
                            />
                            {errors.nif && <p className="text-red-500 text-xs mt-1">{errors.nif.message}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                                {dict.fields.nis}
                            </label>
                            <input
                                {...register("nis")}
                                type="text"
                                placeholder={dict.fields.nisPlaceholder}
                                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 text-[#94A3B8] placeholder:text-[#94A3B8] ${errors.nis ? "border-red-400 focus:ring-red-100" : "border-gray-200 focus:ring-green-100 focus:border-[#4CAF50]"}`}
                            />
                            {errors.nis && <p className="text-red-500 text-xs mt-1">{errors.nis.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                            {dict.fields.commercialRegister}
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
                                placeholder={dict.fields.commercialRegisterPlaceholder}
                                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 text-[#94A3B8] placeholder:text-[#94A3B8] ${errors.commercialRegister ? "border-red-400 focus:ring-red-100" : "border-gray-200 focus:ring-green-100 focus:border-[#4CAF50]"}`}
                            />
                        </div>
                        {errors.commercialRegister && <p className="text-red-500 text-xs mt-1">{errors.commercialRegister.message}</p>}
                    </div>

                    <StepActions step={step} isSubmitting={isSubmitting} onBack={handleBack} onNext={handleNext} backLabel={backLabels[step - 1]} continueLabel={dict.actions.continue} processingLabel={dict.actions.processing} />
                </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
                <div className="p-8 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">{dict.fields.firstName}</label>
                            <input
                                {...register("firstName")}
                                type="text"
                                placeholder={dict.fields.firstNamePlaceholder}
                                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 text-[#94A3B8] placeholder:text-[#94A3B8] ${errors.firstName ? "border-red-400 focus:ring-red-100" : "border-gray-200 focus:ring-green-100 focus:border-[#4CAF50]"}`}
                            />
                            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">{dict.fields.lastName}</label>
                            <input
                                {...register("lastName")}
                                type="text"
                                placeholder={dict.fields.lastNamePlaceholder}
                                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 text-[#94A3B8] placeholder:text-[#94A3B8] ${errors.lastName ? "border-red-400 focus:ring-red-100" : "border-gray-200 focus:ring-green-100 focus:border-[#4CAF50]"}`}
                            />
                            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">{dict.fields.address}</label>
                        <input
                            {...register("address")}
                            type="text"
                            placeholder={dict.fields.addressPlaceholder}
                            className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 text-[#94A3B8] placeholder:text-[#94A3B8] ${errors.address ? "border-red-400 focus:ring-red-100" : "border-gray-200 focus:ring-green-100 focus:border-[#4CAF50]"}`}
                        />
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">{dict.fields.wilaya}</label>
                            <input
                                {...register("wilaya")}
                                type="text"
                                placeholder={dict.fields.wilayaPlaceholder}
                                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 text-[#94A3B8] placeholder:text-[#94A3B8] ${errors.wilaya ? "border-red-400 focus:ring-red-100" : "border-gray-200 focus:ring-green-100 focus:border-[#4CAF50]"}`}
                            />
                            {errors.wilaya && <p className="text-red-500 text-xs mt-1">{errors.wilaya.message}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">{dict.fields.commune}</label>
                            <input
                                {...register("commune")}
                                type="text"
                                placeholder={dict.fields.communePlaceholder}
                                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 text-[#94A3B8] placeholder:text-[#94A3B8] ${errors.commune ? "border-red-400 focus:ring-red-100" : "border-gray-200 focus:ring-green-100 focus:border-[#4CAF50]"}`}
                            />
                            {errors.commune && <p className="text-red-500 text-xs mt-1">{errors.commune.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">{dict.fields.phone}</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </span>
                            <input {...register("phone")} type="tel" placeholder="+213 555 123 456"
                                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 text-[#94A3B8] placeholder:text-[#94A3B8] ${errors.phone ? "border-red-400 focus:ring-red-100" : "border-gray-200 focus:ring-green-100 focus:border-[#4CAF50]"}`} />
                        </div>
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">{dict.fields.email}</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </span>
                            <input {...register("email")} type="email" placeholder="name@company.com"
                                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 text-[#94A3B8] placeholder:text-[#94A3B8] ${errors.email ? "border-red-400 focus:ring-red-100" : "border-gray-200 focus:ring-green-100 focus:border-[#4CAF50]"}`} />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">{dict.fields.password}</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </span>
                            <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="••••••••"
                                className={`w-full pl-10 pr-11 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 text-[#94A3B8] placeholder:text-[#94A3B8] ${errors.password ? "border-red-400 focus:ring-red-100" : "border-gray-200 focus:ring-green-100 focus:border-[#4CAF50]"}`} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
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
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>

                    {registrationRole === "SERVICE_CONTRACTANT" && (
                        <>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">{dict.fields.sectorActivity}</label>
                                <input
                                    {...register("sectorActivity")}
                                    type="text"
                                    placeholder={dict.fields.sectorActivityPlaceholder}
                                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 text-[#94A3B8] placeholder:text-[#94A3B8] ${errors.sectorActivity ? "border-red-400 focus:ring-red-100" : "border-gray-200 focus:ring-green-100 focus:border-[#4CAF50]"}`}
                                />
                                {errors.sectorActivity && <p className="text-red-500 text-xs mt-1">{errors.sectorActivity.message}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">{dict.fields.ordonnateur}</label>
                                <input
                                    {...register("ordonnateur")}
                                    type="text"
                                    placeholder={dict.fields.ordonnateurPlaceholder}
                                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 text-[#94A3B8] placeholder:text-[#94A3B8] ${errors.ordonnateur ? "border-red-400 focus:ring-red-100" : "border-gray-200 focus:ring-green-100 focus:border-[#4CAF50]"}`}
                                />
                                {errors.ordonnateur && <p className="text-red-500 text-xs mt-1">{errors.ordonnateur.message}</p>}
                            </div>
                        </>
                    )}


                    <div className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                        <div className="mt-0.5 text-[#4CAF50]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-700">{dict.fields.adminTitle}</p>
                            <p className="text-xs text-gray-400 leading-snug mt-0.5">{dict.fields.adminDescription}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                        <svg className="w-4 h-4 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        {dict.fields.identityVerification}
                    </div>

                    <StepActions step={step} isSubmitting={isSubmitting} onBack={handleBack} onNext={handleNext} backLabel={backLabels[step - 1]} continueLabel={dict.actions.continue} processingLabel={dict.actions.processing} />
                </div>
            )}

            {/* ── STEP 3 ── */}
            {step === 3 && (
                <form onSubmit={handleSubmit(onSubmit, (errors) => console.log("VALIDATION ERRORS:", errors))}
                     className="p-8 space-y-4">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                        <svg className="w-4 h-4 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        {dict.fields.identityVerification}
                    </div>
                    <div className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${uploadedFiles.rc ? "border-[#4CAF50] bg-green-50" : "border-gray-200 hover:border-gray-300"}`}>
                        <label className="cursor-pointer block">
                            <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={(e) => setUploadedFiles(prev => ({ ...prev, rc: e.target.files?.[0] || null }))} />
                            {uploadedFiles.rc ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs font-semibold text-gray-700">{dict.fields.rc}</p>
                                            <p className="text-xs text-gray-400 truncate max-w-45">{uploadedFiles.rc.name}</p>
                                        </div>
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-[#4CAF50] flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-xs font-semibold text-gray-700">{dict.fields.rc}</p>
                                    <p className="text-xs text-[#4CAF50] font-semibold mt-1">{dict.fields.rcScan}</p>
                                </>
                            )}
                        </label>
                    </div>

                    <div className={`border rounded-xl p-4 flex items-center justify-between transition-all ${uploadedFiles.nif ? "border-[#4CAF50] bg-green-50" : "border-gray-200"}`}>
                        <label className="cursor-pointer flex items-center gap-3 flex-1">
                            <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={(e) => setUploadedFiles(prev => ({ ...prev, nif: e.target.files?.[0] || null }))} />
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-700">{dict.fields.nif}</p>
                                <p className="text-xs text-blue-400">{uploadedFiles.nif ? uploadedFiles.nif.name : "AI extracting data..."}</p>
                            </div>
                        </label>
                        {uploadedFiles.nif && (
                            <div className="w-6 h-6 rounded-full bg-[#4CAF50] flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                    </div>

                    <div className={`border rounded-xl p-4 flex items-center justify-between transition-all ${uploadedFiles.cnas ? "border-[#4CAF50] bg-green-50" : "border-gray-200"}`}>
                        <label className="cursor-pointer flex items-center gap-3 flex-1">
                            <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={(e) => setUploadedFiles(prev => ({ ...prev, cnas: e.target.files?.[0] || null }))} />
                            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                                <svg className="w-4 h-4 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-700">{dict.fields.cnas}</p>
                                <p className="text-xs text-gray-400">{uploadedFiles.cnas ? uploadedFiles.cnas.name : "File: CNAS_Clearance_2024.pdf"}</p>
                            </div>
                        </label>
                        {uploadedFiles.cnas && (
                            <div className="w-6 h-6 rounded-full bg-[#4CAF50] flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                    </div>

                    <div className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                        <div className="mt-0.5 text-blue-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-700">{dict.fields.dataPrivacyTitle}</p>
                            <p className="text-xs text-gray-400 leading-snug mt-0.5">{dict.fields.dataPrivacyDescription}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                        <svg className="w-4 h-4 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        {dict.fields.secured}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || registerMutation.isPending}
                        className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                        style={{ backgroundColor: "#30E86E", color: "#0F172A" }}
                    >
                        {isSubmitting || registerMutation.isPending
                            ? dict.actions.processing
                            : dict.fields.submitRegistration}
                    </button>

                    {apiError && (
                        <p className="text-red-500 text-sm text-center">{apiError}</p>
                    )}

                    <div className="text-center">
                        <button type="button" onClick={handleBack} className="text-sm font-semibold text-[#64748B] hover:text-gray-700 transition-colors">
                            {backLabels[step - 1]}
                        </button>
                    </div>
                </form>
            )}

            {/* Footer */}
            <div className="border-t border-gray-100 bg-gray-50 px-8 py-4 grid grid-cols-3 gap-4">
                {[
                    { icon: "/Icon.png", title: dict.footer.secureData, desc: dict.footer.secureDataDesc },
                    { icon: "/Icon2.png", title: dict.footer.needHelp, desc: dict.footer.needHelpDesc },
                    { icon: "/Icon3.png", title: dict.footer.verification, desc: dict.footer.verificationDesc },
                ].map((item) => (
                    <div key={item.title} className="flex items-start gap-2">
                        <Image src={item.icon} alt={item.title} width={20} height={20} unoptimized className="mt-0.5" />
                        <div>
                            <p className="text-xs font-semibold text-gray-700">{item.title}</p>
                            <p className="text-xs text-gray-400 leading-snug">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function StepActions({ step, isSubmitting, onBack, onNext, backLabel, continueLabel, processingLabel }: {
    step: number;
    isSubmitting: boolean;
    onBack: () => void;
    onNext: () => void;
    backLabel: string;
    continueLabel: string;
    processingLabel: string;
}) {
    return (
        <div className="flex items-center justify-between pt-2">
            <button type="button" onClick={onBack} className="text-sm font-semibold text-[#64748B] hover:text-gray-700 flex items-center gap-1 transition-colors">
                {backLabel}
            </button>
            <button type="button" onClick={onNext} disabled={isSubmitting}
                className="px-4 py-4 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 flex items-center gap-2"
                style={{ backgroundColor: "#30E86E", color: "#0F172A" }}>
                {isSubmitting ? processingLabel : `${continueLabel} ${step + 1} →`}
            </button>
        </div>
    );
}