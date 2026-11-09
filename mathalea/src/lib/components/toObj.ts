export function toObject(m: Map<string, unknown>): Record<string, unknown> {
  const lo: Record<string, unknown> = {}
  for (const [k, v] of m) {
    if (v instanceof Map) {
      lo[k] = toObject(v)
    } else {
      lo[k] = v
    }
  }
  return lo
}
