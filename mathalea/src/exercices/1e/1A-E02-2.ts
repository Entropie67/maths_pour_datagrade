import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const dateDePublication = '22/07/2025'
export const dateDeModifImportante = '07/10/2026'

export const uuid = '49844'

export const refs = {
  'fr-fr': ['1A-E02-2', '2A-E2-2'],
  'fr-ch': ['10CTQCMFA1-6', '10LCQCMFA1-6', '10LSQCMFA1-6'],
}
/**
 *
 * @author Gilles Mora (IA)

 */
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const titre = "Trouver le calcul d'un prix subissant une évolution"

export default class BaissePrix extends ExerciceSimple {
  // Propositions de la version QCM, utilisées aussi pour le contrôle des doublons
  private propositions: string[] = []

  private appliquerLesValeurs(prixInitial: number, pourcentage: number): void {
    // Calcul du coefficient multiplicateur
    const coefficientMultiplicateur = (100 - pourcentage) / 100
    const coefficientTexte = texNombre(coefficientMultiplicateur, 2)

    this.question = `Un sac coûte $${texNombre(prixInitial)}$ euros. Le prix baisse de $${pourcentage}\\,\\%$. <br>
    `
    this.question += this.versionQcm
      ? 'Le nouveau prix en euros est donné par le calcul :'
      : `Écrire un produit qui permet de calculer le nouveau prix en euros.<br>
    Seul le calcul est attendu, pas son résultat.`

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
    this.correction = this.versionQcm
      ? bonneReponseObj.correction
      : `Diminuer de $${pourcentage}\\,\\%$ revient à multiplier par $1 - \\dfrac{${pourcentage}}{100} = ${coefficientTexte}$ (coefficient multiplicateur).<br>
Ainsi, le nouveau prix est donné par : $${miseEnEvidence(`${texNombre(prixInitial)} \\times ${coefficientTexte}`)}$.<br>
D'autres écritures du produit conviennent, par exemple $${texNombre(prixInitial)} \\times \\left(1 - \\dfrac{${pourcentage}}{100}\\right)$ ou $${texNombre(prixInitial)} \\times \\dfrac{${100 - pourcentage}}{100}$.`

    // Construction du tableau final avec exactement 4 réponses
    this.propositions = [bonneReponseObj.reponse, ...troisDistracteurs]
    this.reponse = this.versionQcm
      ? bonneReponseObj.reponse
      : `${prixInitial}\\times ${coefficientMultiplicateur}`
    this.distracteurs = troisDistracteurs
    this.canEnonce = this.question
    this.canReponseACompleter = '$\\ldots$'
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
    } while (
      compteur < 100 &&
      !aLeBonNombreDePropsDifferentes(
        {
          reponse: this.propositions[0],
          distracteurs: this.propositions.slice(1),
        },
        4,
        true,
      )
    ) // On s'assure d'avoir 4 propositions différentes, sinon on régénère
  }

  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.besoinFormulaireCaseACocher = ['Sujet original', false]
    this.sup = false
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    // Seul un produit égal au nouveau prix est accepté (pas le résultat)
    this.optionsDeComparaison = { multiplicationSeulementEtNonResultat: true }
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.versionQcmDisponible = true
    this.versionQcm = false
    this.versionQcmOptions = { radio: true, compact: true }
  }

  nouvelleVersion(): void {
    if (this.sup) this.versionOriginale()
    else this.versionAleatoire()
  }
}
