import { bleuMathalea } from '../../../lib/colors'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const dateDePublication = '27/07/2025'
export const titre = 'Convertir des unités de longueur'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Éric Elter (d'après can6M4-03 de Jean-claude Lhote & Gilles Mora)

 */
export const uuid = '616e6'

export const refs = {
  'fr-fr': ['can6M4-05', '6M1autoC-4'],
  'fr-ch': ['NR'],
}
export default class ConversionEnTousSensLongueur extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let a, resultat
    switch (this.quotaChoice('cas', ['b', 'd'])) {
      case 'b':
        if (choice([true, false])) {
          a = randint(1, 13) * 5
          resultat = a * 100
          this.question = `$${texNombre(a)}\\text{ m}$ =`
          if (!this.interactif) {
            this.question += ' $\\ldots\\text{ cm}$'
          }

          this.optionsChampTexte = { texteApres: ' $\\text{cm}$' }
          this.canEnonce = 'Compléter.'
          this.canReponseACompleter = `$${texNombre(a)}\\text{ m}$ $=$ $\\dots\\text{ cm}$`
          this.correction = `$${texNombre(a)}\\text{ m}$ $=${miseEnEvidence(texNombre(a * 100))}\\text{ cm}$`
          this.correction += texteEnCouleur(
            `<br> Mentalement : <br>
          Comme $1\\text{ m}$ $=100\\text{ cm}$, pour convertir des $\\text{m}$ aux $\\text{cm}$, on multiplie par $100$.<br>
            Comme : $${texNombre(a)}\\times 100 =${texNombre(a * 100)}$, alors $${texNombre(a)}\\text{ m}=${texNombre(a * 100)}\\text{ cm}$. `,
            bleuMathalea,
          )
        } else {
          a = randint(1, 12) * 10
          resultat = a / 100
          this.question = `$${texNombre(a)}\\text{ cm}$ =`
          if (!this.interactif) {
            this.question += ' $\\ldots\\text{ m}$'
          }

          this.optionsChampTexte = { texteApres: '$\\text{ m}$' }
          this.canEnonce = 'Compléter.'
          this.canReponseACompleter = `$${texNombre(a)}\\text{ cm}$ $= \\dots\\text{ m}$`
          this.correction = `$${texNombre(a)}\\text{ cm}=${miseEnEvidence(texNombre(a / 100))}\\text{ m}$`
          this.correction += texteEnCouleur(
            `<br> Mentalement : <br>
          Comme $1\\text{ m}$ $=100\\text{ cm}$, alors $1\\text{ cm}$ $=0,01\\text{ m}$.<br>
          Ainsi pour convertir des $\\text{cm}$ aux $\\text{m}$, on divise par $100$.<br>
            Comme $${texNombre(a)}\\div 100 =${texNombre(a / 100)}$, alors $${texNombre(a)}\\text{ cm}=${texNombre(a / 100)}\\text{ m}$. `,
            bleuMathalea,
          )
        }
        break
      case 'd':
        if (choice([true, false])) {
          a = randint(1, 20) * 10
          resultat = a / 1000
          this.question = `$${texNombre(a)}\\text{ m}$ $=$ `
          if (!this.interactif) {
            this.question += ' $\\ldots\\text{ km}$'
          }

          this.optionsChampTexte = { texteApres: '$\\text{ km}$' }
          this.canEnonce = 'Compléter.'
          this.canReponseACompleter = `$${texNombre(a)}\\text{ m}$ $= \\dots\\text{ km}$`
          this.correction = `$${texNombre(a)}\\text{ m}$ $=${miseEnEvidence(texNombre(a / 1000))}\\text{ km}$`
          this.correction += texteEnCouleur(
            `<br> Mentalement : <br>
          Comme $1\\text{ km}$ $=${texNombre(1000)}\\text{ m}$, alors $1\\text{ m}$ $=0,001\\text{ km}$.<br>
          Ainsi pour convertir des $\\text{m}$ aux $\\text{km}$, on divise par $${texNombre(1000)}$.<br>
            Comme $${texNombre(a)}\\div ${texNombre(1000)} =${texNombre(a / 1000)}$, alors $${texNombre(a)}\\text{ m}=${texNombre(a / 1000)}\\text{ km}$.`,
            bleuMathalea,
          )
        } else {
          a = randint(1, 35) / 100
          resultat = a * 1000
          this.question = `$${texNombre(a)}\\text{ km}$ $=$`
          if (!this.interactif) {
            this.question += ' $\\ldots\\text{ m}$'
          }

          this.optionsChampTexte = { texteApres: '$\\text{ m}$' }
          this.canEnonce = 'Compléter.'
          this.canReponseACompleter = `$${texNombre(a)}\\text{ km}$ $= \\dots\\text{ m}$`
          this.correction = `$${texNombre(a)}\\text{ km}$$=${miseEnEvidence(texNombre(a * 1000))}\\text{ m}$`
          this.correction += texteEnCouleur(
            `<br> Mentalement : <br>
          Comme $1\\text{ km}$ $=${texNombre(1000)}\\text{ m}$, pour convertir des $\\text{km}$ aux $\\text{m}$, on multiplie par $${texNombre(1000)}$.<br>
            Comme $${texNombre(a)}\\times ${texNombre(1000)} =${texNombre(a * 1000)}$, alors $${texNombre(a)}\\text{ km}$$=${texNombre(a * 1000)}\\text{ m}$.`,
            bleuMathalea,
          )
        }
        break
    }
    this.reponse = resultat
  }
}
