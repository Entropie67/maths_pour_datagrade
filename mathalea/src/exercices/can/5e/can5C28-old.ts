// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid f9b48 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const interactifReady = true
export const titre =
  'Trouver un entier relatif (addition à trou, écriture simplifiée)'
export const dateDePublication = '19/10/2023'
/**
 * @author  Gilles Mora (J'ai repris l'ex 5R20-2)
 *

 */
export const uuid = 'f9b48'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class AdditionRelatifATrou2Old extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.sup = 20
  }

  nouvelleVersion() {
    let a = this.quotaRandint('a', 1, this.sup)
    let b = this.quotaRandint('b', 1, this.sup)
    const k = this.quotaChoice('k', [
      [-1, -1],
      [-1, 1],
      [1, -1],
    ]) // Les deux nombres relatifs ne peuvent pas être tous les deux positifs
    a = a * k[0]
    b = b * k[1]
    const rang1 = randint(0, 1)
    const rang2 = 1 - rang1
    const termes = [
      rang1 === 0 ? a : ecritureAlgebrique(a),
      (rang2 === 1 ? '+' : '') + '\\ldots',
      rang1 === 0 ? a : ecritureAlgebrique(a),
      rang2 === 1
        ? '+' + miseEnEvidence(String(ecritureParentheseSiNegatif(b)))
        : miseEnEvidence(b),
    ]

    this.question =
      "Quel nombre doit-on écrire pour que l'égalité soit correcte ? <br>"

    this.question +=
      '$ ' + termes[rang1] + '  ' + termes[rang2] + ' = ' + (a + b) + ' $'
    this.canEnonce = 'Compléter.'
    this.canReponseACompleter =
      '$ ' + termes[rang1] + '  ' + termes[rang2] + ' = ' + (a + b) + ' $'
    this.correction =
      '$ ' + termes[rang1 + 2] + termes[rang2 + 2] + ' = ' + (a + b) + ' $'
    if (rang2 === 1 && b < 0)
      this.correction +=
        '<br>$ ' +
        termes[rang1 + 2] +
        sp(1) +
        miseEnEvidence(b) +
        ' = ' +
        (a + b) +
        ' $'
    this.reponse = b
  }
}
