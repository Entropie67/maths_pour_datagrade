import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const dateDePublication = '22/07/2025'
export const dateDeModifImportante = '07/10/2026'

export const uuid = '11bf3'

export const refs = {
  'fr-fr': ['1A-E02-3', '2A-E2-3'],
  'fr-ch': ['10CTQCMFA1-7', '10LCQCMFA1-7', '10LSQCMFA1-7', '11CTQCMFA1-2', '11LCQCMFA1-2', '11LSQCMFA1-2'],
}
/**
 *
 * @author Gilles Mora (IA)

 */
export const interactifReady = true

export const amcReady = 'true'
export const titre =
  "Retrouver le calcul d'un prix après deux évolutions successives"

export default class AugmentationsSuccessives extends ExerciceQcmACourt {
  // Pourcentage d'augmentation du dernier tirage (utilisé par la saisie courte)
  private pourcentage = 20

  versionOriginale: () => void = () => {
    this.pourcentage = 20
    this.enonce =
      "Le prix d'un article est noté $P$. Il connaît deux augmentations de $20\\,\\%$.<br> Le prix, après ces augmentations, est :"
    this.correction = `Après une augmentation de $20\\,\\%$, le nouveau prix est $P \\times 1,2$.<br>
 Après une deuxième augmentation de $20\\,\\%$, le prix devient : $(P \\times 1,2) \\times 1,2 = P \\times 1,2^2 = ${miseEnEvidence('P \\times 1,44')}$`

    this.reponses = [
      '$P \\times 1,2^2$',
      '$P \\times \\left(1 + \\left(\\dfrac{20}{100}\\right)^2\\right)$',
      '$\\dfrac{P}{1,44}$',
      '$P \\times 1,40$',
    ]
  }

  versionAleatoire = () => {
    let compteur = 0
    do {
      // Génération d'un pourcentage d'augmentation (multiples de 5 entre 5 et 50)
      const pourcentagesAugmentation = [10, 20, 25, 30, 40, 50, 60, 70]
      const pourcentage = choice(pourcentagesAugmentation)
      this.pourcentage = pourcentage

      // Génération du nombre d'augmentations (2 ou 3)
      const nombreAugmentations = 2

      // Calcul du coefficient multiplicateur
      const coefficientUnitaire = (100 + pourcentage) / 100
      const coefficientTotal = Math.pow(
        coefficientUnitaire,
        nombreAugmentations,
      )
      const coefficientTexte = texNombre(coefficientUnitaire, 4)
      const coefficientTotalTexte = texNombre(coefficientTotal, 4)

      // Texte pour le nombre d'augmentations
      const texteNombre = nombreAugmentations === 2 ? 'deux' : 'trois'

      this.enonce = `Le prix d'un article est noté $P$. Il connaît ${texteNombre} augmentations successives de $${pourcentage}\\,\\%$. <br>Le prix, après ces augmentations, est :`

      // Bonne réponse (plusieurs formes possibles)
      const bonnesReponses = [
        `$P \\times ${coefficientTexte}^${nombreAugmentations}$`,
        `$P \\times \\left(1 + \\dfrac{${pourcentage}}{100}\\right)^${nombreAugmentations}$`,
        `$P \\times \\left(1 + ${new FractionEtendue(pourcentage, 100).texFractionSimplifiee}\\right)^${nombreAugmentations}$`,
      ]

      // Distracteurs classiques
      const distracteurs = [
        `$P \\times \\left(1 + \\left(\\dfrac{${pourcentage}}{100}\\right)^${nombreAugmentations}\\right)$`, // Confusion avec la formule
        `$P \\times ${texNombre(1 + (nombreAugmentations * pourcentage) / 100, 2)}$`, // Addition linéaire des pourcentages
        `$\\dfrac{P}{${coefficientTotalTexte}}$`, // Division au lieu de multiplication
        `$P \\times \\left(\\dfrac{${pourcentage}}{100}\\right)^${nombreAugmentations}$`, // Oubli du +1
        `$P \\times ${texNombre((pourcentage / 100) * nombreAugmentations, 2)}$`, // Confusion totale
        `$P \\times \\left(${coefficientTexte} + ${texNombre(((nombreAugmentations - 1) * pourcentage) / 100, 2)}\\right)$`, // Formule inventée
        `$P \\times ${texNombre(coefficientUnitaire + ((nombreAugmentations - 1) * pourcentage) / 100, 2)}$`, // Autre formule fausse
      ]

      // Sélection d'une bonne réponse
      const bonneReponse = choice(bonnesReponses)

      const indexBonneReponse = bonnesReponses.indexOf(bonneReponse)

      // Les 3 expressions "brutes" (sans les $ et sans miseEnEvidence), dans le même ordre que bonnesReponses
      const expressions = [
        `P \\times ${coefficientTexte}^${nombreAugmentations}`,
        `P \\times \\left(1 + \\dfrac{${pourcentage}}{100}\\right)^${nombreAugmentations}`,
        `P \\times \\left(1 + ${new FractionEtendue(pourcentage, 100).texFractionSimplifiee}\\right)^${nombreAugmentations}`,
      ]

      // Sélection de 3 distracteurs distincts
      const distracteursFiltres = distracteurs.filter(
        (rep) => rep !== bonneReponse,
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

      // Construction de la correction selon le nombre d'augmentations
      // N'applique miseEnEvidence qu'à l'expression choisie comme bonne réponse
      const afficher = (i: number) =>
        i === indexBonneReponse
          ? miseEnEvidence(expressions[i])
          : expressions[i]

      const correctionDetail = `Après une augmentation de $${pourcentage}\\,\\%$, le nouveau prix est $P \\times ${coefficientTexte}$.<br>
 Après une deuxième augmentation de $${pourcentage}\\,\\%$, le prix devient : <br>
 $(P \\times ${coefficientTexte}) \\times ${coefficientTexte} = ${afficher(1)}=${afficher(2)} = ${afficher(0)}$`

      this.correction = correctionDetail

      // Construction du tableau final avec exactement 4 réponses
      this.reponses = [bonneReponse, ...troisDistracteurs]
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true)) // On s'assure d'avoir 4 réponses différentes, sinon on régénère
  }

  constructor() {
    super()
    // Version sans QCM : l'élève complète « P × … » par le coefficient multiplicateur global
    this.enonceCourt = () =>
      this.enonce.replace(
        'Le prix, après ces augmentations, est :',
        this.interactif
          ? 'Compléter par un nombre ou par un calcul :<br>Le prix après ces augmentations est donné par $P\\times$'
          : 'Compléter par un nombre ou par un calcul :<br>Le prix après ces augmentations est donné par : $P\\times \\ldots$.',
      )
    this.reponseCourte = () => `${(100 + this.pourcentage) / 100}^2`
    this.clavierReponseCourte =
      KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets
    this.optionsChampReponseCourte = { texteApres: '.' }
    this.champReponseCourteEnLigne = true
    this.correctionCourte = () => {
      const coefficient = texNombre((100 + this.pourcentage) / 100, 4)
      const coefficientTotal = texNombre(
        ((100 + this.pourcentage) / 100) ** 2,
        4,
      )
      return `Après une augmentation de $${this.pourcentage}\\,\\%$, le nouveau prix est $P \\times ${coefficient}$.<br>
 Après une deuxième augmentation de $${this.pourcentage}\\,\\%$, le prix devient : <br>
 $(P \\times ${coefficient}) \\times ${coefficient} = P \\times ${coefficient}^2 = P \\times ${miseEnEvidence(coefficientTotal)}$.<br>
 On peut aussi compléter avec $${coefficient}^2$ ou $\\left(1 + \\dfrac{${this.pourcentage}}{100}\\right)^2$.`
    }
    this.options.compact = true // moins d'espace avant les propositions du QCM
    this.versionAleatoire()
  }
}
