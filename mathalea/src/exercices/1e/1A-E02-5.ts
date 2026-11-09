import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const dateDePublication = '20/02/2026'
export const dateDeModifImportante = '07/10/2026'

export const uuid = 'edd3b'

export const refs = {
  'fr-fr': ['1A-E02-5', '2A-E2-5'],
  'fr-ch': ['10CTQCMFA1-8', '10LCQCMFA1-8', '10LSQCMFA1-8', '11CTQCMFA1-3', '11LCQCMFA1-3', '11LSQCMFA1-3'],
}
/**
 *
 * @author Gilles Mora 

 */
export const interactifReady = true

export const amcReady = 'true'
export const titre = 'Retrouver le calcul pour obtenir la valeur initiale'

export default class Auto1AE025 extends ExerciceQcmACourt {
  // Valeurs du dernier tirage (utilisées par la saisie courte)
  private pourcentage = 0
  private prixFinal = 0

  private appliquerLesValeurs(prixFinal: number, pourcentage: number): void {
    this.pourcentage = pourcentage
    this.prixFinal = prixFinal
    // Calcul du coefficient multiplicateur
    const coefficientMultiplicateur = (100 - pourcentage) / 100
    const coefficientTexte = texNombre(coefficientMultiplicateur, 2)

    this.enonce = `Le prix d'un sac a baissé de $${pourcentage}\\,\\%$. Il coûte maintenant $${texNombre(prixFinal)}$ euros. <br>
    Le prix initial en euros est donné par le calcul :`

    // Bonnes réponses (plusieurs formes possibles)
    const bonnesReponses = [
      {
        reponse: `$\\dfrac{${texNombre(prixFinal)}}{${coefficientTexte}}$`,
        correction: `Diminuer de $${pourcentage}\\,\\%$ revient à multiplier par $1 -  ${texNombre(pourcentage / 100, 2)}=${coefficientTexte}$ (coefficient multiplicateur).<br>
        Si $V_I$ est le prix initial, on a : $ V_I \\times ${coefficientTexte}=${texNombre(prixFinal)}$.<br>
        Ainsi, le prix initial est donné par : $${miseEnEvidence(`\\dfrac{${texNombre(prixFinal)}}{${coefficientTexte}}`)}$.`,
      },
      {
        reponse: `$\\dfrac{${texNombre(prixFinal)}}{1 - \\dfrac{${pourcentage}}{100}}$`,
        correction: `Diminuer de $${pourcentage}\\,\\%$ revient à multiplier par $1 - ${texNombre(pourcentage / 100, 2)}$ (coefficient multiplicateur).<br>
        Si $V_I$ est le prix initial, on a : $ V_I \\times \\left(1 - \\dfrac{${pourcentage}}{100}\\right)=${texNombre(prixFinal)}$.<br>
        Ainsi, le prix initial est donné par : $${miseEnEvidence(`\\dfrac{${texNombre(prixFinal)}}{1 - \\dfrac{${pourcentage}}{100}}`)}$.`,
      },
      {
        reponse: `$\\dfrac{${texNombre(prixFinal)}}{1 - \\dfrac{${pourcentage}}{100}}$`,
        correction: `Diminuer de $${pourcentage}\\,\\%$ revient à multiplier par $1 - \\dfrac{${pourcentage}}{100}$ (coefficient multiplicateur).<br>
Si $V_I$ est le prix initial, on a : $ V_I \\times \\left(1 - \\dfrac{${pourcentage}}{100}\\right)=${texNombre(prixFinal)}$.<br>
Pour retrouver le prix initial, on divise le prix final par ce coefficient.<br>
Ainsi, le prix initial est donné par : $${miseEnEvidence(`\\dfrac{${texNombre(prixFinal)}}{1 - \\dfrac{${pourcentage}}{100}}`)}$.`,
      },
      {
        reponse: `$\\dfrac{${texNombre(prixFinal)}}{1 - ${texNombre(pourcentage / 100, 2)}}$`,
        correction: `Diminuer de $${pourcentage}\\,\\%$ revient à multiplier par $1 -  ${texNombre(pourcentage / 100, 2)}$ (coefficient multiplicateur).<br>
Si $V_I$ est le prix initial, on a : $ V_I \\times \\left(1 - ${texNombre(pourcentage / 100, 2)}\\right)=${texNombre(prixFinal)}$.<br>
Ainsi, le prix initial est donné par : $${miseEnEvidence(`\\dfrac{${texNombre(prixFinal)}}{1 - ${texNombre(pourcentage / 100, 2)}}`)}$.`,
      },
      {
        reponse: `$${texNombre(prixFinal)} \\times \\dfrac{100}{${100 - pourcentage}}$`,
        correction: `Diminuer de $${pourcentage}\\,\\%$ revient à multiplier par $1 - \\dfrac{${pourcentage}}{100}=\\dfrac{${100 - pourcentage}}{100}$.<br>
Si $V_I$ est le prix initial, on a : $V_I \\times \\dfrac{${100 - pourcentage}}{100}=${texNombre(prixFinal)}$.<br>
Ainsi, le prix initial est donné par : $${miseEnEvidence(`${texNombre(prixFinal)} \\times \\dfrac{100}{${100 - pourcentage}}`)}$.`,
      },
      {
        reponse: `$${texNombre(prixFinal)} \\div ${coefficientTexte}$`,
        correction: `Diminuer de $${pourcentage}\\,\\%$ revient à multiplier par $1 - ${texNombre(pourcentage / 100, 2)}=${coefficientTexte}$ (coefficient multiplicateur).<br>
Si $V_I$ est le prix initial, on a : $ V_I \\times ${coefficientTexte}=${texNombre(prixFinal)}$.<br>
Ainsi, le prix initial est donné par : $${miseEnEvidence(`${texNombre(prixFinal)} \\div ${coefficientTexte}`)}$.`,
      },
    ]

    // Distracteurs classiques
    const distracteurs = [
      `$${texNombre(prixFinal)} \\times ${coefficientTexte}$`, // Confusion : multiplier au lieu de diviser
      `$${texNombre(prixFinal)} \\times \\left(1 + \\dfrac{${pourcentage}}{100}\\right)$`, // Confusion : ajouter le pourcentage de baisse
      `$\\dfrac{${texNombre(prixFinal)}}{${texNombre(pourcentage / 100, 2)}}$`, // Division par le pourcentage au lieu du CM
      `$${texNombre(prixFinal)} + ${texNombre(prixFinal)} \\times \\dfrac{${pourcentage}}{100}$`, // Ajout du pourcentage sur le prix final (erreur classique)
      `$${texNombre(prixFinal)} \\times \\dfrac{${100 - pourcentage}}{100}$`, // Appliquer encore une baisse
      `$\\dfrac{${texNombre(prixFinal)}}{1 + \\dfrac{${pourcentage}}{100}}$`, // Confusion baisse/hausse dans la division
      `$${texNombre(prixFinal)} \\times \\dfrac{${pourcentage}}{${100 - pourcentage}}$`, // Formule fausse
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
    this.appliquerLesValeurs(117, 10)
  }

  versionAleatoire = () => {
    let compteur = 0
    do {
      // Génération d'un pourcentage de baisse (multiples de 5 entre 5 et 50)
      const pourcentage = randint(2, 70)

      // Génération d'un prix final
      const prixFinal = randint(104, 299, 200)

      this.appliquerLesValeurs(prixFinal, pourcentage)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    // Version sans QCM : l'élève complète « prix ÷ … » par le coefficient multiplicateur (nombre décimal)
    this.enonceCourt = () =>
      this.enonce.replace(
        'Le prix initial en euros est donné par le calcul :',
        `Compléter :<br>Le prix initial en euros est donné par : $${texNombre(this.prixFinal)}\\div${this.interactif ? '' : ' \\ldots'}$${this.interactif ? '' : '.'}`,
      )
    this.reponseCourte = () => `${(100 - this.pourcentage) / 100}`
    this.clavierReponseCourte = KeyboardType.clavierDeBase
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    this.optionsChampReponseCourte = { texteApres: '.' }
    this.champReponseCourteEnLigne = true
    this.correctionCourte = () => {
      const coefficient = texNombre((100 - this.pourcentage) / 100, 2)
      return `Diminuer de $${this.pourcentage}\\,\\%$ revient à multiplier par $1 - \\dfrac{${this.pourcentage}}{100} = ${coefficient}$ (coefficient multiplicateur).<br>
Si $V_I$ est le prix initial, on a : $V_I \\times ${coefficient} = ${texNombre(this.prixFinal)}$.<br>
Pour retrouver le prix initial, on divise le prix final par ce coefficient : $${texNombre(this.prixFinal)} \\div ${miseEnEvidence(coefficient)}$.`
    }
    this.options.compact = true // moins d'espace avant les propositions du QCM
    this.versionAleatoire()
  }
}
