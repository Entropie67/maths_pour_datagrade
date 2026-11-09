import { orangeMathalea, vertMathalea } from '../colors'
import { DomReadyActionElement } from '../customElements/DomReadyAction'
import type { ObjetMathalea2D } from './ObjetMathalea2D'
import { pointAbstrait } from './PointAbstrait'
import { polyline } from './Polyline'
import { segment } from './segmentsVecteurs'

/**
 * Lecture graphique des solutions d'une équation f(x) = g(x) ou d'une
 * inéquation f(x) ⩽ g(x) : on descend des points d'intersection jusqu'à l'axe
 * des abscisses, on repasse les portions de la courbe qui conviennent, puis on
 * marque l'ensemble des solutions sur l'axe des abscisses avec ses crochets.
 *
 * `lectureSolutionsAnimee()` anime la lecture sur une figure HTML existante
 * (repérée par son id) ; `lectureSolutionsStatique()` renvoie les mêmes tracés,
 * fixes, pour les sorties LaTeX et Typst.
 */

export type IntervalleSolution = {
  gauche: number
  droite: number
  gaucheFerme: boolean
  droiteFerme: boolean
}

export type LectureSolutionsOptions = {
  /** Points d'intersection dont on lit l'abscisse. */
  points: { x: number; y: number }[]
  /**
   * Portions de courbe à repasser (inéquation), chacune donnée par une liste
   * de points [x, y] de la courbe.
   */
  portions?: [number, number][][]
  /** Intervalles solutions à marquer sur l'axe des abscisses (inéquation). */
  intervalles?: IntervalleSolution[]
  /** Couleur des pointillés de lecture et des portions de courbe. */
  couleurLecture?: string
  /** Couleur des abscisses lues et des intervalles solutions. */
  couleurSolutions?: string
}

export type LectureSolutionsAnimeeOptions = LectureSolutionsOptions & {
  /** id du SVG de la figure (option `id` de mathalea2d). */
  figureId: string
  /** pixelsParCm de la figure. */
  pixelsParCm: number
}

type Payload = Required<LectureSolutionsOptions> & {
  figureId: string
  pixelsParCm: number
}

const action = 'lecture-solutions-animee'
/** Demi-hauteur et longueur des branches d'un crochet, en unités du repère. */
const DEMI_HAUTEUR_CROCHET = 0.35
const BRANCHE_CROCHET = 0.18

/** Rythme de l'animation, en millisecondes. */
const RYTHME = {
  /** écart entre deux points d'intersection */
  entrePoints: 1100,
  /** apparition d'un point, d'une étiquette ou d'un crochet */
  apparition: 600,
  /** descente des pointillés jusqu'à l'axe */
  descente: 1000,
  /** tracé d'une portion de courbe */
  portion: 1500,
  /** tracé d'un intervalle sur l'axe */
  intervalle: 1200,
  /** pause entre deux étapes */
  pause: 700,
}

/**
 * Sommets d'un crochet placé en x sur l'axe des abscisses, en unités du
 * repère. Un crochet fermé tourne ses branches vers l'intérieur de
 * l'intervalle, un crochet ouvert vers l'extérieur.
 */
function sommetsCrochet(
  x: number,
  borneGauche: boolean,
  ferme: boolean,
): [number, number][] {
  const versLaDroite = borneGauche === ferme
  const dx = (versLaDroite ? 1 : -1) * BRANCHE_CROCHET
  return [
    [x + dx, DEMI_HAUTEUR_CROCHET],
    [x, DEMI_HAUTEUR_CROCHET],
    [x, -DEMI_HAUTEUR_CROCHET],
    [x + dx, -DEMI_HAUTEUR_CROCHET],
  ]
}

let registered = false
function register() {
  if (registered) return
  registered = true
  DomReadyActionElement.registerCallback<Payload>(
    action,
    ({ element, payload }) => {
      const previous = element.previousElementSibling
      const svg =
        previous instanceof SVGSVGElement && previous.id === payload.figureId
          ? previous
          : document.getElementById(payload.figureId)
      if (!(svg instanceof SVGSVGElement)) return
      const ns = 'http://www.w3.org/2000/svg'
      const ppc = payload.pixelsParCm
      const X = (x: number) => x * ppc
      const Y = (y: number) => -y * ppc
      const ms = (duree: number) => `${duree / 1000}s`

      const animate = (
        attributeName: string,
        from: string,
        to: string,
        duree: number,
        delay: number,
      ) => {
        const a = document.createElementNS(ns, 'animate')
        a.setAttribute('attributeName', attributeName)
        a.setAttribute('from', from)
        a.setAttribute('to', to)
        a.setAttribute('dur', ms(duree))
        a.setAttribute('begin', 'indefinite')
        a.setAttribute('fill', 'freeze')
        a.setAttribute('data-delay', `${delay}`)
        return a
      }
      const apparition = (el: SVGElement, delay: number) => {
        el.setAttribute('opacity', '0')
        el.appendChild(animate('opacity', '0', '1', RYTHME.apparition, delay))
        return el
      }
      // Trait qui se déroule de (x1 ; y1) à (x2 ; y2), coordonnées SVG
      const trait = (
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        color: string,
        largeur: number,
        delay: number,
        duree: number,
        pointilles: boolean,
      ) => {
        const line = document.createElementNS(ns, 'line')
        line.setAttribute('x1', `${x1}`)
        line.setAttribute('y1', `${y1}`)
        line.setAttribute('x2', `${x1}`)
        line.setAttribute('y2', `${y1}`)
        line.setAttribute('stroke', color)
        line.setAttribute('stroke-width', `${largeur}`)
        if (pointilles) {
          line.setAttribute('stroke-dasharray', '6 5')
          line.setAttribute('stroke-linecap', 'round')
        }
        line.appendChild(animate('x2', `${x1}`, `${x2}`, duree, delay))
        line.appendChild(animate('y2', `${y1}`, `${y2}`, duree, delay))
        return line
      }

      // Abscisse lue, écrite sous l'axe (ou au-dessus) en couleur des solutions
      const etiquette = (x: number, dessous: boolean, delay: number) => {
        const label = document.createElementNS(ns, 'text')
        label.textContent = `${x}`.replace('-', '−')
        label.setAttribute('x', `${X(x)}`)
        label.setAttribute('y', `${dessous ? 0.55 * ppc : -0.55 * ppc}`)
        label.setAttribute('fill', payload.couleurSolutions)
        label.setAttribute('font-weight', '700')
        label.setAttribute('font-size', `${0.65 * ppc}`)
        label.setAttribute('text-anchor', 'middle')
        label.setAttribute('dominant-baseline', dessous ? 'hanging' : 'alphabetic')
        // Liseré blanc pour masquer la graduation située dessous
        label.setAttribute('stroke', 'white')
        label.setAttribute('stroke-width', `${0.2 * ppc}`)
        label.setAttribute('paint-order', 'stroke')
        return apparition(label, delay)
      }

      // Identifiants des setTimeout lançant les animations en cours, annulés
      // quand on relance l'animation ou que la figure est démontée
      const minuteurs: number[] = []
      const annulerMinuteurs = () => {
        minuteurs.forEach((id) => window.clearTimeout(id))
        minuteurs.length = 0
      }

      const play = () => {
        annulerMinuteurs()
        svg.querySelector(`[data-${action}="${payload.figureId}"]`)?.remove()
        const group = document.createElementNS(ns, 'g')
        group.setAttribute(`data-${action}`, payload.figureId)
        group.setAttribute('aria-hidden', 'true')
        // Abscisses déjà écrites, pour ne pas les écrire deux fois
        const abscissesEcrites = new Set(payload.points.map(({ x }) => x))
        let t = 300

        // 1. Des points d'intersection jusqu'à l'axe des abscisses
        payload.points.forEach(({ x, y }, i) => {
          const debut = t + RYTHME.entrePoints * i
          const point = document.createElementNS(ns, 'circle')
          point.setAttribute('cx', `${X(x)}`)
          point.setAttribute('cy', `${Y(y)}`)
          point.setAttribute('r', `${0.18 * ppc}`)
          point.setAttribute('fill', payload.couleurLecture)
          group.appendChild(apparition(point, debut))
          const debutDescente = debut + RYTHME.apparition
          group.appendChild(
            trait(
              X(x),
              Y(y),
              X(x),
              0,
              payload.couleurLecture,
              3,
              debutDescente,
              RYTHME.descente,
              true,
            ),
          )
          // Abscisse lue, du côté de l'axe opposé au point
          group.appendChild(
            etiquette(x, y >= 0, debutDescente + RYTHME.descente),
          )
        })
        if (payload.points.length > 0) {
          t +=
            RYTHME.entrePoints * (payload.points.length - 1) +
            2 * RYTHME.apparition +
            RYTHME.descente +
            RYTHME.pause
        }

        // 2. Les portions de courbe qui conviennent, repassées
        payload.portions.forEach((portion, j) => {
          const pts = portion.map(([x, y]) => [X(x), Y(y)])
          let longueur = 0
          for (let k = 1; k < pts.length; k++) {
            longueur += Math.hypot(
              pts[k][0] - pts[k - 1][0],
              pts[k][1] - pts[k - 1][1],
            )
          }
          const chemin = document.createElementNS(ns, 'polyline')
          chemin.setAttribute('points', pts.map((p) => p.join(',')).join(' '))
          chemin.setAttribute('fill', 'none')
          chemin.setAttribute('stroke', payload.couleurLecture)
          chemin.setAttribute('stroke-width', `${0.25 * ppc}`)
          chemin.setAttribute('stroke-linecap', 'round')
          chemin.setAttribute('stroke-linejoin', 'round')
          chemin.setAttribute('opacity', '0.8')
          // Le trait se dessine en faisant glisser un unique tiret
          chemin.setAttribute('stroke-dasharray', `${longueur} ${longueur}`)
          chemin.setAttribute('stroke-dashoffset', `${longueur}`)
          chemin.appendChild(
            animate(
              'stroke-dashoffset',
              `${longueur}`,
              '0',
              RYTHME.portion,
              t + (RYTHME.portion + RYTHME.pause) * j,
            ),
          )
          group.appendChild(chemin)
        })
        if (payload.portions.length > 0) {
          t += (RYTHME.portion + RYTHME.pause) * payload.portions.length
        }

        // 3. Les intervalles solutions sur l'axe des abscisses
        payload.intervalles.forEach((inter, j) => {
          const debut = t + (RYTHME.intervalle + RYTHME.pause) * j
          const bande = trait(
            X(inter.gauche),
            0,
            X(inter.droite),
            0,
            payload.couleurSolutions,
            0.3 * ppc,
            debut,
            RYTHME.intervalle,
            false,
          )
          bande.setAttribute('opacity', '0.85')
          group.appendChild(bande)
          const bornes: [number, boolean, boolean][] = [
            [inter.gauche, true, inter.gaucheFerme],
            [inter.droite, false, inter.droiteFerme],
          ]
          for (const [x, borneGauche, ferme] of bornes) {
            const crochet = document.createElementNS(ns, 'polyline')
            crochet.setAttribute(
              'points',
              sommetsCrochet(x, borneGauche, ferme)
                .map(([a, b]) => `${X(a)},${Y(b)}`)
                .join(' '),
            )
            crochet.setAttribute('fill', 'none')
            crochet.setAttribute('stroke', payload.couleurSolutions)
            crochet.setAttribute('stroke-width', '3')
            group.appendChild(apparition(crochet, debut + RYTHME.intervalle))
            // Borne qui n'est pas une intersection (borne de l'ensemble de
            // définition) : on écrit aussi sa valeur
            if (!abscissesEcrites.has(x)) {
              abscissesEcrites.add(x)
              group.appendChild(etiquette(x, true, debut + RYTHME.intervalle))
            }
          }
        })

        svg.appendChild(group)
        group
          .querySelectorAll<SVGAnimateElement>('animate[data-delay]')
          .forEach((a) => {
            const delay = Number(a.getAttribute('data-delay') ?? 0)
            minuteurs.push(window.setTimeout(() => a.beginElement(), delay))
          })
      }

      const button = document.createElement('button')
      button.type = 'button'
      button.textContent = 'Revoir'
      button.className =
        'ml-3 rounded-md border border-coopmaths-action px-3 py-1 text-sm font-semibold text-coopmaths-action hover:bg-coopmaths-action hover:text-white'
      button.setAttribute('aria-label', "Revoir l'animation de lecture")
      button.addEventListener('click', play)
      element.replaceChildren(button)
      play()
      return () => {
        annulerMinuteurs()
        button.removeEventListener('click', play)
        svg.querySelector(`[data-${action}="${payload.figureId}"]`)?.remove()
        element.replaceChildren()
      }
    },
  )
}

function completeOptions(
  options: LectureSolutionsOptions,
): Required<LectureSolutionsOptions> {
  return {
    points: options.points,
    portions: options.portions ?? [],
    intervalles: options.intervalles ?? [],
    couleurLecture: options.couleurLecture ?? vertMathalea,
    couleurSolutions: options.couleurSolutions ?? orangeMathalea,
  }
}

/**
 * Élément HTML à placer juste après la figure (SVG d'id `figureId`) : il
 * anime la lecture et ajoute un bouton « Revoir ».
 */
export function lectureSolutionsAnimee(
  options: LectureSolutionsAnimeeOptions,
): string {
  register()
  const payload: Payload = {
    ...completeOptions(options),
    figureId: options.figureId,
    pixelsParCm: options.pixelsParCm,
  }
  return DomReadyActionElement.create({ action, payload })
}

/**
 * Tracés fixes de la lecture (pointillés, portions de courbe et intervalles
 * avec crochets), à ajouter aux objets de la figure pour les sorties LaTeX et
 * Typst.
 */
export function lectureSolutionsStatique(
  options: LectureSolutionsOptions,
): ObjetMathalea2D[] {
  const { points, portions, intervalles, couleurLecture, couleurSolutions } =
    completeOptions(options)
  const objets: ObjetMathalea2D[] = []
  for (const portion of portions) {
    const p = polyline(
      portion.map(([x, y]) => pointAbstrait(x, y)),
      couleurLecture,
    )
    p.epaisseur = 4
    p.opacite = 0.8
    objets.push(p)
  }
  for (const { x, y } of points) {
    const s = segment(x, y, x, 0, couleurLecture)
    s.epaisseur = 2
    s.pointilles = 5 // tirets simples (dashed)
    objets.push(s)
  }
  for (const inter of intervalles) {
    const bande = segment(inter.gauche, 0, inter.droite, 0, couleurSolutions)
    bande.epaisseur = 4
    bande.opacite = 0.85
    objets.push(bande)
    const bornes: [number, boolean, boolean][] = [
      [inter.gauche, true, inter.gaucheFerme],
      [inter.droite, false, inter.droiteFerme],
    ]
    for (const [x, borneGauche, ferme] of bornes) {
      const sommets = sommetsCrochet(x, borneGauche, ferme)
      for (let k = 0; k < sommets.length - 1; k++) {
        const s = segment(
          sommets[k][0],
          sommets[k][1],
          sommets[k + 1][0],
          sommets[k + 1][1],
          couleurSolutions,
        )
        s.epaisseur = 2
        objets.push(s)
      }
    }
  }
  return objets
}
