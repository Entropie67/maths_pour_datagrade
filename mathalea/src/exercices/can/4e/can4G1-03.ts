import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { texRacineCarree } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer la diagonale d’un carré'
export const interactifReady = true

export const dateDePublication = '09/09/2021'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export const uuid = '66672'

export const refs = {
  'fr-fr': ['can4G1-03'],
  'fr-ch': ['NR'],
}

export default class DiagonaleCarre extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierFullOperations
  }

  nouvelleVersion() {
    switch (this.quotaChoice('cas', [1, 2])) {
      case 1:
        {
          const a = randint(1, 10) //
          const c2 = 2 * a ** 2

          this.question = `Calculer la valeur exacte de la longueur de la diagonale $d$ d'un carré de côté $${a}$.`
          if (this.interactif) {
            this.question += '<br>$d=$'
          }
          this.correction = ` En utilisant le théorème de Pythagore dans un carré de côté $${a}$ et de diagonale $d$, on a :<br><br>
    $\\begin{aligned}
    d^2&=${a}^2+${a}^2\\\\
    d^2&= ${a ** 2}+${a ** 2}\\\\
    d&=${miseEnEvidence(`\\sqrt{ ${2 * a ** 2}}`)}
       \\end{aligned}$
   `
          this.correction += texteEnCouleur(
            `<br> Mentalement : <br>
   On calcule le double du carré du côté du carré,
   soit $2\\times ${a}^2=2\\times ${a ** 2}=${c2}$, puis on en prend la racine carrée.    `,
            bleuMathalea,
          )
          this.reponse = texRacineCarree(c2)
        }
        break
      case 2:
        {
          const a = randint(2, 48, [4, 9, 16, 25, 36]) //
          const c2 = 2 * a

          this.question = `Calculer la valeur exacte de la longueur de la diagonale $d$ d'un carré de côté $\\sqrt{${a}}$.`
          if (this.interactif) {
            this.question += '<br>$d=$'
          }

          this.correction = ` En utilisant le théorème de Pythagore dans un carré de côté $c=\\sqrt{${a}}$
       et de diagonale $d$, on a :<br>`
          if (c2 === 4 || c2 === 16 || c2 === 36 || c2 === 64 || c2 === 100) {
            this.correction += `
       $\\begin{aligned}
       c^2+c^2&=d^2\\\\
       \\sqrt{${a}}^2+\\sqrt{${a}}^2&=d^2\\\\
       d^2&=${a}+${a}\\\\
       d^2&=${c2}\\\\
       d&=${miseEnEvidence(texRacineCarree(c2))}
       \\end{aligned}$`
          } else {
            this.correction += `
       $\\begin{aligned}
       c^2+c^2&=d^2\\\\
       \\sqrt{${a}}^2+\\sqrt{${a}}^2&=d^2\\\\
       d^2&=${a}+${a}\\\\
       d^2&=${c2}\\\\
       d&=${miseEnEvidence(`\\sqrt{${c2}}`)}
       \\end{aligned}$`
          }
          this.correction += texteEnCouleur(
            `<br> Mentalement : <br>
       On calcule le double du carré du côté du carré, soit
       $2\\times (\\sqrt{${a}})^2=2\\times ${a}=${c2}$, puis on en prend la racine carrée.    `,
            bleuMathalea,
          )

          this.reponse = texRacineCarree(c2)
        }
        break
    }

    this.canReponseACompleter = '$d=\\ldots$'
  }
}
