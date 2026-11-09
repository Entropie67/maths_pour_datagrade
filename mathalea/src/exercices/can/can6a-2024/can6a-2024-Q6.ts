import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une somme'
export const interactifReady = true

export const uuid = '8665b'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsChampTexte = {
      texteApres: ' €',
      texteAvant: "En tout, j'ai reçu",
    }

    this.canOfficielle = false
  }

  nouvelleVersion() {
    const listeValeurs = this.canOfficielle
      ? [[27, 100]]
      : [
          [27, 50],
          [26, 50],
          [36, 50],
          [38, 100],
          [21, 60],
          [39, 60],
          [46, 100],
          [18, 50],
          [48, 100],
          [23, 60],
          [26, 60],
          [39, 70],
          [37, 70],
        ]
    const valeurs = this.quotaChoice('valeurs', listeValeurs)

    this.reponse = valeurs[1]
    this.question = `J'ai reçu $${valeurs[0]}$ € puis $${valeurs[1] - valeurs[0]}$ €. <br>
     `
    this.correction = `J'ai reçu $${valeurs[0]}$ € $+$ $${valeurs[1] - valeurs[0]}$ € $=${miseEnEvidence(this.reponse)}$ €.`
    if (!this.interactif) {
      this.question += "En tout, j'ai reçu $\\ldots$ €."
    }
    this.canEnonce = `J'ai reçu $${valeurs[0]}$ € puis $${valeurs[1] - valeurs[0]}$.`
    this.canReponseACompleter = "En tout, j'ai reçu $\\ldots$ €."
  }
}
