import { bleuMathalea } from '../../../lib/colors'
import { miseEnEvidence, texteEnCouleur } from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer astucieusement avec $100$ ou $10$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 * Créé pendant l'été 2021

 * Date de publication
*/
export const uuid = 'ca4ce'

export const refs = {
  'fr-fr': ['can5C2-02', '5N1autoE-3'],
  'fr-ch': ['NR'],
}
export default class CalculAstucieux1 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const a = randint(1, 9)
    const b = randint(1, 9, a)
    const c = randint(1, 9, [a, b])
    const d = a + b * 0.1 + c * 0.01
    const e = (2 * a + 1) / 2
    const f = randint(1, 9) - 0.2
    const g = randint(10, 90)
    switch (
      this.quotaChoice('typeDeQuestions', ['a', 'b', 'c', 'd', 'e', 'f', 'g']) //
    ) {
      case 'a':
        this.question = `Calculer $4 \\times ${texNombre(d)}\\times 25$.`
        this.correction = `$4 \\times ${texNombre(d)}\\times 25 = ${miseEnEvidence(texNombre(100 * d))}$`
        this.correction += texteEnCouleur(`<br> Mentalement : <br>
        $4 \\times ${texNombre(d)}\\times 25 =\\underbrace{4\\times 25}_{100}\\times ${texNombre(d)}= 100 \\times ${texNombre(d)} = ${texNombre(100 * d)}$ `,
                  bleuMathalea,)
        this.reponse = arrondi(100 * d, 6)
        break
      case 'b':
        this.question = `Calculer $2 \\times ${texNombre(d)}\\times 50$.`
        this.correction = `$2 \\times ${texNombre(d)}\\times 50 =  ${miseEnEvidence(texNombre(100 * d))}$`
        this.reponse = arrondi(100 * d, 6)
        this.correction += texteEnCouleur(`<br> Mentalement : <br>
        $2 \\times ${texNombre(d)}\\times 50 = \\underbrace{2\\times 50}_{100} \\times ${texNombre(d)} = ${texNombre(100 * d)}$ `,
                  bleuMathalea,)
        break

      case 'c':
        this.question = `Calculer $25 \\times ${texNombre(d)}\\times 4$.`
        this.correction = `$25 \\times ${texNombre(d)}\\times 4 =  ${miseEnEvidence(texNombre(100 * d))}$`
        this.reponse = arrondi(100 * d, 6)
        this.correction += texteEnCouleur(`<br> Mentalement : <br>
        $25 \\times ${texNombre(d)}\\times 4 = \\underbrace{4\\times 25}_{100} \\times ${texNombre(d)} = ${texNombre(100 * d)}$ `,
                  bleuMathalea,)
        break
      case 'd':
        this.question = `Calculer $2,5 \\times ${texNombre(d)}\\times 4$.`
        this.correction = `$2,5 \\times ${texNombre(d)}\\times 4 = 10 \\times ${texNombre(d)} = ${miseEnEvidence(texNombre(10 * d))}$`
        this.reponse = arrondi(10 * d, 6)
        this.correction += texteEnCouleur(`<br> Mentalement : <br>
        $2,5 \\times ${texNombre(d)}\\times 4 =\\underbrace{2,5\\times 4}_{10} \\times ${texNombre(d)} = ${texNombre(10 * d)}$ `,
                  bleuMathalea,)
        break
      case 'e':
        this.question = `Calculer $${texNombre(e)} \\times ${texNombre(d)}+${texNombre(10 - e)}\\times ${texNombre(d)}$.`
        this.correction = `$${texNombre(e)} \\times ${texNombre(d)}+${texNombre(10 - e)}\\times ${texNombre(d)}=${texNombre(d)}\\times 10=${miseEnEvidence(texNombre(10 * d))}$`
        this.reponse = arrondi(10 * d, 6)
        this.correction += texteEnCouleur(`<br> Mentalement : <br>
        On remarque une factorisation possible par le facteur commun $${texNombre(d)}$ qui permet de simplifier le calcul :<br>
        $${texNombre(e)} \\times ${texNombre(d)}+${texNombre(10 - e)}\\times ${texNombre(d)}=${texNombre(d)}\\times(\\underbrace{${texNombre(e)}+${texNombre(10 - e)}}_{10})=${texNombre(d)}\\times 10=${texNombre(10 * d)}$  `,
          bleuMathalea,)
        break
      case 'f':
        this.question = `Calculer $${texNombre(f)} \\times ${texNombre(d)}+${texNombre(10 - f)}\\times ${texNombre(d)}$.`
        this.correction = `$${texNombre(f)} \\times ${texNombre(d)}+${texNombre(10 - f)}\\times ${texNombre(d)}=${miseEnEvidence(texNombre(10 * d))}$`
        this.reponse = arrondi(10 * d, 6)
        this.correction += texteEnCouleur(`<br> Mentalement : <br>
        On remarque une factorisation possible par le facteur commun $${texNombre(d)}$ qui permet de simplifier le calcul :<br>
        $${texNombre(f)} \\times ${texNombre(d)}+${texNombre(10 - f)}\\times ${texNombre(d)}=${texNombre(d)}\\times(\\underbrace{${texNombre(f)}+${texNombre(10 - f)}}_{10})=${texNombre(d)}\\times 10=${texNombre(10 * d)}$. `,
          bleuMathalea,)
        break
      case 'g':
        this.question = `Calculer $${texNombre(g)} \\times ${texNombre(d)}+${texNombre(100 - g)}\\times ${texNombre(d)}$.`
        this.correction = `$${g} \\times ${texNombre(d)}+${texNombre(100 - g)}\\times ${texNombre(d)}=${miseEnEvidence(texNombre(100 * d))}$`
        this.reponse = arrondi(100 * d, 6)
        this.correction += texteEnCouleur(`<br> Mentalement : <br>
        On remarque une factorisation possible par le facteur commun $${texNombre(d)}$ qui permet de simplifier le calcul :<br>
        $${g} \\times ${texNombre(d)}+${texNombre(100 - g)}\\times ${texNombre(d)}=${texNombre(d)}\\times(\\underbrace{${texNombre(g)}+${texNombre(100 - g)}}_{100})=${texNombre(d)}\\times 100=${texNombre(100 * d)}$  `,
          bleuMathalea,)
        break
    }
  }
}
