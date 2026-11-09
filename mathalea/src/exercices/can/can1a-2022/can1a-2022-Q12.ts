import { texNombre } from '../../../lib/outils/texNombre'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { arcenciel, miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer un terme dans une suite géométrique'
export const interactifReady = true

export const uuid = 'ko2fq'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2022Q12 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(u0?: number, raison?: number, k?: number) {
    if (u0 == null || raison == null || k == null) {
      raison = randint(2, 3)
      u0 = 1
      k = randint(2, 4)
    }

    let u = u0
    let texteCorr: string

    this.question = `Pour tout entier naturel $n$, <br>
$\\begin{cases} u_0=${u0}\\\\u_{n+1}=${raison}\\times u_n \\end{cases}$${sp(15)}
$u_{${k}}=$`

    texteCorr = 'On calcule les termes avec la formule de récurrence :'
    for (let indice = 0; indice < k; indice++) {
      texteCorr += `<br> $u_{${indice + 1}} = ${miseEnEvidence(' u_{' + indice + '}', arcenciel(indice, true))} \\times ${raison} =
${miseEnEvidence(u, arcenciel(indice, true))} \\times ${raison} = ${miseEnEvidence(u * raison, arcenciel(indice + 1, true))}$`
      u = u * raison
    }

    texteCorr += `<br>Ainsi, $u_{${k}}=${miseEnEvidence(texNombre(u))}$.`
    this.correction = texteCorr
    this.reponse = u
    this.canEnonce = `Pour tout entier naturel $n$, <br>
$\\begin{cases} u_0=${u0}\\\\u_{n+1}=${raison}\\times u_n \\end{cases}$
`
    this.canReponseACompleter = `$u_{${k}}=\\ldots$ `
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(1, 3, 4)
    else this.enonce()
  }
}
