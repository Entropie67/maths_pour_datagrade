import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const titre = 'Calculer la probabilité d’une somme obtenue avec deux dés'
export const dateDePublication = '06/01/2026'
export const dateDeModifImportante = '21/10/2026'
export const amcReady = true
export const interactifReady = true

export const uuid = 'b1f9e'
export const refs = {
  'fr-fr': ['1A-P04-1', '2A-P4-1'],
  'fr-ch': ['11LSNO4C-7'],
}

/**
 * Calculer la probabilité d'obtenir une somme donnée en lançant deux dés à quatre faces.
 * @author Stéphane Guyon
 */
export default class ProbabiliteSommeDeuxDes extends ExerciceQcmACourt {
  private appliqueLesValeurs(somme: number) {
    const issues: Array<[number, number]> = []
    for (let premierDe = 1; premierDe <= 4; premierDe++) {
      for (let secondDe = 1; secondDe <= 4; secondDe++) {
        issues.push([premierDe, secondDe])
      }
    }

    const issuesFavorables = issues.filter(
      ([premierDe, secondDe]) => premierDe + secondDe === somme,
    )
    const nombreIssuesFavorables = issuesFavorables.length
    const bonneReponse = new FractionEtendue(
      nombreIssuesFavorables,
      16,
    ).simplifie()

    const candidats = [
      new FractionEtendue(nombreIssuesFavorables, 8).texFractionSimplifiee,
      new FractionEtendue(1, nombreIssuesFavorables).texFractionSimplifiee,
      new FractionEtendue(somme, 16).texFractionSimplifiee,
      new FractionEtendue(4, 16).texFractionSimplifiee,
      new FractionEtendue(16 - nombreIssuesFavorables, 16)
        .texFractionSimplifiee,
      new FractionEtendue(nombreIssuesFavorables + 1, 16).texFractionSimplifiee,
      new FractionEtendue(Math.max(1, nombreIssuesFavorables - 1), 16)
        .texFractionSimplifiee,
    ]
    const distracteurs = [...new Set(candidats)].filter(
      (reponse) => reponse !== bonneReponse.texFraction,
    )

    this.reponses = [
      `$${bonneReponse.texFraction}$`,
      ...distracteurs.slice(0, 3).map((reponse) => `$${reponse}$`),
    ]

    this.enonce = `On lance deux dés équilibrés à quatre faces numérotées de $1$ à $4$.<br>
    La probabilité que la somme des deux dés soit égale à $${somme}$ est :`

    const listeIssues = issuesFavorables
      .map(([premierDe, secondDe]) => `$(${premierDe}\\,;\\,${secondDe})$`)
      .join(', ')

    this.correction = `On note $\\Omega$ l'univers constitué des couples de résultats obtenus avec les deux dés.<br>
    Chaque dé possède $4$ faces, donc $\\operatorname{Card}(\\Omega)=4\\times 4=16$.<br>
    Les deux dés étant équilibrés, les $16$ issues de $\\Omega$ sont équiprobables.<br>
    Soit $A$ l'événement : «\u00a0la somme des deux dés est égale à $${somme}$\u00a0».<br>
    Les issues qui réalisent l'événement $A$ sont : ${listeIssues}.<br>
    Ainsi, $\\operatorname{Card}(A)=${nombreIssuesFavorables}$.<br>
    On en déduit :
    $P(A)=\\dfrac{\\operatorname{Card}(A)}{\\operatorname{Card}(\\Omega)}`
    if (nombreIssuesFavorables !== bonneReponse.simplifie().num)
      this.correction += `=\\dfrac{${nombreIssuesFavorables}}{16}`
    this.correction += `=${miseEnEvidence(bonneReponse)}$.`
  }

  versionAleatoire = () =>
    this.appliqueLesValeurs(choice([2, 3, 4, 5, 6, 7, 8]))

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, {
        fractionEgale: true,
        nombreDecimalSeulement: true,
      })
    this.options.ordered = context.isTypst
    // Saisie libre (version QCM désactivée) : la dernière phrase devient une question
    this.enonceCourt = () =>
      this.enonce.replace(
        /La probabilité que la somme des deux dés soit égale à \$(\d+)\$ est :\s*$/,
        (_, somme: string) =>
          `On note $A$ l'événement : «${sp()}la somme des deux dés est égale à $${somme}$${sp()}».<br>${this.interactif ? '$P(A)=$' : 'Calculer $P(A)$.'}`,
      )
    this.clavierReponseCourte = KeyboardType.clavierDeBaseAvecFraction
    this.champReponseCourteEnLigne = true
    this.versionAleatoire()
  }
}
