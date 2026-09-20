import React, { useEffect, useRef, useState } from "react";

export interface CodeInputProps {
  length?: number;
  value?: string;
  onChange?: (val: string) => void;
  testIdPrefix?: string;
}

export const CodeInput: React.FC<CodeInputProps> = ({
  length = 8,
  value = "",
  onChange,
  testIdPrefix = "access-code-input",
}) => {
  const [chars, setChars] = useState<string[]>(
    Array.from({ length }, (_, i) => value?.[i] || "")
  );
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setChars((prev) => {
      const filled = Array.from({ length }, (_, i) => value?.[i] || "");
      if (filled.join("") === prev.join("")) return prev;
      return filled;
    });
  }, [value, length]);

  const notify = (arr: string[]) => onChange && onChange(arr.join(""));

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.toUpperCase().replace(/[^A-Z0-9\-!@#$%^&*]/g, "");
    const next = [...chars];
    if (v.length <= 1) {
      next[i] = v;
      setChars(next);
      notify(next);
      if (v && i < length - 1) refs.current[i + 1]?.focus();
    } else {
      const arr = v.split("").slice(0, length - i);
      arr.forEach((ch, k) => (next[i + k] = ch));
      setChars(next);
      notify(next);
      const last = Math.min(i + arr.length, length - 1);
      refs.current[last]?.focus();
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !chars[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < length - 1) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const paste = (e.clipboardData.getData("text") || "")
      .toUpperCase()
      .replace(/[^A-Z0-9\-!@#$%^&*]/g, "")
      .slice(0, length);
    const next = Array.from({ length }, (_, i) => paste[i] || "");
    setChars(next);
    notify(next);
    const last = Math.min(paste.length, length) - 1;
    if (last >= 0) refs.current[last]?.focus();
  };

  return (
    <div
      className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 flex-nowrap max-w-full py-1"
      data-testid="access-code-input-group"
      onPaste={handlePaste}
    >
      {chars.map((c, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="code-tile"
          value={c}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          maxLength={1}
          data-testid={`${testIdPrefix}-${i + 1}`}
          aria-label={`Code character ${i + 1}`}
        />
      ))}
    </div>
  );
};

export default CodeInput;
