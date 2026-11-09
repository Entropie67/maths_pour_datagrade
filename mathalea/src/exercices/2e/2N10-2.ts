import { customSortStringNumber } from '../../lib/components/sorting'
import {
  combinaisonListes,
  getRandomSubarray,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = "Effectuer des opérations d'ensembles"
export const dateDePublication = '30/08/2024'

/**
 * Réduire une expression littérale
 * @author Nathan Scheinmann
 */

export const uuid = 'd6d2a'
export const refs = {
  'fr-fr': ['2N10-2'],
  'fr-ch': ['1mEI-2'],
}

export default class nomExercice extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.besoinFormulaireNumerique = [
      "Type d'ensembles",
      3,
      'Nombres \n2 : Lettres \n3 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      "Nombre d'éléments maximum",
      3,
      '3 \n4 \n5\n 6',
    ]
    this.besoinFormulaire3CaseACocher = ['Union']
    this.besoinFormulaire4CaseACocher = ['Intersection']
    this.besoinFormulaire5CaseACocher = ['Différence']
    this.sup2 = 3
    this.sup3 = true
    this.sup4 = true
    this.sup5 = true
    // this.besoinFormulaireCaseACocher = ['Type de coefficients', 3, 'Entiers\nFractionnaires\nMélange']
    // this.besoinFormulaire5Numerique = ['Nombre de termes', 5, '1\n2\n3\n4\n5']
    this.sup = 3
    let nbBesoinsFormulaireCaseACocher = 0
    let operations = ''
    if (this.sup3) {
      nbBesoinsFormulaireCaseACocher++
      operations += `${nbBesoinsFormulaireCaseACocher > 1 ? ',' : ''} $A \\cup B$`
    }
    if (this.sup4) {
      nbBesoinsFormulaireCaseACocher++
      operations += `${nbBesoinsFormulaireCaseACocher > 1 ? ',' : ''} $A \\cap B$`
    }
    if (this.sup5) {
      nbBesoinsFormulaireCaseACocher++
      operations += `${nbBesoinsFormulaireCaseACocher > 1 ? ',' : ''} $A \\setminus B$ et $B \\setminus A$`
    }
    this.consigne = `Pour chaque paire d'ensembles, écrire l'ensemble correspondant à ${operations}.`
  }

  nouvelleVersion() {
    let nbBesoinsFormulaireCaseACocher = 0
    let operations = ''
    if (this.sup3) {
      nbBesoinsFormulaireCaseACocher++
      operations += `${nbBesoinsFormulaireCaseACocher > 1 ? ',' : ''} $A \\cup B$`
    }
    if (this.sup4) {
      nbBesoinsFormulaireCaseACocher++
      operations += `${nbBesoinsFormulaireCaseACocher > 1 ? ',' : ''} $A \\cap B$`
    }
    if (this.sup5) {
      nbBesoinsFormulaireCaseACocher++
      operations += `${nbBesoinsFormulaireCaseACocher > 1 ? ',' : ''} $A \\setminus B$ et $B \\setminus A$`
    }
    this.consigne = `Pour chaque paire d'ensembles, écrire l'ensemble correspondant à ${operations}.`

    let typeQuestionsDisponibles: ('nombres' | 'lettres')[]
    if (this.sup === 1) {
      typeQuestionsDisponibles = ['nombres']
    } else if (this.sup === 2) {
      typeQuestionsDisponibles = ['lettres']
    } else {
      typeQuestionsDisponibles = shuffle([
        'nombres',
        'lettres',
        'nombres',
        'lettres',
      ])
    }
    const listeTypeDeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      let texteCorr: string
      let listeElements: (number | string)[]
      switch (listeTypeDeQuestions[i]) {
        case 'nombres': {
          listeElements = [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
            20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
            37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
          ]
          break
        }
        case 'lettres': {
          listeElements = [
            'a',
            'b',
            'c',
            'd',
            'e',
            'f',
            'g',
            'h',
            'i',
            'j',
            'k',
            'l',
            'm',
            'n',
            'o',
            'p',
            'q',
            'r',
            's',
            't',
            'u',
            'v',
            'w',
            'x',
            'y',
            'z',
          ]
          break
        }
      }
      const listeElementsChoisis = getRandomSubarray(
        listeElements,
        this.sup2 * 2 + 7,
      )
      const ensemble1 = getRandomSubarray(
        listeElementsChoisis,
        this.sup2 + 2 - randint(0, 1),
      )
      const ensemble2 = getRandomSubarray(listeElementsChoisis, this.sup2 + 2)
      const texte = `$A = \\{ ${ensemble1.sort(customSortStringNumber).join('; ')} \\}$ et $B = \\{ ${ensemble2.sort(customSortStringNumber).join('; ')} \\}$.`
      texteCorr = ''
      if (this.sup3) {
        // I want to order alphabetically or by magnitude the union
        texteCorr += `$A \\cup B = ${miseEnEvidence(`\\{ ${[...new Set([...ensemble1, ...ensemble2])].sort(customSortStringNumber).join('; ')} \\}`)}$`
      }
      if (this.sup4) {
        if (this.sup3) {
          texteCorr += ',<br>'
        }
        const intersection = ensemble1
          .filter((x) => ensemble2.includes(x))
          .sort(customSortStringNumber)
          .join('; ')
        if (intersection === '') {
          texteCorr += `$A \\cap B = ${miseEnEvidence('\\emptyset')}$`
        } else {
          texteCorr += `$A \\cap B = ${miseEnEvidence(
            `\\{ ${ensemble1
              .filter((x) => ensemble2.includes(x))
              .sort(customSortStringNumber)
              .join('; ')} \\}`,
          )}$`
        }
      }
      if (this.sup5) {
        if (this.sup3 || this.sup4) {
          texteCorr += ',<br>'
        }
        const setAMinusB = ensemble1
          .filter((x) => !ensemble2.includes(x))
          .sort(customSortStringNumber)
          .join('; ')
        const setBMinusA = ensemble2
          .filter((x) => !ensemble1.includes(x))
          .sort(customSortStringNumber)
          .join('; ')
        if (setAMinusB === '') {
          texteCorr += `$A \\setminus B = ${miseEnEvidence('\\emptyset')}$`
        } else {
          texteCorr += `$A \\setminus B = ${miseEnEvidence(
            `\\{ ${ensemble1
              .filter((x) => !ensemble2.includes(x))
              .sort(customSortStringNumber)
              .join('; ')} \\}`,
          )}$ et `
        }
        if (setBMinusA === '') {
          texteCorr += `$B \\setminus A = ${miseEnEvidence('\\emptyset')}$`
        } else {
          texteCorr += `$B \\setminus A = ${miseEnEvidence(
            `\\{ ${ensemble2
              .filter((x) => !ensemble1.includes(x))
              .sort(customSortStringNumber)
              .join('; ')} \\}`,
          )}$`
        }
      }
      // replace {} by \emptyset
      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
