import { bleuMathalea } from '../../../lib/colors'
import { texteEnCouleur, miseEnEvidence } from '../../../lib/outils/embellissements'
import { prenom } from '../../../lib/outils/Personne'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Résoudre un problème avec la proportionnalité'
export const interactifReady = true

export const dateDePublication = '25/10/2021'

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export const uuid = 'c58e0'

export const refs = {
  'fr-fr': ['can4P1-04'],
  'fr-ch': [],
}
export default class ProportionnaliteNotes extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let b, n
    const a = this.quotaChoice('a', [30, 40, 50, 60, 80, 100])

    if (a === 30) {
      b = randint(1, 9)
      n = b * 3

      this.question = `${prenom()} a obtenu $${n}$ sur $30$ à son devoir.<br>

      Quelle est sa note sur $20$ ?`
      this.correction = `Sa note est de $${miseEnEvidence((n * 2) / 3)}$ sur $20$.`
      this.correction += texteEnCouleur(`<br> Mentalement : <br>
      Pour obtenir la note sur $20$, on multiplie sa note par $2$ (on obtient $${n * 2}$), puis on divise le résultat par $3$, soit  $${n * 2}\\div 3=${(n * 2) / 3}$.<br>
      En multipliant par $2$, on obtient sa note sur $60$, puis en divisant par $3$, on la ramène sur $20$. `, bleuMathalea)
      this.reponse = (n * 2) / 3
    }
    if (a === 40) {
      n = 2 * randint(1, 9) + 1

      this.question = `${prenom()} a obtenu $${n}$ sur $40$ à son devoir.<br>

        Quelle est sa note sur $20$ ?`
      this.correction = `Sa note est de $${miseEnEvidence(texNombre(n / 2))}$ sur $20$.`
      this.correction += texteEnCouleur(`<br> Mentalement : <br>
      Pour obtenir la note sur $20$, on divise la note sur $40$ par $2$. `, bleuMathalea)
      this.reponse = n / 2
    }
    if (a === 50) {
      b = randint(1, 9)
      n = b * 5

      this.question = `${prenom()} a obtenu $${n}$ sur $50$ à son devoir.<br>

        Quelle est sa note sur $20$ ?`
      this.correction = `Sa note est de $${miseEnEvidence(texNombre((n * 2) / 5))}$ sur $20$.`
      this.correction += texteEnCouleur(`<br> Mentalement : <br>
        Pour obtenir la note sur $20$, on multiplie sa note par $2$ (on obtient $${n * 2}$), puis on divise le résultat par $5$, soit  $${n * 2}\\div 5=${(n * 2) / 5}$.<br>
        En multipliant par $2$, on obtient sa note sur $100$, puis en divisant par $5$, on la ramène sur $20$. `, bleuMathalea)
      this.reponse = (n * 2) / 5
    }
    if (a === 60) {
      b = randint(1, 9)
      n = b * 6

      this.question = `${prenom()} a obtenu $${n}$ sur $60$ à son devoir.<br>

        Quelle est sa note sur $20$ ?`
      this.correction = `Sa note est de $${miseEnEvidence(texNombre(n / 3))}$ sur $20$.`
      this.correction += texteEnCouleur(`<br> Mentalement : <br>
        Pour obtenir la note sur $20$, on divise la note sur $60$ par $3$. `, bleuMathalea)
      this.reponse = n / 3
    }
    if (a === 80) {
      b = randint(1, 9)
      n = b * 8

      this.question = `${prenom()} a obtenu $${n}$ sur $80$ à son devoir.<br>

        Quelle est sa note sur $20$ ?`
      this.correction = `Sa note est de $${miseEnEvidence(texNombre(n / 4))}$ sur $20$.`
      this.correction += texteEnCouleur(`<br> Mentalement : <br>
        Pour obtenir la note sur $20$, on divise la note sur $80$ par $4$. `, bleuMathalea)
      this.reponse = n / 4
    }
    if (a === 100) {
      b = randint(1, 9)
      n = b * 10

      this.question = `${prenom()} a obtenu $${n}$ sur $100$ à son devoir.<br>

        Quelle est sa note sur $20$ ?`
      this.correction = `Sa note est de $${miseEnEvidence(texNombre(n / 5))}$ sur $20$.`
      this.correction += texteEnCouleur(`<br> Mentalement : <br>
        Pour obtenir la note sur $20$, on divise la note sur $100$ par $5$. `, bleuMathalea)
      this.reponse = n / 5
    }
  }
}
