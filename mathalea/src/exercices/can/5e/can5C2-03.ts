import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer astucieusement avec une factorisation'
export const interactifReady = true

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication 18/10/2021
*/
export const uuid = '7d21c'

export const refs = {
  'fr-fr': ['can5C2-03', '5N1H-flash3'],
  'fr-ch': ['NR'],
}
export default class CalculAstucieuxAvecFactorisation extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let a, b, c, d
    switch (
      this.quotaChoice('typeDeQuestions', ['a', 'b', 'c', 'c', 'd', 'e']) //
    ) {
      case 'a':
        a = randint(5, 99) / 10
        b = randint(2, 9) * 5
        c = 100 - b
        this.question = `Calculer $${b}\\times${texNombre(a)} + ${texNombre(a)}\\times${c}$.
`
        this.correction = `On remarque de part et d'autre du signe "$+$" un facteur commun : $${texNombre(a)}$.<br>
En factorisant par ce nombre, on obtient : <br>
$\\begin{aligned}
${texNombre(b)}\\times${texNombre(a)} + ${texNombre(a)}\\times${c}&=${texNombre(a)}\\underbrace{(${texNombre(b)}+${texNombre(c)})}_{=100}\\\\
&=${texNombre(a)}\\times 100\\\\
&=${miseEnEvidence(texNombre(100 * a))}
\\end{aligned}$`
        this.reponse = arrondi(100 * a)
        break

      case 'b':
        a = randint(5, 99) / 100
        b = randint(2, 8)
        c = 10 - b
        this.question = `Calculer $ ${b}\\times${texNombre(a)}+ ${c}\\times${texNombre(a)}$.
`
        this.correction = `On remarque de part et d'autre du signe "$+$" un facteur commun : $${texNombre(a)}$.<br>
        En factorisant par ce nombre, on obtient : <br>
        $\\begin{aligned}
        ${texNombre(b)}\\times${texNombre(a)} + ${texNombre(c)}\\times${texNombre(a)}&=${texNombre(a)}\\underbrace{(${texNombre(b)}+${texNombre(c)})}_{=10}\\\\
        &=${texNombre(a)}\\times 10\\\\
        &=${miseEnEvidence(texNombre(10 * a))}
        \\end{aligned}$`
        this.reponse = arrondi(10 * a)
        break

      case 'c':
        a = randint(5, 99, [10, 20, 30, 40, 50, 60, 70, 80, 90]) / 10
        b = randint(2, 8) / 10
        d = randint(1, 2)
        c = d - b
        this.question = `Calculer $ ${texNombre(b)}\\times${texNombre(a)}+ ${texNombre(c)}\\times${texNombre(a)}$.
`
        this.correction = `On remarque de part et d'autre du signe "$+$" un facteur commun : $${texNombre(a)}$.<br>
        En factorisant par ce nombre, on obtient : <br>
$\\begin{aligned}
${texNombre(a)}\\times ${texNombre(b)}+${texNombre(a)}\\times ${texNombre(c)}&=${texNombre(a)}\\underbrace{(${texNombre(b)}+${texNombre(c)})}_{=${d}}\\\\
&=${texNombre(a)}\\times ${d}\\\\
&=${miseEnEvidence(texNombre(d * a))}
\\end{aligned}$`
        this.reponse = arrondi(d * a)
        break
      case 'd':
        a = randint(5, 99) / 100
        b = randint(2, 99) / 10
        c = 10 - b
        this.question = `Calculer $ ${texNombre(b)}\\times${texNombre(a)}+ ${texNombre(c)}\\times${texNombre(a)}$.
    `
        this.correction = `On remarque de part et d'autre du signe "$+$" un facteur commun : $${texNombre(a)}$.<br>
            En factorisant par ce nombre, on obtient : <br>
            $\\begin{aligned}
            ${texNombre(b)}\\times${texNombre(a)} + ${texNombre(c)}\\times${texNombre(a)}&=${texNombre(a)}\\underbrace{(${texNombre(b)}+${texNombre(c)})}_{=10}\\\\
            &=${texNombre(a)}\\times 10\\\\
            &=${miseEnEvidence(texNombre(10 * a))}
            \\end{aligned}$`
        this.reponse = arrondi(10 * a)
        break
      case 'e':
        a = randint(1, 12) * 10
        b = randint(2, 9) / 10
        c = 5 - b
        this.question = `Calculer $ ${texNombre(a)}\\times${texNombre(b)}+ ${texNombre(c)}\\times${texNombre(a)}$.
    `
        this.correction = `On remarque de part et d'autre du signe "$+$" un facteur commun : $${texNombre(a)}$.<br>
            En factorisant par ce nombre, on obtient : <br>
            $\\begin{aligned}
            ${texNombre(a)}\\times${texNombre(b)}+ ${texNombre(c)}\\times${texNombre(a)}&=${texNombre(a)}\\underbrace{(${texNombre(b)}+${texNombre(c)})}_{=5}\\\\
            &=${texNombre(a)}\\times 5\\\\
            &=${miseEnEvidence(texNombre(5 * a))}
            \\end{aligned}$`
        this.reponse = arrondi(5 * a)
        break
    }
  }
}
