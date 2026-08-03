export function formatDate(value: string | Date, locale = "en") {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}
