import { bleuMathalea } from '../../../lib/colors'
import {
  texteEnCouleur,
  miseEnEvidence,
} from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Convertir des $\\text{m}^3$ et litres'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote & Gilles Mora
 */

export const uuid = 'a39f6'

export const refs = {
  'fr-fr': ['can6M3-01'],
  'fr-ch': [],
}
export default class ConversionM3EtLitres extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let a, resultat
    switch (this.quotaChoice('typeConversion', ['a', 'b'])) {
      case 'a':
        a = randint(1, 12) + randint(1, 9) / 10
        resultat = a * 1000
        this.question = ` $${texNombre(a)}\\text{ m}^3 =$ `
        if (!this.interactif) {
          this.question += '$ \\ldots\\text{ L}$'
        }

        this.optionsChampTexte = { texteApres: ' L' }
        this.correction = ` $${texNombre(a)}\\text{ m}^3 = ${miseEnEvidence(texNombre(a * 1000))}\\text{ L}$`
        this.correction += texteEnCouleur(
          `<br> Mentalement : <br>
        Comme $1\\text{ m}^3 = ${texNombre(1000)}\\text{ L}$, alors pour passer des $\\text{ m}^3$ au $\\text{L}$, on multiplie par $${texNombre(1000)}$.<br>
          Comme $${texNombre(a)}\\times ${texNombre(1000)} =${texNombre(a * 1000)}$, alors $${texNombre(a)}\\text{ m}^3${sp()}=${texNombre(resultat)}\\text{ L}$. `,
          bleuMathalea,
        )
        this.canEnonce = 'Compléter.'
        this.canReponseACompleter = `$${texNombre(a)}\\text{ m}^3 = \\dots\\text{ L}$`
        break
      case 'b':
        a = randint(1, 9) + randint(1, 9) * 10 + randint(0, 9) * 100
        resultat = a / 1000
        this.question = `$${texNombre(a)}\\text{ L}=$ `
        if (!this.interactif) {
          this.question += ' $\\dots\\text{ m}^3$'
        }

        this.optionsChampTexte = { texteApres: '$\\text{ m}^3$' }
        this.canEnonce = 'Compléter.'
        this.canReponseACompleter = `$${texNombre(a)}\\text{ L} = \\dots\\text{ m}^3$`
        this.correction = ` $${texNombre(a)}\\text{ L}=${miseEnEvidence(texNombre(a / 1000))}\\text{ m}^3$`
        this.correction += texteEnCouleur(
          `<br> Mentalement : <br>
           Comme $1\\text{ m}^3 = ${texNombre(1000)}\\text{ L}$, alors $1\\text{ L} = ${texNombre(0.001)}\\text{ m}^3$. Donc, pour passer des $\\text{L}$ aux $\\text{ m}^3$, on divise par $${texNombre(1000)}$.<br>
          Comme $${texNombre(a)}\\div ${texNombre(1000)} =${texNombre(a / 1000)}$, alors $${texNombre(a)}\\text{ L}$$${sp()}=${texNombre(a / 1000)}\\text{ m}^3$. `,
          bleuMathalea,
        )

        break
    }

    this.reponse = resultat
  }
}
