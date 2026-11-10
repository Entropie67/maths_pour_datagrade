import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { distracteursDistincts } from '../../../lib/interactif/qcmDistractors'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  "Déterminer le coefficient directeur d'une fonction affine à partir de deux images"
export const interactifReady = true

export const dateDePublication = '01/09/2026'
export const uuid = '7b93d'
export const refs = {
  'fr-fr': ['can2F20-06'],
  'fr-ch': ['NR'],
}
/*** Copie de can2G30-05 pour les auto 1ere avec énoncé différent par A.Meistermann
 * @author Gilles Mora

*/
export default class TrouverCoeffDir extends ExerciceSimple {
  constructor() {
    super()
    this.versionQcmDisponible = true
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsChampTexte = { texteApres: '.' }
    this.spacing = 1.5
    this.versionQcm = false
  }

  nouvelleVersion() {
    const xA = this.quotaRandint('xA', -10, 10, [0])
    const yA = this.quotaRandint('yA', -10, 10, [0])
    const xB = randint(-10, 10, [0, xA])
    // Le plan de quotaRandint est construit avec le yA de la première question : pour les suivantes,
    // yB peut valoir yA (m = 0, et la fraction des distracteurs a un dénominateur nul).
    // La valeur est alors remplacée, sans tirage aléatoire supplémentaire.
    const yBTire = this.quotaRandint('yB', -10, 10, [0, yA])
    const yB =
      yBTire !== yA
        ? yBTire
        : ([yA + 1, yA - 1].find((v) => v !== 0 && Math.abs(v) <= 10) ?? yA + 1)
    const m = new FractionEtendue(yB - yA, xB - xA)
    if (context.isAmc) this.versionQcm = false
    this.reponse = this.versionQcm
      ? `$${m.texFractionSimplifiee}$`
      : m.texFractionSimplifiee
    this.question = `On considère une fonction affine $f$ telle que $f(${xA})=${yA}$ et $f(${xB})=${yB}$.<br>
     Le coefficient directeur $m$ de la fonction $f$ est égal à : `

    this.correction = `Le coefficient directeur $m$ de la fonction $f$ est donné par la formule : $\\dfrac{f({${xB}})-f({${xA}})}{{${xB}}-{${xA}}}$.<br>
    $\\begin{aligned}
    m&=\\dfrac{${yB}-${ecritureParentheseSiNegatif(yA)}}{${xB}-${ecritureParentheseSiNegatif(xA)}}\\\\
    &= \\dfrac{${yB - yA}}{${xB - xA}}\\\\
    &=${miseEnEvidence(m.texFractionSimplifiee)}
    \\end{aligned}$`
    if (this.versionQcm) {
      // Les distracteurs peuvent se confondre avec la bonne réponse ou entre eux (m = -17 donne
      // −1/17 et 1/17 en double…) : un doublon est remplacé, sans tirage aléatoire supplémentaire.
      const secours = [
        `$${m.oppose().texFractionSimplifiee}$`,
        `$${m.ajouteEntier(1).texFractionSimplifiee}$`,
        `$${m.ajouteEntier(-1).texFractionSimplifiee}$`,
        `$${m.inverse().oppose().texFractionSimplifiee}$`,
      ]
      if (yB - yA === xB - xA || yB - yA === -xB + xA) {
        this.distracteurs = distracteursDistincts(
          String(this.reponse),
          [
            `$${new FractionEtendue(xA - xB, yB - yA).texFractionSimplifiee}$`,
            '$0$',
            `$${yB - yA}$`,
          ],
          secours,
        )
      } else {
        const denTroisiemeDistracteur = xB + xA === 0 ? xB - xA : xB + xA
        this.distracteurs = distracteursDistincts(
          String(this.reponse),
          [
            `$${new FractionEtendue(xA - xB, yB - yA).texFractionSimplifiee}$`,
            `$${m.inverse().texFractionSimplifiee}$`,
            `$${new FractionEtendue(yB + yA, denTroisiemeDistracteur).texFractionSimplifiee}$`,
          ],
          secours,
        )
      }
    }

    this.canReponseACompleter = '$m=\\ldots$'
    if (!this.interactif && !this.versionQcm) {
      this.question += ' $\\ldots$'
    }
  }
}
