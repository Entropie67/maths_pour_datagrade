import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { range } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const titre = "Trouver la médiane d'une série de notes"

export const interactifReady = true

export const dateDePublication = '05/12/2025'

export const uuid = '5b987'

export const refs = {
  'fr-fr': ['3AutoS02-6'],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote
 */
export default class MedianeDeSerieDeNotes extends ExerciceSimple {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = [
      'Sujet original (2e paramètre inutile si coché)',
      false,
    ]
    this.besoinFormulaire2CaseACocher = ['Notes entières', true]
    this.sup = false
    this.sup2 = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const serie = this.sup
      ? [8, 12, 6, 19, 15]
      : range(choice([5, 7]) - 1).map(
          () => randint(2, 20) + (this.sup2 ? 0 : choice([0, 0.5])),
        )
    const mediane = this.sup
      ? 12
      : serie.slice().sort((a, b) => a - b)[Math.floor(serie.length / 2)]
    this.reponse = this.sup ? '12' : texNombre(mediane, 1)

    this.question = `Les notes obtenues par un élève sont : $${serie.map((el) => texNombre(el, 1)).join('$ ; $')}$.<br>
    Que vaut la médiane de cette série de notes ?`
    this.correction = `Rangeons les notes dans l'ordre croissant : $${serie
      .sort((a, b) => a - b)
      .map((el) => texNombre(el, 1))
      .join('$ ; $')}$.<br>
    Comme il y a $${serie.length}$ notes (nombre impair), la médiane est la note du milieu, c'est-à-dire la $${Math.ceil(
      serie.length / 2,
    )}$e note : $${miseEnEvidence(this.reponse)}$.`
  }
}
