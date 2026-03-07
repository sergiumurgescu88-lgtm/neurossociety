export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "$0.00";
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sign = value > 0 ? "+$" : value < 0 ? "-$" : "$";
  return `${sign}${formatted}`;
}

export function formatCurrencyPlain(value: number | null | undefined): string {
  if (value == null) return "$0.00";
  return "$" + Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null) return "0.00%";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null) return "0";
  return value.toLocaleString("en-US");
}

export function timeAgo(date: Date | string | null | undefined): string {
  if (!date) return "Never";
  const now = new Date();
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (seconds < 5) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
