import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Calculer un terme d'une suite"
export const interactifReady = true

export const uuid = '6sywb'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2022Q16 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(a?: number, b?: number, k?: number) {
    if (a == null || b == null || k == null) {
      a = randint(1, 7) * choice([-1, 1])
      b = randint(1, 10) * choice([-1, 1])
      k = randint(1, 10)
    }

    let texteUn = ''
    if (a === 1) {
      texteUn = 'n'
    } else if (a === -1) {
      texteUn = '-n'
    } else {
      texteUn = `${a}n`
    }
    texteUn += b > 0 ? `+${b}` : `${b}`

    this.question = `Soit $(u_n)$ une suite définie pour tout  $n\\in\\mathbb{N}$ par : $u_n = ${texteUn}$.<br> $u_{${k}}=$`

    let texteCorr = `Dans l'expression de $u_n$ on remplace $n$ par $${k}$, on obtient : $u_{${k}} =`
    if (a === 1) {
      texteCorr += `${k} ${ecritureAlgebrique(b)}`
    } else if (a === -1) {
      texteCorr += `-${k} ${ecritureAlgebrique(b)}`
    } else {
      texteCorr += `${a} \\times ${k} ${ecritureAlgebrique(b)}`
    }
    const reponse = a * k + b
    texteCorr += `=${miseEnEvidence(reponse)}$.`

    this.correction = texteCorr
    this.reponse = reponse
    this.canEnonce = `Soit $(u_n)$ une suite définie pour tout  $n\\in\\mathbb{N}$ par : $u_n = ${texteUn}$.`
    this.canReponseACompleter = `$u_{${k}}=\\ldots$`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(2, 3, 10)
    else this.enonce()
  }
}
