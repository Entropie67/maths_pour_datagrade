import { texFractionReduite } from '../../../lib/outils/deprecatedFractions'
import { reduireAxPlusB, rienSi1 } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Trouver les valeurs interdites d’une fonction'
export const interactifReady = true

export const dateDePublication = '25/10/2021'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication
*/
export const uuid = '6f13a'

export const refs = {
  'fr-fr': ['can2F12-01', '2F15-flash1'],
  'fr-ch': [],
}
export default class ValeurInterdite extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let a, b, c, n
    if (this.quotaChoice('type', [true, false])) {
      a = randint(-10, 10, 0)
      n = randint(-5, 5, 0)
      b = randint(-10, 10, 0)
      c = n * b
      this.question = `Donner la valeur interdite de la fonction $f$ définie par ${sp(1)}: ${sp(1)}$f(x)=\\dfrac{${rienSi1(a)}x}{${reduireAxPlusB(b, c)}}$.<br>
    
            `
      this.correction = `La valeur interdite est la solution de l'équation $${reduireAxPlusB(b, c)}=0$.<br>
    La valeur interdite est donc $${miseEnEvidence(texFractionReduite(-c, b))}$.`
      this.reponse = -n
    } else {
      a = randint(-10, 10, 0)

      b = randint(1, 10)
      this.question = `Donner la plus petite valeur interdite de la fonction $f$ définie par ${sp(1)}: ${sp(1)} $f(x)=\\dfrac{${rienSi1(a)}x}{x^2-${b ** 2}}$.<br>
   
      
      `
      this.correction = `Les valeurs interdites sont les solutions de l'équation $x^2-${b ** 2}=0$.<br>
               Cette équation a deux solutions : $${b}$ et $-${b}$.<br>
               La plus petite valeur interdite est donc : $${miseEnEvidence(`-${b}`)}$. `
      this.reponse = -b
    }
    this.canEnonce = this.question // 'Compléter'
    this.canReponseACompleter = ''
  }
}
