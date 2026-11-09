import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Trouver un représentant positif dans une congruence'
export const interactifReady = true

export const dateDePublication = '21/02/2025'
export const uuid = '87535' // à adapter

export const refs = {
  'fr-fr': ['TEA1-31'],
  'fr-ch': [],
}
/**
 *
 * @author Stéphane Guyon

*/
export default class ExerciceCongruence extends Exercice {
  constructor() {
    super()
    this.consigne = ''
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''

      // a et k aléatoires
      const k = randint(3, 10)

      let a: number
      do a = randint(-50, 50)
      while (a >= -9 && a <= 9)

      // plus petit entier positif ou nul b tel que a ≡ b [k]
      let r = a % k
      if (r < 0) r += k // reste dans [0, k-1]
      const b = r === 0 ? k : r
      const q = (a - r) / k
      texte = `Déterminer le plus petit entier positif ou nul $a$ vérifiant cette congruence $${a} \\equiv a \\,\\, [${k}]$.`

      if (r !== 0) {
        texteCorr += `On effectue la division euclidienne de $${a}$ par $${k}$ :<br>`
        texteCorr += `$${a} = ${q}\\times${k} + ${r}$ . <br> 
      
        L'inégalité $0 \\leqslant ${r} < ${k}$ garantit que $${r}$ est bien le reste de la division euclidienne.<br>
        On a donc $${a} \\equiv ${r} \\,\\,[${k}]$.`
      } else {
        texteCorr += `On observe que $${b}$ divise $${a}$. <br>On a donc $${a} \\equiv  0\\,\\,[${k}]$.`
      }
      texteCorr += `<br>Le plus petit entier positif ou nul $a$ vérifiant cette congruence est donc $${miseEnEvidence(`${r}`)}$.`
      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] =
          texte +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
            texteAvant: `<br>$${a} \\equiv ~~$`,
            texteApres: `$~[${k}]$.`,
          })

        this.listeCorrections[i] = texteCorr

        handleAnswers(this, i, {
          reponse: { value: `${r}` },
        })

        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
