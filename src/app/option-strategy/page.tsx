"use client";
import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { deleteConfig, getConfigs, getLive, killConfig } from "@/lib/api";
import { LiveStrategy, PcrConfig } from "@/lib/types";
import ConfigForm from "@/components/ConfigForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import StrategyCard from "@/components/StrategyCard";
import { cn } from "@/lib/utils";
import { useTradeAlert } from "@/lib/useTradeAlert";

type FormState = null | { mode: "add" } | { mode: "edit"; config: PcrConfig };

export default function OptionStrategyPage() {
  const [configs, setConfigs] = useState<PcrConfig[]>([]);
  const [live, setLive] = useState<LiveStrategy[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [form, setForm] = useState<FormState>(null);

  // for alerts
  const [soundOn, setSoundOn] = useState(false);
  const { unlock, playAlert } = useTradeAlert(live, soundOn);

  // delete flow
  const [toDelete, setToDelete] = useState<PcrConfig | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // kill switch flow
  const [toKill, setToKill] = useState<PcrConfig | null>(null);
  const [killing, setKilling] = useState(false);
  const [killError, setKillError] = useState("");
  const [killMsg, setKillMsg] = useState("");

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

  // for sound alerts, play a sound if any config's totalOpenLots changed since last load
  useEffect(() => {
    setSoundOn(localStorage.getItem("tradeSound") === "1");
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    localStorage.setItem("tradeSound", next ? "1" : "0");
    if (next) {
      unlock(); // user click → allowed to play audio
      playAlert(); // test ring so you know it works
    }
  };

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
  const confirmKill = async () => {
    if (!toKill) return;
    setKilling(true);
    setKillError("");
    try {
      const res = await killConfig(toKill.id);
      if (res.status === "FAILED") {
        // config is already INACTIVE; keep the dialog open so the user can retry
        const bad = res.orders.filter((o) => o.ok === false);
        setKillError(
          res.reason ??
            bad.map((o) => `${o.tradingSymbol}: ${o.error}`).join("; ") ??
            "Some orders failed",
        );
        load(true);
        return;
      }
      const label =
        res.status === "NOOP"
          ? "No open positions to close."
          : res.status === "DRY_RUN"
            ? `Dry run: ${res.orders.length} closing order(s) planned, nothing sent (execution disabled).`
            : `${res.orders.length} closing order(s) placed.`;
      setKillMsg(
        `${toKill.contractName} · ${toKill.pcrExpiry}: ${label} Configuration set to INACTIVE.`,
      );
      setToKill(null);
      load(true);
    } catch (err: any) {
      setKillError(err.message || "Kill failed");
    } finally {
      setKilling(false);
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
            onClick={toggleSound}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm",
              soundOn
                ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                : "border-neutral-300 dark:border-neutral-700",
            )}
          >
            {soundOn ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
            Sound {soundOn ? "On" : "Off"}
          </button>
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

      {killMsg && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 text-sm p-3 flex justify-between gap-3">
          <span>{killMsg}</span>
          <button onClick={() => setKillMsg("")} className="font-semibold">
            ✕
          </button>
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
            onKill={() => {
              setKillError("");
              setToKill(c);
            }}
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

      {toKill && (
        <ConfirmDialog
          title="Kill switch"
          message={
            <>
              Are you sure you want to close <b>all open positions</b> and set{" "}
              <b>
                {toKill.contractName} · {toKill.pcrExpiry}
              </b>{" "}
              to INACTIVE?
            </>
          }
          busy={killing}
          error={killError}
          onConfirm={confirmKill}
          onCancel={() => setToKill(null)}
        />
      )}
    </div>
  );
}
