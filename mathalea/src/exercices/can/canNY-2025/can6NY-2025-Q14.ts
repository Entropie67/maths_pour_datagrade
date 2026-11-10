import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
export const titre = 'Déterminer un nombre plus grand ou plus petit'
export const interactifReady = true

export const uuid = '47dd3'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class SommeDeProduitsCompleter extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const choixPG = [
      [0, 2030],
      [1, 2031],
      [2, 2032],
      [3, 2033],
      [4, 2034],
      [5, 2035],
      [6, 2026],
      [7, 2027],
      [8, 2028],
      [9, 2029],
    ]
    const choixPP = [
      [0, 2020],
      [1, 2021],
      [2, 2022],
      [3, 2023],
      [4, 2024],
      [5, 2015],
      [6, 2016],
      [7, 2017],
      [8, 2018],
      [9, 2019],
    ]
    const PlusGrand = this.quotaChoice('plusGrand', choixPG)
    const PlusPetit = this.quotaChoice('plusPetit', choixPP)
    const PGouPP = choice([PlusGrand, PlusPetit])
    this.question = `Quel est le plus ${PGouPP === PlusGrand ? 'petit nombre entier strictement supérieur' : 'grand nombre entier strictement inférieur'} à $${texNombre(2025, 0)}$  dont le chiffre des unités est $${PGouPP[0]}$ ?`
    this.correction = '$'
    if (PGouPP === PlusGrand) {
      for (let i = 2025; i < PlusGrand[1]; i++)
        this.correction += `${texNombre(i, 0)}<`
      this.correction += `${miseEnEvidence(texNombre(PlusGrand[1], 0))}$`
    } else {
      for (let i = 2025; i > PlusPetit[1]; i--)
        this.correction += `${texNombre(i, 0)}>`
      this.correction += `${miseEnEvidence(texNombre(PlusPetit[1], 0))}$`
    }

    this.correction += `<br>Le plus ${PGouPP === PlusGrand ? 'petit nombre entier strictement supérieur' : 'grand nombre entier strictement inférieur'} à $${texNombre(2025, 0)}$  dont le chiffre des unités est $${PGouPP[0]}$ est $${miseEnEvidence(texNombre(PGouPP[1]))}$.`
    this.reponse = PGouPP[1]
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
