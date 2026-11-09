import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { createQuestion } from '../../lib/interactif/createQuestion'
import { Complexe } from '../../lib/mathFonctions/Complexe'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Calculer l'affixe d'un vecteur"
export const interactifReady = true
export const dateDePublication = '28/10/2026'
export const uuid = '99f5e'
export const refs = {
  'fr-fr': ['TEC2-10-4'],
  'fr-ch': [],
}

const couples = [
  ['A', 'B'],
  ['C', 'D'],
  ['E', 'F'],
  ['M', 'N'],
  ['P', 'Q'],
  ['R', 'S'],
]

/**
 * Calculer l'affixe du vecteur AB à partir des affixes de A et de B.
 * @author Stéphane Guyon
 */
export default class AffixeVecteur extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      const xA = randint(-6, 6)
      const yA = randint(-6, 6)
      const xB = randint(-6, 6)
      const yB = randint(-6, 6)
      if ((xA !== xB || yA !== yB) && this.questionJamaisPosee(i, xA, yA, xB, yB)) {
        const [P, Q] = couples[i % couples.length]
        const zA = new Complexe(xA, yA)
        const zB = new Complexe(xB, yB)
        const affixe = new Complexe(xB - xA, yB - yA).tex()
        createQuestion(this, i, {
          question: `Dans le plan complexe muni d'un repère orthonormé $(O\\,;\\,\\vec u,\\vec v)$, on considère les points $${P}$ et $${Q}$ d'affixes respectives $z_${P}=${zA.tex()}$ et $z_${Q}=${zB.tex()}$.<br>Calculer l'affixe du vecteur $\\overrightarrow{${P}${Q}}$.`,
          correction: `L'affixe de $\\overrightarrow{${P}${Q}}$ est la différence $z_${Q}-z_${P}$ :<br>
          $z_{\\overrightarrow{${P}${Q}}}=(${zB.tex()})-(${zA.tex()})=${miseEnEvidence(affixe)}$`,
          answer: { value: affixe },
          field: {
            keyboard: KeyboardType.complexes,
            texteAvant: `<br>$z_{\\overrightarrow{${P}${Q}}}=$`,
          },
        })
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
