export class Ratio {
  values: number[]

  constructor(values: number[]) {
    if (values.length < 2) {
      throw new Error('Un ratio doit avoir au moins 2 valeurs.')
    }
    if (values.some((v) => v <= 0 || !isFinite(v))) {
      throw new Error(
        'Toutes les valeurs du ratio doivent être des nombres strictement positifs et finis.',
      )
    }
    this.values = [...values]
  }

  total(): number {
    return this.values.reduce((acc, val) => acc + val, 0)
  }

  percentages(): number[] {
    const total = this.total()
    return this.values.map((v) => (v / total) * 100)
  }

  setValue(index: number, newValue: number): void {
    if (index < 0 || index >= this.values.length) {
      throw new Error('Index hors limites.')
    }
    if (newValue <= 0 || !isFinite(newValue)) {
      throw new Error(
        'La nouvelle valeur doit être strictement positive et finie.',
      )
    }
    const scaleFactor = newValue / this.values[index]
    this.values = this.values.map((v, i) =>
      i === index ? newValue : v * scaleFactor,
    )
  }

  scale(factor: number): void {
    if (factor <= 0 || !isFinite(factor)) {
      throw new Error('Le facteur doit être strictement positif et fini.')
    }
    this.values = this.values.map((v) => v * factor)
  }

  adjustToTotal(targetTotal: number): void {
    if (targetTotal <= 0 || !isFinite(targetTotal)) {
      throw new Error('Le total cible doit être strictement positif et fini.')
    }
    const currentTotal = this.total()
    const factor = targetTotal / currentTotal
    this.scale(factor)
  }

  normalized(): number[] {
    // Pour les floats, on cherche un GCD approximatif
    const precision = 1e-8
    const scaled = this.scaleToIntegers(this.values, precision)
    const gcd = this.greatestCommonDivisor(scaled)
    return scaled.map((v) => v / gcd)
  }

  isProportionalTo(other: Ratio, epsilon: number = 1e-6): boolean {
    if (this.values.length !== other.values.length) return false

    const ratios = this.values.map((v, i) => v / other.values[i])

    // Vérifie que tous les ratios sont égaux dans la tolérance epsilon
    const firstRatio = ratios[0]
    return ratios.every((r) => Math.abs(r - firstRatio) < epsilon)
  }

  equals(other: Ratio, epsilon: number = 1e-8): boolean {
    if (this.values.length !== other.values.length) return false
    return this.values.every((v, i) => Math.abs(v - other.values[i]) < epsilon)
  }

  asString(separator: string = ':'): string {
    return this.values.join(separator)
  }

  toJSON(): number[] {
    return [...this.values]
  }

  static fromJSON(json: number[]): Ratio {
    return new Ratio(json)
  }

  toLatex(): string {
    return this.values.join(' : ')
  }

  clone(): Ratio {
    return new Ratio([...this.values])
  }

  private scaleToIntegers(values: number[], precision: number): number[] {
    const scaleFactor = this.findScaleFactor(values, precision)
    return values.map((v) => Math.round(v * scaleFactor))
  }

  private findScaleFactor(values: number[], precision: number): number {
    let maxDecimals = 0
    for (const v of values) {
      const decimals = this.countDecimals(v, precision)
      if (decimals > maxDecimals) maxDecimals = decimals
    }
    return Math.pow(10, maxDecimals)
  }

  private countDecimals(value: number, precision: number): number {
    let decimals = 0
    while (
      Math.abs(
        Math.round(value * Math.pow(10, decimals)) -
          value * Math.pow(10, decimals),
      ) > precision &&
      decimals < 10
    ) {
      decimals++
    }
    return decimals
  }

  private greatestCommonDivisor(arr: number[]): number {
    const gcdTwo = (a: number, b: number): number => {
      if (!b) return a
      return gcdTwo(b, a % b)
    }

    return arr.reduce((acc, val) => gcdTwo(acc, val))
  }
}
export function ratioFromJSON(json: number[]): Ratio {
  return Ratio.fromJSON(json)
}
export function ratioToJSON(ratio: Ratio): number[] {
  return ratio.toJSON()
}
export function ratioToLatex(ratio: Ratio): string {
  return ratio.toLatex()
}
export function ratioFromLatex(latex: string): Ratio {
  const values = latex.split(':').map((v) => parseFloat(v.trim()))
  return new Ratio(values)
}
