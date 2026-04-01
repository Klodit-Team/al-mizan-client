import { useRef } from "react";

interface VerificationCodeInputProps {
  code: string[];
  disabled?: boolean;
  hasError?: boolean;
  onChange: (nextCode: string[]) => void;
}

const CODE_LENGTH = 6;

export default function VerificationCodeInput({
  code,
  disabled = false,
  hasError = false,
  onChange,
}: VerificationCodeInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const nextCode = [...code];
    nextCode[index] = value.slice(-1);
    onChange(nextCode);

    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);

    if (pasted.length === CODE_LENGTH) {
      onChange(pasted.split(""));
      inputRefs.current[CODE_LENGTH - 1]?.focus();
    }
  };

  return (
    <div className="flex justify-between gap-2" onPaste={handlePaste} dir="ltr">
      {code.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          disabled={disabled}
          className={`w-12 h-14 text-center text-lg font-bold rounded-xl border outline-none transition-all
            ${digit ? "border-[#4CAF50] bg-green-50 text-gray-900" : "border-gray-200 text-gray-900"}
            ${hasError ? "border-red-400 focus:ring-red-100" : "focus:border-[#4CAF50] focus:ring-2 focus:ring-green-100"}
            disabled:opacity-60`}
        />
      ))}
    </div>
  );
}
