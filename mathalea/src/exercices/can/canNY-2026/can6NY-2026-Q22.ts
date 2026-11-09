import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
export const titre = ''
export const interactifReady = true

export const uuid = '7k09a'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class CalculDivers2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const choix = this.canOfficielle ? 2 : this.quotaRandint('choix', 1, 5)
    const annee = 2026
    if (choix === 1) {
      this.question = `À quel nombre décimal est égal $${texNombre(annee)}$ dixièmes ? `
      this.reponse = texNombre(new Decimal(annee).div(10), 3)
      this.correction = `$${texNombre(annee)}$ dixièmes est égal  $${texNombre(annee)}\\div 10=${miseEnEvidence(this.reponse)}$.`
    } else if (choix === 2) {
      this.question = `À quel nombre décimal est égal $${texNombre(annee)}$ centièmes ? `
      this.reponse = texNombre(new Decimal(annee).div(100), 3)
      this.correction = `$${texNombre(annee)}$ centièmes est égal à $${texNombre(annee)}\\div 100=${miseEnEvidence(this.reponse)}$.`
    } else if (choix === 3) {
      this.question = `À quel nombre décimal est égal $${texNombre(annee)}$ millièmes ? `
      this.reponse = texNombre(new Decimal(annee).div(1000), 3)
      this.correction = `$${texNombre(annee)}$ millièmes est égal à $${texNombre(annee)}\\div ${texNombre(1000)}=${miseEnEvidence(this.reponse)}$.`
    } else if (choix === 4) {
      this.question = `À quel nombre entier est égal $${texNombre(annee)}$ dizaines ? `
      this.reponse = texNombre(new Decimal(annee).mul(10), 3)
      this.correction = `$${texNombre(annee)}$ dizaines est égal à $${texNombre(annee)}\\times 10=${miseEnEvidence(this.reponse)}$.`
    } else {
      this.question = `À quel nombre entier est égal $${texNombre(annee)}$ centaines ? `
      this.reponse = texNombre(new Decimal(annee).mul(100), 3)
      this.correction = `$${texNombre(annee)}$ centaines est égal à $${texNombre(annee)}\\times 100=${miseEnEvidence(this.reponse)}$.`
    }
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
