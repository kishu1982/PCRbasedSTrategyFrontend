"use client";

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  busy = false,
  error,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  busy?: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-6 space-y-4">
        <h2 className="text-lg font-bold">{title}</h2>
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          {message}
        </div>
        {error && <p className="text-sm text-rose-500 break-all">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-sm disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-medium disabled:opacity-60"
          >
            {busy ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
