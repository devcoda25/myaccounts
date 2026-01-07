import React, { useRef, useEffect } from "react";
import { Box } from "@mui/material";

export default function OtpInput({
    value,
    onChange,
    autoFocus = false,
}: {
    value: string[];
    onChange: (next: string[]) => void;
    autoFocus?: boolean;
}) {
    const refs = useRef<Array<HTMLInputElement | null>>([]);

    useEffect(() => {
        if (!autoFocus) return;
        window.setTimeout(() => refs.current[0]?.focus(), 200);
    }, [autoFocus]);

    const setDigit = (i: number, raw: string) => {
        const d = raw.replace(/\D/g, "").slice(-1);
        const next = [...value];
        next[i] = d;
        onChange(next);
        if (d && i < next.length - 1) refs.current[i + 1]?.focus();
    };

    const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !value[i] && i > 0) refs.current[i - 1]?.focus();
    };

    const onPasteFirst = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, value.length);
        if (!text) return;
        e.preventDefault();

        const chars = text.split("");
        const next = [...value];
        for (let i = 0; i < next.length; i++) next[i] = chars[i] || "";
        onChange(next);
        const lastIndex = Math.min(next.length - 1, text.length - 1);
        window.setTimeout(() => refs.current[lastIndex]?.focus(), 0);
    };

    return (
        <Box className="grid grid-cols-6 gap-2">
            {value.map((digit, i) => (
                <Box key={i}>
                    <input
                        ref={(el) => {
                            refs.current[i] = el;
                        }}
                        value={digit}
                        onChange={(e) => setDigit(i, e.target.value)}
                        onKeyDown={(e) => onKeyDown(i, e)}
                        onPaste={i === 0 ? onPasteFirst : undefined}
                        inputMode="numeric"
                        maxLength={1}
                        className="w-full rounded-xl border border-white/10 bg-transparent px-0 py-3 text-center text-lg font-extrabold outline-none"
                        style={{
                            borderColor: "rgba(255,255,255,0.12)",
                            background: "rgba(255,255,255,0.04)",
                            color: "inherit",
                        }}
                        aria-label={`OTP digit ${i + 1}`}
                    />
                </Box>
            ))}
        </Box>
    );
}
