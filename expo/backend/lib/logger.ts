type Level = "info" | "warn" | "error";

export function log(
  level: Level,
  service: string,
  message: string,
  meta?: Record<string, unknown>
): void {
  const entry: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    level,
    service,
    message,
  };
  if (meta) Object.assign(entry, meta);
  console.log(JSON.stringify(entry));
}
