import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = 'bd063'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Factoriser ou développer une différence de deux carrés'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ6AGns2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    a: number,
    b: number,
    distracteurs?: string[],
  ): void {
    this.enonce = `On développe $(${a}x - ${b})^2$. L'expression développée et réduite est :`

    const repCorrecteMath = `${a * a}x^2 - ${2 * a * b}x + ${b * b}`
    const repCorrecte = `$${repCorrecteMath}$`

    if (distracteurs && distracteurs.length >= 3) {
      this.reponses = [
        repCorrecte,
        distracteurs[0],
        distracteurs[1],
        distracteurs[2],
      ]
    } else {
      // Génération des erreurs classiques pour ce type de développement
      let mauvaisesReponses = [
        `$${a * a}x^2 - ${2 * a * b}x - ${b * b}$`, // Erreur de signe sur le dernier terme (ex: -25)
        `$${a * a}x^2 - ${b * b}$`, // Oubli du double produit (différence de deux carrés)
        `$${a}x^2 - ${a * b}x + ${b * b}$`, // Erreur de l'énoncé original (ex: 2x^2 - 10x + 25)
        `$${a}x^2 - ${2 * a * b}x + ${b * b}$`, // Oubli du carré sur le coefficient "a"
        `$${a * a}x^2 + ${2 * a * b}x + ${b * b}$`, // Erreur de signe sur le double produit
      ]

      // On s'assure qu'aucun distracteur ne soit accidentellement la bonne réponse
      mauvaisesReponses = mauvaisesReponses.filter((rep) => rep !== repCorrecte)

      this.reponses = [
        repCorrecte,
        mauvaisesReponses[0],
        mauvaisesReponses[1],
        mauvaisesReponses[2],
      ]
    }

    this.correction = `On utilise l'identité remarquable $(a-b)^2 = a^2 - 2ab + b^2$ (ici avec $a = ${a}x$ et $b = ${b}$).<br><br>`
    this.correction += `$\\begin{aligned}
    (${a}x - ${b})^2 &= (${a}x)^2 - 2 \\times ${a}x \\times ${b} + ${b}^2\\\\
    & = ${a * a}x^2 - ${2 * a * b}x + ${b * b}
    \\end{aligned}$<br>`
    this.correction += `L'expression développée et réduite est donc : $${miseEnEvidence(repCorrecteMath)}$.`
  }

  versionOriginale: () => void = () => {
    // Reproduction exacte de la question 6 de l'image
    this.appliquerLesValeurs(2, 5, [
      `$2x^2 - 10x + 25$`,
      `$4x^2 - 20x - 25$`,
      `$4x^2 - 25$`,
    ])
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      // Pour avoir de belles expressions ax - b
      const a = randint(2, 6)
      const b = randint(1, 9)

      this.appliquerLesValeurs(a, b)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /^On développe \$(.*)\$\. L'expression développée et réduite est :\s*$/,
        (_, expression: string) => `Développer et réduire $${expression}$.`,
      )
    this.clavierReponseCourte = KeyboardType.lyceeClassique
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, {
        expressionsForcementReduites: true,
      })
  }
}
