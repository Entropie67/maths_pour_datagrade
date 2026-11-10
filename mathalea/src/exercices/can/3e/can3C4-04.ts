import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { texteEnCouleur, miseEnEvidence } from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer avec un programme de calcul'
export const interactifReady = true

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication
*/
export const uuid = '9094b'

export const refs = {
  'fr-fr': ['can3C4-04'],
  'fr-ch': [],
}
export default class ProgrammeCalcul extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1

    // ${texNombre(ecritureParenthesesSiNegatif(a / 5 - e))}^2=${texNombre((a / 5 - e) * (a / 5 - e))}$
  }

  nouvelleVersion() {
    const a = arrondi(this.quotaRandint('a', 2, 9) * 5)
    const b = arrondi(this.quotaRandint('b', 2, 9) * 4)
    const c = arrondi(this.quotaRandint('c', 2, 9) * 3)
    const d = arrondi(this.quotaRandint('d', 2, 9) * 6)
    const e = randint(2, 9, [a / 5, b / 4, c / 3, d / 6])
    const N = this.quotaChoice('N', ['quart', 'tiers', 'cinquième', 'sixième'])

    if (N === 'cinquième') {
      this.question = `Prendre le ${N} de $${a}$, puis soustraire $${e}$ et élever le résultat au carré. <br>
      
     Quel nombre obtient-on ?`
      this.correction = `$\\bullet$ On prend le ${N} de $${a}$ : $\\dfrac{1}{5}\\times ${a}=${texNombre(a / 5)}$.
    <br>
    $\\bullet$ On soustrait $${e}$, on obtient : $${texNombre(a / 5)}-${texNombre(e)}=${texNombre(a / 5 - e)}$.
    <br>
    $\\bullet$ On élève au carré :  $${ecritureParentheseSiNegatif(a / 5 - e)}^2= ${miseEnEvidence(texNombre((a / 5 - e) * (a / 5 - e)))}$.
      `
      this.correction += texteEnCouleur(`<br> Mentalement : <br>
      Prendre le cinquième d'un nombre revient à le diviser par $5$.<br>
       Ainsi, le ${N} de $${a}$ est égal à $${a}\\div 5=${a / 5}$.
        `)
      this.reponse = (a / 5 - e) * (a / 5 - e)
    }
    if (N === 'quart') {
      this.question = `Prendre le ${N} de $${b}$, puis soustraire $${e}$ et élever le résultat au carré. <br>

      Quel nombre obtient-on ?`
      this.correction = `$\\bullet$ On prend le ${N} de $${b}$ : $\\dfrac{1}{4}\\times ${b}=${texNombre(b / 4)}$.
      <br>
      $\\bullet$ On soustrait $${e}$, on obtient : $${texNombre(b / 4)}-${texNombre(e)}=${texNombre(b / 4 - e)}$.
      <br>
      $\\bullet$ On élève au carré : $${ecritureParentheseSiNegatif(b / 4 - e)}^2= ${miseEnEvidence(texNombre((b / 4 - e) * (b / 4 - e)))}$. `
      this.correction += texteEnCouleur(`<br> Mentalement : <br>
    Prendre le quart d'un nombre revient à le diviser par $4$.<br>
     Ainsi, le ${N} de $${b}$ est égal à $${b}\\div 4=${b / 4}$.
      `)
      this.reponse = (b / 4 - e) * (b / 4 - e)
    }
    if (N === 'tiers') {
      this.question = `Prendre le ${N} de $${c}$, puis soustraire $${e}$ et élever le résultat au carré. <br>

     Quel nombre obtient-on ?`
      this.correction = `$\\bullet$ On prend le ${N} de $${c}$ : $\\dfrac{1}{3}\\times ${c}=${texNombre(c / 3)}$.
      <br>
      $\\bullet$ On soustrait $${e}$, on obtient : $${texNombre(c / 3)}-${texNombre(e)}=${texNombre(c / 3 - e)}$.
      <br>
      $\\bullet$ On élève au carré : $${ecritureParentheseSiNegatif(c / 3 - e)}^2= ${miseEnEvidence(texNombre((c / 3 - e) * (c / 3 - e)))}$. `
      this.correction += texteEnCouleur(`<br> Mentalement : <br>
      Prendre le tiers d'un nombre revient à le diviser par $3$.<br>
       Ainsi, le ${N} de $${c}$ est égal à $${c}\\div 3=${c / 3}$.
        `)
      this.reponse = (c / 3 - e) * (c / 3 - e)
    }
    if (N === 'sixième') {
      this.question = `Prendre le ${N} de $${d}$, puis soustraire $${e}$ et élever le résultat au carré. <br>
      Quel nombre obtient-on ?`
      this.correction = `$\\bullet$ On prend le ${N} de $${d}$ : $\\dfrac{1}{6}\\times ${d}=${texNombre(d / 6)}$.
      <br>
      $\\bullet$ On soustrait $${e}$, on obtient : $${texNombre(d / 6)}-${texNombre(e)}=${texNombre(d / 6 - e)}$.
      <br>
      $\\bullet$ On élève au carré : $${ecritureParentheseSiNegatif(d / 6 - e)}^2= ${miseEnEvidence(texNombre((d / 6 - e) * (d / 6 - e)))}$. `
      this.correction += texteEnCouleur(`<br> Mentalement : <br>
    Prendre le sixième d'un nombre revient à le diviser par $6$.<br>
     Ainsi, le ${N} de $${d}$ est égal à $${d}\\div 6=${d / 6}$.
      `)
      this.reponse = (d / 6 - e) * (d / 6 - e)
    }
  }
}
