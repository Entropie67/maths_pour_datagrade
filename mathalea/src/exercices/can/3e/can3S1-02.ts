import { bleuMathalea } from '../../../lib/colors'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une moyenne'
export const interactifReady = true

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora et Stéphane Guyon (version QCM)

 * Date de publication
*/
export const uuid = 'c9d15'

export const refs = {
  'fr-fr': ['can3S1-02', 'BP1AUTO048', '2S20-flash2'],
  'fr-ch': [],
}
export default class MoyenneStat extends ExerciceSimple {
  constructor() {
    super()
    this.versionQcmDisponible = true
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let a, b, c, d, e, f, N
    switch (
      this.versionQcm
        ? this.quotaChoice('cas', [1, 2])
        : this.quotaChoice('cas', [1, 2, 3, 3]) //
    ) {
      case 1:
        a = randint(2, 6)
        b = randint(8, 15)
        c = randint(7, 11)
        e = choice([36, 40, 44, 48, 52])
        d = e - a - b - c
        this.question = `$${a}$ ${sp(2)} ; ${sp(2)} $${b}$ ${sp(2)} ; ${sp(2)} $${c}$${sp(2)} ; ${sp(2)} $${d}$<br>
   
        ${this.versionQcm ? 'La moyenne de cette série est :' : ' Quelle est la moyenne de cette série ?'}`
        this.correction = `La somme des $4$ valeurs est : $${a}+${b}+${c}+${d} =${e}$.<br>
         La moyenne est donc $\\dfrac{${e}}{4}=${miseEnEvidence(new FractionEtendue(e, 4).texFractionSimplifiee)}$.`
        this.reponse = e / 4
        this.distracteurs = [
          `$${texNombre(e / 4 - 1)}$`,
          `$${texNombre((e + 1) / 4)}$`,
          `$${texNombre(e / 4 + 1)}$`,
          `$${texNombre(e / 4 + 2)}$`,
          `$${texNombre(e / 4 - 2)}$`,
          `$${texNombre(e / 4 - 0.5)}$`,
          `$${texNombre(e / 4 + 0.5)}$`,
        ]
        break
      case 2:
        a = randint(1, 2) * 5
        b = randint(9, 10)
        c = randint(5, 7)
        d = randint(1, 5)
        e = choice([35, 40, 45, 50])
        f = e - a - b - c - d
        this.question = `$${b}$${sp(2)} ; ${sp(2)} $${a}$ ${sp(2)} ; ${sp(2)}$${c}$${sp(2)} ; ${sp(2)}$${d}$ ${sp(2)} ; ${sp(2)}$${f}$<br>
       
        ${this.versionQcm ? 'La moyenne de cette série est :' : ' Quelle est la moyenne de cette série ?'}`
        this.distracteurs = [
          `$${texNombre(e / 5 - 1)}$`,
          `$${texNombre((e + 1) / 5)}$`,
          `$${texNombre(e / 5 + 1)}$`,
          `$${texNombre(e / 5 + 2)}$`,
          `$${texNombre(e / 5 - 2)}$`,
          `$${texNombre(e / 5 - 0.5)}$`,
          `$${texNombre(e / 5 + 0.5)}$`,
        ]
        this.correction = `La somme des $5$ valeurs est : $${b}+${a}+${c}+${d}+${f}= ${e}$.<br>
         La moyenne est donc $\\dfrac{${texNombre(e)}}{5}=${miseEnEvidence(new FractionEtendue(e, 5).texFractionSimplifiee)}$.`

        this.reponse = e / 5
        break
      case 3:
        N = choice(['a', 'b', 'c', 'd']) //
        if (N === 'a') {
          a = randint(1, 10) + randint(31, 89, [40, 50, 60, 70, 80]) / 100
          e = randint(2, 9) / 100
          b = a - e
          c = a + e
          this.question = `$${texNombre(a)}$ ${sp(2)} ; ${sp(2)}  $${texNombre(b)}$  ${sp(2)} ; ${sp(2)}  $${texNombre(c)}$<br>
         
          Quelle est la moyenne de cette série ?`
          this.correction = `La somme des $3$ valeurs est : $${texNombre(a)}+${texNombre(b)}+${texNombre(c)} =${texNombre(3 * a)}$.<br>
          La moyenne est donc $\\dfrac{${texNombre(3 * a)}}{3}=${miseEnEvidence(texNombre(a))}$.`
          this.correction += texteEnCouleur(
            `<br> Mentalement : <br>
          En écrivant les valeurs dans l'ordre croissant : <br>$\\underbrace{${texNombre(b)}}_{${texNombre(a)}- ${texNombre(e)}}$ ${sp(2)} ; ${sp(2)}  $${texNombre(a)}$  ${sp(2)} ; ${sp(2)}  $\\underbrace{${texNombre(c)}}_{${texNombre(a)}+ ${texNombre(e)}}$,
                    on remarque que les écarts entre la valeur intermédiaire ($${texNombre(a)}$) et les deux autres valeurs ($${texNombre(a - e)}$ et $${texNombre(a + e)}$) sont égaux (ils valent $${texNombre(e)}$).<br>
          On en déduit que la moyenne est la valeur intermédiaire : $${texNombre(a)}$.
          `,
            bleuMathalea,
          )
          this.reponse = a
        }
        if (N === 'b') {
          a = randint(1, 10) + randint(31, 89, [40, 50, 60, 70, 80]) / 100
          e = randint(2, 9) / 100
          b = a - e
          c = a + e
          this.question = `$${texNombre(b)}$ ${sp(2)} ; ${sp(2)}  $${texNombre(c)}$  ${sp(2)} ; ${sp(2)}  $${texNombre(a)}$<br>
        
          Quelle est la moyenne de cette série ?`
          this.correction = `La somme des $3$ valeurs est : $${texNombre(a)}+${texNombre(b)}+${texNombre(c)} =${texNombre(3 * a)}$.<br>
          La moyenne est donc $\\dfrac{${texNombre(3 * a)}}{3}=${miseEnEvidence(texNombre(a))}$.`
          this.correction += texteEnCouleur(
            `<br> Mentalement : <br>
          En écrivant les valeurs dans l'ordre croissant : <br>$\\underbrace{${texNombre(b)}}_{${texNombre(a)}- ${texNombre(e)}}$ ${sp(2)} ; ${sp(2)}  $${texNombre(a)}$  ${sp(2)} ; ${sp(2)}  $\\underbrace{${texNombre(c)}}_{${texNombre(a)}+ ${texNombre(e)}}$,
                    on remarque que les écarts entre la valeur intermédiaire ($${texNombre(a)}$) et les deux autres valeurs ($${texNombre(a - e)}$ et $${texNombre(a + e)}$) sont égaux (ils valent $${texNombre(e)}$).<br>
          On en déduit que la moyenne est la valeur intermédiaire : $${texNombre(a)}$.
          `,
            bleuMathalea,
          )
          this.reponse = a
        }
        if (N === 'c') {
          a = randint(100, 200)
          e = randint(2, 9)
          b = a - e
          c = a + e
          this.question = `$${texNombre(c)}$${sp(2)} ; ${sp(2)} $${texNombre(a)}$ ${sp(2)} ; ${sp(2)}$${texNombre(b)}$<br>
          
          Quelle est la moyenne de cette série ?`

          this.correction = `La somme des $3$ valeurs est : $${texNombre(a)}+${texNombre(b)}+${texNombre(c)} =${texNombre(3 * a)}$.<br>
                            La moyenne est donc $\\dfrac{${texNombre(3 * a)}}{3}=${miseEnEvidence(texNombre(a))}$.`
          this.correction += texteEnCouleur(
            `<br> Mentalement : <br>
          On remarque que les écarts entre la valeur intermédiaire ($${texNombre(a)}$) et les deux autres valeurs ($${texNombre(a - e)}$ et $${texNombre(a + e)}$) sont égaux (ils valent $${texNombre(e)}$) :
          $\\underbrace{${texNombre(c)}}_{${a}+ ${e}}$ ${sp(2)} ; ${sp(2)}  $${texNombre(a)}$  ${sp(2)} ; ${sp(2)}  $\\underbrace{${texNombre(b)}}_{${a}- ${e}}$. <br>
                            
                            On en déduit que la moyenne est la valeur intermédiaire : $${texNombre(a)}$.
                            `,
            bleuMathalea,
          )
          this.reponse = a
        }
        if (N === 'd') {
          a = randint(100, 200)
          e = randint(2, 9)
          b = a - e
          c = a + e
          this.question = `$${texNombre(a)}$${sp(2)} ; ${sp(2)} $${texNombre(c)}$ ${sp(2)} ; ${sp(2)}$${texNombre(b)}$<br>
          
          Quelle est la moyenne de cette série ?`

          this.correction = `La somme des $3$ valeurs est : $${texNombre(a)}+${texNombre(b)}+${texNombre(c)} =${texNombre(3 * a)}$.<br>
                            La moyenne est donc $\\dfrac{${texNombre(3 * a)}}{3}=${miseEnEvidence(texNombre(a))}$.`
          this.correction += texteEnCouleur(
            `<br> Mentalement : <br>
          En écrivant les valeurs dans l'ordre croissant : $\\underbrace{${texNombre(b)}}_{${texNombre(a)}- ${texNombre(e)}}$ ${sp(2)} ; ${sp(2)}  $${texNombre(a)}$  ${sp(2)} ; ${sp(2)}  $\\underbrace{${texNombre(c)}}_{${texNombre(a)}+ ${texNombre(e)}}$,
                    on remarque que les écarts entre la valeur intermédiaire ($${texNombre(a)}$) et les deux autres valeurs ($${texNombre(a - e)}$ et $${texNombre(a + e)}$) sont égaux (ils valent $${texNombre(e)}$).<br>
          On en déduit que la moyenne est la valeur intermédiaire : $${texNombre(a)}$.
          `,
            bleuMathalea,
          )
          this.reponse = a
        }
        break
    }
  }
}
