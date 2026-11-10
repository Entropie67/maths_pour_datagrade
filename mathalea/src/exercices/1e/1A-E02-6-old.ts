// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 799cf continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
// Version publiée jusqu'au 07/10/2026 (commit 25d6ac33f).
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const titre = 'Retrouver le calcul après une augmentation'
export const dateDePublication = '04/08/2026'
export const uuid = '799cf'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'

/**
 * Retrouver le calcul donnant une valeur initiale après une augmentation.
 * @author Stéphane Guyon
 */
export default class Auto1AE026Old extends ExerciceQcmA {
  private appliquerLesValeurs(
    article: string,
    prixFinal: number,
    pourcentage: number,
  ): void {
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
    this.besoinFormulaireCaseACocher = false

    this.versionAleatoire()
  }
}
