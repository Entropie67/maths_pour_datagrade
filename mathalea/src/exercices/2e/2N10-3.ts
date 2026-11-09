import { choixDeroulant } from '../../lib/customElements/ListeDeroulanteElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { customSortStringNumber } from '../../lib/components/sorting'
import {
  combinaisonListes,
  getRandomSubarray,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre =
  "Déterminer l'appartenance d'un élément ou la contenance d'un ensemble à un ensemble"
export const dateDePublication = '01/09/2024'
export const interactifReady = true

/**
 * Réduire une expression littérale
 * @author Nathan Scheinmann
 * erreur avec 9X7w
 */

export const uuid = 'b5a46'
export const refs = {
  'fr-fr': ['2N10-3'],
  'fr-ch': ['1mEI-3'],
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
    this.besoinFormulaire3CaseACocher = ['Appartenance']
    this.besoinFormulaire4CaseACocher = ['Contenance']
    this.besoinFormulaire5CaseACocher = ['Consigne avec les symboles']
    this.sup2 = 3
    this.sup3 = true
    this.sup4 = true
    this.sup5 = true
    // this.besoinFormulaireCaseACocher = ['Type de coefficients', 3, 'Entiers\nFractionnaires\nMélange']
    // this.besoinFormulaire5Numerique = ['Nombre de termes', 5, '1\n2\n3\n4\n5']
    this.sup = 3
    let nbBesoinsFormulaireCaseACocher = 0
    let symbole = ''
    if (this.sup3) {
      nbBesoinsFormulaireCaseACocher++
      symbole += `${nbBesoinsFormulaireCaseACocher > 1 ? ' ou ' : ''} le symbole $\\in, \\not\\in$`
    }
    if (this.sup4) {
      nbBesoinsFormulaireCaseACocher++
      symbole += `${nbBesoinsFormulaireCaseACocher > 1 ? ' ou ' : ''} le symbole $\\subset, \\not\\subset$`
    }
    this.consigne = `Compléter avec ${this.sup5 ? symbole : 'le symbole qui convient'}.`
    if (this.sup3 === false && this.sup4 === false) {
      this.consigne = 'Au moins une option doit être cochée'
      this.nbQuestions = 1
    }
  }

  nouvelleVersion() {
    let nbBesoinsFormulaireCaseACocher = 0
    let symbole = ''
    if (this.sup3) {
      nbBesoinsFormulaireCaseACocher++
      symbole += `${nbBesoinsFormulaireCaseACocher > 1 ? ' ou ' : ''} les symboles $\\in, \\not\\in$`
    }
    if (this.sup4) {
      nbBesoinsFormulaireCaseACocher++
      symbole += `${nbBesoinsFormulaireCaseACocher > 1 ? ' ou ' : ''} les symboles $\\subset, \\not\\subset$`
    }
    this.consigne = `Compléter avec ${this.sup5 ? symbole : 'le symbole qui convient'}.`

    let typeQuestionsDisponibles: (
      | 'nombresElementTrue'
      | 'nombresElementFalse'
      | 'nombresContenanceTrue'
      | 'nombresContenanceFalse'
      | 'lettresElementTrue'
      | 'lettresElementFalse'
      | 'lettresContenanceTrue'
      | 'lettresContenanceFalse'
      | 'erreur'
    )[]
    typeQuestionsDisponibles = []
    if (this.sup === 1) {
      if (this.sup3 === true) {
        typeQuestionsDisponibles.push('nombresElementTrue')
        typeQuestionsDisponibles.push('nombresElementFalse')
      }
      if (this.sup4 === true) {
        typeQuestionsDisponibles.push('nombresContenanceTrue')
        typeQuestionsDisponibles.push('nombresContenanceFalse')
      }
    } else if (this.sup === 2) {
      if (this.sup3 === true) {
        typeQuestionsDisponibles.push('lettresElementTrue')
        typeQuestionsDisponibles.push('lettresElementFalse')
      }
      if (this.sup4 === true) {
        typeQuestionsDisponibles.push('lettresContenanceTrue')
        typeQuestionsDisponibles.push('lettresContenanceFalse')
      }
    } else {
      if (this.sup3 === true) {
        typeQuestionsDisponibles = [
          'nombresElementTrue',
          'nombresElementFalse',
          'lettresElementTrue',
          'lettresElementFalse',
        ]
      }
      if (this.sup4 === true) {
        typeQuestionsDisponibles.push('nombresContenanceFalse')
        typeQuestionsDisponibles.push('nombresContenanceTrue')
        typeQuestionsDisponibles.push('lettresContenanceTrue')
        typeQuestionsDisponibles.push('lettresContenanceFalse')
      }
    }
    if (this.sup3 === false && this.sup4 === false) {
      typeQuestionsDisponibles = ['erreur']
      this.consigne = 'Au moins une option doit être cochée'
      this.nbQuestions = 1
    }
    const listeTypeDeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    const choixSymboles = [
      { label: 'Choisir', value: '' },
      { latex: '\\in', value: '\\in' },
      { latex: '\\not\\in', value: '\\not\\in' },
      { latex: '\\subset', value: '\\subset' },
      { latex: '\\not\\subset', value: '\\not\\subset' },
    ]

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      let texteCorr: string
      let texte: string
      let listeElements: (number | string)[]
      listeElements = []
      if (listeTypeDeQuestions[i].includes('erreur')) {
        texte = ''
        texteCorr = ''
      } else {
        switch (listeTypeDeQuestions[i].substring(0, 7)) {
          case 'nombres': {
            listeElements = [
              1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
              20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
              36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
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
        const ensemble1 = getRandomSubarray(
          listeElements.slice(0, listeElements.length - 1),
          this.sup2 + 2 - randint(0, 1),
        )
        const el = ensemble1[randint(0, ensemble1.length - 1)]
        // get the first element after el in listeElements which is after el and not in ensemble1
        const el2 = listeElements.find(
          (e) =>
            listeElements.indexOf(e) > listeElements.indexOf(el) &&
            !ensemble1.includes(e),
        )
        const subEns = getRandomSubarray(
          ensemble1,
          ensemble1.length - randint(1, ensemble1.length - 1),
        )
        let subPasEns: (number | string)[]
        subPasEns = []
        if (randint(0, 1) === 1) {
          subPasEns = [...subEns]
          subPasEns.push(el2 as number | string)
        } else {
          // define a subPasEns which is not contained in ensemble1
          do {
            subPasEns = getRandomSubarray(
              listeElements.slice(0, listeElements.length - 1),
              this.sup2 + 2 - this.sup2,
            ).sort(customSortStringNumber)
          } while (subPasEns.every((e) => ensemble1.includes(e)))
        }
        // if the string contains element
        texteCorr = ''
        texte = ''
        if (listeTypeDeQuestions[i].includes('ElementTrue')) {
          texte = `$${el}\\,$`
          texte += this.interactif
            ? choixDeroulant(this, i, { choices: choixSymboles })
            : '$\\ldots\\ldots$'
          texte += `$\\,\\{ ${ensemble1.sort(customSortStringNumber).join('; ')} \\}$.`
          texteCorr = `$${el} ${miseEnEvidence('\\in')} \\{ ${ensemble1.sort(customSortStringNumber).join('; ')} \\}$`
          handleAnswers(
            this,
            i,
            { reponse: { value: '\\in' } },
            { formatInteractif: 'liste-deroulante' },
          )
        } else if (listeTypeDeQuestions[i].includes('ElementFalse')) {
          texte = `$${el2}\\,$`
          texte += this.interactif
            ? choixDeroulant(this, i, { choices: choixSymboles })
            : '$\\ldots\\ldots$'
          texte += `$\\,\\{ ${ensemble1.sort(customSortStringNumber).join('; ')} \\}$.`
          texteCorr = `$${el2} ${miseEnEvidence('\\not\\in')}\\{ ${ensemble1.sort(customSortStringNumber).join('; ')} \\}$`
          handleAnswers(
            this,
            i,
            { reponse: { value: '\\not\\in' } },
            { formatInteractif: 'liste-deroulante' },
          )
        } else if (listeTypeDeQuestions[i].includes('ContenanceTrue')) {
          texte = `$\\{ ${subEns.sort(customSortStringNumber).join('; ')} \\}\\,$`
          texte += this.interactif
            ? choixDeroulant(this, i, { choices: choixSymboles })
            : '$\\ldots\\ldots$'
          texte += `$\\,\\{ ${ensemble1.sort(customSortStringNumber).join('; ')} \\}$.`
          texteCorr = `$\\{ ${subEns.sort(customSortStringNumber).join('; ')} \\} ${miseEnEvidence('\\subset')} \\{ ${ensemble1.sort(customSortStringNumber).join('; ')} \\} $`
          handleAnswers(
            this,
            i,
            { reponse: { value: '\\subset' } },
            { formatInteractif: 'liste-deroulante' },
          )
        } else if (listeTypeDeQuestions[i].includes('ContenanceFalse')) {
          texte = `$\\{ ${subPasEns.sort(customSortStringNumber).join('; ')} \\}\\,$`
          texte += this.interactif
            ? choixDeroulant(this, i, { choices: choixSymboles })
            : '$\\ldots\\ldots$'
          texte += `$\\,\\{ ${ensemble1.sort(customSortStringNumber).join('; ')}\\}$.`
          texteCorr = `$\\{ ${subPasEns.sort(customSortStringNumber).join('; ')} \\} ${miseEnEvidence('\\not\\subset')} \\{ ${ensemble1.sort(customSortStringNumber).join('; ')}\\}$`
          handleAnswers(
            this,
            i,
            { reponse: { value: '\\not\\subset' } },
            { formatInteractif: 'liste-deroulante' },
          )
        }
      }
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
