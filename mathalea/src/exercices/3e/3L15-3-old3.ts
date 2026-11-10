// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 9ae36 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import type { OptionsComparaisonType } from '../../lib/types'
import Exercice from '../Exercice'
import Equation3L13 from './3L13-old4'
import Equation3L14 from './3L14'
import Equation3L15 from './3L15'

export const interactifReady = true

export const dateDePublication = '13/06/2026'
export const titre = 'Exercice de synthèse sur les équations'

export const dateDeModifImportante = '03/10/2026'

export const uuid = '9ae36'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

/**
 * Mélange d'équations du premier degré ou assimilées, de niveau facile à difficile. Les types d'équations sont ceux des exercices 3L13, 3L14 et 3L15.
 * @author Jean-Claude Lhote
 */
export default class EquationMeleesOld3 extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      4,
      '1 : facile\n2 : Moyen\n3 : difficile\n4 : mélange',
    ]
    this.sup = 1
  }
  nouvelleVersion() {
    const interactif = this.interactif
    const numeroExercice = this.numeroExercice

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
        if (options.suiteDeNombres) {
          handleAnswers(this, i, {
            reponse: {
              value: exo.autoCorrection[0]?.valeur?.reponse?.value ?? '',
              options,
            },
          })
        } else {
          handleAnswers(
            this,
            i,
            {
              reponse: {
                value: exo.autoCorrection[0]?.valeur?.reponse?.value ?? '',
              },
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
