import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import Decimal from 'decimal.js'
import { choice } from '../../../lib/outils/arrayOutils'
export const titre = 'Convertir m$^3$ et Litres'
export const interactifReady = true

export const uuid = 'ob9in'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter + Gilles Mora
 */
export default class Convertir extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const annee = 2026
    let a, b
    switch (this.canOfficielle ? 'a' : this.quotaChoice('cas', ['a', 'b'])) {
      case 'a':
        b = annee
        a = choice([
          new Decimal(b).div(10),
          new Decimal(b).div(10000),
          new Decimal(b).div(100),
          new Decimal(b).div(1000),
        ])
        this.reponse = texNombre(new Decimal(a).mul(1000), 4)
        this.question = ` $${texNombre(a)}\\text{ m}^3 =$ `
        if (!this.interactif) {
          this.question += ' $\\dots\\text{ L}$ '
        }
        this.optionsChampTexte = { texteApres: ' L' }
        this.correction = `Comme $1\\text{ m}^3=${texNombre(1000, 0)}\\text{ L}$, alors $${texNombre(a, 4)}\\text{ m}^3 =${texNombre(a)}\\times ${texNombre(1000, 0)}$ L $ = ${miseEnEvidence(this.reponse)}$ L.`

        this.canEnonce = 'Compléter.'
        this.canReponseACompleter = `$${texNombre(a)}\\text{ m}^3 = \\dots\\text{ L}$`
        break
      case 'b':
        b = annee
        a = choice([
          new Decimal(b),
          new Decimal(b).mul(10),
          new Decimal(b).mul(100),
          new Decimal(b).div(10),
        ])
        this.reponse = texNombre(new Decimal(a).div(1000), 4)
        this.question = `$${texNombre(a)}\\text{ L}=$ `
        if (!this.interactif) {
          this.question += ' $\\dots\\text{ m}^3$ '
        }

        this.optionsChampTexte = { texteApres: '$\\text{ m}^3$' }
        this.canEnonce = 'Compléter.'
        this.canReponseACompleter = `$${texNombre(a)}\\text{ L} = \\dots\\text{ m}^3$`
        this.correction = `Comme $1\\text{ L} =0,001\\text{ m}^3$, alors $${texNombre(a, 4)}\\text{ L}=${texNombre(a, 4)}\\times 0,001\\text{ m}^3 = ${miseEnEvidence(this.reponse)}\\text{ m}^3$.`

        break
    }
  }
}
