import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer un produit avec un décimal'
export const interactifReady = true

export const uuid = '90963'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/

type TypeDeNombre = {
  entier: number
  decimaux: number[]
}
export default class Can2026CM2Q28 extends ExerciceCan {
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
      entier: 4,
      decimaux: [1.3, 1.4, 1.6],
    },
    {
      entier: 2,
      decimaux: [0.6, 0.8, 1.6, 1.8],
    },
  ]

  enonce(entier?: number, decimal?: number) {
    if (entier == null) {
      const typeDeNombre = choice(this.typesDeNombres)
      entier = typeDeNombre.entier
      decimal = choice(typeDeNombre.decimaux)
    }

    this.reponse = arrondi(entier * decimal!)
    this.question = `$${entier}\\times ${texNombre(decimal!)}$`
    const partieEntiere = Math.floor(decimal!)
    const partieDecimale = arrondi(decimal! - partieEntiere)

    if (partieEntiere === 0) {
      this.correction = `$${entier}\\times ${texNombre(decimal!)}=${miseEnEvidence(texNombre(this.reponse))}$`
    } else {
      this.correction = `$${entier}\\times ${texNombre(decimal!)}= ${entier}\\times (${partieEntiere} + ${texNombre(partieDecimale)})
      = (${entier}\\times ${partieEntiere}) + (${entier}\\times ${texNombre(partieDecimale)})
      = ${entier * partieEntiere} + ${texNombre(arrondi(entier * partieDecimale))}
      =${miseEnEvidence(texNombre(this.reponse))}$`
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(2, 0.6)
    else this.enonce()
  }
}
