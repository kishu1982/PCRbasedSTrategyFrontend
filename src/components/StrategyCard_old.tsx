// import { LiveStrategy, PcrConfig } from "@/lib/types";
// import { cn } from "@/lib/utils";

// const n = (v: number | undefined, d = 2) =>
//   v === undefined || v === null
//     ? "-"
//     : v.toLocaleString("en-IN", { maximumFractionDigits: d });

// const pnlCls = (v: number) =>
//   v > 0 ? "text-emerald-500" : v < 0 ? "text-rose-500" : "";

// function Stat({
//   label,
//   value,
//   className,
// }: {
//   label: string;
//   value: React.ReactNode;
//   className?: string;
// }) {
//   return (
//     <div className="rounded-lg bg-neutral-100 dark:bg-neutral-800/60 px-3 py-2">
//       <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
//         {label}
//       </div>
//       <div className={cn("text-sm font-semibold break-all", className)}>
//         {value}
//       </div>
//     </div>
//   );
// }

// export default function StrategyCard({
//   config,
//   live,
//   onEdit,
//   onDelete,
//   onKill,
// }: {
//   config: PcrConfig;
//   live?: LiveStrategy;
//   onEdit: () => void;
//   onDelete: () => void;
//   onKill: () => void;
// }) {
//   //   const totalPnl = live?.openPositions.reduce((s, p) => s + p.pnl, 0) ?? 0;
//   const totalPnl = (live?.openPositions ?? []).reduce((s, p) => s + p.pnl, 0);

//   return (
//     <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden">
//       <header className="flex items-center justify-between gap-3 p-4 border-b border-neutral-200 dark:border-neutral-800">
//         <div className="flex items-center gap-3">
//           <h3 className="text-lg font-bold">
//             {config.contractName} · {config.pcrExpiry}
//           </h3>
//           <span
//             className={cn(
//               "px-2.5 py-0.5 rounded-full text-xs font-medium border",
//               config.status === "ACTIVE"
//                 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
//                 : "bg-neutral-500/10 text-neutral-500 border-neutral-500/20",
//             )}
//           >
//             {config.status}
//           </span>
//           <span
//             className={cn(
//               "text-xs font-semibold",
//               config.side === "BUY" ? "text-sky-500" : "text-pink-500",
//             )}
//           >
//             {config.side}
//           </span>
//         </div>

//         <div className="flex gap-2">
//           <button
//             onClick={onKill}
//             className="px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-sm font-medium"
//           >
//             Kill Switch
//           </button>
//           <button
//             onClick={onEdit}
//             className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-sm"
//           >
//             Edit
//           </button>
//           <button
//             onClick={onDelete}
//             className="px-3 py-1.5 rounded-lg border border-rose-500/40 text-rose-500 hover:bg-rose-500/10 text-sm"
//           >
//             Delete
//           </button>
//         </div>
//       </header>

//       {/* CONFIG */}
//       <div className="p-4 space-y-2">
//         <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
//           Configuration
//         </h4>
//         <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
//           <Stat label="PCR Exchange" value={config.pcrExchange} />
//           <Stat label="Trade Exchange" value={config.tradeExchange} />
//           <Stat label="Instrument" value={config.tradeInstrumentType} />
//           <Stat label="Trade Contract" value={config.tradeContractName} />
//           <Stat label="Trade Expiry" value={config.tradeExpiry} />
//           <Stat label="Timeframe" value={`${config.timeframeMinutes} min`} />
//           <Stat label="Lots / Trade" value={config.lotsPerTrade} />
//           <Stat
//             label="Bullish Start (above)"
//             value={config.pcrBullishStartLevel ?? 1.2}
//           />
//           <Stat
//             label="Bearish Start (below)"
//             value={config.pcrBearishStartLevel ?? 0.8}
//           />
//           <Stat
//             label="Strikes Around ATM"
//             value={
//               config.strikesAroundAtm
//                 ? `${config.strikesAroundAtm} above / below`
//                 : "All"
//             }
//           />
//           <Stat label="PCR Step" value={config.pcrStep ?? "-"} />
//           <Stat label="Product" value={config.productType ?? "-"} />
//           <Stat
//             label="Underlying"
//             value={`${config.underlyingExchange}:${config.underlyingToken}`}
//           />
//           <Stat
//             label="Updated"
//             value={new Date(config.updatedAt).toLocaleString("en-IN")}
//           />
//         </div>
//       </div>

//       {/* LIVE */}
//       <div className="p-4 pt-0 space-y-3">
//         <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
//           Live Strategy
//         </h4>
//         {!live ? (
//           <p className="text-sm text-neutral-500">
//             No live data for this configuration (strategy not running).
//           </p>
//         ) : (
//           <>
//             <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
//               <Stat label="Underlying LTP" value={n(live.underlying.ltp)} />
//               <Stat label="PCR" value={live.pcr} />
//               <Stat label="Call OI" value={n(live.totalCallOi, 0)} />
//               <Stat label="Put OI" value={n(live.totalPutOi, 0)} />
//               <Stat label="Lots Direction" value={live.lots.direction} />
//               <Stat
//                 label="PCR Lots / Target"
//                 value={`${live.lots.pcrLots} / ${live.lots.targetLots}`}
//               />
//               <Stat label="Option Type" value={live.optionType} />
//               <Stat
//                 label="Contract To Trade"
//                 value={
//                   live.contractToTrade?.tradingSymbol ??
//                   live.contractReason ??
//                   "-"
//                 }
//               />
//               <Stat label="Open Lots" value={live.totalOpenLots} />
//               <Stat
//                 label="Positions OK"
//                 value={live.positionsOk ? "Yes" : "No"}
//                 className={
//                   live.positionsOk ? "text-emerald-500" : "text-rose-500"
//                 }
//               />
//               <Stat
//                 label="Feed Coverage"
//                 value={`${live.feed.received}/${live.feed.totalStrikes} (${Math.round(live.feed.coverage * 100)}%)`}
//               />
//               <Stat
//                 label="Total PnL"
//                 value={n(totalPnl)}
//                 className={pnlCls(totalPnl)}
//               />
//             </div>

//             <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
//               <table className="w-full text-sm">
//                 <thead className="bg-neutral-100 dark:bg-neutral-800/60 text-xs uppercase text-neutral-500">
//                   <tr>
//                     {[
//                       "Symbol",
//                       "Type",
//                       "Net Qty",
//                       "Net Lots",
//                       "Avg Price",
//                       "LTP",
//                       "PnL",
//                     ].map((h) => (
//                       <th key={h} className="px-3 py-2 text-left">
//                         {h}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {live.openPositions.length === 0 && (
//                     <tr>
//                       <td
//                         colSpan={7}
//                         className="px-3 py-4 text-center text-neutral-500"
//                       >
//                         No open positions
//                       </td>
//                     </tr>
//                   )}
//                   {live.openPositions.map((p) => (
//                     <tr
//                       key={p.token}
//                       className="border-t border-neutral-200 dark:border-neutral-800"
//                     >
//                       <td className="px-3 py-2 font-semibold">
//                         {p.tradingSymbol}
//                       </td>
//                       <td className="px-3 py-2">{p.optType}</td>
//                       <td className="px-3 py-2">{p.netQty}</td>
//                       <td className="px-3 py-2">{p.netLots}</td>
//                       <td className="px-3 py-2">{n(p.avgPrice)}</td>
//                       <td className="px-3 py-2">{n(p.ltp)}</td>
//                       <td
//                         className={cn("px-3 py-2 font-medium", pnlCls(p.pnl))}
//                       >
//                         {n(p.pnl)}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {live.lastExecution && (
//               <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 text-sm space-y-1">
//                 <div className="font-semibold">
//                   Last execution: {live.lastExecution.status} ·{" "}
//                   {new Date(live.lastExecution.at).toLocaleString("en-IN")} ·
//                   PCR {live.lastExecution.pcr} · held{" "}
//                   {live.lastExecution.heldLots}/{live.lastExecution.targetLots}{" "}
//                   lots
//                 </div>

//                 {live.lastExecution.error && (
//                   <div className="text-rose-500 break-all">
//                     {live.lastExecution.error}
//                   </div>
//                 )}

//                 {/* executed orders, if any */}
//                 {(live.lastExecution.results ?? []).map((r, i) => (
//                   <div
//                     key={i}
//                     className="flex flex-wrap gap-x-4 text-neutral-600 dark:text-neutral-400"
//                   >
//                     <span>
//                       {r.side === "B" ? "BUY" : "SELL"} {r.quantity}{" "}
//                       {r.tradingSymbol}
//                     </span>
//                     <span>@ {r.price ?? "-"}</span>
//                     <span>{r.reason}</span>
//                     <span
//                       className={r.ok ? "text-emerald-500" : "text-rose-500"}
//                     >
//                       {r.ok ? `OK #${r.orderNo}` : "FAILED"}
//                     </span>
//                   </div>
//                 ))}

//                 {/* planned orders when nothing was executed */}
//                 {!live.lastExecution.results?.length &&
//                   (live.lastExecution.plan ?? []).map((p, i) => (
//                     <div
//                       key={i}
//                       className="flex flex-wrap gap-x-4 text-neutral-600 dark:text-neutral-400"
//                     >
//                       <span>
//                         Plan: {p.side === "B" ? "BUY" : "SELL"} {p.quantity}{" "}
//                         {p.tradingSymbol}
//                       </span>
//                       <span>{p.reason}</span>
//                     </div>
//                   ))}
//               </div>
//             )}
//             <p className="text-xs text-neutral-500">
//               Live updated: {new Date(live.updatedAt).toLocaleString("en-IN")}
//             </p>
//           </>
//         )}
//       </div>
//     </section>
//   );
// }
