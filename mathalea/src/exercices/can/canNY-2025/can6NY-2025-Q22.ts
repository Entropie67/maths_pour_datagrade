import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
export const titre = ''
export const interactifReady = true

export const uuid = 'bcfc8'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class CalculDivers extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const choix = this.quotaRandint('choix', 1, 5)
    if (choix === 1) {
      this.question = `À quel nombre décimal est égal $${texNombre(2025)}$ dixièmes ? `
      this.reponse = texNombre(new Decimal(2025).div(10), 3)
      this.correction = `$${texNombre(2025)}$ dixièmes est égal  $${texNombre(2025)}\\div 10=${miseEnEvidence(this.reponse)}$.`
    } else if (choix === 2) {
      this.question = `À quel nombre décimal est égal $${texNombre(2025)}$ centièmes ? `
      this.reponse = texNombre(new Decimal(2025).div(100), 3)
      this.correction = `$${texNombre(2025)}$ centièmes est égal à $${texNombre(2025)}\\div 100=${miseEnEvidence(this.reponse)}$.`
    } else if (choix === 3) {
      this.question = `À quel nombre décimal est égal $${texNombre(2025)}$ millièmes ? `
      this.reponse = texNombre(new Decimal(2025).div(1000), 3)
      this.correction = `$${texNombre(2025)}$ millièmes est égal à $${texNombre(2025)}\\div ${texNombre(1000)}=${miseEnEvidence(this.reponse)}$.`
    } else if (choix === 4) {
      this.question = `À quel nombre entier est égal $${texNombre(2025)}$ dizaines ? `
      this.reponse = texNombre(new Decimal(2025).mul(10), 3)
      this.correction = `$${texNombre(2025)}$ dizaines est égal à $${texNombre(2025)}\\times 10=${miseEnEvidence(this.reponse)}$.`
    } else {
      this.question = `À quel nombre entier est égal $${texNombre(2025)}$ centaines ? `
      this.reponse = texNombre(new Decimal(2025).mul(100), 3)
      this.correction = `$${texNombre(2025)}$ centaines est égal à $${texNombre(2025)}\\times 100=${miseEnEvidence(this.reponse)}$.`
    }
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
