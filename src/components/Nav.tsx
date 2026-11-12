"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { refreshInstruments } from "@/lib/api";

const links = [
  { href: "/trade-data", label: "Trade Data" },
  { href: "/option-strategy", label: "Option Strategy" },
];

type Result = null | { ok: boolean; text: string };

export default function Nav() {
  const path = usePathname();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result>(null);

  // hide the success/error message after a few seconds
  useEffect(() => {
    if (!result) return;
    const t = setTimeout(() => setResult(null), result.ok ? 4000 : 8000);
    return () => clearTimeout(t);
  }, [result]);

  const updateInstruments = async () => {
    if (busy) return;
    setBusy(true);
    setResult(null);
    try {
      await refreshInstruments();
      setResult({ ok: true, text: "Instruments updated" });
    } catch (err: any) {
      setResult({ ok: false, text: err?.message || "Update failed" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <nav className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center gap-6">
        <span className="font-bold">PCR Strategy</span>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "text-sm font-medium px-3 py-1.5 rounded-lg",
              path.startsWith(l.href)
                ? "bg-neutral-900 text-white dark:bg-white dark:text-black"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800",
            )}
          >
            {l.label}
          </Link>
        ))}

        {/* right side */}
        <div className="ml-auto flex items-center gap-3">
          {result && (
            <span
              title={result.text}
              className={cn(
                "text-xs max-w-[240px] truncate",
                result.ok ? "text-emerald-500" : "text-rose-500",
              )}
            >
              {result.text}
            </span>
          )}
          <button
            onClick={updateInstruments}
            disabled={busy}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-60"
          >
            <RefreshCw className={cn("h-4 w-4", busy && "animate-spin")} />
            {busy ? "Updating…" : "Update Instruments"}
          </button>
        </div>
      </div>
    </nav>
  );
}
