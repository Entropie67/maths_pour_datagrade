import type { PreviewPageGeometry } from '../shared/typstPreview'
import type { ExerciseImageCuts } from './imageCuts'
import { applyTypstSourceEdits, maskTypstLiterals } from './typstSource'

export interface ImageGeometry {
  num: number
  part: keyof ExerciseImageCuts
  page: number
  x: number
  y: number
  width: number
  height: number
}

/** Mesurer les images dans le rendu, sans ajouter ces repères aux exports. */
const IMAGE_GEOMETRY_HELPER = `#let mathalea-measured-image(body, num, part, zoom: 1.0, start: none, end: none) = layout(size => {
  let natural = measure(body);
  let factor = calc.min(1.0, size.width / natural.width) * zoom;
  let width = natural.width * factor;
  let height = natural.height * factor;
  let sliced = start != none;
  let fragment-height = if sliced { height * (end - start) } else { height };
  let marker = context {
    let position = here().position();
    [#metadata((num: num, part: part, page: position.page, x: position.x.pt(), y: position.y.pt(), width: width.pt(), height: fragment-height.pt())) <mathalea-image-geometry>]
  };
  let scaled = if factor != 1.0 { scale(factor * 100%, origin: top + left, reflow: true, body) } else { body };
  if sliced {
    block(width: width, height: fragment-height, breakable: false, clip: true, above: 0pt, below: 0pt)[
      #place(top + left, marker)
      #place(top + left, dy: -height * start, scale(factor * 100%, origin: top + left, reflow: true, box(width: natural.width, height: natural.height, body)))
    ]
  } else {
    box[#place(top + left, marker)#scaled]
  }
})`

export function withImageGeometry(source: string): string {
  const masked = maskTypstLiterals(source)
  const edits = []
  const calls =
    /#mathalea-(fit|image-slice)\((fig-\d+)(?:, ([\d.]+), ([\d.]+))?, zoom: exo-(\d+)(-corr)?-zoom\)/g
  for (const match of source.matchAll(calls)) {
    if (!masked.startsWith('#mathalea-', match.index)) continue
    const [, kind, figure, start, end, num, correction] = match
    if (kind === 'image-slice' && start == null) continue
    const part = correction ? 'correction' : 'enonce'
    edits.push({
      start: match.index,
      end: match.index + match[0].length,
      text: `#mathalea-measured-image(${figure}, ${num}, "${part}", zoom: exo-${num}${correction ?? ''}-zoom${kind === 'image-slice' ? `, start: ${start}, end: ${end}` : ''})`,
    })
  }
  if (edits.length === 0) return source
  // Avant les appels, sur la première ligne : garder les lignes des diagnostics.
  return `${IMAGE_GEOMETRY_HELPER.replace(/\n\s*/g, ' ')}; ${applyTypstSourceEdits(source, edits)}`
}

export function parseImageGeometries(values: unknown): ImageGeometry[] {
  if (!Array.isArray(values)) return []
  return values.filter(
    (value): value is ImageGeometry =>
      value != null &&
      (value.part === 'enonce' || value.part === 'correction') &&
      ['num', 'page', 'x', 'y', 'width', 'height'].every(
        (key) => typeof value[key] === 'number' && Number.isFinite(value[key]),
      ),
  )
}

/** Tolérer les arrondis du SVG, et dédupliquer les fragments d'une même partie. */
export function overflowingImages(
  images: ImageGeometry[],
  pages: PreviewPageGeometry[],
) {
  const targets = new Map<
    string,
    { num: number; part: keyof ExerciseImageCuts }
  >()
  for (const image of images) {
    const page = pages[image.page - 1]
    if (page == null) continue
    if (
      image.y + image.height > page.height + 0.5 ||
      image.x + image.width > page.width + 0.5 ||
      image.x < -0.5 ||
      image.y < -0.5
    )
      targets.set(`${image.num}-${image.part}`, {
        num: image.num,
        part: image.part,
      })
  }
  return [...targets.values()]
}
