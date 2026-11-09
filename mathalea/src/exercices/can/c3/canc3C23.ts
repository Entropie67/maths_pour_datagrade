import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'

import { bleuMathalea } from '../../../lib/colors'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
import { sp } from '../../../lib/outils/outilString'
export const titre = 'Déterminer le complément à $10$, $100$, $1\\,000$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '03/08/2025'

/**
 * @author Gilles Mora
 *
 */
export const uuid = 'cb93a'

export const refs = {
  'fr-fr': ['can6C1-08', 'canc3C23'],
  'fr-ch': [],
}
export default class ComplementADixCentMille extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.typeExercice = 'simple'
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  nouvelleVersion() {
    switch (
      this.quotaChoice('typeDeQuestions', [1, 1, 1, 2, 3, 3, 3, 3]) //
    ) {
      case 1: // complément à 100
        {
          const a = randint(11, 89, [20, 30, 40, 50, 60, 70, 80])
          this.question = `Calculer $100-${a}$.`
          this.correction = `$100-${a}=${miseEnEvidence(100 - a)}$<br>`
          this.reponse = 100 - a
          this.correction += texteEnCouleur(
            `Mentalement : <br><br>
    $${a} \\xrightarrow{+${10 - (a % 10)}} ${a + (10 - (a % 10))} \\xrightarrow{+${100 - (a + (10 - (a % 10)))}} 100$.
     `,
            bleuMathalea,
          )
        }
        break
      case 2: // complément à 10
        {
          const a = randint(1, 9)
          this.question = `Calculer $10-${a}$.`
          this.correction = `$10-${a}=${miseEnEvidence(10 - a)}$<br>`
          this.reponse = 10 - a
          this.correction += texteEnCouleur(
            `Mentalement : <br>
    pour calculer $10-${a}$, on peut penser : «${sp()}Combien faut-il ajouter à $${a}$ pour obtenir $10$ ?${sp()}» <br>
     $${10 - a}$ car $${a}+${10 - a}=10$. <br><br>
     `,
            bleuMathalea,
          )
        }
        break
      case 3: // complément à 1000
      default:
        {
          const a = randint(101, 899, [200, 300, 400, 500, 600, 700, 800])
          this.question = `Calculer $${texNombre(1000)}-${a}$.`
          this.correction = `$${texNombre(1000)}-${a}=${miseEnEvidence(1000 - a)}$<br>`
          this.reponse = 1000 - a

          let diagramme = `$${a}`
          let valeurCourante = a

          // Si ce n'est pas un multiple de 10, aller à la dizaine supérieure
          if (a % 10 !== 0) {
            const prochaineDizaine = Math.ceil(a / 10) * 10
            const etapeVers10 = prochaineDizaine - a
            diagramme += ` \\xrightarrow{+${etapeVers10}} ${prochaineDizaine}`
            valeurCourante = prochaineDizaine
          }

          // Si ce n'est pas un multiple de 100, aller à la centaine supérieure
          if (valeurCourante % 100 !== 0) {
            const prochaineCentaine = Math.ceil(valeurCourante / 100) * 100
            const etapeVers100 = prochaineCentaine - valeurCourante
            diagramme += ` \\xrightarrow{+${etapeVers100}} ${prochaineCentaine}`
            valeurCourante = prochaineCentaine
          }

          // Aller à 1000
          const etapeVers1000 = 1000 - valeurCourante
          diagramme += ` \\xrightarrow{+${etapeVers1000}} ${texNombre(1000)}$.`

          this.correction += texteEnCouleur(
            `Mentalement : <br><br>
    ${diagramme} <br><br>
     `,
            bleuMathalea,
          )
        }
        break
    }
  }
}
