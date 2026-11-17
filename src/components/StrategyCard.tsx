import { LiveStrategy, PcrConfig } from "@/lib/types";
import { cn } from "@/lib/utils";

const n = (v: number | undefined | null, d = 2) =>
  v === undefined || v === null
    ? "-"
    : v.toLocaleString("en-IN", { maximumFractionDigits: d });

const pnlCls = (v: number) =>
  v > 0
    ? "text-emerald-600 dark:text-emerald-400"
    : v < 0
      ? "text-rose-600 dark:text-rose-400"
      : "";

/* ---------- colour tones (full class names so Tailwind keeps them) ---------- */
type Tone =
  | "neutral"
  | "sky"
  | "violet"
  | "emerald"
  | "rose"
  | "amber"
  | "indigo";

const BOX: Record<Tone, string> = {
  neutral:
    "bg-neutral-100 border-neutral-200 dark:bg-neutral-800/60 dark:border-neutral-700/60",
  sky: "bg-sky-50 border-sky-200 dark:bg-sky-500/10 dark:border-sky-500/20",
  violet:
    "bg-violet-50 border-violet-200 dark:bg-violet-500/10 dark:border-violet-500/20",
  emerald:
    "bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20",
  rose: "bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20",
  amber:
    "bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20",
  indigo:
    "bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/20",
};
const LABEL: Record<Tone, string> = {
  neutral: "text-neutral-500",
  sky: "text-sky-600 dark:text-sky-400",
  violet: "text-violet-600 dark:text-violet-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
  rose: "text-rose-600 dark:text-rose-400",
  amber: "text-amber-600 dark:text-amber-400",
  indigo: "text-indigo-600 dark:text-indigo-400",
};
const DOT: Record<Tone, string> = {
  neutral: "bg-neutral-400",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
  emerald: "bg-emerald-500",
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  indigo: "bg-indigo-500",
};
const PILL: Record<Tone, string> = {
  neutral:
    "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20",
  sky: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  violet:
    "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  emerald:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  amber:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  indigo:
    "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
};
const BAR: Record<"emerald" | "amber" | "rose", string> = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
};

const EXEC_TONE: Record<string, Tone> = {
  EXECUTED: "emerald",
  DRY_RUN: "sky",
  NOOP: "neutral",
  FAILED: "rose",
  SKIPPED: "amber",
};

function Stat({
  label,
  value,
  tone = "neutral",
  className,
}: {
  label: string;
  value: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border px-3 py-2", BOX[tone])}>
      <div
        className={cn(
          "text-[10px] font-bold uppercase tracking-wider",
          LABEL[tone],
        )}
      >
        {label}
      </div>
      <div className={cn("text-sm font-semibold break-all", className)}>
        {value}
      </div>
    </div>
  );
}

function Pill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        PILL[tone],
      )}
    >
      {children}
    </span>
  );
}

function SectionTitle({
  tone,
  children,
}: {
  tone: Tone;
  children: React.ReactNode;
}) {
  return (
    <h4
      className={cn(
        "flex items-center gap-2 text-xs font-bold uppercase tracking-wider",
        LABEL[tone],
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", DOT[tone])} />
      {children}
    </h4>
  );
}

/* ---------- PCR gauge: bearish zone | neutral band | bullish zone ---------- */
function PcrGauge({
  pcr,
  bear,
  bull,
}: {
  pcr: number | null;
  bear: number;
  bull: number;
}) {
  const MAX = 2; // gauge runs 0 .. 2
  const pct = (v: number) => Math.min(100, Math.max(0, (v / MAX) * 100));
  return (
    <div className="mt-2">
      <div className="relative h-2.5 rounded-full overflow-hidden flex">
        <div className="bg-rose-400/70" style={{ width: `${pct(bear)}%` }} />
        <div
          className="bg-amber-300/70 dark:bg-amber-400/40"
          style={{ width: `${pct(bull) - pct(bear)}%` }}
        />
        <div className="bg-emerald-400/70 flex-1" />
        {pcr != null && (
          <div
            className="absolute top-0 h-full w-1 bg-neutral-900 dark:bg-white rounded"
            style={{ left: `calc(${pct(pcr)}% - 2px)` }}
          />
        )}
      </div>
      <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
        <span>0</span>
        <span className="text-rose-500">{bear}</span>
        <span className="text-emerald-500">{bull}</span>
        <span>{MAX}+</span>
      </div>
    </div>
  );
}

export default function StrategyCard({
  config,
  live,
  onEdit,
  onDelete,
  onKill,
}: {
  config: PcrConfig;
  live?: LiveStrategy;
  onEdit: () => void;
  onDelete: () => void;
  onKill: () => void;
}) {
  const totalPnl = (live?.openPositions ?? []).reduce((s, p) => s + p.pnl, 0);
  const active = config.status === "ACTIVE";
  const bull = config.pcrBullishStartLevel ?? 1.2;
  const bear = config.pcrBearishStartLevel ?? 0.8;

  // live direction -> colour + label
  const dir = live?.lots.direction;
  const dirTone: Tone =
    dir === "ABOVE" ? "emerald" : dir === "BELOW" ? "rose" : "amber";
  const dirLabel =
    dir === "ABOVE"
      ? "Bullish"
      : dir === "BELOW"
        ? "Bearish"
        : dir === "NEUTRAL"
          ? "Neutral band"
          : "No data";

  const cov = live ? Math.round(live.feed.coverage * 100) : 0;
  const covTone = cov >= 90 ? "emerald" : cov >= 60 ? "amber" : "rose";
  const pnlTone: Tone =
    totalPnl > 0 ? "emerald" : totalPnl < 0 ? "rose" : "neutral";

  return (
    <section
      className={cn(
        "rounded-2xl border bg-white dark:bg-neutral-950 overflow-hidden shadow-sm border-l-4",
        active
          ? "border-neutral-200 dark:border-neutral-800 border-l-emerald-500"
          : "border-neutral-200 dark:border-neutral-800 border-l-neutral-400",
      )}
    >
      {/* HEADER */}
      <header className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-r from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-bold">
            {config.contractName} · {config.pcrExpiry}
          </h3>
          <Pill tone={active ? "emerald" : "neutral"}>
            {active ? (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            ) : (
              <span className="h-2 w-2 rounded-full bg-neutral-400" />
            )}
            {config.status}
          </Pill>
          <Pill tone={config.side === "BUY" ? "sky" : "rose"}>
            {config.side}
          </Pill>
          <Pill tone="violet">{config.tradeInstrumentType}</Pill>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onKill}
            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-sm font-medium shadow-sm"
          >
            Kill Switch
          </button>
          <button
            onClick={onEdit}
            className="px-3 py-1.5 rounded-lg border border-sky-500/40 text-sky-600 dark:text-sky-400 hover:bg-sky-500/10 text-sm"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/40 text-sm"
          >
            Delete
          </button>
        </div>
      </header>

      {/* CONFIG */}
      <div className="p-4 space-y-4">
        <SectionTitle tone="indigo">Configuration</SectionTitle>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* PCR source */}
          <div className="rounded-xl bg-sky-50/50 dark:bg-sky-500/5 border border-sky-100 dark:border-sky-500/10 p-3 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              PCR source
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Stat
                tone="sky"
                label="PCR Exchange"
                value={config.pcrExchange}
              />
              <Stat
                tone="sky"
                label="Underlying"
                value={`${config.underlyingExchange}:${config.underlyingToken}`}
              />
              <Stat
                tone="sky"
                label="Strikes Around ATM"
                value={
                  config.strikesAroundAtm
                    ? `±${config.strikesAroundAtm} (${config.strikesAroundAtm * 2 + 1} strikes)`
                    : "All strikes"
                }
              />
              <Stat
                tone="sky"
                label="Timeframe"
                value={`${config.timeframeMinutes} min`}
              />
            </div>
          </div>

          {/* Trade */}
          <div className="rounded-xl bg-violet-50/50 dark:bg-violet-500/5 border border-violet-100 dark:border-violet-500/10 p-3 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              Trade
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Stat
                tone="violet"
                label="Trade Exchange"
                value={config.tradeExchange}
              />
              <Stat
                tone="violet"
                label="Trade Contract"
                value={config.tradeContractName}
              />
              <Stat
                tone="violet"
                label="Trade Expiry"
                value={config.tradeExpiry}
              />
              <Stat
                tone="violet"
                label="Product"
                value={config.productType ?? "-"}
              />
            </div>
          </div>

          {/* Entry levels + sizing */}
          <div className="rounded-xl bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 p-3 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Entry levels & sizing
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Stat
                tone="emerald"
                label="Bullish above"
                value={bull}
                className="text-emerald-700 dark:text-emerald-300 text-base"
              />
              <Stat
                tone="rose"
                label="Bearish below"
                value={bear}
                className="text-rose-700 dark:text-rose-300 text-base"
              />
              <Stat
                tone="amber"
                label="PCR Step"
                value={config.pcrStep ?? "-"}
              />
              <Stat
                tone="amber"
                label="Lots / Trade"
                value={config.lotsPerTrade}
              />
            </div>
          </div>
        </div>
        <p className="text-[11px] text-neutral-500">
          Updated {new Date(config.updatedAt).toLocaleString("en-IN")}
        </p>
      </div>

      {/* LIVE */}
      <div className="p-4 pt-0 space-y-4">
        <SectionTitle tone="emerald">Live strategy</SectionTitle>

        {!live ? (
          <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 p-4 text-sm text-neutral-500">
            No live data for this configuration (strategy not running).
          </div>
        ) : (
          <>
            {/* HERO ROW: PCR + OI + underlying */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div
                className={cn(
                  "rounded-xl border p-3 md:col-span-2",
                  BOX[dirTone],
                )}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      LABEL[dirTone],
                    )}
                  >
                    PCR
                  </div>
                  <Pill tone={dirTone}>{dirLabel}</Pill>
                </div>
                <div className="text-3xl font-bold mt-1">{live.pcr ?? "-"}</div>
                <PcrGauge
                  pcr={live.pcr ?? null}
                  bear={live.pcrBearishStartLevel ?? bear}
                  bull={live.pcrBullishStartLevel ?? bull}
                />
                <div className="mt-2 text-xl text-purple-800 dark:text-neutral-400">
                  Lots: <b>{live.lots.pcrLots}</b> × {live.lots.lotsPerTrade} ={" "}
                  <b>{live.lots.targetLots}</b> Target lots
                </div>
              </div>

              <div className="grid grid-rows-2 gap-3">
                <Stat
                  tone="rose"
                  label="Call OI (resistance)"
                  value={n(live.totalCallOi, 0)}
                />
                <Stat
                  tone="emerald"
                  label="Put OI (support)"
                  value={n(live.totalPutOi, 0)}
                />
              </div>

              <div className="grid grid-rows-2 gap-3">
                <Stat
                  tone="sky"
                  label="Underlying LTP"
                  value={n(live.underlying?.ltp)}
                  className="text-base"
                />
                <Stat
                  tone={pnlTone}
                  label="Total PnL"
                  value={n(totalPnl)}
                  className={cn("text-base", pnlCls(totalPnl))}
                />
              </div>
            </div>

            {/* SECOND ROW */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              <Stat
                tone="violet"
                label="Option Type"
                value={live.optionType ?? "-"}
              />
              <Stat
                tone="violet"
                label="Contract To Trade"
                value={
                  live.contractToTrade?.tradingSymbol ??
                  live.contractReason ??
                  "-"
                }
              />
              <Stat
                tone="indigo"
                label="Open Lots"
                value={live.totalOpenLots}
              />
              <Stat
                tone={live.positionsOk ? "emerald" : "rose"}
                label="Positions OK"
                value={live.positionsOk ? "Yes" : "No"}
              />
              <div
                className={cn(
                  "rounded-xl border px-3 py-2 col-span-2",
                  BOX[covTone],
                )}
              >
                <div
                  className={cn(
                    "flex justify-between text-[10px] font-bold uppercase tracking-wider",
                    LABEL[covTone],
                  )}
                >
                  <span>Feed coverage</span>
                  <span>
                    {live.feed.received}/{live.feed.totalStrikes} · {cov}%
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", BAR[covTone])}
                    style={{ width: `${cov}%` }}
                  />
                </div>
              </div>
            </div>

            {/* POSITIONS */}
            <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
              <table className="w-full text-sm">
                <thead className="bg-indigo-50 dark:bg-indigo-500/10 text-xs uppercase text-indigo-600 dark:text-indigo-400">
                  <tr>
                    {[
                      "Symbol",
                      "Type",
                      "Net Qty",
                      "Net Lots",
                      "Avg Price",
                      "LTP",
                      "PnL",
                    ].map((h) => (
                      <th key={h} className="px-3 py-2 text-left">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {live.openPositions.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-3 py-4 text-center text-neutral-500"
                      >
                        No open positions
                      </td>
                    </tr>
                  )}
                  {live.openPositions.map((p) => (
                    <tr
                      key={p.token}
                      className={cn(
                        "border-t border-neutral-200 dark:border-neutral-800",
                        p.pnl > 0
                          ? "bg-emerald-50/50 dark:bg-emerald-500/5"
                          : p.pnl < 0
                            ? "bg-rose-50/50 dark:bg-rose-500/5"
                            : "",
                      )}
                    >
                      <td className="px-3 py-2 font-semibold">
                        {p.tradingSymbol}
                      </td>
                      <td className="px-3 py-2">
                        {p.optType ? (
                          <Pill tone={p.optType === "CE" ? "emerald" : "rose"}>
                            {p.optType}
                          </Pill>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td
                        className={cn(
                          "px-3 py-2 font-medium",
                          p.netQty > 0
                            ? "text-sky-600 dark:text-sky-400"
                            : "text-pink-600 dark:text-pink-400",
                        )}
                      >
                        {p.netQty > 0 ? "+" : ""}
                        {p.netQty}
                      </td>
                      <td className="px-3 py-2">{p.netLots}</td>
                      <td className="px-3 py-2">{n(p.avgPrice)}</td>
                      <td className="px-3 py-2">{n(p.ltp)}</td>
                      <td className={cn("px-3 py-2 font-bold", pnlCls(p.pnl))}>
                        {n(p.pnl)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* LAST EXECUTION */}
            {live.lastExecution && (
              <div
                className={cn(
                  "rounded-xl border p-3 text-sm space-y-1.5",
                  BOX[EXEC_TONE[live.lastExecution.status] ?? "neutral"],
                )}
              >
                <div className="flex flex-wrap items-center gap-2 font-semibold">
                  <Pill
                    tone={EXEC_TONE[live.lastExecution.status] ?? "neutral"}
                  >
                    {live.lastExecution.status}
                  </Pill>
                  <span>
                    {new Date(live.lastExecution.at).toLocaleString("en-IN")} ·
                    PCR {live.lastExecution.pcr} · held{" "}
                    {live.lastExecution.heldLots}/
                    {live.lastExecution.targetLots} lots
                  </span>
                </div>

                {live.lastExecution.error && (
                  <div className="text-rose-500 break-all">
                    {live.lastExecution.error}
                  </div>
                )}

                {(live.lastExecution.results ?? []).map((r, i) => (
                  <div
                    key={i}
                    className="flex flex-wrap items-center gap-x-4 gap-y-1 text-neutral-700 dark:text-neutral-300"
                  >
                    <span
                      className={cn(
                        "font-semibold",
                        r.side === "B"
                          ? "text-sky-600 dark:text-sky-400"
                          : "text-pink-600 dark:text-pink-400",
                      )}
                    >
                      {r.side === "B" ? "BUY" : "SELL"} {r.quantity}{" "}
                      {r.tradingSymbol}
                    </span>
                    <span>@ {r.price ?? "-"}</span>
                    <span className="text-neutral-500">{r.reason}</span>
                    <Pill tone={r.ok ? "emerald" : "rose"}>
                      {r.ok ? `OK #${r.orderNo}` : "FAILED"}
                    </Pill>
                  </div>
                ))}

                {!live.lastExecution.results?.length &&
                  (live.lastExecution.plan ?? []).map((p, i) => (
                    <div
                      key={i}
                      className="flex flex-wrap gap-x-4 text-neutral-700 dark:text-neutral-300"
                    >
                      <span
                        className={cn(
                          "font-semibold",
                          p.side === "B"
                            ? "text-sky-600 dark:text-sky-400"
                            : "text-pink-600 dark:text-pink-400",
                        )}
                      >
                        Plan: {p.side === "B" ? "BUY" : "SELL"} {p.quantity}{" "}
                        {p.tradingSymbol}
                      </span>
                      <span className="text-neutral-500">{p.reason}</span>
                    </div>
                  ))}
              </div>
            )}

            <p className="text-xs text-neutral-500">
              Live updated: {new Date(live.updatedAt).toLocaleString("en-IN")}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
