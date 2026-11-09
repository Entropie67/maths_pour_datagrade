import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  reduireAxPlusB,
  reduirePolynomeDegre3,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer un terme d’une suite explicite'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '14/02/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '04/02/2025' // Une date de modification importante au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export const uuid = '44c30'

export const refs = {
  'fr-fr': ['can1S1-01', '1Gen-A101', '1Tec-S105'],
  'fr-ch': [],
}
export default class CalculTermeSuiteExp extends ExerciceSimple {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let a, b, c, k, p, choix, listeFractions1, fraction1
    switch (
      this.quotaChoice('cas', ['a', 'b', 'c', 'd']) //, 'b', 'c', 'd'
    ) {
      case 'a': // fonction affine
        a = randint(-6, 7, 0)
        b = randint(1, 10) * choice([-1, 1])
        k = randint(2, 10)
        this.question = `Soit $(u_n)$ une suite définie par : $u_n =${reduireAxPlusB(a, b, 'n')}$.<br>
        Calculer $u_{${k}}$.`
        this.correction = `Dans l'expression de $u_n$ on remplace $n$ par $${k}$, on obtient : <br>
        $u_{${k}} =${a === 1 || a === -1 ? `${a * k}` : `${a}\\times ${k}`}${ecritureAlgebrique(b)}=${miseEnEvidence(a * k + b)}$.`
        this.reponse = a * k + b
        break
      case 'b': // polynome second degré
        a = randint(1, 2) * choice([-1, 1])
        b = randint(0, 3) * choice([-1, 1])
        c = randint(1, 9) * choice([-1, 1])
        k = randint(1, 5)
        p = reduirePolynomeDegre3(0, a, b, c, 'n')
        this.question = `Soit $(u_n)$ une suite définie par :
        $u_n = ${p}$<br>
        Calculer $u_{${k}}$.`

        this.correction = `Dans l'expression de $u_n$ on remplace $n$ par $${k}$, on obtient :<br>`
        if (a === 1) {
          this.correction += `$u_{${k}}=${k}^2${b === 0 ? '' : `${ecritureAlgebrique(b)}\\times ${k}`}${ecritureAlgebrique(c)}=${miseEnEvidence(a * k * k + b * k + c)}$.`
        } else if (a === -1) {
          this.correction += `$u_{${k}}=${k}^2${b === 0 ? '' : `${ecritureAlgebrique(b)}\\times ${k}`}${ecritureAlgebrique(c)}=${miseEnEvidence(a * k * k + b * k + c)}$.`
        } else {
          this.correction += `$u_{${k}}=${a}\\times ${k}^2${b === 0 ? '' : `${ecritureAlgebrique(b)}\\times ${k}`}${ecritureAlgebrique(c)}=${miseEnEvidence(a * k * k + b * k + c)}$.`
        }
        this.reponse = a * k * k + b * k + c
        break
      case 'c': // suite a+b/n
        choix = choice([true, false])
        a = randint(1, 10) * choice([-1, 1])
        b = randint(1, 10)
        k = choice([1, 2, 4, 5, 10, 100])
        this.question = 'Soit $(u_n)$ une suite définie par : '
        this.question += `$u_n =${a}${choix ? '+' : '-'}\\dfrac{${b}}{n}$.`
        this.question += `<br>Calculer $u_{${k}}$ (résultat sous forme décimale).`
        this.correction = `Dans l'expression de $u_n$ on remplace $n$ par $${k}$, on obtient :<br> $u_{${k}} = `
        if (choix === true) {
          this.correction += `${a}+\\dfrac{${b}}{${k}}=${a}+${texNombre(b / k)}=${miseEnEvidence(`${texNombre(a + b / k, 4)}`)}$.`
          this.reponse = a + b / k
        } else {
          this.correction += `${a}-\\dfrac{${b}}{${k}}=${a}-${texNombre(b / k)}=${miseEnEvidence(`${texNombre(a + b / k, 4)}`)}$.`
          this.reponse = a - b / k
        }

        break
      case 'd': // suite a+b/n resultat fraction ir
        choix = choice([true, false])
        listeFractions1 = [
          [1, 3],
          [2, 3],
          [5, 3],
          [7, 3],
          [10, 3],
          [11, 3],
          [1, 7],
          [2, 7],
          [3, 7],
          [4, 7],
          [6, 7],
          [5, 7],
        ]
        fraction1 = choice(listeFractions1)
        a = randint(1, 10) * choice([-1, 1])
        b = fraction1[0]
        k = fraction1[1]

        this.question = 'Soit $(u_n)$ une suite définie par : '
        this.question += `$u_n =${a}${choix ? '+' : '-'}\\dfrac{${b}}{n}$.`
        this.question += `<br> Calculer $u_{${k}}$ (résultat sous forme d'une fraction irréductible). `
        this.correction = `Dans l'expression de $u_n$ on remplace $n$ par $${k}$, on obtient :<br> $u_{${k}} = `
        if (choix === true) {
          this.correction += `${a}+\\dfrac{${b}}{${k}}=\\dfrac{${a}\\times ${k}}{${k}}+\\dfrac{${b}}{${k}}=${miseEnEvidence(`\\dfrac{${a * k + b}}{${k}}`)}$`
          this.reponse = new FractionEtendue(a * k + b, k).simplifie()
        } else {
          this.correction += `${a}-\\dfrac{${b}}{${k}}=\\dfrac{${a}\\times ${k}}{${k}}-\\dfrac{${b}}{${k}}=${miseEnEvidence(`\\dfrac{${a * k - b}}{${k}}`)}$`
          this.reponse = new FractionEtendue(a * k - b, k).simplifie()
        }
        break
    }
    if (this.interactif) {
      this.question += `<br>$u_{${k}}=$`
    }

    this.canReponseACompleter = `$u_{${k}}=\\ldots$`
  }
}
