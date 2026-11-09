import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'

import { toutPourUnPoint } from '../../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
export const titre = ''
export const interactifReady = true

export const uuid = '30f80'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora

*/
export default class ComparerFractions extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire faire un exercice simple !
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.formatInteractif = 'fillInTheBlank'
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const a = 2025
    const b = this.quotaChoice('b', [2024, 2026])
    const choix = this.quotaChoice('choix', [true, false])
    switch (this.quotaRandint('cas', 2, 2)) {
      case 1:
        this.consigne = choix
          ? `L'image de $${texNombre(a, 0)}$ par la fonction $f$ est $${texNombre(b, 0)}$.`
          : `$${texNombre(b, 0)}$ est l'image de $${texNombre(a, 0)}$ par la fonction $f$.`
        this.consigne += "<br> Compléter l'égalité correspondante."
        this.question = 'f(%{champ1}) =%{champ2}'
        this.correction = `$f(${miseEnEvidence(texNombre(a, 0))}) =${miseEnEvidence(texNombre(b, 0))}$`
        handleAnswers(this, 0, {
          bareme: (listePoints) => [
            Math.min(listePoints[0], listePoints[1]),
            1,
          ],
          champ1: { value: String(a) },
          champ2: { value: String(b) },
        })
        this.reponse = {
          bareme: toutPourUnPoint,
          champ1: { value: String(a) },
          champ2: { value: String(b) },
        }
        this.canReponseACompleter = `$f(${sp()}\\ldots ${sp()}) =${sp()}\\ldots$`
        break

      case 2:
        this.consigne = choix
          ? `Un antécédent de $${texNombre(a, 0)}$ par la fonction $f$ est $${texNombre(b, 0)}$.`
          : `$${texNombre(b, 0)}$ est un antécédent de  $${texNombre(a, 0)}$ par la fonction $f$.`
        this.consigne += "<br> Compléter l'égalité correspondante."
        this.question = 'f(%{champ1}) =%{champ2}'
        this.correction = `$f(${miseEnEvidence(texNombre(b, 0))}) =${miseEnEvidence(texNombre(a, 0))}$`
        handleAnswers(this, 0, {
          bareme: (listePoints) => [
            Math.min(listePoints[0], listePoints[1]),
            1,
          ],
          champ1: { value: String(b) },
          champ2: { value: String(a) },
        })
        this.reponse = {
          bareme: toutPourUnPoint,
          champ1: { value: String(b) },
          champ2: { value: String(a) },
        }
        this.canReponseACompleter = `$f(${sp()}\\ldots ${sp()}) =${sp()}\\ldots$`
        break
    }
    this.canEnonce = this.consigne
  }
}
