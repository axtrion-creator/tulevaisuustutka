export function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("fi-FI", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}
