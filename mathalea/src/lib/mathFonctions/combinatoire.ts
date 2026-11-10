export function combinations(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  if (k === 0 || k === n) return 1
  let res = 1
  for (let i = 1; i <= k; i++) {
    res = (res * (n - i + 1)) / i
  }
  return res
}
