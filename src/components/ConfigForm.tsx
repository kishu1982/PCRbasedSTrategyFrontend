"use client";
import { useState } from "react";
import { createConfig, updateConfig } from "@/lib/api";
import { ConfigInput, PcrConfig } from "@/lib/types";
import { fromPcrDate, toPcrDate } from "@/lib/date";

const CONTRACTS = ["NIFTY", "SENSEX", "GOLDM", "CRUDE"];
const PCR_EXCHANGES = ["NFO", "BFO", "MCX"];
const EXCHANGES = ["NSE", "BSE", "NFO", "BFO", "MCX"];
const MCX_TYPES = ["FUTCOM", "OPTFUT"];
const OTHER_TYPES = ["EQ", "FUTIDX", "FUTSTK", "OPTIDX", "OPTSTK"];

const DEFAULTS: ConfigInput = {
  contractName: "NIFTY",
  pcrExchange: "NFO",
  pcrExpiry: "",
  tradeExchange: "NFO",
  tradeInstrumentType: "OPTIDX",
  tradeContractName: "NIFTY",
  tradeExpiry: "",
  timeframeMinutes: 5,
  lotsPerTrade: 1,
  status: "INACTIVE",
  pcrBullishStartLevel: 1.2,
  pcrBearishStartLevel: 0.8,
  strikesAroundAtm: 0,
  side: "BUY",
  underlyingExchange: "NSE",
  underlyingToken: "26000",
};

const KEYS = [
  ...Object.keys(DEFAULTS),
  "pcrStep",
  "productType",
] as (keyof ConfigInput)[];

const inputCls =
  "w-full h-9 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 text-sm";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function Select({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      className={inputCls}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function DateField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        className={inputCls}
        value={fromPcrDate(value)}
        onChange={(e) => onChange(toPcrDate(e.target.value))}
        required
      />
      <span className="text-xs font-mono w-28 text-neutral-500">
        {value || "—"}
      </span>
    </div>
  );
}

export default function ConfigForm({
  initial,
  onDone,
  onCancel,
}: {
  initial?: PcrConfig;
  onDone: () => void;
  onCancel: () => void;
}) {
  const editing = !!initial;

  const [base] = useState<ConfigInput>(() => {
    if (!initial) return DEFAULTS;
    // const o: any = {};
    const o: any = {
      pcrBullishStartLevel: 1.2,
      pcrBearishStartLevel: 0.8,
      strikesAroundAtm: 0,
    };
    KEYS.forEach((k) => {
      if ((initial as any)[k] !== undefined) o[k] = (initial as any)[k];
    });
    return o as ConfigInput;
  });

  const [f, setF] = useState<ConfigInput>(base);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof ConfigInput>(k: K, v: ConfigInput[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  const types = f.tradeExchange === "MCX" ? MCX_TYPES : OTHER_TYPES;

  const changeTradeExchange = (v: string) => {
    const list = v === "MCX" ? MCX_TYPES : OTHER_TYPES;
    setF((p) => ({
      ...p,
      tradeExchange: v,
      tradeInstrumentType: list.includes(p.tradeInstrumentType)
        ? p.tradeInstrumentType
        : list[0],
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(f.pcrBearishStartLevel < f.pcrBullishStartLevel)) {
      setError("Bearish start level must be lower than bullish start level");
      return;
    }
    if (f.strikesAroundAtm < 0 || !Number.isInteger(f.strikesAroundAtm)) {
      setError("Strikes around ATM must be a whole number (0 = all)");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editing) {
        // PATCH only what changed
        const diff: any = {};
        KEYS.forEach((k) => {
          if (f[k] !== base[k]) diff[k] = f[k];
        });
        if (Object.keys(diff).length === 0) {
          onCancel();
          return;
        }
        await updateConfig(initial!.id, diff);
      } else {
        await createConfig(f);
      }
      onDone();
    } catch (err: any) {
      setError(err.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-3xl rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-6 space-y-5"
      >
        <h2 className="text-xl font-bold">
          {editing ? "Edit Configuration" : "Add Configuration"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Contract Name">
            <Select
              value={f.contractName}
              options={CONTRACTS}
              onChange={(v) => set("contractName", v)}
            />
          </Field>
          <Field label="PCR Exchange">
            <Select
              value={f.pcrExchange}
              options={PCR_EXCHANGES}
              onChange={(v) => set("pcrExchange", v)}
            />
          </Field>
          <Field label="PCR Expiry">
            <DateField
              value={f.pcrExpiry}
              onChange={(v) => set("pcrExpiry", v)}
            />
          </Field>

          <Field label="Trade Exchange">
            <Select
              value={f.tradeExchange}
              options={EXCHANGES}
              onChange={changeTradeExchange}
            />
          </Field>
          <Field label="Trade Instrument Type">
            <Select
              value={f.tradeInstrumentType}
              options={types}
              onChange={(v) => set("tradeInstrumentType", v)}
            />
          </Field>
          <Field label="Trade Contract Name">
            <input
              className={inputCls}
              list="contracts"
              value={f.tradeContractName}
              onChange={(e) =>
                set("tradeContractName", e.target.value.toUpperCase())
              }
              required
            />
            <datalist id="contracts">
              {CONTRACTS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>

          <Field label="Trade Expiry">
            <DateField
              value={f.tradeExpiry}
              onChange={(v) => set("tradeExpiry", v)}
            />
          </Field>
          <Field label="Timeframe (min)">
            <input
              type="number"
              min={1}
              className={inputCls}
              value={f.timeframeMinutes}
              onChange={(e) => set("timeframeMinutes", Number(e.target.value))}
            />
          </Field>
          <Field label="Lots Per Trade">
            <input
              type="number"
              min={1}
              className={inputCls}
              value={f.lotsPerTrade}
              onChange={(e) => set("lotsPerTrade", Number(e.target.value))}
            />
          </Field>

          <Field label="Status">
            <Select
              value={f.status}
              options={["INACTIVE", "ACTIVE"]}
              onChange={(v) => set("status", v as ConfigInput["status"])}
            />
          </Field>
          <Field label="Bullish Start Level (above)">
            <input
              type="number"
              step="any"
              className={inputCls}
              value={f.pcrBullishStartLevel}
              onChange={(e) =>
                set("pcrBullishStartLevel", Number(e.target.value))
              }
            />
          </Field>
          <Field label="Bearish Start Level (below)">
            <input
              type="number"
              step="any"
              className={inputCls}
              value={f.pcrBearishStartLevel}
              onChange={(e) =>
                set("pcrBearishStartLevel", Number(e.target.value))
              }
            />
          </Field>
          <Field label="Side">
            <Select
              value={f.side}
              options={["BUY", "SELL"]}
              onChange={(v) => set("side", v as ConfigInput["side"])}
            />
          </Field>

          <Field label="Underlying Exchange">
            <Select
              value={f.underlyingExchange}
              options={EXCHANGES}
              onChange={(v) => set("underlyingExchange", v)}
            />
          </Field>
          <Field label="Underlying Token">
            <input
              className={inputCls}
              value={f.underlyingToken}
              onChange={(e) => set("underlyingToken", e.target.value)}
            />
          </Field>
          <Field label="Strikes Around ATM (0 = All)">
            <input
              type="number"
              min={0}
              step={1}
              className={inputCls}
              value={f.strikesAroundAtm}
              onChange={(e) => set("strikesAroundAtm", Number(e.target.value))}
            />
          </Field>

          {editing && (
            <>
              <Field label="PCR Step">
                <input
                  type="number"
                  step="any"
                  className={inputCls}
                  value={f.pcrStep ?? ""}
                  onChange={(e) => set("pcrStep", Number(e.target.value))}
                />
              </Field>
              <Field label="Product Type">
                <input
                  className={inputCls}
                  value={f.productType ?? ""}
                  onChange={(e) => set("productType", e.target.value)}
                />
              </Field>
            </>
          )}
        </div>

        {error && <p className="text-sm text-rose-500 break-all">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-sm"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-black text-sm font-medium disabled:opacity-60"
          >
            {saving ? "Saving…" : editing ? "Update" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}
