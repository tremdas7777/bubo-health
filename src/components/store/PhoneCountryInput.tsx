import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (value: string) => void;
  defaultCountry?: string;
  placeholder?: string;
  className?: string;
}

/**
 * International phone input with flag selector and E.164 validation.
 * Themed to match the design system (uses input tokens).
 */
export default function PhoneCountryInput({ value, onChange, defaultCountry, placeholder, className }: Props) {
  return (
    <div className={cn("phone-input-wrapper", className)}>
      <PhoneInput
        international
        defaultCountry={(defaultCountry?.toUpperCase() as never) || ("US" as never)}
        value={value}
        onChange={(v) => onChange(v || "")}
        placeholder={placeholder}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      />
    </div>
  );
}
