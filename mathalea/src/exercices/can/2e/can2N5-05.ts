import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer avec des racines carrées'
export const interactifReady = true

export const dateDePublication = '19/09/2022'
export const dateDeModifImportante = '31/10/2026'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication
*/

export const uuid = '27f5c'

export const refs = {
  'fr-fr': ['can2N5-05', '2N50-flash3'],
  'fr-ch': ['NR'],
}
export default class CalculAvecRacineDef extends ExerciceSimple {
  constructor() {
    super()
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.formatChampTexte = KeyboardType.clavierFullOperations
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let a, choix
    switch (
      this.quotaChoice('cas', [1, 2, 3, 4, 5]) //
    ) {
      case 1:
        a = choice([1, 4, 9, 16, 25, 36, 49, 64, 81, 100])
        if (choice([true, false])) {
          this.question = `Calculer $(\\sqrt{${a}})^2$. `
          this.correction = `$\\sqrt{${a}}$ est le nombre positif dont le carré est $${a}$. <br>
          Ainsi, $(\\sqrt{${a}})^2=\\sqrt{${a}}\\times \\sqrt{${a}}=${miseEnEvidence(`${a}`)}$.`
        } else {
          this.question = `Calculer $(-\\sqrt{${a}})^2$. `
          this.correction = `$\\sqrt{${a}}$ est le nombre positif dont le carré est $${a}$. <br>
        Ainsi, $(-\\sqrt{${a}})^2=(-\\sqrt{${a}})\\times (-\\sqrt{${a}})=\\sqrt{${a}}\\times \\sqrt{${a}}=${miseEnEvidence(`${a}`)}$.`
        }
        this.optionsDeComparaison = { texteSansCasse: true }
        this.reponse = a
        break

      case 2:
        a = randint(1, 10)
        choix = choice([true, false])
        this.question = `Calculer $${choix ? '' : '-'}\\sqrt{${a * a}}$. `
        this.correction = `$\\sqrt{${a * a}}$ est le nombre positif dont le carré est $${a * a}$. <br>
          Le nombre positif dont le carré est $${a * a}$ est $${a}$.
          Ainsi, ${choix ? `$\\sqrt{${a * a}}=${miseEnEvidence(`${a}`)}$` : `$-\\sqrt{${a * a}}=${miseEnEvidence(`${-a}`)}$`}.`
        this.optionsDeComparaison = { texteSansCasse: true }
        this.reponse = choix ? a : -a
        break

      case 3:
        a =
          choice([2, 3, 4, 5, 6, 7, 8, 9, 10, 16, 25, 36, 49, 64, 81, 100]) *
          choice([-1, 1])
        this.question = `Calculer $\\sqrt{${ecritureParentheseSiNegatif(a)}^2}$. `
        if (a < 0) {
          this.correction = `$\\sqrt{(${a})^2}=\\sqrt{${-a}^2}=\\sqrt{${-a}\\times ${-a}}=\\sqrt{${-a}}\\times \\sqrt{${-a}}=(\\sqrt{${-a}})^2$<br>
        $\\sqrt{${-a}}$ est le nombre positif dont le carré est $${-a}$, donc $(\\sqrt{${-a}})^2=${-a}$. <br>
         Ainsi, $\\sqrt{(${a})^2}=${miseEnEvidence(`${-a}`)}$.`
        } else {
          this.correction = `$\\sqrt{${a}^2}=\\sqrt{${a}\\times ${a}}=\\sqrt{${a}}\\times \\sqrt{${a}}=(\\sqrt{${a}})^2$<br>
         $\\sqrt{${a}}$ est le nombre positif dont le carré est $${a}$, donc $(\\sqrt{${a}})^2=${a}$. <br>
          Ainsi, $\\sqrt{${a}^2}=${miseEnEvidence(`${a}`)}$.`
        }
        this.optionsDeComparaison = { texteSansCasse: true }
        if (a < 0) {
          this.reponse = -a
        } else {
          this.reponse = a
        }

        break

      case 4:
        a = randint(2, 30, [4, 9, 16, 25])
        choix = choice([true, false])
        if (choice([true, false])) {
          this.question = `Calculer $${choix ? '' : '-'}\\sqrt{${a}}\\times \\sqrt{${a}}$. `
          this.correction = `$ ${choix ? '' : '-'}\\sqrt{${a}}\\times \\sqrt{${a}}= ${choix ? '' : '-'}(\\sqrt{${a}})^2$<br>
           $\\sqrt{${a}}$ est le nombre positif dont le carré est $${a}$, donc $(\\sqrt{${a}})^2=${a}$. <br>
            Ainsi, $${choix ? '' : '-'}\\sqrt{${a}}\\times \\sqrt{${a}}=${miseEnEvidence(`${choix ? '' : '-'} ${a}`)}$.`
        } else {
          this.question = `Calculer $\\sqrt{${a}}\\times${choix ? '' : '(-'} \\sqrt{${a}}${choix ? '' : ')'}$. `
          this.correction = `$\\sqrt{${a}}\\times${choix ? '' : '(-'} \\sqrt{${a}}${choix ? '' : ')'}= ${choix ? '' : '-'}(\\sqrt{${a}})^2$<br>
            $\\sqrt{${a}}$ est le nombre positif dont le carré est $${a}$, donc $(\\sqrt{${a}})^2=${a}$. <br>
             Ainsi, $\\sqrt{${a}}\\times${choix ? '' : '(-'} \\sqrt{${a}}${choix ? '' : ')'}=${miseEnEvidence(`${choix ? '' : '-'} ${a}`)}$.`
        }
        this.optionsDeComparaison = { texteSansCasse: true }
        this.reponse = choix ? a : -a
        break

      case 5:
      default:
        a = choice([2, 3, 5, 7, 10, 11, 13, 15, 17, 19, 21])
        choix = choice([true, false])
        this.question = `Écrire plus simplement $\\sqrt{${a}}+ \\sqrt{${a}}$. `
        this.correction = `La somme de deux racines carrées n'est pas égale à la racine carrée de la somme.<br> Autrement dit, $\\sqrt{${a}}+ \\sqrt{${a}}$
             n'est pas égal à $\\sqrt{${2 * a}}$.<br>
             En revanche on peut écrire : $\\sqrt{${a}} + \\sqrt{${a}}= ${miseEnEvidence(`2\\sqrt{${a}}`)}$.`
        this.reponse = [`2\\sqrt{${a}}`]
        // Les cas précédents imposent une comparaison de texte, qui resterait active pour cette question
        // et refuserait `2\sqrt7` (MathLive n'écrit pas les accolades d'une racine à un chiffre).
        this.optionsDeComparaison = {}
        break
    }
    this.canEnonce = this.question // 'Compléter'
    this.canReponseACompleter = ''
  }
}
