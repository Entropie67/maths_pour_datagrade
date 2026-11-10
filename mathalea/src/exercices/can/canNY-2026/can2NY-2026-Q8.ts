import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Compléter une égalité'
export const interactifReady = true

export const uuid = 'ru8u5'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora

*/
export default class EgaliteCompleter2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.formatChampTexte = KeyboardType.clavierFullOperations
  }

  nouvelleVersion() {
    const annee = 2026

    switch (this.canOfficielle ? 1 : this.quotaRandint('choix', 1, 3)) {
      case 1:
        this.question = 'Compléter :<br>'
        this.optionsDeComparaison = { texteAvecCasse: true }
        this.reponse = `\\sqrt{${annee}}`

        if (this.interactif) {
          this.optionsChampTexte = {
            texteAvant: `$\\sqrt{${texNombre(annee, 0)}}\\times$`,
            texteApres: `$=${texNombre(annee)}$`,
          }
        } else {
          this.question += `$\\sqrt{${texNombre(annee, 0)}}\\times \\ldots =${texNombre(annee)}$`
        }

        this.correction = `On utilise la propriété $\\sqrt{a}\\times \\sqrt{a} =a$ valable pour $a$ positif.<br>
        Ainsi, $\\sqrt{${texNombre(annee, 0)}}\\times${miseEnEvidence(`\\sqrt{${texNombre(annee)}}`)}=${texNombre(annee)}$`
        this.canReponseACompleter = `$\\sqrt{${texNombre(annee, 0)}}\\times \\ldots =${texNombre(annee)}$`
        break

      case 2:
        this.question = 'Compléter le plus simplement possible :<br>'
        this.optionsDeComparaison = { texteAvecCasse: true }
        this.reponse = `2\\times\\sqrt{${annee}}`

        if (this.interactif) {
          this.optionsChampTexte = {
            texteAvant: `$\\sqrt{${texNombre(annee, 0)}}+\\sqrt{${texNombre(annee, 0)}}=$`,
            texteApres: ``,
          }
        } else {
          this.question += `$\\sqrt{${texNombre(annee, 0)}}+\\sqrt{${texNombre(annee, 0)}}= \\ldots$`
        }

        this.correction = `$\\sqrt{${texNombre(annee, 0)}}+\\sqrt{${texNombre(annee, 0)}}=${miseEnEvidence(`2\\times\\sqrt{${texNombre(annee)}}`)}$`
        this.canReponseACompleter = `$\\sqrt{${texNombre(annee, 0)}}+\\sqrt{${texNombre(annee, 0)}}= \\ldots$`
        break

      case 3:
        this.question = 'Compléter le plus simplement possible :<br>'
        this.optionsDeComparaison = { nombreDecimalSeulement: true }
        this.reponse = `${annee}`

        if (this.interactif) {
          this.optionsChampTexte = {
            texteAvant: `$\\sqrt{${texNombre(annee, 0)}}\\times \\sqrt{${texNombre(annee, 0)}}=$`,
            texteApres: ``,
          }
        } else {
          this.question += `$\\sqrt{${texNombre(annee, 0)}}\\times \\sqrt{${texNombre(annee, 0)}} =\\ldots$`
        }

        this.correction = `On utilise la propriété $\\sqrt{a}\\times \\sqrt{a} =a$ valable pour $a$ positif.<br>
        $\\sqrt{${texNombre(annee, 0)}}\\times \\sqrt{${texNombre(annee, 0)}}=${miseEnEvidence(texNombre(annee))}$`
        this.canReponseACompleter = `$\\sqrt{${texNombre(annee, 0)}}\\times \\sqrt{${texNombre(annee, 0)}} =\\ldots$`
        break
    }
    this.canEnonce = 'Compléter :'
  }
}
