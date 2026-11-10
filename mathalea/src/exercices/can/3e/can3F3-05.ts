import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { numAlpha } from '../../../lib/outils/outilString'
import CoefficientDirecteur from '../../3e/3F20-4-old2'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  "Reconnaitre coefficient directeur ou ordonnée à l'origine d'une fonction affine"

export const dateDePublication = '18/03/2026'

export const interactifReady = true

export const uuid = '7b38d'
export const refs = {
  'fr-fr': ['can3F3-05'],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote
 */
export default class CoefficientDirecteurOrdonneeOrigine extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.sup = 14
    this.sup2 = true
    this.sup3 = true
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.formatChampTexte = KeyboardType.lyceeClassique
  }

  nouvelleVersion(): void {
    const exercice = new CoefficientDirecteur()
    exercice.sup = 14
    exercice.sup2 = true
    exercice.sup3 = true
    exercice.interactif = false
    exercice.nouvelleVersion()
    const enonceEtQuestions = exercice.listeQuestions[0].split(numAlpha(0))
    const questions = enonceEtQuestions[1].split(numAlpha(1))
    const question1 = questions[0]
    const question2 = questions[1]
    const enonce = enonceEtQuestions[0]
    const choix = Math.random() < 0.5
    this.question = `${enonce}${choix ? question1 : question2}`
    const corrections = exercice.listeCorrections[0]
    const correctionDecoupee = corrections.split('a donc pour')
    const correction1 = correctionDecoupee[1].split(' et pour')[0] + '.'
    const correction2 =
      correctionDecoupee[1].split(' et pour')[1].split('<br>')[0] + '.'
    this.correction =
      correctionDecoupee[0] + `a donc pour ${choix ? correction1 : correction2}`
    if (choix) {
      this.reponse = correctionDecoupee[0]
        .split('on identifie : $m=')[1]
        .split('$')[0]
    } else {
      this.reponse = correctionDecoupee[0].split('et $p=')[1].split('$')[0]
    }
  }
}
