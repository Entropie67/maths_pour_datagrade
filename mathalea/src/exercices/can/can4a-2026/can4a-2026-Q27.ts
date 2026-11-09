import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer une moyenne'
export const interactifReady = true

export const uuid = '3fczw'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can20264emeQ27 extends ExerciceCan {
  constructor() {
    super()
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsChampTexte = { texteApres: '.' }
  }

  enonce(a?: number, b?: number, c?: number, d?: number) {
    if (a == null || b == null || c == null || d == null) {
      // Générer une moyenne entière entre 5 et 20
      const moyenne = randint(10, 16)
      const somme = moyenne * 4

      // Générer 3 nombres aléatoires
      a = randint(5, 15)
      b = randint(5, 15)
      c = randint(5, 20)
      // Le 4ème nombre est calculé pour que la somme soit un multiple de 4
      d = somme - a - b - c

      // Si d est hors limites, on recommence
      if (d < 10 || d > 16) {
        // On ajuste pour rester dans les limites
        d = randint(5, 20)
        c = randint(5, 20)
        b = randint(5, 20)
        a = somme - b - c - d
        if (a < 5 || a > 20) {
          // Dernier ajustement
          a = randint(5, 15)
          b = randint(5, 15)
          c = somme - a - b - randint(5, 15)
          d = somme - a - b - c
        }
      }

      // Mélanger les valeurs
      ;[a, b, c, d] = shuffle([a, b, c, d])
    }

    const somme = a + b + c + d
    const moyenne = somme / 4

    this.question = `$${a}~;~${b}~;~${c}~;~${d}$<br>
    La moyenne de cette série est : 
    `

    this.correction = `La moyenne est : $\\dfrac{${a}+${b}+${c}+${d}}{4}=\\dfrac{${somme}}{4}=${miseEnEvidence(texNombre(moyenne))}$.`

    this.reponse = moyenne
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(4, 17, 13, 10)
    else this.enonce()
  }
}
