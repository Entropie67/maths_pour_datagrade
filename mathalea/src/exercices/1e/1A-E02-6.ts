import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const titre = 'Retrouver le calcul après une augmentation'
export const dateDePublication = '04/08/2026'
export const dateDeModifImportante = '07/10/2026'

export const uuid = '38be8'

export const refs = {
  'fr-fr': ['1A-E02-6', '2A-E2-6'],
  'fr-ch': ['10CTQCMFA1-9', '10LCQCMFA1-9', '10LSQCMFA1-9', '11CTQCMFA1-4', '11LCQCMFA1-4', '11LSQCMFA1-4'],
}

export const interactifReady = true

export const amcReady = 'true'

/**
 * Retrouver le calcul donnant une valeur initiale après une augmentation.
 * @author Stéphane Guyon
 */
export default class Auto1AE026 extends ExerciceQcmACourt {
  // Valeurs du dernier tirage (utilisées par la saisie courte)
  private pourcentage = 0
  private prixFinal = 0

  private appliquerLesValeurs(
    article: string,
    prixFinal: number,
    pourcentage: number,
  ): void {
    this.pourcentage = pourcentage
    this.prixFinal = prixFinal
    const coefficientMultiplicateur = (100 + pourcentage) / 100
    const coefficientTexte = texNombre(coefficientMultiplicateur, 2)
    const coefficientDeDiminutionTexte = texNombre((100 - pourcentage) / 100, 2)
    const tauxDecimal = texNombre(pourcentage / 100, 2)
    const prixFinalTexte = texNombre(prixFinal)

    this.enonce = `Le prix ${article} a augmenté de $${pourcentage}\\,\\%$. Il coûte maintenant $${prixFinalTexte}$ euros.<br>
    Le prix initial en euros est donné par le calcul :`

    const bonnesReponses = [
      `$\\dfrac{${prixFinalTexte}}{${coefficientTexte}}$`,
      `$${prixFinalTexte} \\div ${coefficientTexte}$`,
      `$\\dfrac{${prixFinalTexte}}{1 + \\dfrac{${pourcentage}}{100}}$`,
      `$\\dfrac{${prixFinalTexte}}{1 + ${tauxDecimal}}$`,
      `$${prixFinalTexte} \\times \\dfrac{100}{${100 + pourcentage}}$`,
    ]

    const bonneReponse = choice(bonnesReponses)
    const distracteurs = [
      `$${prixFinalTexte} \\times ${coefficientTexte}$`,
      `$${prixFinalTexte} \\times \\left(1 - \\dfrac{${pourcentage}}{100}\\right)$`,
      `$${prixFinalTexte} - ${prixFinalTexte} \\times \\dfrac{${pourcentage}}{100}$`,
      `$\\dfrac{${prixFinalTexte}}{${tauxDecimal}}$`,
      `$${prixFinalTexte} + ${prixFinalTexte} \\times \\dfrac{${pourcentage}}{100}$`,
      `$\\dfrac{${prixFinalTexte}}{1 - \\dfrac{${pourcentage}}{100}}$`,
      `$\\dfrac{${prixFinalTexte}}{${coefficientDeDiminutionTexte}}$`,
      `$${prixFinalTexte} \\times \\dfrac{${pourcentage}}{${100 + pourcentage}}$`,
    ]

    const troisDistracteurs: string[] = []
    while (troisDistracteurs.length < 3) {
      const distracteur = choice(distracteurs)
      if (!troisDistracteurs.includes(distracteur)) {
        troisDistracteurs.push(distracteur)
      }
    }

    this.correction = `Augmenter de $${pourcentage}\\,\\%$ revient à multiplier par $1+\\dfrac{${pourcentage}}{100}=${coefficientTexte}$.<br>
    Si $V_I$ est le prix initial, alors $V_I\\times ${coefficientTexte}=${prixFinalTexte}$.<br>
    Pour retrouver le prix initial, on divise donc le prix final par le coefficient multiplicateur. Le calcul à effectuer est : $${miseEnEvidence(bonneReponse.slice(1, -1))}$.`

    this.reponses = [bonneReponse, ...troisDistracteurs]
  }

  versionAleatoire = () => {
    let compteur = 0
    do {
      const article = choice([
        "d'un vélo électrique",
        "d'un ordinateur portable",
        "d'un canapé",
        "d'un appareil photo",
        "d'un robot pâtissier",
      ])
      const pourcentage = randint(2, 70)
      const prixFinal = randint(104, 499)

      this.appliquerLesValeurs(article, prixFinal, pourcentage)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()

    // Version sans QCM : l'élève complète « prix ÷ … » par le coefficient multiplicateur (nombre décimal)
    this.enonceCourt = () =>
      this.enonce.replace(
        'Le prix initial en euros est donné par le calcul :',
        `Compléter  :<br>Le prix initial en euros est donné par : $${texNombre(this.prixFinal)}\\div${this.interactif ? '' : ' \\ldots'}$${this.interactif ? '' : '.'}`,
      )
    this.reponseCourte = () => `${(100 + this.pourcentage) / 100}`
    this.clavierReponseCourte = KeyboardType.clavierDeBase
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    this.optionsChampReponseCourte = { texteApres: '.' }
    this.champReponseCourteEnLigne = true
    this.correctionCourte = () => {
      const coefficient = texNombre((100 + this.pourcentage) / 100, 2)
      return `Augmenter de $${this.pourcentage}\\,\\%$ revient à multiplier par $1 + \\dfrac{${this.pourcentage}}{100} = ${coefficient}$ (coefficient multiplicateur).<br>
Si $V_I$ est le prix initial, on a : $V_I \\times ${coefficient} = ${texNombre(this.prixFinal)}$.<br>
Pour retrouver le prix initial, on divise le prix final par ce coefficient : $${texNombre(this.prixFinal)} \\div ${miseEnEvidence(coefficient)}$.`
    }
    this.options.compact = true // moins d'espace avant les propositions du QCM
    this.versionAleatoire()
  }
}
