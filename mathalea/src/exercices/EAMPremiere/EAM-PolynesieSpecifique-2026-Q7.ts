import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { droite } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import type { ObjetMathalea2D } from '../../lib/2d/ObjetMathalea2D'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import RepereBuilder from '../../lib/2d/RepereBuilder'
import { latex2d } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d, type Mathalea2dDisplay } from '../../modules/mathalea2d'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = 'psq07'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Déterminer graphiquement l'équation réduite d'une droite"
export const dateDePublication = '02/07/2026'
export const dateDeModifImportante = '22/10/2026'

/**
 * @author Stéphane Guyon
 */
export default class AutoQ7PolynesieSpecifique2026 extends ExerciceQcmACourt {
  private creerFigure(xIntercept: number, b: -1 | 1, avecPoints = false) {
    const A = pointAbstrait(0, b)
    const B = pointAbstrait(xIntercept, 0)
    const d = droite(A, B)
    d.color = colorToLatexOrHTML('blue')
    const rep = new RepereBuilder({
      xMin: -1,
      xMax: 7,
      yMin: -2,
      yMax: 3,
    })
      .setGrille({
        grilleX: { dx: 1, style: 'pointilles' },
        grilleY: { dy: 1, style: 'pointilles' },
      })
      .setThickX({ xMin: -1, xMax: 6, dx: 1 })
      .setThickY({ yMin: -1, yMax: 2, dy: 1 })
      .setLabelsX([{ valeur: 1, texte: '1' }])
      .setLabelsY([{ valeur: 1, texte: '1' }])
      .buildCustom()
    const xLabelD = Math.min(5.8, xIntercept + 1.8)
    const yLabelD = b + (-b / xIntercept) * xLabelD + (b === -1 ? 0.6 : -0.6)
    const labelD = latex2d('(d)', xLabelD, yLabelD, {
      letterSize: 'small',
      color: 'blue',
    })
    const objets: ObjetMathalea2D[] = [rep, d, labelD]

    if (avecPoints) {
      const traces = tracePoint(A, B, 'red')
      traces.epaisseur = 2
      const labelA = latex2d('A', 0.3, b + (b === -1 ? -0.35 : 0.35), {
        letterSize: 'scriptsize',
        color: 'red',
      })
      const labelB = latex2d('B', xIntercept, -0.35, {
        letterSize: 'scriptsize',
        color: 'red',
      })
      objets.push(traces, labelA, labelB)
    }

    return mathalea2d(
      Object.assign(
        { scale: 0.55, display: 'block' as Mathalea2dDisplay },
        fixeBordures(objets),
      ),
      objets,
    )
  }

  private appliquerLesValeurs(xIntercept: number, b: -1 | 1): void {
    const coefficient = new FractionEtendue(-b, xIntercept).simplifie()
    const coefficientInverse = new FractionEtendue(xIntercept, -b).simplifie()
    const constanteOpposeCoefficient = new FractionEtendue(
      b,
      xIntercept,
    ).simplifie()
    const equation = `y=${coefficient.texFractionSaufUn}x${ecritureAlgebrique(b)}`
    const figure = this.creerFigure(xIntercept, b)
    const figureCorrection = this.creerFigure(xIntercept, b, true)

    this.enonce = `Dans le repère du plan ci-dessous, on a tracé la droite $(d)$.<br>
    ${figure}
    L'équation réduite de la droite $(d)$ est :`

    this.reponses = [
      `$${equation}$`,
      `$y=${coefficientInverse.texFractionSaufUn}x${ecritureAlgebrique(b)}$`,
      `$y=x${ecritureAlgebrique(constanteOpposeCoefficient)}$`,
      `$y=${coefficient.texFractionSaufUn}x${ecritureAlgebrique(-b)}$`,
    ]

    this.correction = `${figureCorrection}
    Graphiquement, la droite passe par les points $A(0\\,;\\,${b})$ et $B(${xIntercept}\\,;\\,0)$.<br>
    Son ordonnée à l'origine vaut donc environ $${b}$.<br>
    Son coefficient directeur est :<br>
    $a=\\dfrac{y_B-y_A}{x_B-x_A}=\\dfrac{0${ecritureAlgebrique(-b)}}{${xIntercept}-0}=\\dfrac{${-b}}{${xIntercept}}=${coefficient.texFractionSimplifiee}$.<br>
    L'équation réduite de la droite $(d)$ est : $${miseEnEvidence(equation)}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(4, -1)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      this.appliquerLesValeurs(choice([2, 3, 4, 5]), choice([-1, 1]))
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /(?:L'équation réduite de la droite \$\(d\)\$|Une équation de la droite) est :\s*$/,
        this.interactif
          ? "L'équation réduite de la droite $(d)$ est "
          : "Déterminer l'équation réduite de la droite $(d)$.",
      )
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { egaliteExpression: true })
    this.clavierReponseCourte = KeyboardType.lyceeClassique
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = '.'
  }
}
