import type { UseFormRegisterReturn } from "react-hook-form";

interface LoginFieldProps {
    label: string;
    placeholder: string;
    error?: string;
    disabled?: boolean;
    registration: UseFormRegisterReturn;
}

export default function LoginField({
    label,
    placeholder,
    error,
    disabled = false,
    registration,
}: LoginFieldProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <input
                type="email"
                placeholder={placeholder}
                disabled={disabled}
                {...registration}
                className={`text-[#94A3B8] w-full px-4 py-3 rounded-xl border outline-none transition-all focus:ring-2 ${
                    error
                        ? "border-red-400 focus:ring-red-100"
                        : "border-gray-200 focus:ring-green-100 focus:border-[#4CAF50]"
                }`}
            />
            {error ? <p className="text-red-500 text-xs mt-1">{error}</p> : null}
        </div>
    );
}
