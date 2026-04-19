import "react-phone-number-input/style.css";
import PhoneInput, { parsePhoneNumber, getCountryCallingCode } from "react-phone-number-input";
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
 * Caps the number of digits to the country's max national length
 * (prevents users from typing extra digits beyond what the country allows).
 */
export default function PhoneCountryInput({ value, onChange, defaultCountry, placeholder, className }: Props) {
  const handleChange = (next: string | undefined) => {
    if (!next) return onChange("");
    try {
      const parsed = parsePhoneNumber(next);
      if (!parsed) return onChange(next);
      // Max national digit lengths per common countries (E.164 max is 15 total)
      const maxByCountry: Record<string, number> = {
        BR: 11, US: 10, CA: 10, MX: 10, AR: 10, PT: 9, ES: 9, FR: 9,
        IT: 10, DE: 11, GB: 10, AU: 9, JP: 10, CN: 11, IN: 10, CL: 9,
        CO: 10, PE: 9, UY: 8, PY: 9, BO: 8, EC: 9, VE: 10,
      };
      const country = parsed.country || (defaultCountry?.toUpperCase() as never);
      const max = (country && maxByCountry[country as string]) || 15;
      const national = parsed.nationalNumber.toString();
      if (national.length > max) {
        const trimmed = national.slice(0, max);
        const cc = parsed.countryCallingCode || (country ? getCountryCallingCode(country as never) : "");
        return onChange(`+${cc}${trimmed}`);
      }
      onChange(next);
    } catch {
      onChange(next);
    }
  };

  return (
    <div className={cn("phone-input-wrapper", className)}>
      <PhoneInput
        international
        defaultCountry={(defaultCountry?.toUpperCase() as never) || ("US" as never)}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      />
    </div>
  );
}
