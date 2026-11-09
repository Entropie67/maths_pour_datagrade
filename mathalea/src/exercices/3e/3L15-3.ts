import {
  baremeSolveur,
  commentaireSolveur,
  formulaireBaremeSolveur,
  modeSolveur,
} from '../../lib/customElements/MathaleaSolveurElement'
import { toutPourUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import type { OptionsComparaisonType } from '../../lib/types'
import Exercice from '../Exercice'
import Equation3L13 from './3L13'
import Equation3L14 from './3L14'
import Equation3L15 from './3L15'

export const interactifReady = true

export const dateDePublication = '13/06/2026'
export const titre = 'Exercice de synthèse sur les équations'

export const dateDeModifImportante = '04/10/2026'

export const uuid = 'bff54'
export const refs = {
  'fr-fr': ['3L15-3'],
  'fr-ch': ['11LSFA4E-10'],
}

/**
 * Mélange d'équations du premier degré ou assimilées, de niveau facile à difficile. Les types d'équations sont ceux des exercices 3L13, 3L14 et 3L15.
 * @author Jean-Claude Lhote
 */
export default class EquationMelees extends Exercice {
  constructor() {
    super()
    this.comment = commentaireSolveur
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      4,
      '1 : facile\n2 : Moyen\n3 : difficile\n4 : mélange',
    ]
    this.besoinFormulaire2CaseACocher = ['Mode entrainement en non interactif']
    this.sup = 1
    this.sup2 = false
    this.besoinFormulaire3Numerique = formulaireBaremeSolveur()
    this.sup3 = 1
  }
  nouvelleVersion() {
    const interactif = this.interactif
    const numeroExercice = this.numeroExercice
    const modeInteractif = modeSolveur(this.sup3)

    const niveau =
      this.sup === 1
        ? 'facile'
        : this.sup === 2
          ? 'moyen'
          : this.sup === 3
            ? 'difficile'
            : 'mélange'
    const typeFacileFor3L13 = [3, 4, 6]
    const typeMoyenFor3L13 = [1, 2]
    const typeDifficileFor3L13 = [5, 7]
    const typeMelangeFor3L13 = [1, 2, 3, 4, 5, 6, 7]
    const typeFacileFor3L14 = [1, 2]
    const typeMoyenFor3L14 = [3]
    const typeDifficileFor3L14 = [4]
    const typeMelangeFor3L14 = [1, 2, 3, 4]
    const typeFacileFor3L15 = [1, 5]
    const typeMoyenFor3L15 = [3, 4]
    const typeDifficileFor3L15 = [6, 7]
    const typeMelangeFor3L15 = [1, 3, 4, 5, 6]
    const listeExos: number[] = combinaisonListes([0, 1, 2], this.nbQuestions)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let exo: Equation3L13 | Equation3L14 | Equation3L15
      let options: OptionsComparaisonType = {}
      if (listeExos[i] === 0) {
        exo = new Equation3L13()
        exo.interactif = interactif
        if (niveau === 'facile') {
          exo.sup2 = choice(typeFacileFor3L13)
        } else if (niveau === 'moyen') {
          exo.sup2 = choice(typeMoyenFor3L13)
        } else if (niveau === 'difficile') {
          exo.sup2 = choice(typeDifficileFor3L13)
        } else {
          exo.sup2 = choice(typeMelangeFor3L13)
        }
        exo.sup3 = true
        exo.sup4 = this.sup2
        exo.sup5 = this.sup3
        exo.sup = true
      } else if (listeExos[i] === 1) {
        exo = new Equation3L14()
        exo.interactif = interactif
        if (niveau === 'facile') {
          exo.sup = choice(typeFacileFor3L14)
        } else if (niveau === 'moyen') {
          exo.sup = choice(typeMoyenFor3L14)
        } else if (niveau === 'difficile') {
          exo.sup = choice(typeDifficileFor3L14)
        } else {
          exo.sup = choice(typeMelangeFor3L14)
        }
        options = { suiteDeNombres: true }
      } else {
        exo = new Equation3L15()
        exo.interactif = interactif
        if (niveau === 'facile') {
          exo.sup = choice(typeFacileFor3L15)
        } else if (niveau === 'moyen') {
          exo.sup = choice(typeMoyenFor3L15)
        } else if (niveau === 'difficile') {
          exo.sup = choice(typeDifficileFor3L15)
        } else {
          exo.sup = choice(typeMelangeFor3L15)
        }
        exo.sup2 = true
      }
      exo.nbQuestions = 1
      exo.numeroExercice = 0
      exo.nouvelleVersion()
      if (this.questionJamaisPosee(i, listeExos[i], exo.listeCorrections[0])) {
        const options = exo.autoCorrection[0]?.valeur?.reponse?.options ?? {}
        const estSolveur =
          exo.autoCorrection[0]?.formatInteractif === 'mathalea-solveur'
        // Chaque question doit valoir le même nombre de points quel que soit
        // le type tiré : avec le barème sur 2 points, les questions avec
        // solveur sont sur 2 points, les autres sont donc doublées.
        const bareme = estSolveur
          ? baremeSolveur(modeInteractif)
          : modeInteractif === 'entrainement'
            ? (listePoints: number[]): [number, number] => [
                2 * Math.min(...listePoints),
                2,
              ]
            : toutPourUnPoint
        if (options.suiteDeNombres) {
          handleAnswers(this, i, {
            reponse: {
              value: exo.autoCorrection[0]?.valeur?.reponse?.value ?? '',
              options,
            },
            bareme,
          })
        } else {
          handleAnswers(
            this,
            i,
            {
              reponse: {
                value: exo.autoCorrection[0]?.valeur?.reponse?.value ?? '',
              },
              bareme,
            },
            { formatInteractif: exo.autoCorrection[0]?.formatInteractif },
          )
        }
        this.consigne =
          this.nbQuestions === 1
            ? exo.consigne
            : `Résoudre les équations suivantes. S'il y a plusieurs solutions, les donner en les séparant par un point-virgule.`
        this.listeQuestions.push(
          exo.listeQuestions[0]
            .replaceAll(
              'mathalea-solveurEx0Q0',
              `mathalea-solveurEx${numeroExercice}Q${i}`,
            )
            .replace(
              'numero-exercice="0"',
              `numero-exercice="${numeroExercice}"`,
            )
            .replace('question-index="0"', `question-index="${i}"`)
            // L'id figure aussi dans le `for` du label qui précède le champ.
            .replaceAll(
              'champTexteEx0Q0',
              `champTexteEx${numeroExercice}Q${i}`,
            )
            .replace(
              'resultatCheckEx0Q0',
              `resultatCheckEx${numeroExercice}Q${i}`,
            )
            .replace('feedbackEx0Q0', `feedbackEx${numeroExercice}Q${i}`),
        )
        this.listeCorrections.push(exo.listeCorrections[0])
        i++
      }
      cpt++
    }
  }
}
