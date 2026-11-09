import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer un produit avec un décimal'
export const interactifReady = true

export const uuid = 'ke05o'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Éric Elter

*/

type TypeDeNombre = {
  entier: number
  decimaux: number[]
}
export default class Can20266Q28 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = {
      texteAvant: '$~=$',
    }
  }

  typesDeNombres: TypeDeNombre[] = [
    {
      entier: 5,
      decimaux: [2.2, 3.2, 4.2, 5.2, 0.2, 1.2],
    },
    {
      entier: 4,
      decimaux: [1.5, 2.5, 3.5, 4.5, 5.5],
    },
    {
      entier: 5,
      decimaux: [1.4, 2.4, 3.4, 4.4, 5.4],
    },
  ]

  enonce(entier?: number, decimal?: number) {
    if (entier == null) {
      const typeDeNombre = this.typesDeNombres[randint(0, 2)]

      entier = typeDeNombre.entier
      decimal =
        typeDeNombre.decimaux[
          Math.floor(Math.random() * typeDeNombre.decimaux.length)
        ]
    }

    this.reponse = arrondi(entier * decimal!)
    this.question = `$${entier}\\times ${texNombre(decimal!)}$`
    const partieEntiere = Math.floor(decimal!)
    const partieDecimale = arrondi(decimal! - Math.floor(decimal!))
    this.correction =
      this.question.slice(0, -1) +
      `= ${entier}\\times (${partieEntiere} + ${texNombre(partieDecimale)})
      = (${entier}\\times ${partieEntiere}) + (${entier}\\times ${texNombre(partieDecimale)})
      = ${entier * partieEntiere} + ${arrondi(entier * partieDecimale)}
      =${miseEnEvidence(this.reponse)}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(5, 1.2)
    else this.enonce()
  }
}
