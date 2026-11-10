import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
export const uuid = '51fc1' // mettre ici l'uuid générée au pnpm dev
export const titre = 'Calculer des évolutions successives'
export const interactifReady = true

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

export default class NomDeLaClasse extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 2
    this.spacingCorr = 2
    this.optionsChampTexte = { texteApres: '$\\%$' }
  }

  nouvelleVersion() {
    const augmentation = randint(1, 9)
    const nbAnnees = randint(2, 5)

    // On définit le coefficient multiplicateur
    const coefMult = (1 + augmentation / 100) ** nbAnnees
    // On calcule le pourcentage correspondant
    const pourcentageFinal = (coefMult - 1) * 100

    this.question = `Un propriétaire a décidé d'augmenter le loyer de l'appartement qu'il 
                     loue de $${augmentation}\\,\\%$ par an.<br>
                     De quel pourcentage aura-t-il augmenté en $${nbAnnees}$ ans ? (arrondi au centième)`

    // On utilise texNombre(variable, decimales) pour l'affichage
    this.correction = `Le loyer est multiplié chaque année par 
         $1 + \\dfrac{${augmentation}}{100} = ${texNombre(1 + augmentation / 100, 2)}$.<br>`
    this.correction += `En $${nbAnnees}$ ans, il est multiplié par
         $${texNombre(1 + augmentation / 100, 2)}^{${nbAnnees}} \\approx ${texNombre(coefMult, 4)}$.<br>`
    this.correction += `L'augmentation totale est donc d'environ 
         $${miseEnEvidence(`${texNombre(pourcentageFinal, 2)}`)}\\,\\%$.`

    // La réponse attendue par l'exercice
    this.reponse = texNombre(pourcentageFinal, 2) // arrondi à 2 chiffres après la virgule
  }
}
