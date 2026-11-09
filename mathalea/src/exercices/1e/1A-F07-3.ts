import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { tracePoint } from '../../lib/2d/TracePoint'
import { droite } from '../../lib/2d/droites'
import { repere } from '../../lib/2d/reperes'
import { vide2d } from '../../lib/2d/Vide2d'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
/**
 * @author Gilles Mora
 *
 */
export const dateDeModifImportante = '22/10/2026'

export const uuid = 'f04f3'
export const refs = {
  'fr-fr': ['1A-F07-3'],
  'fr-ch': ['1mQCM-63', '11LCQCMFA2C-3', '11LSQCMFA2C-3'],
}
export const interactifReady = true

export const amcReady = 'true'
export const titre =
  "Déterminer le coefficient directeur d'une droite à partir de sa représentation graphique"
export const dateDePublication = '10/07/2025'

export default class Auto1AF6c extends ExerciceQcmACourt {
  // Réponse attendue : le coefficient directeur seul (la saisie est précédée de « m= »)
  clavierReponseCourte = KeyboardType.clavierDeBaseAvecFraction
  texteAvantReponseCourte = 'Le coefficient directeur de cette droite est $m=$'
  private enonceGraphique = ''
  // Hors interactif, la question n'a pas de champ pour la porter
  enonceCourt = () =>
    this.enonceGraphique +
    (this.interactif
      ? ''
      : '<br>Donner le coefficient directeur de cette droite.')

  /**
   * Génère l'exercice avec les coordonnées données
   */
  private genererExercice(
    xA: number,
    yA: number,
    xB: number,
    yB: number,
  ): void {
    const o = latex2d('\\text{O}', -0.3, -0.3, { letterSize: 'scriptsize' })
    const A = pointAbstrait(xA, yA)
    const B = pointAbstrait(xB, yB)
    const maFraction = new FractionEtendue(yB - yA, xB - xA)

    const lA = latex2d(
      'A',
      xA - 0.4,
      yA + ((yB - yA) / (xB - xA) > 0 ? 0.5 : -0.5),
      { letterSize: 'scriptsize' },
    )
    const traceA = tracePoint(A, 'black')
    traceA.taille = 3
    traceA.epaisseur = 2

    const lB = latex2d('B', xB, yB + 0.5, { letterSize: 'scriptsize' })
    const traceB = tracePoint(B, 'black')
    traceB.taille = 3
    traceB.epaisseur = 2

    const d = droite(A, B, '', bleuMathalea)
    d.epaisseur = 2

    const xmin = -6
    const ymin = -1
    const xmax = 6
    const ymax = 6

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
      })
    const r1 = creerRepere(ymin, ymax)

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
      o,
    )

    // Figure de correction : point B' à droite de A, à coordonnées entières,
    // avec le déplacement horizontal et le dénivelé vertical entiers (pas d'une unité si m est entier)
    const m = (yB - yA) / (xB - xA)
    const pgcd = (u: number, v: number): number =>
      v === 0 ? u : pgcd(v, u % v)
    const largeur =
      Math.abs(xB - xA) / pgcd(Math.abs(xB - xA), Math.abs(yB - yA))
    const denivele = m * largeur
    const yQ = yA + denivele
    const yMinC = Math.min(ymin, Math.floor(yQ) - 1)
    const yMaxC = Math.max(ymax, Math.ceil(yQ) + 1)
    const rC = creerRepere(yMinC, yMaxC)
    const P = pointAbstrait(xA + largeur, yA)
    const Q = pointAbstrait(xA + largeur, yQ)
    const sAP = segment(A, P, 'green')
    const sPQ = m !== 0 ? segment(P, Q, bleuMathalea) : vide2d()
    for (const seg of [sAP, sPQ]) {
      seg.epaisseur = 2
      seg.pointilles = 5
    }
    const lLargeur = latex2d(
      `${largeur}`,
      Math.floor(xA + largeur / 2) + 0.5,
      yA + (m > 0 ? -0.5 : 0.5),
      {
        color: 'green',
        letterSize: 'scriptsize',
      },
    )
    const lDenivele = latex2d(
      `${denivele}`,
      xA + largeur + 0.5,
      Math.floor((yA + yQ) / 2) + 0.5,
      {
        color: bleuMathalea,
        letterSize: 'scriptsize',
      },
    )
    const traceQ = tracePoint(Q, 'black')
    traceQ.taille = 3
    traceQ.epaisseur = 2
    const lQ = latex2d('B', xA + largeur - 0.4, yQ + (m > 0 ? 0.5 : -0.5), {
      letterSize: 'scriptsize',
    })
    const objetsB = Number.isInteger(m) ? [] : [lQ]

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
      traceQ,
      ...objetsB,
      o,
      sAP,
      sPQ,
      lLargeur,
      lDenivele,
    )

    this.enonceGraphique = `Dans un repère du plan, on a représenté une droite.<br><br>
      ${objet}`
    this.enonce = `${this.enonceGraphique}<br>
      Le coefficient directeur de cette droite est égal à :`

    if (yB === yA) {
      this.correction = `La droite est horizontale. On en déduit que son coefficient directeur est $m=${miseEnEvidence('0')}$.<br>`
      this.reponses = [
        '$0$',
        `${yA !== 1 && yA !== -1 ? `$${yA}$` : '$2$'}`,
        '$1$',
        '$-1$',
      ]
    } else {
      const pluriel = (n: number) => (Math.abs(n) > 1 ? 's' : '')
      const sens = denivele > 0 ? 'monte' : 'descend'
      if (Number.isInteger(m)) {
        this.correction = `On choisit le point $A(${xA}\\,;\\,${yA})$ de la droite.<br>
      Depuis $A$, on se déplace d'une unité horizontalement vers la droite, puis on mesure verticalement le déplacement nécessaire pour rejoindre la droite : ce déplacement est le coefficient directeur.<br>
      Ici, on ${sens} de $${Math.abs(m)}$ unité${pluriel(m)}, donc $m=${miseEnEvidence(`${m}`)}$.`
      } else {
        this.correction = `On choisit le point $A(${xA}\\,;\\,${yA})$ de la droite, puis un point $B(${xA + largeur}\\,;\\,${yQ})$ de la droite situé à droite de $A$ et dont les coordonnées sont entières.<br>
      De $A$ à $B$, on avance horizontalement de $${miseEnEvidence(largeur, 'green')}$ unité${pluriel(largeur)} et on ${sens} verticalement de $${miseEnEvidence(Math.abs(denivele), bleuMathalea)}$ unité${pluriel(denivele)}.<br>
      Le coefficient directeur est le quotient du dénivelé vertical par le déplacement horizontal :<br>
      $m=\\dfrac{\\text{dénivelé vertical}}{\\text{déplacement horizontal}}=\\dfrac{${miseEnEvidence(denivele, bleuMathalea)}}{${miseEnEvidence(largeur, 'green')}}=${miseEnEvidence(`${maFraction.texFractionSimplifiee}`)}$`
      }
      this.correction += `<br>${objetC}<br>`
      this.reponses = [
        `$${maFraction.texFractionSimplifiee}$`,
        `${Math.abs((yB - yA) / (xB - xA)) !== 1 ? `$${maFraction.inverse().texFractionSimplifiee}$` : '$0$'}`,
        `$${maFraction.oppose().texFractionSimplifiee}$`,
        `${(yB - yA) / (xB - xA) !== yA ? `$${yA}$` : `$${xB}$`}`,
      ]
    }
  }

  versionOriginale: () => void = () => {
    this.genererExercice(0, 2, 1, -1)
  }

  versionAleatoire: () => void = () => {
    let compteur = 0 // un compteur pour éviter les boucles infinies si le qcm est vraiment problématique
    do {
      const xA = 0
      const yA = randint(1, 5)
      const xB = randint(-5, 5, 0)
      const yB = randint(0, 6)
      this.genererExercice(xA, yA, xB, yB)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
    // Ici, on doit avoir une bonne réponse et 3 distracteurs distincts.
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(
        saisie,
        reponse,
        reponse.includes('frac')
          ? { fractionEgale: true, nombreDecimalSeulement: true }
          : { nombreDecimalSeulement: true },
      )
    this.versionAleatoire()
  }
}
