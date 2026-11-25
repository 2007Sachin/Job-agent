/** User-saved rows must not be presented as a job board named Catalog. */
export function sourceLabel(source: string) {
  if (source === "Catalog" || source === "catalog") return "Saved by you";
  return source;
}
