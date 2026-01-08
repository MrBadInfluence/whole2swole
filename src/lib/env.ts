export function getRequiredEnv(name: string): string {
  const v = (import.meta.env as any)[name] as string | undefined;
  if (!v) throw new Error(`Missing env var: ${name}. Copy .env.example to .env and fill it in.`);
  return v;
}

export function getEnv(name: string, fallback: string): string {
  const v = (import.meta.env as any)[name] as string | undefined;
  return v ?? fallback;
}
