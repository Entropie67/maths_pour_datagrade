import { bleuMathalea } from '../colors'
import { arrondi } from '../outils/nombres'
import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import { ObjetMathalea2D } from './ObjetMathalea2D'

/**
 * Roues dentées au style épuré : dents trapézoïdales aux angles arrondis,
 * corps bleu, face plus claire et moyeu blanc.
 * Les roues d'un train sont alignées horizontalement et s'engrènent exactement.
 *
 * Les identifiants `animRoue…` et `compteur…` (et la classe `compteurDeTours`)
 * sont utilisés par `src/lib/outils/animationRoues.ts` et par le convertisseur Typst.
 */

/** Les marqueurs servent à repérer visuellement la synchronisation de deux roues voisines. */
const COULEURS_JONCTION = ['#ffffff', '#ffc857']

/** Demi-largeur angulaire (en fraction du pas angulaire) d'une dent à sa base et à son sommet. */
const DEMI_BASE = 0.3
const DEMI_SOMMET = 0.13

type Marqueur = { angle: number; couleur: string }

type ParametresRoue = {
  nbDents: number
  module: number
  x: number
  /** angle (en degrés) de la dent de référence */
  phase: number
  /** durée signée d'un tour en secondes : 0 pour une roue immobile, négatif pour le sens trigonométrique */
  dureeTour: number
  marqueurs: Marqueur[]
}

function polaire(x: number, y: number, rayon: number, angle: number) {
  const rad = (angle * Math.PI) / 180
  return {
    x: x + rayon * Math.cos(rad),
    y: y + rayon * Math.sin(rad),
  }
}

export class RoueDentee extends ObjetMathalea2D {
  nbDents: number
  x: number
  /** rayon au pied des dents */
  rayon: number
  /** rayon au sommet des dents */
  rayonExt: number
  phase: number
  dureeTour: number
  marqueurs: Marqueur[]

  constructor({
    nbDents,
    module,
    x,
    phase,
    dureeTour,
    marqueurs,
  }: ParametresRoue) {
    super()
    this.nbDents = nbDents
    this.x = x
    this.rayon = (nbDents * module) / 2 - 0.625 * module
    this.rayonExt = (nbDents * module) / 2 + 0.5 * module
    this.phase = phase
    this.dureeTour = dureeTour
    this.marqueurs = marqueurs
    this.color = colorToLatexOrHTML(bleuMathalea)
    this.bordures = [
      x - this.rayonExt - 0.2,
      -this.rayonExt - 0.2,
      x + this.rayonExt + 0.2,
      this.rayonExt + 0.2,
    ]
  }

  /** Sommets de chaque dent, dans l'ordre trigonométrique : pied, sommet, sommet, pied. */
  private dents() {
    const pas = 360 / this.nbDents
    return Array.from({ length: this.nbDents }, (_, k) => {
      const centre = this.phase + k * pas
      return {
        debutArc: centre + DEMI_BASE * pas,
        points: [
          polaire(this.x, 0, this.rayon, centre - DEMI_BASE * pas),
          polaire(this.x, 0, this.rayonExt, centre - DEMI_SOMMET * pas),
          polaire(this.x, 0, this.rayonExt, centre + DEMI_SOMMET * pas),
          polaire(this.x, 0, this.rayon, centre + DEMI_BASE * pas),
        ],
        finArc: centre + (1 - DEMI_BASE) * pas,
      }
    })
  }

  private get rayonMoyeu() {
    return 0.46 * this.rayon
  }

  private get rayonMarqueur() {
    return Math.min(Math.max(0.1 * this.rayon, 0.13), 0.2)
  }

  svg(coeff: number) {
    const cx = arrondi(this.x * coeff)
    const rayon = this.rayon * coeff
    const corps = this.color[0]
    const pt = (p: { x: number; y: number }) =>
      `${arrondi(p.x * coeff)},${arrondi(-p.y * coeff)}`
    const dents = this.dents()
    const trace =
      dents
        .map(
          ({ points }, k) =>
            `${k === 0 ? 'M' : `A${arrondi(rayon)},${arrondi(rayon)} 0 0 0`} ${pt(points[0])} L${pt(points[1])} L${pt(points[2])} L${pt(points[3])}`,
        )
        .join(' ') +
      ` A${arrondi(rayon)},${arrondi(rayon)} 0 0 0 ${pt(dents[0].points[0])} Z`

    const animation =
      this.dureeTour === 0
        ? ''
        : `<animateTransform id="animRoue${this.id}" attributeName="transform" attributeType="XML" type="rotate" from="0 ${cx} 0" to="${this.dureeTour < 0 ? -360 : 360} ${cx} 0" dur="${Math.abs(this.dureeTour)}" repeatCount="indefinite"/>`

    const marqueurs = this.marqueurs
      .map((m) => {
        const p = polaire(this.x, 0, 0.84 * this.rayon, m.angle)
        return `<circle cx="${arrondi(p.x * coeff)}" cy="${arrondi(-p.y * coeff)}" r="${arrondi(this.rayonMarqueur * coeff)}" fill="${m.couleur}"/>`
      })
      .join('')

    const rMoyeu = arrondi(this.rayonMoyeu * coeff)
    const centre =
      this.dureeTour === 0
        ? `<circle cx="${cx}" cy="0" r="${arrondi(0.14 * this.rayon * coeff)}" fill="${corps}"/>`
        : `<text class="compteurDeTours" id="compteur${this.id}" x="${cx}" y="0" fill="${corps}" font-weight="bold" font-size="${arrondi(Math.min(rMoyeu * 1.1, 16))}" text-anchor="middle" dominant-baseline="middle">0</text>`

    return `<g class="roueDentee" id="roue${this.id}">
      <path d="${trace}" fill="${corps}" stroke="${corps}" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="${cx}" cy="0" r="${arrondi(0.7 * rayon)}" fill="white" fill-opacity="0.18"/>
      ${marqueurs}${animation}
    </g>
    <circle cx="${cx}" cy="0" r="${rMoyeu}" fill="white"/>
    ${centre}`
  }

  tikz() {
    const corps = this.color[1]
    const pt = (p: { x: number; y: number }) =>
      `(${arrondi(p.x, 3)},${arrondi(p.y, 3)})`
    const dents = this.dents()
    const trace = dents
      .map(
        ({ points, debutArc, finArc }, k) =>
          `${k === 0 ? '' : '-- '}${pt(points[0])} -- ${pt(points[1])} -- ${pt(points[2])} -- ${pt(points[3])} arc (${arrondi(debutArc, 3)}:${arrondi(finArc, 3)}:${arrondi(this.rayon, 3)})`,
      )
      .join(' ')
    const centre = `(${this.x},0)`
    const marqueurs = this.marqueurs
      .map((m) => {
        const p = polaire(this.x, 0, 0.84 * this.rayon, m.angle)
        return `\\fill[color=${colorToLatexOrHTML(m.couleur)[1]}] ${pt(p)} circle (${arrondi(this.rayonMarqueur, 3)});`
      })
      .join('\n')
    return `% roue dentée de ${this.nbDents} dents centrée en (${this.x};0)
    \\fill[color=${corps},draw=${corps},line join=round,line width=0.6pt] ${trace} -- cycle;
    \\fill[color=white,fill opacity=0.18] ${centre} circle (${arrondi(0.7 * this.rayon, 3)});
    ${marqueurs}
    \\fill[color=white] ${centre} circle (${arrondi(this.rayonMoyeu, 3)});
    ${this.dureeTour === 0 ? `\\fill[color=${corps}] ${centre} circle (${arrondi(0.14 * this.rayon, 3)});` : ''}
    `
  }
}

/**
 * Une roue de plus dans le train : si la roue précédente a une dent tournée vers
 * la droite, celle-ci présente un creux vers la gauche, et inversement.
 */
function phaseEngrenee(nbDents: number, precedenteAUneDent: boolean) {
  const pas = 360 / nbDents
  return precedenteAUneDent ? 180 + pas / 2 : 180
}

function aUneDentVersLaDroite(nbDents: number, phase: number) {
  const k = -phase / (360 / nbDents)
  return Math.abs(k - Math.round(k)) < 1e-6
}

/**
 * Crée un train de roues dentées alignées horizontalement, de la gauche vers la droite.
 * @param options
 * @param options.dureeTourBase durée (en s) d'un tour de la première roue ; 0 pour un dessin immobile.
 *   Les autres roues tournent en sens inverse, à la vitesse imposée par leur nombre de dents.
 * @param options.module taille d'une dent en cm (0.4 par défaut)
 * @param options.marqueurs ajoute des repères de couleur à la jonction de chaque paire de roues
 * @param nbDents nombre de dents de chaque roue, de gauche à droite
 */
export function rouesDentees(
  { dureeTourBase = 0, module = 0.4, marqueurs = false } = {},
  ...nbDents: number[]
): RoueDentee[] {
  let x = 0
  let phase = 0
  let precedenteAUneDent = false
  return nbDents.map((n, i) => {
    if (i > 0) {
      x += (module * (nbDents[i - 1] + n)) / 2
      phase = phaseEngrenee(n, precedenteAUneDent)
    }
    precedenteAUneDent = aUneDentVersLaDroite(n, phase)
    const reperes: Marqueur[] = []
    if (marqueurs) {
      if (i > 0) {
        reperes.push({
          angle: 180,
          couleur: COULEURS_JONCTION[(i - 1) % COULEURS_JONCTION.length],
        })
      }
      if (i < nbDents.length - 1) {
        reperes.push({
          angle: 0,
          couleur: COULEURS_JONCTION[i % COULEURS_JONCTION.length],
        })
      }
    }
    const sens = i % 2 === 0 ? 1 : -1
    return new RoueDentee({
      nbDents: n,
      module,
      x,
      phase,
      dureeTour: (sens * dureeTourBase * n) / nbDents[0],
      marqueurs: reperes,
    })
  })
}
