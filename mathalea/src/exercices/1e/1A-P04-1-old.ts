// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid fb646 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import ExerciceQcmA from '../ExerciceQcmA'

export const titre = 'Calculer la probabilité d’une somme obtenue avec deux dés'
export const dateDePublication = '06/01/2026'
export const dateDeModifImportante = '06/08/2026'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

export const uuid = 'fb646'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

/**
 * Calculer la probabilité d'obtenir une somme donnée en lançant deux dés à quatre faces.
 * @author Stéphane Guyon
 */
export default class ProbabiliteSommeDeuxDesOld extends ExerciceQcmA {
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
    Soit $A$ l'événement : « la somme des deux dés est égale à $${somme}$ ».<br>
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
    this.besoinFormulaireCaseACocher = false
    this.options.ordered = context.isTypst
    this.versionAleatoire()
  }
}
