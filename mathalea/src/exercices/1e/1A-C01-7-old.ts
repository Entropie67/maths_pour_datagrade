// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid c96ba continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const titre = "Déduire une comparaison du signe d'une différence"
export const dateDePublication = '16/07/2026'
export const uuid = 'c96ba'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'

/**
 * Déduire l'ordre de deux fractions à partir du signe de leur différence.
 * @author Stéphane Guyon
 */
export default class ComparerFractionsAvecDifferenceOld extends ExerciceQcmA {
  private appliquerLesValeurs(n: number, forme: 1 | 2): void {
    const fraction1 = `\\dfrac{${n}}{${n + 1}}`
    const fraction2 = `\\dfrac{${n + 1}}{${n + 2}}`

    this.enonce =
      forme === 1
        ? `On sait que :
        $${fraction1}-${fraction2} < 0$.<br><br>
        On peut en déduire que :`
        : `On sait que :
        $${fraction2}-${fraction1} > 0$.<br><br>
        On peut en déduire que :`

    this.reponses = [
      `$${fraction1} < ${fraction2}$`,
      `$\\dfrac{${n + 1}}{${n}} < \\dfrac{${n + 1}}{${n + 2}}$`,
      `$\\dfrac{${n + 1}}{${n}} < \\dfrac{${n + 2}}{${n + 1}}$`,
      `$\\dfrac{${n + 1}}{${n + 1}} < \\dfrac{${n}}{${n + 2}}$`,
    ]

    this.correction =
      forme === 1
        ? `La différence $${fraction1}-${fraction2}$ est négative.<br>
        Le premier nombre est donc inférieur au second :<br>
        $${miseEnEvidence(`${fraction1} < ${fraction2}`)}$.`
        : `La différence $${fraction2}-${fraction1}$ est positive.<br>
        On a donc $${fraction2} > ${fraction1}$, c'est-à-dire :<br>
        $${miseEnEvidence(`${fraction1} < ${fraction2}`)}$.`
  }

  versionAleatoire = (): void => {
    this.appliquerLesValeurs(randint(30, 60), choice([1, 2]))
  }

  constructor() {
    super()
    this.tip = `
      <p style="margin: 0;">
        Si deux nombres réels $A$ et $B$ vérifient $A-B > 0$, alors $A > B$.
      </p>
    `
    this.besoinFormulaireCaseACocher = false
    this.versionAleatoire()
  }
}
