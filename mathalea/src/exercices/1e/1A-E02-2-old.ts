// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid a3828 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
// Version publiée jusqu'au 07/10/2026 (commit 25d6ac33f).
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const dateDePublication = '22/07/2025'
export const uuid = 'a3828'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 *
 * @author Gilles Mora (IA)

 */
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Trouver le calcul d'un prix subissant une évolution"

export default class BaissePrixOld extends ExerciceQcmA {
  private appliquerLesValeurs(prixInitial: number, pourcentage: number): void {
    // Calcul du coefficient multiplicateur
    const coefficientMultiplicateur = (100 - pourcentage) / 100
    const coefficientTexte = texNombre(coefficientMultiplicateur, 2)

    this.enonce = `Un sac coûte $${texNombre(prixInitial)}$ euros. Le prix baisse de $${pourcentage}\\,\\%$. <br>
    Le nouveau prix en euros est donné par le calcul :`

    // Bonne réponse (plusieurs formes possibles)
    const bonnesReponses = [
      {
        reponse: `$${texNombre(prixInitial)} \\times ${coefficientTexte}$`,
        correction: `Diminuer de $${pourcentage}\\,\\%$ revient à multiplier par $${coefficientTexte}$ (coefficient multiplicateur).<br>
Ainsi, le nouveau prix est donné par : $${miseEnEvidence(`${texNombre(prixInitial)} \\times ${coefficientTexte}`)}$.`,
      },
      {
        reponse: `$${texNombre(prixInitial)} \\times \\left(1 - \\dfrac{${pourcentage}}{100}\\right)$`,
        correction: `Diminuer de $${pourcentage}\\,\\%$ revient à multiplier par $\\left(1 - \\dfrac{${pourcentage}}{100}\\right)$ (coefficient multiplicateur).<br>
Ainsi, le nouveau prix est donné par : $${miseEnEvidence(`${texNombre(prixInitial)} \\times \\left(1 - \\dfrac{${pourcentage}}{100}\\right)`)}$.`,
      },
      {
        reponse: `$${texNombre(prixInitial)} \\times \\left(1 - ${texNombre(pourcentage / 100, 2)}\\right)$`,
        correction: `Diminuer de $${pourcentage}\\,\\%$ revient à multiplier par $\\left(1 - ${texNombre(pourcentage / 100, 2)}\\right)$ (coefficient multiplicateur).<br>
En effet, $${pourcentage}\\,\\% = \\dfrac{${pourcentage}}{100} = ${texNombre(pourcentage / 100, 2)}$.<br>
Ainsi, le nouveau prix est donné par : $${miseEnEvidence(`${texNombre(prixInitial)} \\times \\left(1 - ${texNombre(pourcentage / 100, 2)}\\right)`)}$.`,
      },
      {
        reponse: `$${texNombre(prixInitial)} \\times \\dfrac{${100 - pourcentage}}{100}$`,
        correction: `Diminuer de $${pourcentage}\\,\\%$ revient à conserver $${100 - pourcentage}\\,\\%$ du prix initial.<br>
On multiplie donc par $\\dfrac{${100 - pourcentage}}{100}$.<br>
Ainsi, le nouveau prix est donné par : $${miseEnEvidence(`${texNombre(prixInitial)} \\times \\dfrac{${100 - pourcentage}}{100}`)}$.`,
      },
      {
        reponse: `$${texNombre(prixInitial / 10)} \\times \\dfrac{${100 - pourcentage}}{10}$`,
        correction: `Diminuer de $${pourcentage}\\,\\%$ revient à conserver $${100 - pourcentage}\\,\\%$ du prix initial.<br>
On peut écrire le calcul : $${texNombre(prixInitial)} \\times \\dfrac{${100 - pourcentage}}{100} = ${texNombre(prixInitial / 10)} \\times 10 \\times \\dfrac{${100 - pourcentage}}{100} = ${texNombre(prixInitial / 10)} \\times \\dfrac{${100 - pourcentage}}{10}$.<br>
Ainsi, le nouveau prix est donné par : $${miseEnEvidence(`${texNombre(prixInitial / 10)} \\times \\dfrac{${100 - pourcentage}}{10}`)}$.`,
      },
    ]

    // Distracteurs classiques
    const distracteurs = [
      `${pourcentage === 50 ? `$${texNombre(prixInitial)} \\times \\dfrac{5}{100}$` : `$${texNombre(prixInitial)} \\times ${texNombre(pourcentage / 100, 2)}$`}`, // Confusion : multiplier par le pourcentage de baisse
      `$${texNombre(prixInitial)} \\times \\left(- \\dfrac{${pourcentage}}{100}\\right)$`, // Signe négatif mal placé
      `$${texNombre(prixInitial)} \\times \\left(1 + \\dfrac{${pourcentage}}{100}\\right)$`, // Confusion baisse/hausse
      `${pourcentage === 50 ? `$${texNombre(prixInitial)} \\times 0,2$` : `$${texNombre(prixInitial)} \\times \\dfrac{${pourcentage}}{100}$`}`, // Juste le pourcentage
      `$${texNombre(prixInitial / 10)} \\times \\left(\\dfrac{100 - ${pourcentage}}{${pourcentage}}\\right)$`, // Formule inversée
      `$${texNombre(prixInitial)} \\times \\left(\\dfrac{${pourcentage}}{100 - ${pourcentage}}\\right)$`, // Autre formule fausse
      `$${texNombre(prixInitial)} \\times ${texNombre((100 + pourcentage) / 100, 2)}$`, // Confusion avec une hausse
    ]

    // Sélection d'une bonne réponse
    const bonneReponseObj = choice(bonnesReponses)

    // Sélection de 3 distracteurs distincts
    const distracteursFiltres = distracteurs.filter(
      (rep) => rep !== bonneReponseObj.reponse,
    )
    const troisDistracteurs: string[] = []

    while (troisDistracteurs.length < 3 && distracteursFiltres.length > 0) {
      const distracteur = choice(distracteursFiltres)
      if (!troisDistracteurs.includes(distracteur)) {
        troisDistracteurs.push(distracteur)
      }
      // Retirer le distracteur sélectionné pour éviter les doublons
      const index = distracteursFiltres.indexOf(distracteur)
      distracteursFiltres.splice(index, 1)
    }

    // Utilisation de la correction spécifique à la bonne réponse choisie
    this.correction = bonneReponseObj.correction

    // Construction du tableau final avec exactement 4 réponses
    this.reponses = [bonneReponseObj.reponse, ...troisDistracteurs]
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(130, 10)
  }

  versionAleatoire = () => {
    let compteur = 0
    do {
      // Génération d'un pourcentage de baisse (multiples de 5 entre 5 et 50)

      const pourcentage = randint(2, 70)

      // Génération d'un prix (multiples de 10 entre 80 et 500)

      const prixInitial = randint(104, 299, 200)

      this.appliquerLesValeurs(prixInitial, pourcentage)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true)) // On s'assure d'avoir 4 réponses différentes, sinon on régénère
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
