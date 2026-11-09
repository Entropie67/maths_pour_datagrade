import { Figure2D } from '../Figures2D'
import { PointAbstrait, pointAbstrait } from '../PointAbstrait'
import { segment } from '../segmentsVecteurs'

function nbAxesChiffre(chiffre: number): number {
  // Tableau des chiffres et de leur nombre d'axes de symétrie
  const axesSymetrie = {
    0: 2,
    1: 1,
    2: 0,
    3: 1,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 2,
    9: 0,
  }
  // Vérification que le chiffre est valide
  if (chiffre < 0 || chiffre > 9 || chiffre !== (chiffre | 0)) {
    throw new Error('Le paramètre doit être un entier de 0 à 9')
  }
  // Retourne le nombre d'axes de symétrie pour le chiffre donné
  return axesSymetrie[chiffre as keyof typeof axesSymetrie]
}
function centreChiffre(chiffre: number): PointAbstrait | null {
  // Tableau des chiffres et de leur centre de symétrie
  const centreSymetrie = {
    0: pointAbstrait(0, 0),
    1: pointAbstrait(2, 0),
    2: pointAbstrait(0, 0),
    3: null,
    4: null,
    5: pointAbstrait(0, 0),
    6: null,
    7: null,
    8: pointAbstrait(0, 0),
    9: null,
  }
  // Vérification que le chiffre est valide
  if (chiffre < 0 || chiffre > 9 || chiffre !== (chiffre | 0)) {
    throw new Error('Le paramètre doit être un entier de 0 à 9')
  }
  // Retourne si le chiffre donné a un centre de symétrie
  return centreSymetrie[chiffre as keyof typeof centreSymetrie]
}
/**
 * Retourne à la fois le SVG <g>…</g> et le code TikZ pour le chiffre demandé.
 * @param {number} d  – chiffre 0 – 9
 * @param {object} [opt] – options : x, y (centre du chiffre)
 * @returns {object} – { svg: string, tikz: string }
 */
function digitSVGTIKZ(
  d: number,
  opt = { x: 0, y: 0, fillStyle: 'red', strokeStyle: 'black', lineWidth: 2 },
) {
  if (d < 0 || d > 9 || d !== (d | 0))
    throw new Error('Le paramètre doit être un entier de 0 à 9')

  const { x = 0, y = 0, fillStyle, strokeStyle, lineWidth } = opt

  // Tableau des segments allumés : [a,b,c,d,e,f,g]
  const map = [
    [1, 1, 1, 1, 1, 1, 0], // 0
    [0, 1, 1, 0, 0, 0, 0], // 1
    [1, 1, 0, 1, 1, 0, 1], // 2
    [1, 1, 1, 1, 0, 0, 1], // 3
    [0, 1, 1, 0, 0, 1, 1], // 4
    [1, 0, 1, 1, 0, 1, 1], // 5
    [1, 0, 1, 1, 1, 1, 1], // 6
    [1, 1, 1, 0, 0, 0, 0], // 7
    [1, 1, 1, 1, 1, 1, 1], // 8
    [1, 1, 1, 1, 0, 1, 1], // 9
  ][d]

  // Position (tx,ty) et rotation (rot) de chaque segment par rapport au centre
  const pos = [
    { tx: 0, ty: -35, rot: 0 }, // a
    { tx: 17.5, ty: -17.5, rot: 90 }, // b
    { tx: 17.5, ty: 17.5, rot: 90 }, // c
    { tx: 0, ty: 35, rot: 0 }, // d
    { tx: -17.5, ty: 17.5, rot: 90 }, // e
    { tx: -17.5, ty: -17.5, rot: 90 }, // f
    { tx: 0, ty: 0, rot: 0 }, // g
  ].map(({ tx, ty, rot }) => ({ tx: tx / 2, ty: ty / 2, rot }))

  const svgPolys: string[] = []
  const tikzPaths: string[] = []

  // Hexagone en TikZ centré en (0,0), adapté au polygon SVG "-15,-2.5 15,-2.5 17.5,0 15,2.5 -15,2.5 -17.5,0"
  // Points: (-15,-2.5), (15,-2.5), (17.5,0), (15,2.5), (-15,2.5), (-17.5,0)

  pos.forEach(({ tx, ty, rot }, i) => {
    const isOn = !!map[i]
    if (isOn) {
      svgPolys.push(
        `<polygon points="-7.5,-1.25 7.5,-1.25 8.75,0 7.5,1.25 -7.5,1.25 -8.75,0" transform="translate(${tx},${ty})${rot ? ` rotate(${rot})` : ''}"/>`,
      )
    }

    // TikZ \draw
    if (isOn) {
      // Définition des sommets du polygone (hexagone) en coordonnées SVG
      const polyPoints = [
        { x: -7.5, y: -1.25 },
        { x: 7.5, y: -1.25 },
        { x: 8.75, y: 0 },
        { x: 7.5, y: 1.25 },
        { x: -7.5, y: 1.25 },
        { x: -8.75, y: 0 },
      ]
      // Conversion en cm et application de la rotation et translation
      const angle = (rot * Math.PI) / 180
      const cosA = Math.cos(angle)
      const sinA = Math.sin(angle)
      const tikzPoly = polyPoints
        .map((pt) => {
          // Rotation autour de (0,0)
          const xr = pt.x * cosA - pt.y * sinA
          const yr = pt.x * sinA + pt.y * cosA
          // Translation, inversion de y pour TikZ, conversion en cm
          const xt = (x + tx + xr) / 20
          const yt = (-y - ty - yr) / 20
          return `(${xt.toFixed(2)},${yt.toFixed(2)})`
        })
        .join(' -- ')
      tikzPaths.push(
        `\\draw[fill=${fillStyle}, draw=${strokeStyle}, line width=${lineWidth}pt] ${tikzPoly} -- cycle;`,
      )
    }
  })

  return {
    svg: `<g transform="translate(${x},${y})">${svgPolys.join('')}</g>`,
    tikz: tikzPaths.join('\n'),
  }
}
/**
 * Génère une figure représentant le chiffre "0" en style digital (7 segments).
 * @param options Options pour personnaliser le style du chiffre "0".
 * @returns Une instance de Figure2D représentant un chiffre "0" digital.
 */
export function chiffreDigital(options?: {
  fillStyle?: string // Couleur de remplissage des segments (par défaut rouge)
  strokeStyle?: string // Couleur de la bordure des segments (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure``
  chiffre?: number // Chiffre à afficher (par défaut 0)
  largeur?: number // Largeur du chiffre (en cm, par défaut 3)
  hauteur?: number // Hauteur du chiffre (en cm, par défaut 4)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  // Options par défaut
  const fillStyle = options?.fillStyle || 'green'
  const strokeStyle = options?.strokeStyle || 'black'
  const lineWidth = options?.lineWidth || 2
  const opacite = options?.opacite ?? 1
  const chiffre = options?.chiffre ?? 0

  // Utilisation de digitSVG pour obtenir le code SVG et TikZ du chiffre 0
  const { svg: rawSvg, tikz: rawTikz } = digitSVGTIKZ(chiffre, {
    x: 0,
    y: 0,
    fillStyle,
    strokeStyle,
    lineWidth,
  })

  // Ajout du style aux segments SVG
  const codeSvg = rawSvg.replaceAll(
    /<polygon /g,
    `<polygon fill="${fillStyle}" stroke="${strokeStyle}" stroke-width="${lineWidth}" opacity="${opacite}" `,
  )

  // Ajout du style aux segments TikZ
  const codeTikz = rawTikz.replaceAll(
    /\\draw\[fill=red\]/g,
    `\\draw[fill=${fillStyle}, draw=${strokeStyle}, line width=${lineWidth}pt]`,
  )

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: 2,
    height: 6,
    opacite,
    centre: centreChiffre(chiffre),
    axes:
      nbAxesChiffre(chiffre) === 0
        ? []
        : nbAxesChiffre(chiffre) === 1
          ? [segment(pointAbstrait(-2.5, 0), pointAbstrait(2.5, 0))]
          : [
              segment(pointAbstrait(-2.5, 0), pointAbstrait(2.5, 0)),
              segment(pointAbstrait(0, -2.5), pointAbstrait(0, 2.5)),
            ],
    nonAxe:
      chiffre === 4 || chiffre === 7 || chiffre === 2 || chiffre === 5
        ? segment(-2, 0, 2, 0)
        : chiffre === 6 || chiffre === 9
          ? segment(
              pointAbstrait(0, -4 * (chiffre === 6 ? -1 : 1)),
              pointAbstrait(0, 4 * (chiffre === 6 ? -1 : 1)),
            )
          : undefined,
  })
}

export function nombre88(options?: {
  fillStyle?: string // Couleur de remplissage des segments (par défaut rouge)
  strokeStyle?: string // Couleur de la bordure des segments (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure``
  largeur?: number // Largeur du chiffre (en cm, par défaut 3)
  hauteur?: number // Hauteur du chiffre (en cm, par défaut 4)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  const unites = chiffreDigital({ chiffre: 8 })
  const dizaines = unites.copy(Date.now().toString())
  dizaines.translate(-1.2, 0)
  unites.translate(1.2, 0)
  const codeTikz = `\\begin{scope}
  ${unites.tikz()}\n${dizaines.tikz()}\\end{scope}`
  const codeSvg = `<g>${unites.svg(20)}\n${dizaines.svg(20)}</g>`

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: 6,
    height: 6,
    opacite: options?.opacite ?? 1,
    centre: pointAbstrait(0, 0),
    axes: [segment(-2, 0, 2, 0), segment(0, -2, 0, 2)],
  })
}

export function nombre38(options?: {
  fillStyle?: string // Couleur de remplissage des segments (par défaut rouge)
  strokeStyle?: string // Couleur de la bordure des segments (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure``
  largeur?: number // Largeur du chiffre (en cm, par défaut 3)
  hauteur?: number // Hauteur du chiffre (en cm, par défaut 4)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  const unites = chiffreDigital({ chiffre: 8 })
  const dizaines = chiffreDigital({ chiffre: 3 })
  dizaines.translate(-1.2, 0)
  unites.translate(1.2, 0)
  const codeTikz = `\\begin{scope}
  ${unites.tikz()}\n${dizaines.tikz()}\\end{scope}`
  const codeSvg = `<g>${unites.svg(20)}\n${dizaines.svg(20)}</g>`

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: 6,
    height: 6,
    opacite: options?.opacite ?? 1,
    axes: [segment(-2, 0, 2, 0)],
  })
}
export function nombre30(options?: {
  fillStyle?: string // Couleur de remplissage des segments (par défaut rouge)
  strokeStyle?: string // Couleur de la bordure des segments (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure``
  largeur?: number // Largeur du chiffre (en cm, par défaut 3)
  hauteur?: number // Hauteur du chiffre (en cm, par défaut 4)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  const unites = chiffreDigital({ chiffre: 0 })
  const dizaines = chiffreDigital({ chiffre: 3 })
  dizaines.translate(-1.2, 0)
  unites.translate(1.2, 0)
  const codeTikz = `\\begin{scope}
  ${unites.tikz()}\n${dizaines.tikz()}\\end{scope}`
  const codeSvg = `<g>${dizaines.svg(20)}\n${unites.svg(20)}</g>`
  return new Figure2D({
    codeSvg,
    codeTikz,
    width: 6,
    height: 6,
    opacite: options?.opacite ?? 1,
    axes: [segment(-2, 0, 2, 0)],
  })
}
export function nombre25(options?: {
  fillStyle?: string // Couleur de remplissage des segments (par défaut rouge)
  strokeStyle?: string // Couleur de la bordure des segments (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure``
  largeur?: number // Largeur du chiffre (en cm, par défaut 3)
  hauteur?: number // Hauteur du chiffre (en cm, par défaut 4)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  const unites = chiffreDigital({ chiffre: 5 })
  const dizaines = chiffreDigital({ chiffre: 2 })
  dizaines.translate(-1.2, 0)
  unites.translate(1.2, 0)
  const codeTikz = `\\begin{scope}
  ${unites.tikz()}\n${dizaines.tikz()}\\end{scope}`
  const codeSvg = `<g>${unites.svg(20)}\n${dizaines.svg(20)}</g>`

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: 6,
    height: 6,
    opacite: options?.opacite ?? 1,
    axes: [segment(0, -2, 0, 2)],
  })
}
export function nombre75(options?: {
  fillStyle?: string // Couleur de remplissage des segments (par défaut rouge)
  strokeStyle?: string // Couleur de la bordure des segments (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure``
  largeur?: number // Largeur du chiffre (en cm, par défaut 3)
  hauteur?: number // Hauteur du chiffre (en cm, par défaut 4)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  const unites = chiffreDigital({ chiffre: 5 })
  const dizaines = chiffreDigital({ chiffre: 7 })
  dizaines.translate(-1.2, 0)
  unites.translate(1.2, 0)
  const codeTikz = `\\begin{scope}
  ${unites.tikz()}\n${dizaines.tikz()}\\end{scope}`
  const codeSvg = `<g>${unites.svg(20)}\n${dizaines.svg(20)}</g>`

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: 6,
    height: 6,
    opacite: options?.opacite ?? 1,
    nonAxe: segment(0, -4, 0, 4),
  })
}
export function nombre13(options?: {
  fillStyle?: string // Couleur de remplissage des segments (par défaut rouge)
  strokeStyle?: string // Couleur de la bordure des segments (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure``
  largeur?: number // Largeur du chiffre (en cm, par défaut 3)
  hauteur?: number // Hauteur du chiffre (en cm, par défaut 4)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  const unites = chiffreDigital({ chiffre: 3 })
  const dizaines = chiffreDigital({ chiffre: 1 })
  dizaines.translate(-1.2, 0)
  unites.translate(1.2, 0)
  const codeTikz = `\\begin{scope}
  ${unites.tikz()}\n${dizaines.tikz()}\\end{scope}`
  const codeSvg = `<g>${unites.svg(20)}\n${dizaines.svg(20)}</g>`

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: 6,
    height: 6,
    opacite: options?.opacite ?? 1,
    axes: [segment(-2, 0, 2, 0)],
  })
}
export function nombre52(options?: {
  fillStyle?: string // Couleur de remplissage des segments (par défaut rouge)
  strokeStyle?: string // Couleur de la bordure des segments (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure``
  largeur?: number // Largeur du chiffre (en cm, par défaut 3)
  hauteur?: number // Hauteur du chiffre (en cm, par défaut 4)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  const unites = chiffreDigital({ chiffre: 2 })
  const dizaines = chiffreDigital({ chiffre: 5 })
  dizaines.translate(-1.2, 0)
  unites.translate(1.2, 0)
  const codeTikz = `\\begin{scope}
  ${unites.tikz()}\n${dizaines.tikz()}\\end{scope}`
  const codeSvg = `<g>${unites.svg(20)}\n${dizaines.svg(20)}</g>`

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: 6,
    height: 6,
    opacite: options?.opacite ?? 1,
    axes: [segment(0, -2, 0, 2)],
  })
}
export function nombre73(options?: {
  fillStyle?: string // Couleur de remplissage des segments (par défaut rouge)
  strokeStyle?: string // Couleur de la bordure des segments (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure``
  largeur?: number // Largeur du chiffre (en cm, par défaut 3)
  hauteur?: number // Hauteur du chiffre (en cm, par défaut 4)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  const unites = chiffreDigital({ chiffre: 3 })
  const dizaines = chiffreDigital({ chiffre: 7 })
  dizaines.translate(-1.2, 0)
  unites.translate(1.2, 0)
  const codeTikz = `\\begin{scope}
  ${unites.tikz()}\n${dizaines.tikz()}\\end{scope}`
  const codeSvg = `<g>${unites.svg(20)}\n${dizaines.svg(20)}</g>`

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: 6,
    height: 6,
    opacite: options?.opacite ?? 1,
    nonAxe: segment(0, -4, 0, 4),
  })
}
export function nombre26(options?: {
  fillStyle?: string // Couleur de remplissage des segments (par défaut rouge)
  strokeStyle?: string // Couleur de la bordure des segments (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure``
  largeur?: number // Largeur du chiffre (en cm, par défaut 3)
  hauteur?: number // Hauteur du chiffre (en cm, par défaut 4)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  const unites = chiffreDigital({ chiffre: 6 })
  const dizaines = chiffreDigital({ chiffre: 2 })
  dizaines.translate(-1.2, 0)
  unites.translate(1.2, 0)
  const codeTikz = `\\begin{scope}
  ${unites.tikz()}\n${dizaines.tikz()}\\end{scope}`
  const codeSvg = `<g>${unites.svg(20)}\n${dizaines.svg(20)}</g>`

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: 6,
    height: 6,
    opacite: options?.opacite ?? 1,
    nonAxe: segment(0, -4, 0, 4),
  })
}
export function nombre42(options?: {
  fillStyle?: string // Couleur de remplissage des segments (par défaut rouge)
  strokeStyle?: string // Couleur de la bordure des segments (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure``
  largeur?: number // Largeur du chiffre (en cm, par défaut 3)
  hauteur?: number // Hauteur du chiffre (en cm, par défaut 4)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  const unites = chiffreDigital({ chiffre: 2 })
  const dizaines = chiffreDigital({ chiffre: 4 })
  dizaines.translate(-1.2, 0)
  unites.translate(1.2, 0)
  const codeTikz = `\\begin{scope}
  ${unites.tikz()}\n${dizaines.tikz()}\\end{scope}`
  const codeSvg = `<g>${unites.svg(20)}\n${dizaines.svg(20)}</g>`

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: 6,
    height: 6,
    opacite: options?.opacite ?? 1,
    nonAxe: segment(0, -4, 0, 4),
  })
}
export function nombre96(options?: {
  fillStyle?: string // Couleur de remplissage des segments (par défaut rouge)
  strokeStyle?: string // Couleur de la bordure des segments (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure``
  largeur?: number // Largeur du chiffre (en cm, par défaut 3)
  hauteur?: number // Hauteur du chiffre (en cm, par défaut 4)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  const unites = chiffreDigital({ chiffre: 6 })
  const dizaines = chiffreDigital({ chiffre: 9 })
  dizaines.translate(-1.2, 0)
  unites.translate(1.2, 0)
  const codeTikz = `\\begin{scope}
  ${unites.tikz()}\n${dizaines.tikz()}\\end{scope}`
  const codeSvg = `<g>${unites.svg(20)}\n${dizaines.svg(20)}</g>`

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: 6,
    height: 6,
    opacite: options?.opacite ?? 1,
    centre: pointAbstrait(0, 0),
    nonAxe: segment(0, -4, 0, 4),
  })
}
export function nombre80(options?: {
  fillStyle?: string // Couleur de remplissage des segments (par défaut rouge)
  strokeStyle?: string // Couleur de la bordure des segments (par défaut noir)
  lineWidth?: number // Épaisseur de la bordure``
  largeur?: number // Largeur du chiffre (en cm, par défaut 3)
  hauteur?: number // Hauteur du chiffre (en cm, par défaut 4)
  opacite?: number // Opacité de la figure (par défaut 1)
}): Figure2D {
  const unites = chiffreDigital({ chiffre: 0 })
  const dizaines = chiffreDigital({ chiffre: 8 })
  dizaines.translate(-1.2, 0)
  unites.translate(1.2, 0)
  const codeTikz = `\\begin{scope}
  ${unites.tikz()}\n${dizaines.tikz()}\\end{scope}`
  const codeSvg = `<g>${unites.svg(20)}\n${dizaines.svg(20)}</g>`

  return new Figure2D({
    codeSvg,
    codeTikz,
    width: 6,
    height: 6,
    opacite: options?.opacite ?? 1,
    axes: [segment(-2, 0, 2, 0)],
  })
}
