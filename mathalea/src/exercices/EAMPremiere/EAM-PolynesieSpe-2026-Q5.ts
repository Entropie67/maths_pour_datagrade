import { courbe } from '../../lib/2d/Courbe'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import type { ObjetMathalea2D } from '../../lib/2d/ObjetMathalea2D'
import { point } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d, type Mathalea2dDisplay } from '../../modules/mathalea2d'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { sp } from '../../lib/outils/outilString'

export const uuid = 'ps265'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  'Résoudre graphiquement une inéquation avec la fonction inverse'
export const dateDePublication = '01/07/2026'
export const dateDeModifImportante = '22/10/2026'

type SensInegalite = '>' | '<' | '\\leqslant'

/**
 * @author Stéphane Guyon
 */
export default class AutoQ5PolynesieSpe2026 extends ExerciceQcmACourt {
  // Correction de la saisie libre : « S= » est écrit devant le champ, seul l'ensemble est mis en évidence
  private correctionSaisie = ''

  private creerFigure(seuil: number, sens?: SensInegalite): string {
    const borneNumerique = 1 / seuil
    const borne = new FractionEtendue(1, seuil).texFractionSimplifiee
    const r = repere({
      xMin: -5,
      xMax: 5,
      yMin: -5,
      yMax: 5,
      grilleSecondaire: true,
      grilleSecondaireXDistance: 0.5,
      grilleSecondaireYDistance: 0.5,
    })
    const brancheGauche = courbe((x) => 1 / x, {
      repere: r,
      color: 'red',
      xMin: -5,
      xMax: -0.1,
      yMin: -5,
      yMax: 5,
      step: 0.05,
    })
    const brancheDroite = courbe((x) => 1 / x, {
      repere: r,
      color: 'red',
      xMin: 0.1,
      xMax: 5,
      yMin: -5,
      yMax: 5,
      step: 0.05,
    })
    const objets: ObjetMathalea2D[] = [r, brancheGauche, brancheDroite]

    if (sens != null) {
      const droiteSeuil = segment(-5, seuil, 5, seuil, 'blue')
      droiteSeuil.epaisseur = 2
      const labelSeuil = latex2d(`y=${seuil}`, 4.15, seuil + 0.65, {
        color: 'blue',
        letterSize: 'scriptsize',
      })
      const projectionBorne = segment(
        borneNumerique,
        0,
        borneNumerique,
        seuil,
        'blue',
      )
      projectionBorne.pointilles = 5
      projectionBorne.epaisseur = 1.5
      const pointIntersection = tracePoint(point(borneNumerique, seuil), 'blue')
      pointIntersection.style = 'o'
      pointIntersection.epaisseur = 2
      const labelAbscisse = latex2d(borne, borneNumerique, -0.55, {
        color: 'blue',
        letterSize: 'scriptsize',
      })
      const courbesSolutions =
        sens === '>'
          ? [
              courbe((x) => 1 / x, {
                repere: r,
                color: 'green',
                epaisseur: 3,
                xMin: 0.1,
                xMax: borneNumerique,
                yMin: -5,
                yMax: 5,
                step: 0.02,
              }),
            ]
          : [
              courbe((x) => 1 / x, {
                repere: r,
                color: 'green',
                epaisseur: 3,
                xMin: -5,
                xMax: -0.1,
                yMin: -5,
                yMax: 5,
                step: 0.02,
              }),
              courbe((x) => 1 / x, {
                repere: r,
                color: 'green',
                epaisseur: 3,
                xMin: borneNumerique,
                xMax: 5,
                yMin: -5,
                yMax: 5,
                step: 0.02,
              }),
            ]
      const segmentsSolutions =
        sens === '>'
          ? [segment(0, 0, borneNumerique, 0, 'green')]
          : [
              segment(-5, 0, 0, 0, 'green'),
              segment(borneNumerique, 0, 5, 0, 'green'),
            ]
      const crochets =
        sens === '>'
          ? [
              latex2d(']', 0, 0, {
                color: 'green',
                letterSize: 'LARGE',
                gras: true,
              }),
              latex2d('[', borneNumerique, 0, {
                color: 'green',
                letterSize: 'LARGE',
                gras: true,
              }),
            ]
          : [
              latex2d('[', 0, 0, {
                color: 'green',
                letterSize: 'LARGE',
                gras: true,
              }),
              latex2d(sens === '<' ? ']' : '[', borneNumerique, 0, {
                color: 'green',
                letterSize: 'LARGE',
                gras: true,
              }),
            ]
      for (const segmentSolution of segmentsSolutions) {
        segmentSolution.epaisseur = 3
      }
      objets.push(
        droiteSeuil,
        labelSeuil,
        ...courbesSolutions,
        projectionBorne,
        pointIntersection,
        labelAbscisse,
        ...segmentsSolutions,
        ...crochets,
      )
    }

    return mathalea2d(
      Object.assign(
        { scale: 0.45, display: 'block' as Mathalea2dDisplay },
        fixeBordures([r]),
      ),
      objets,
    )
  }

  private appliquerLesValeurs(seuil: number, sens: SensInegalite): void {
    const borne = new FractionEtendue(1, seuil).texFractionSimplifiee
    const sensTex = sens === '<' ? '{<}' : sens
    const intervallePositifStrict = `\\left]0\\,;\\,${borne}\\right[`
    const intervallePositifFerme = `\\left]0\\,;\\,${borne}\\right]`
    const intervalleDroiteStrict = `\\left]${borne}\\,;\\,+\\infty\\right[`
    const intervalleDroiteFerme = `\\left[${borne}\\,;\\,+\\infty\\right[`
    const intervalleNegatif = '\\left]-\\infty\\,;\\,0\\right['
    const correct =
      sens === '>'
        ? intervallePositifStrict
        : sens === '<'
          ? `${intervalleNegatif}\\cup${intervalleDroiteStrict}`
          : `${intervalleNegatif}\\cup${intervalleDroiteFerme}`
    const positionCourbe =
      sens === '>'
        ? `strictement au-dessus de la droite horizontale d'équation $y=${seuil}$`
        : sens === '<'
          ? `strictement en dessous de la droite horizontale d'équation $y=${seuil}$`
          : `en dessous ou sur la droite horizontale d'équation $y=${seuil}$`
    const lectureGraphique =
      sens === '>'
        ? `On lit alors que cela correspond aux abscisses $x$ telles que $0{<}x{<}${borne}$.`
        : sens === '<'
          ? `On lit alors que cela correspond aux abscisses $x$ telles que $x{<}0$ ou $x{>}${borne}$.`
          : `On lit alors que cela correspond aux abscisses $x$ telles que $x{<}0$ ou $x\\geqslant ${borne}$.`
    const figure = this.creerFigure(seuil)
    const figureCorrection = this.creerFigure(seuil, sens)

    this.enonce = `On a représenté ci-dessous la courbe de la fonction inverse définie sur $\\mathbb{R}^*$ par $f(x)=\\dfrac{1}{x}$.<br>
    ${figure}
    L'ensemble des solutions de l'inéquation $\\dfrac{1}{x}${sensTex} ${seuil}$ est${sp()}:`

    this.reponses = [
      `$${correct}$`,
      `$${intervallePositifFerme}$`,
      `$${intervalleDroiteFerme}$`,
      `$${intervalleNegatif}\\cup${intervallePositifFerme}$`,
    ]

    // QCM : l'ensemble est mis en évidence ; saisie libre : « S= » est écrit devant le champ
    const corrige = (
      conclusion: string,
    ) => `Pour résoudre graphiquement l'inéquation $\\dfrac{1}{x}${sensTex} ${seuil}$, on cherche les abscisses respectives des points de la courbe situés ${positionCourbe}.<br>
    ${figureCorrection}
    La courbe coupe cette droite horizontale en un point d'abscisse $x=${borne}$.<br>
    ${lectureGraphique}<br>
    L'ensemble des solutions est donc $${conclusion}$.`
    this.correction = corrige(miseEnEvidence(correct))
    this.correctionSaisie = corrige(`S=${miseEnEvidence(correct)}`)
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(2, '>')
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      this.appliquerLesValeurs(
        choice([2, 3, 4]),
        choice(['>', '<', '\\leqslant']),
      )
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /L'ensemble des solutions de l'inéquation (\$.*\$) est[^:]*:\s*$/,
        (_, inequation: string) =>
          `Donner l'ensemble des solutions de l'inéquation ${inequation}.`,
      )
    // La bonne réponse du QCM est de la forme « $\left]-\infty\,;\,0\right[\cup…$ » : on ne garde que l'ensemble
    this.reponseCourte = () =>
      this.reponses[0]
        .replace(/^\$|\$$/g, '')
        .replace(/\\left|\\right|\\,/g, '')
    this.correctionCourte = () => this.correctionSaisie
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { intervalle: true })
    this.texteAvantReponseCourte = '$S=$'
    this.clavierReponseCourte = KeyboardType.clavierEnsemble
  }
}
