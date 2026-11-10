import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre, texPrix } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer un prix après une réduction'
export const interactifReady = true

export const uuid = '14a1a'
export const refs = {
  'fr-fr': [''],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class PrixApresReduction extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.canOfficielle = true
    this.optionsChampTexte = { texteAvant: '<br>', texteApres: 'euros.' }
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 150 : randint(9, 15) * 10

    const b = this.canOfficielle ? 20 : choice([20, 30, 40])
    this.question = `Une veste coûte $${a}$ €.<br>Son prix baisse de $${b}\\,\\%$ pendant les soldes.<br>
             Le nouveau prix est de `
    this.optionsChampTexte = { texteApres: '€' }
    this.correction = `
             Le nouveau prix est de  $ ${texNombre(a - (b * a) / 100)} $ €.`

    this.correction = ` 
        On calcule d'abord le montant de la réduction. <br>
        Pour calculer $${b}\\,\\%$  d'une quantité, on commence par calculer $10\\,\\%$  en divisant
        par $10$ :<br> $10\\,\\%$  de $${a}$ est égal à $${a}\\div 10=${texNombre(a / 10, 0)}$.<br>
        $${b}\\,\\%$  de $${a}$ est donc égal à $ ${texNombre(a / 10, 0)}\\times ${texNombre(b / 10, 0)}=${texNombre((a * b) / 100, 2)}$.<br>
                     La réduction est donc de : $${texPrix((b * a) / 100)}$ €.<br>
             Le nouveau prix est de  $${a}-${texNombre((b * a) / 100)}= ${miseEnEvidence(texPrix(a - (b * a) / 100))}$  €.`

    this.reponse = a - (b * a) / 100

    this.canReponseACompleter = '$\\ldots$ euros'
    if (!this.interactif) {
      this.question += ' $\\ldots$ euros.'
    }
  }
}
