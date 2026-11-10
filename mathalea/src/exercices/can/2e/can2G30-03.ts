import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { tracePoint } from '../../../lib/2d/TracePoint'
import { vide2d } from '../../../lib/2d/Vide2d'
import { droite } from '../../../lib/2d/droites'
import { repere } from '../../../lib/2d/reperes'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../../lib/2d/textes'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { ecritureAlgebrique, rienSi1 } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Lire graphiquement l'équation réduite d’une droite"
export const interactifReady = true

export const dateDePublication = '15/11/2022'
export const dateDeModifImportante = '08/07/2025'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 *
*/

export const uuid = '1f967'

export const refs = {
  'fr-fr': ['can2G30-03', '2G31-flash1'],
  'fr-ch': ['NR'],
}
type Segment2d = { a: [number, number]; b: [number, number] }

/** Distance d'un point à un segment */
function distanceSegment(x: number, y: number, { a, b }: Segment2d): number {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const longueur2 = dx * dx + dy * dy
  const t =
    longueur2 === 0
      ? 0
      : Math.max(
          0,
          Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / longueur2),
        )
  return Math.hypot(x - (a[0] + t * dx), y - (a[1] + t * dy))
}

/**
 * Choisit, parmi des positions candidates (dans l'ordre de préférence), celle qui est
 * la plus éloignée des obstacles (droite, pointillés, autres labels), donc ni sur les
 * pointillés ni sur la droite. Les positions sont à coordonnées non entières pour
 * éviter aussi les lignes de la grille.
 */
function meilleurePosition(
  candidats: [number, number][],
  obstacles: Segment2d[],
  labelsPlaces: [number, number][],
): [number, number] {
  const score = ([x, y]: [number, number]) =>
    Math.min(
      0.6,
      ...obstacles.map((o) => distanceSegment(x, y, o)),
      ...labelsPlaces.map(([lx, ly]) => Math.hypot(x - lx, y - ly) - 0.2),
    )
  // on évite la zone des graduations de l'axe des abscisses
  const valides = candidats.filter(([, y]) => y > 0.4 || y < -0.7)
  const meilleur = Math.max(...valides.map(score))
  return valides.find((c) => score(c) >= meilleur - 0.05) ?? candidats[0]
}

export default class EquationDroite extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.versionQcmDisponible = true
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecEgalEtVariable
  }

  nouvelleVersion() {
    const xA = 0
    const yA = this.quotaRandint('yA', 1, 4)
    const xB = this.quotaRandint('xB', -5, 5, [0])
    const yB = this.quotaRandint('yB', 0, 4)

    const xmin = -6
    const ymin = -1
    const xmax = 6
    const ymax = 5
    const o = latex2d('\\text{O}', -0.3, -0.3, { letterSize: 'scriptsize' })
    const A = pointAbstrait(xA, yA)
    const B = pointAbstrait(xB, yB)

    // On calcule le coefficient directeur avec un point de la droite à droite de A,
    // à coordonnées entières, le plus proche possible de A (pas d'une unité si m est entier)
    const m = (yB - yA) / (xB - xA)
    const pgcd = (u: number, v: number): number =>
      v === 0 ? u : pgcd(v, u % v)
    const largeur =
      Math.abs(xB - xA) / pgcd(Math.abs(xB - xA), Math.abs(yB - yA))
    const denivele = m * largeur
    const xC = xA + largeur
    const yC = yA + denivele
    const maFraction = new FractionEtendue(yB - yA, xB - xA)
    // le point de calcul est B lui-même s'il est à droite de A et déjà « minimal »
    const nomC = xC === xB && yC === yB ? 'B' : 'C'

    const yMinC = Math.min(ymin, Math.floor(yC) - 1)
    const yMaxC = Math.max(ymax, Math.ceil(yC) + 1)
    const creerRepere = (yMin: number, yMax: number) =>
      repere({
        xMin: xmin,
        xMax: xmax,
        xUnite: 1,
        yMin,
        yMax,
        yUnite: 1,
        thickHauteur: 0.1,
        xLabelMin: xmin + 1,
        xLabelMax: xmax - 1,
        yLabelMax: yMax - 1,
        yLabelMin: yMin + 1,
        axeXStyle: '->',
        axeYStyle: '->',
        yLabelDistance: 1,
        yLabelEcart: 0.3,
        grilleSecondaire: true,
        grilleSecondaireYDistance: 1,
        grilleSecondaireXDistance: 1,
        grilleSecondaireYMin: yMin - 0.1,
        grilleSecondaireYMax: yMax + 0.1,
        grilleSecondaireXMin: xmin - 0.1,
        grilleSecondaireXMax: xmax + 0.1,
      })
    const r1 = creerRepere(ymin, ymax)
    const rC = creerRepere(yMinC, yMaxC)

    const C = pointAbstrait(xC, yC)
    const H = pointAbstrait(xC, yA)
    const sHorizontal = segment(A, H, 'green')
    const sVertical = yC === yA ? vide2d() : segment(C, H, bleuMathalea)
    sVertical.epaisseur = 2
    sVertical.pointilles = 5
    sHorizontal.epaisseur = 2
    sHorizontal.pointilles = 5

    const traceA = tracePoint(A, 'black')
    const traceB = tracePoint(B, 'black')
    const traceC = tracePoint(C, 'black')
    for (const t of [traceA, traceB, traceC]) {
      t.taille = 3
      t.epaisseur = 2
    }

    // Labels : placés loin de la droite, des pointillés et de la grille
    const droiteSeg: Segment2d = {
      a: [xmin - 1, yA + m * (xmin - 1)],
      b: [xmax + 1, yA + m * (xmax + 1)],
    }
    const horizSeg: Segment2d = { a: [xA, yA], b: [xC, yA] }
    const vertSeg: Segment2d = { a: [xC, yC], b: [xC, yA] }
    const obstacles = [droiteSeg, horizSeg, vertSeg]
    // les graduations de l'axe des ordonnées comptent comme des labels déjà placés
    const labelsPlaces: [number, number][] = []
    for (let k = Math.ceil(yMinC) + 1; k < yMaxC; k++) {
      if (k !== 0) labelsPlaces.push([-0.3, k])
    }
    const placer = (candidats: [number, number][]) => {
      const pos = meilleurePosition(candidats, obstacles, labelsPlaces)
      labelsPlaces.push(pos)
      return pos
    }
    const candidatsPoint = (x: number, y: number): [number, number][] => [
      [x - 0.4, y + 0.5],
      [x + 0.4, y + 0.5],
      [x - 0.4, y - 0.5],
      [x + 0.4, y - 0.5],
    ]
    const [xlA, ylA] = placer(candidatsPoint(xA, yA))
    const lA = latex2d('A', xlA, ylA, { letterSize: 'scriptsize' })
    // Le point C n'est nommé que si le texte de la correction y fait référence
    const nommerC = !Number.isInteger(m)
    const [xlC, ylC] = nommerC ? placer(candidatsPoint(xC, yC)) : [0, 0]
    const lC = latex2d(nomC, xlC, ylC, { letterSize: 'scriptsize' })

    // Labels pour les déplacements
    const candidatsH: [number, number][] = []
    for (let k = 0; k < largeur; k++) {
      for (const dy of [-0.5, 0.5]) candidatsH.push([xA + k + 0.5, yA + dy])
    }
    const [xlH, ylH] = placer(candidatsH)
    const lHorizontal = latex2d(`${largeur}`, xlH, ylH, {
      color: 'green',
      letterSize: 'scriptsize',
    })
    const yMinV = Math.min(yA, yC)
    const candidatsV: [number, number][] = []
    for (let k = 0; k < Math.abs(denivele); k++) {
      for (const dx of [0.5, -0.5]) candidatsV.push([xC + dx, yMinV + k + 0.5])
    }
    const [xlV, ylV] = placer(
      candidatsV.length > 0 ? candidatsV : [[xC + 0.5, yA]],
    )
    const lVertical = latex2d(`${denivele}`, xlV, ylV, {
      color: bleuMathalea,
      letterSize: 'scriptsize',
    })

    const d = droite(A, B, '', bleuMathalea)
    d.epaisseur = 2

    const objet = mathalea2d(
      {
        xmin,
        xmax,
        ymin: ymin - 0.25,
        ymax: ymax + 0.25,
        pixelsParCm: 30,
        scale: 0.75,
        center: !context.isHtml,
      },
      d,
      r1,
      traceA,
      traceB,
      o,
    )
    const objetC = mathalea2d(
      {
        xmin,
        xmax,
        ymin: yMinC,
        ymax: yMaxC + 0.25,
        pixelsParCm: 30,
        scale: 0.75,
        center: !context.isHtml,
      },
      d,
      rC,
      traceA,
      lA,
      traceC,
      ...(nommerC ? [lC] : []),
      o,
      sHorizontal,
      sVertical,
      lHorizontal,
      lVertical,
    )

    if (context.isAmc) this.versionQcm = false
    this.question = this.versionQcm
      ? ''
      : "Donner l'équation réduite de la droite.<br>"
    this.question += `${objet}`
    this.question += this.versionQcm
      ? "<br>L'équation réduite de cette droite est : "
      : ''

    if (yB === yA) {
      this.reponse = this.versionQcm
        ? `$y= ${yA}$`
        : [`y=${yA}`, `y=0x + ${yA}`, `y=0 \\cdot x + ${yA}`]
      this.correction = `La droite est horizontale. On en déduit que son coefficient directeur est $m=0$.<br>
        Son ordonnée à l'origine est $${yA}$, ainsi l'équation réduite de la droite est $${miseEnEvidence(`y=${yA}`)}$.`
      this.distracteurs = [`$y=x + ${yA}$`, `$x=${yA}$`, `$y=${rienSi1(yA)}x$`]
    } else {
      const intro = `Son ordonnée à l'origine est $${yA}$, ainsi l'équation réduite de la droite est $y=mx${ecritureAlgebrique(yA)}$. On cherche $m$.`
      const pluriel = (n: number) => (Math.abs(n) > 1 ? 's' : '')
      const sens = denivele > 0 ? 'monte' : 'descend'
      if (Number.isInteger(m)) {
        this.correction = `On choisit le point $A(${xA}\\,;\\,${yA})$ de la droite. ${intro}<br>
Depuis $A$, on se déplace d'une unité horizontalement vers la droite, puis on mesure verticalement le déplacement nécessaire pour rejoindre la droite : ce déplacement est le coefficient directeur.<br>
Ici, on ${sens} de $${Math.abs(m)}$ unité${pluriel(m)}, donc $m=${miseEnEvidence(`${m}`)}$.<br>`
      } else {
        this.correction = `On choisit le point $A(${xA}\\,;\\,${yA})$ de la droite. ${intro}<br>
On choisit ensuite un point $${nomC}(${xC}\\,;\\,${yC})$ de la droite situé à droite de $A$ et dont les coordonnées sont entières.<br>
De $A$ à $${nomC}$, on avance horizontalement de $${miseEnEvidence(largeur, 'green')}$ unité${pluriel(largeur)} et on ${sens} verticalement de $${miseEnEvidence(Math.abs(denivele), bleuMathalea)}$ unité${pluriel(denivele)}.<br>
Le coefficient directeur est le quotient du dénivelé vertical par le déplacement horizontal :<br>
$m=\\dfrac{\\text{dénivelé vertical}}{\\text{déplacement horizontal}}=\\dfrac{${miseEnEvidence(denivele, bleuMathalea)}}{${miseEnEvidence(largeur, 'green')}}=${maFraction.texFractionSimplifiee}$.<br>`
      }
      if ((yB - yA) / (xB - xA) === 1) {
        this.correction += `Ainsi, l'équation réduite de la droite est $${miseEnEvidence(`y=x${yA === 0 ? '' : `${ecritureAlgebrique(yA)}`}`)}$.`
      } else if ((yB - yA) / (xB - xA) === -1) {
        this.correction += `Ainsi, l'équation réduite de la droite est $${miseEnEvidence(`y=-x${yA === 0 ? '' : `${ecritureAlgebrique(yA)}`}`)}$.`
      } else {
        this.correction += `Ainsi, l'équation réduite de la droite est $${miseEnEvidence(`y=${maFraction.texFractionSimplifiee}x${yA === 0 ? '' : `${ecritureAlgebrique(yA)}`}`)}$.`
      }
      this.correction += `<br>${objetC}<br>`

      // Les réponses sont toujours basées sur la vraie équation y = mx + p où m = (yB-yA)/(xB-xA) et p = yA
      if ((yB - yA) / (xB - xA) === 1 || (yB - yA) / (xB - xA) === -1) {
        this.reponse = this.versionQcm
          ? `$y= ${rienSi1(maFraction.valeurDecimale)}x${yA === 0 ? '' : ` ${ecritureAlgebrique(yA)}`}$`
          : [
              `y=${maFraction.valeurDecimale}x${ecritureAlgebrique(yA)}`,
              `y=\\frac{${yB - yA}}{${xB - xA}}x${ecritureAlgebrique(yA)}`,
              `y=\\frac{${yA - yB}}{${xA - xB}}x${ecritureAlgebrique(yA)}`,
            ]
      } else {
        this.reponse = this.versionQcm
          ? `$y= ${maFraction.texFractionSimplifiee}x${yA === 0 ? '' : ` ${ecritureAlgebrique(yA)}`}$`
          : [
              `y=${maFraction.texFraction}x${ecritureAlgebrique(yA)}`,
              `y=\\frac{${yB - yA}}{${xB - xA}}x${ecritureAlgebrique(yA)}`,
              `y=\\frac{${yA - yB}}{${xA - xB}}x${ecritureAlgebrique(yA)}`,
            ]
      }

      if (this.versionQcm) {
        // Distracteurs basés sur des erreurs classiques
        if ((yB - yA) / (xB - xA) === 1 || (yB - yA) / (xB - xA) === -1) {
          this.distracteurs = [
            `$y= ${rienSi1(maFraction.multiplieEntier(-1).valeurDecimale)}x${ecritureAlgebrique(yA)}$`, // Coefficient opposé
            `$y=${yA}$`, // Droite horizontale (erreur)
            `$y= ${rienSi1(yA)}x${ecritureAlgebrique(-yA)}$`, // Fraction inversée
          ]
        } else {
          this.distracteurs = [
            `$y= ${maFraction.multiplieEntier(-1).texFractionSimplifiee}x${ecritureAlgebrique(yA)}$`, // Coefficient opposé
            `$y=${yA}$`, // Droite horizontale (erreur)
            `$y= ${new FractionEtendue(xB - xA, yB - yA).texFractionSimplifiee}x${ecritureAlgebrique(yA)}$`, // Fraction inversée
          ]
        }
      }
    }
  }
}
