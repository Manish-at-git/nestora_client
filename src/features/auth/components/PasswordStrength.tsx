import React, { useMemo } from "react";

export interface PasswordStrengthProps {
  value?: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ value = "" }) => {
  const { score, label, color } = useMemo(() => {
    let s = 0;
    if (value.length >= 8) s += 25;
    if (/[A-Z]/.test(value)) s += 25;
    if (/\d/.test(value)) s += 25;
    if (/[^A-Za-z0-9]/.test(value)) s += 25;
    if (value.length >= 12) s = Math.min(100, s + 10);

    let l = "Too short";
    let c = "#B94A48";
    if (s >= 100) {
      l = "Strong";
      c = "#3C6E47";
    } else if (s >= 75) {
      l = "Good";
      c = "#7A5A1C";
    } else if (s >= 50) {
      l = "Fair";
      c = "#C05A46";
    }
    return { score: s, label: l, color: c };
  }, [value]);

  return (
    <div className="mt-2" data-testid="password-strength">
      <div className="h-1.5 w-full bg-line rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${score}%`, background: `linear-gradient(90deg, #C05A46, ${color})` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-xs" style={{ color: "#686864" }}>
        <span>Password strength</span>
        <span style={{ color }}>{label}</span>
      </div>
    </div>
  );
};

export default PasswordStrength;
