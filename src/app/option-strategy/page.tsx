"use client";
import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { deleteConfig, getConfigs, getLive } from "@/lib/api";
import { LiveStrategy, PcrConfig } from "@/lib/types";
import ConfigForm from "@/components/ConfigForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import StrategyCard from "@/components/StrategyCard";
import { cn } from "@/lib/utils";

type FormState = null | { mode: "add" } | { mode: "edit"; config: PcrConfig };

export default function OptionStrategyPage() {
  const [configs, setConfigs] = useState<PcrConfig[]>([]);
  const [live, setLive] = useState<LiveStrategy[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [form, setForm] = useState<FormState>(null);

  // delete flow
  const [toDelete, setToDelete] = useState<PcrConfig | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const load = useCallback(async (manual = false) => {
    if (manual) setSpinning(true);
    const [c, l] = await Promise.allSettled([getConfigs(), getLive()]);
    if (c.status === "fulfilled") setConfigs(c.value);
    if (l.status === "fulfilled") setLive(l.value);
    const failed = [c, l].find((r) => r.status === "rejected") as
      | PromiseRejectedResult
      | undefined;
    setError(failed ? String(failed.reason?.message ?? failed.reason) : "");
    setLoading(false);
    setSpinning(false);
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(() => load(), 10_000);
    return () => clearInterval(id);
  }, [load]);

  const liveFor = (id: string) => live.find((l) => l.configId === id);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteConfig(toDelete.id);
      setToDelete(null);
      load(true);
    } catch (err: any) {
      setDeleteError(err.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Option Strategy</h1>
          <p className="text-sm text-neutral-500">
            Auto-refreshes every 10 seconds.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => load(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-sm"
          >
            <RefreshCw className={cn("h-4 w-4", spinning && "animate-spin")} />{" "}
            Refresh
          </button>
          <button
            onClick={() => setForm({ mode: "add" })}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-black text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> Add Configuration
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-500 text-sm p-3 break-all">
          API error: {error}
        </div>
      )}

      {loading ? (
        <p className="text-neutral-500">Loading…</p>
      ) : configs.length === 0 ? (
        <p className="text-neutral-500">
          No configurations yet. Click “Add Configuration”.
        </p>
      ) : (
        configs.map((c) => (
          <StrategyCard
            key={c.id}
            config={c}
            live={liveFor(c.id)}
            onEdit={() => setForm({ mode: "edit", config: c })}
            onDelete={() => {
              setDeleteError("");
              setToDelete(c);
            }}
          />
        ))
      )}

      {form && (
        <ConfigForm
          initial={form.mode === "edit" ? form.config : undefined}
          onCancel={() => setForm(null)}
          onDone={() => {
            setForm(null);
            load(true);
          }}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete configuration?"
          message={
            <>
              Are you sure you want to delete the{" "}
              <b>
                {toDelete.contractName} · {toDelete.pcrExpiry}
              </b>{" "}
              configuration
              {toDelete.status === "ACTIVE" && (
                <span className="text-rose-500"> (it is currently ACTIVE)</span>
              )}
              ? This cannot be undone.
            </>
          }
          busy={deleting}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
