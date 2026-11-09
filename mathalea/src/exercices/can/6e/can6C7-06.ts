import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { Yohaku } from '../../../lib/outils/Yohaku'
import { randint } from '../../../modules/outils'
import Exercice from '../../Exercice'
export const titre = 'Trouver une valeur dans un Yohaku (multiplicatif)'
export const interactifReady = true

export const dateDePublication = '10/08/2022'
export const dateDeModifImportante = '16/12/2023'

export const uuid = '892f2'

export const refs = {
  'fr-fr': ['can6C7-06'],
  'fr-ch': [],
}
/**
 * @author Jean-claude Lhote
 * @constructor
 */
export default class YohakuCan6b extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    const laCase = randint(0, 3)
    const yohaku1 = new Yohaku({
      type: 'entiers',
      largeur: 2,
      hauteur: 2,
      taille: 2,
      operation: 'multiplication',
      valeurMax: 10,
      solution: false,
      cellules: [],
    })
    // on calcule les résultats
    yohaku1.calculeResultats()
    // On mémorise la réponse
    this.reponse = yohaku1.cellules[laCase]
    // On blanchit la case inconnue avant la représentation
    yohaku1.cellulesPreremplies = [
      ...yohaku1.cellules.map((el, i) => (i === laCase ? '' : el)),
    ]
    this.listeQuestions[0] =
      'Les nombres en bout de ligne ou de colonne sont les produits des nombres contenus dans la ligne ou la colonne.<br>'
    this.listeQuestions[0] += `Donner la valeur de la case vide.<br>
    ${yohaku1.representation({ numeroExercice: this.numeroExercice ?? 0, question: 0, isInteractif: this.interactif, classes: 'college6e' })}`
    yohaku1.solution = true
    this.listeCorrections[0] = `La valeur de la case vide est : $${miseEnEvidence(this.reponse)}$.<br>`
    // On remet la valeur de la case avant de représenter le tableau pour la correction
    yohaku1.cellules[laCase] = this.reponse
    const reponse = [
      `L${1 + Math.floor(laCase / 2)}C${1 + (laCase % 2)}`,
      { value: this.reponse },
    ]
    handleAnswers(this, 0, Object.fromEntries([reponse]))
    this.listeCorrections[0] += yohaku1.representation({
      numeroExercice: this.numeroExercice ?? 0,
      question: 0,
      isInteractif: this.interactif,
      classes: 'college6e',
    })
    this.canEnonce = this.listeQuestions[0]
  }
}
