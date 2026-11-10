import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { abs } from '../../../lib/outils/nombres'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer avec des puissances*'
export const dateDeModifImportante = '30/10/2026'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 * Créé pendant l'été 2021

 * Date de publication
*/
export const uuid = 'b1517'

export const refs = {
  'fr-fr': ['can2N4-02', '2N43-flash3'],
  'fr-ch': [],
}
export default class CalculPuissance1 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let a, b
    switch (
      this.quotaChoice('type', ['a', 'b', 'c', 'd', 'e']) //
    ) {
      case 'a':
        a = choice([0.25, 0.5])
        b = randint(2, 5)
        this.question = `Calculer sous la forme ${context.isDiaporama ? '<br>' : ''} d'un nombre entier $4^{${b}} \\times ${texNombre(a)}^{${b}}$.`
        this.correction = `On utilise la formule $a^n\\times b^n=(a\\times b)^{n}$
         avec $a=4$, $b=${texNombre(a)}$ et $n=${b}$.<br>
        $4^{${b}}\\times ${texNombre(a)}^{${b}}=(4\\times ${texNombre(a)})^{${b}}=
        ${4 * a}^${texNombre(b)}=${miseEnEvidence(texNombre((4 * a) ** b))} $`
        this.reponse = (4 * a) ** b

        break
      case 'b':
        a = choice([0.2, 0.4])
        b = randint(2, 5)
        this.question = `Calculer sous la forme ${context.isDiaporama ? '<br>' : ''}d'un nombre entier $5^{${b}} \\times ${texNombre(a)}^{${b}}$.`
        this.correction = `On utilise la formule $a^n\\times b^n=(a\\times b)^{n}$
        avec $a=5$, $b=${texNombre(a)}$ et $n=${b}$.<br>
       $5^{${b}}\\times ${texNombre(a)}^{${b}}=(5\\times ${texNombre(a)})^{${b}}=
       ${5 * a}^${texNombre(b)}=${miseEnEvidence(texNombre((5 * a) ** b))} $`
        this.reponse = (5 * a) ** b

        break

      case 'c':
        a = randint(-3, -1)
        this.question = `Calculer sous la forme ${context.isDiaporama ? '<br>' : ''} d'un nombre entier $2^{${a}} \\times 8$.`
        this.correction = `Comme $a^{-n}=\\dfrac{1}{a^n}$, ${sp(4)} $2^{${a}}=\\dfrac{1}{2^{${-a}}}=\\dfrac{1}{${2 ** -a}}$. <br>

        
        $2^{${a}}\\times 8=\\dfrac{1}{${2 ** abs(a)}}\\times 8=${miseEnEvidence(texNombre((8 * 1) / 2 ** -a))} $`
        this.reponse = 2 ** a * 8

        break
      case 'd':
        a = randint(-4, -1)
        this.question = `Calculer sous la forme ${context.isDiaporama ? '<br>' : ''} d'un nombre entier $2^{${a}} \\times 16$.`
        this.correction = `Comme $a^{-n}=\\dfrac{1}{a^n}$, ${sp(4)} $2^{${a}}=\\dfrac{1}{2^{${-a}}}=\\dfrac{1}{${2 ** -a}}$. <br>

        
        $2^{${a}}\\times 16=\\dfrac{1}{${2 ** abs(a)}}\\times 16=${miseEnEvidence(texNombre((16 * 1) / 2 ** -a))} $`
        this.reponse = 2 ** a * 16

        break
      case 'e':
        a = randint(-5, -1)
        this.question = `Calculer sous la forme ${context.isDiaporama ? '<br>' : ''} d'un nombre entier $2^{${a}} \\times 32$.`
        this.correction = `Comme $a^{-n}=\\dfrac{1}{a^n}$, ${sp(4)} $2^{${a}}=\\dfrac{1}{2^{${-a}}}=\\dfrac{1}{${2 ** -a}}$. <br>

        
        $2^{${a}}\\times 32=\\dfrac{1}{${2 ** abs(a)}}\\times 32=${miseEnEvidence(texNombre((32 * 1) / 2 ** -a))} $`
        this.reponse = 2 ** a * 32

        break
    }
  }
}
