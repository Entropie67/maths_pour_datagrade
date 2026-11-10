/** Coupures en fractions de la hauteur originale, par image et par partie. */
export type ExerciseImageCuts = {
  enonce?: number[][]
  correction?: number[][]
}

export function normalizeImageCuts(value: unknown): number[][] {
  if (!Array.isArray(value)) return []
  return value.map((cuts) =>
    Array.isArray(cuts)
      ? [
          ...new Set(
            cuts
              .filter(
                (n): n is number =>
                  typeof n === 'number' && Number.isFinite(n) && n > 0 && n < 1,
              )
              .map((n) => Math.round(n * 10000) / 10000),
          ),
        ]
          .filter((n) => n > 0 && n < 1)
          .sort((a, b) => a - b)
      : [],
  )
}

/** Le recadrage garde les octets originaux : même rendu en aperçu et en PDF. */
export const IMAGE_SLICE_HELPER = `#let mathalea-image-slice(body, start, end, zoom: 1.0) = layout(size => {
  let natural = measure(body)
  let factor = calc.min(1.0, size.width / natural.width) * zoom
  let height = natural.height * factor
  block(width: natural.width * factor, height: height * (end - start), breakable: false, clip: true, above: 0pt, below: 0pt)[
    #place(top + left, dy: -height * start, scale(factor * 100%, origin: top + left, reflow: true, box(width: natural.width, height: natural.height, body)))
  ]
})`

export function applyImageCuts(
  code: string,
  value: number[][] | undefined,
  num: number,
  part: keyof ExerciseImageCuts,
): string {
  const cuts = normalizeImageCuts(value)
  if (!cuts.some((list) => list.length > 0)) return code
  let index = 0
  const body = code.replace(
    /#mathalea-fit\((fig-\d+)(, zoom: [\w.-]+)?\)|\[image non convertie\]/g,
    (original, figure: string | undefined, zoom: string = '') => {
      const points = cuts[index++] ?? []
      // Une image indisponible garde son index : ne pas recadrer la suivante à sa place.
      if (figure == null || points.length === 0) return original
      const bounds = [0, ...points, 1]
      return bounds
        .slice(1)
        .map(
          (end, i) =>
            `#mathalea-image-slice(${figure}, ${bounds[i]}, ${end}${zoom})`,
        )
        .join('\n\n')
    },
  )
  return `// mathalea:image-cuts(${num},${part}) ${JSON.stringify(cuts)}\n${body}`
}

export function harvestImageCuts(
  code: string,
): Record<number, ExerciseImageCuts> {
  const result: Record<number, ExerciseImageCuts> = {}
  for (const match of code.matchAll(
    /^\s*\/\/ mathalea:image-cuts\((\d+),(enonce|correction)\) (.+)$/gm,
  )) {
    try {
      const cuts = normalizeImageCuts(JSON.parse(match[3]))
      if (cuts.some((list) => list.length > 0)) {
        ;(result[Number(match[1])] ??= {})[
          match[2] as keyof ExerciseImageCuts
        ] = cuts
      }
    } catch {
      // Un commentaire édité à la main ne doit pas bloquer la fiche.
    }
  }
  return result
}
