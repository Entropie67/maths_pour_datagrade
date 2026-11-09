import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Donner un arrondi'
export const interactifReady = true

export const uuid = 'dm6qq'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2022Q15 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(nbre?: number, typeArrondi?: string) {
    if (nbre == null || typeArrondi == null) {
      const a = randint(1, 9)
      let b = randint(1, 9)
      let c = randint(1, 9, b)
      let d = randint(1, 9, [b, c])
      let e = randint(0, 9, [b, c, d])
      let f = randint(0, 9, [b, c, d, e])
      let g = randint(1, 9, [b, c, d, e, f])
      b /= 10
      c /= 100
      d /= 1000
      e /= 10000
      f /= 100000
      g /= 1000000
      nbre = a + b + c + d + e + f + g
      typeArrondi = choice(['millieme', 'centieme'])
    }

    if (typeArrondi === 'millieme') {
      const chiffreApres = Math.floor((nbre * 10000) % 10)
      const reponse = arrondi(nbre, 3)
      this.question = `Donner l'arrondi au millième de $${texNombre(nbre, 6)}$.`
      if (chiffreApres < 5) {
        this.correction = `Le chiffre qui suit les millièmes est $${chiffreApres}<5$, donc l'arrondi au millième de $${texNombre(nbre, 6)}$ est $${miseEnEvidence(texNombre(reponse))}$.`
      } else {
        this.correction = `Le chiffre qui suit les millièmes est $${chiffreApres}\\geqslant5$, donc l'arrondi au millième de $${texNombre(nbre, 6)}$ est $${miseEnEvidence(texNombre(reponse))}$.`
      }
      this.reponse = nbre.toFixed(3)
    } else {
      const chiffreApres = Math.floor((nbre * 1000) % 10)
      const reponse = arrondi(nbre, 2)
      this.question = `Donner l'arrondi au centième de $${texNombre(nbre, 6)}$.`
      if (chiffreApres < 5) {
        this.correction = `Le chiffre qui suit les centièmes est $${chiffreApres}<5$, donc l'arrondi au centième de $${texNombre(nbre, 6)}$ est $${miseEnEvidence(texNombre(reponse))}$.`
      } else {
        this.correction = `Le chiffre qui suit les centièmes est $${chiffreApres}\\geqslant5$, donc l'arrondi au centième de $${texNombre(nbre, 6)}$ est $${miseEnEvidence(texNombre(reponse))}$.`
      }
      this.reponse = nbre.toFixed(2)
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(3.754689, 'millieme')
    else this.enonce()
  }
}
