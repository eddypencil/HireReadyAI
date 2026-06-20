//src\shared\ui\FormField.jsx
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function FormField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  hint,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <label className="text-xs font-medium text-muted-foreground tracking-wide">
          {label}
        </label>
        {hint && hint}
      </div>

      <div className="relative">
        <input
          type={inputType}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full h-11 rounded-xl px-4 text-sm text-foreground bg-background border border-border outline-none transition-all duration-200 placeholder:text-muted-foreground/40 focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20 ${isPassword ? "pr-12" : ""}`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer bg-transparent border-none p-0 flex items-center justify-center text-muted-foreground/60 hover:text-foreground transition-colors outline-none"
          >
            {showPassword ? (
              <Eye className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
