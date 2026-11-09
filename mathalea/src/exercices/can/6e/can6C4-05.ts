import { combinaisonListes } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre =
  'Calculer le quotient ou le reste dans une division euclidienne sur des petits nombres'
export const interactifReady = true

export const dateDePublication = '12/11/2025'

export const uuid = '5d3fe'
export const refs = {
  'fr-fr': ['can6C4-05'],
  'fr-ch': [],
}

/**
 * quotient ou reste dans une division euclidienne autour des tables de multiplications
 * @author Olivier Mimeau

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const d = this.quotaRandint('d', 2, 10)
    const q = randint(4, 10, [d])
    const r = randint(0, d - 1, [q])
    const a = d * q + r
    const choixQuestion = combinaisonListes(['quotient', 'reste'], 1) // preparer une evolution avec les 2 questions
    const texteMot = choixQuestion[0]
    const reponseQuestion = choixQuestion[0] === 'quotient' ? q : r
    this.question = `Quel est le ${texteMot} de la division euclidienne de $${texNombre(a, 0)}$ par $${texNombre(d, 0)}$ ?`
    this.correction = `Le ${texteMot} de la division euclidienne de $${texNombre(a, 0)}$ par $${texNombre(d, 0)}$ est $${miseEnEvidence(texNombre(reponseQuestion, 0))}$ car $${texNombre(a, 0)} = (${texNombre(d, 0)} \\times ${texNombre(q, 0)}) + ${texNombre(r, 0)}$.`
    this.reponse = reponseQuestion
  }
}
