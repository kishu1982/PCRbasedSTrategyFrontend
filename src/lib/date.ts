const M = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

// "2026-11-17" -> "17-NOV-2026"
export const toPcrDate = (iso: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}-${M[Number(m) - 1]}-${y}`;
};

// "17-NOV-2026" -> "2026-11-17" (for <input type="date">)
export const fromPcrDate = (s: string) => {
  const m = /^(\d{2})-([A-Z]{3})-(\d{4})$/.exec(s || "");
  if (!m) return "";
  const i = M.indexOf(m[2]);
  return i < 0 ? "" : `${m[3]}-${String(i + 1).padStart(2, "0")}-${m[1]}`;
};
