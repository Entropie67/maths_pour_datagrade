import { miseEnEvidence } from '../../../lib/outils/embellissements'
/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/view/view.capytale.save.can.test.ts ⚠️
 */

import handleInteractiveClock, {
  addInteractiveClock,
} from '../../../lib/customElements/InteractiveClock'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { combinaisonListes } from '../../../lib/outils/arrayOutils'
import { formatMinute } from '../../../lib/outils/texNombre'
import Hms from '../../../modules/Hms'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'
export const titre = "Indiquer l'heure sur une horloge"
export const interactifReady = true

export const dateDePublication = '21/2/2025'

export const uuid = '51242'
export const refs = {
  'fr-fr': ['canc3D04', '6M4autoB-flash1', '6AutoT1-3', 'CM1M6B', 'CM2M3B'],
  'fr-ch': ['PR-5'],
}

/**
 * @author Rémi Angot

*/
export default class ExerciceInteractiveClock extends Exercice {
  goodAnswers: { hour: number; minute: number }[] = []
  constructor() {
    super()
    this.nbQuestions = 1
    handleInteractiveClock() // Obligatoire pour la gestion de l'élément custom <interactive-clock>
    this.besoinFormulaireCaseACocher = [
      "Moitié des questions sur les heures de l'après-midi",
    ]
    this.sup = false
  }

  nouvelleVersion(numeroExercice: number, numeroQuestion?: number) {
    let isAfter12 = Array(this.nbQuestions).fill(false)
    if (this.sup) {
      isAfter12 = combinaisonListes([true, false], this.nbQuestions)
    }
    for (
      let i = numeroQuestion ?? 0, cpt = 0;
      i < (numeroQuestion ? numeroQuestion + 1 : this.nbQuestions) && cpt < 50;
    ) {
      let hour = randint(isAfter12[i] ? 13 : 1, isAfter12[i] ? 23 : 12)
      let minute = randint(1, 11) * 5
      if (this.canOfficielle) {
        hour = 13
        minute = 30
      }
      const consigneHoraire = `Placer correctement les aiguilles pour indiquer $${hour}\\text{ h }${formatMinute(minute)}$.`
      const horlogeACompleter = addInteractiveClock(this, i, {
        interactivityOn: this.interactif,
        showHands: this.interactif,
      })
      let enonce = `${consigneHoraire}<br>`
      enonce += `<br><br>${horlogeACompleter}`
      let correction = addInteractiveClock(this, i, {
        id: `interactive-clock-correctionEx${this.numeroExercice}Q${i}`,
        hour,
        minute,
        interactivityOn: false,
        showHands: true,
      })
      correction += `<br>Les aiguilles indiquent $${miseEnEvidence(`${hour}\\text{ h }${formatMinute(minute)}`)}$.`
      if (hour > 12) {
        correction += `<br>Remarque : $${hour}$ h correspond à $${hour - 12}$ h ${hour < 18 ? "de l'après-midi" : 'du soir'}.`
      }
      if (this.questionJamaisPosee(i, hour, minute)) {
        this.listeQuestions[i] = enonce
        this.listeCorrections[i] = correction
        // repris tels quels par MetaExerciceCan (qui ne génère jamais qu'une
        // seule question par sous-exercice) pour le tableau « Course aux
        // nombres » : l'énoncé y reste du texte, l'horloge à compléter part
        // dans la colonne Réponse plutôt que dans celle de l'Énoncé
        this.canEnonce = consigneHoraire
        this.canReponseACompleter = horlogeACompleter
        this.listeCanEnonces[i] = consigneHoraire
        this.listeCanReponsesACompleter[i] = horlogeACompleter
        this.goodAnswers[i] = { hour, minute }
        handleAnswers(
          this,
          i,
          {
            reponse: {
              value: new Hms({
                hour: this.goodAnswers[i].hour,
                minute: this.goodAnswers[i].minute,
              }).toString(),
            },
          },
          { formatInteractif: 'interactive-clock' },
        )

        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
