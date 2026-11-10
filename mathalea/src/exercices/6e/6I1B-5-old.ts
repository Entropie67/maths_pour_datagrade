import { renderSheetMarkup } from '../../lib/customElements/MySpreadSheet'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import type { GoodAnswersFormulas } from '../../lib/types'
import { context } from '../../modules/context'

import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Saisir une formule simple sur tableur'
export const dateDePublication = '07/02/2026'

export const interactifReady = true

/**
 * Programmer des calculs sur tableur : New programme de 6eme 2025
 *  @author Olivier Mimeau
 * revisiter le vocabulaire moitié double .... cf 5C12-7
 * tableur d'après exercice 6I1B-4
 */

export const uuid = '4662d' // '46bae'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

// const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export default class ExerciceTableurVocabulaireOld extends Exercice {
  niveau: number = 6
  constructor() {
    super()
    this.nbQuestions = 2

    this.besoinFormulaireTexte = [
      'Types de formules',
      [
        'Nombres séparés par des tirets :',
        ' 0 : Mélange',
        ' 1 : Double',
        ' 2 : Triple',
        ' 3 : Moitié',
        ' 4 : Quart',
        ' 5 : Dixième',
        ' 6 : Carré',
        ' 7 : Cube',
        ' 8 : Opposé',
        ' 9 : Inverse',
        '10 : Somme de deux nombres',
        '11 : Différence entre deux nombres',
        '12 : Produit de deux nombres',
        '13 : Quotient de deux nombres',
      ].join('\n'),
    ]
    this.comment = `L'exercice étant de niveau 6eme, le choix 0 écarte la possibilité d'obtenir carré, cube, opposé ou inverse. Si on souhaite les obtenir, il faut effectuer une liste explicite du type 1-2-3-4-5-6-7-8-9-10-11-12-13`

    this.besoinFormulaire2Numerique = ['Nombre de lignes', 1, '1\n2\n3\n4\n5']
    this.sup = 0
    this.sup2 = 3
    this.niveau = 6
  }

  static readonly colors = {
    orange: '#e6b457',
    vert: '#7adb7a',
    jaune: '#e6e66a',
    bleu: '#8181e6',
    violet: '#f8a3f8',
    rouge: '#eca2a2',
  }

  static readonly styles = {
    style_id_rouge: {
      fs: 12,
      bg: ExerciceTableurVocabulaireOld.colors.rouge,
    },
    style_id_bleu: {
      fs: 12,
      bg: ExerciceTableurVocabulaireOld.colors.bleu,
    },
    style_id_orange: {
      fs: 12,
      bg: ExerciceTableurVocabulaireOld.colors.orange,
    },
    style_id_violet: {
      fs: 12,
      bg: ExerciceTableurVocabulaireOld.colors.violet,
    },
    style_id_vert: {
      fs: 12,
      bg: ExerciceTableurVocabulaireOld.colors.vert,
    },
    style_id_jaune: {
      fs: 12,
      bg: ExerciceTableurVocabulaireOld.colors.jaune,
    },
  }

  nouvelleVersion(): void {
    const nbLignes = this.sup2
    const nbElements = this.nbQuestions * this.sup2
    /*     const nbOperations =
      this.sup === 1 ? randint(2, 5) : Math.min(Math.max(2, this.sup), 5)
 */
    let choixThisSup = this.sup
    if (this.niveau === 6 && choixThisSup === 0) {
      choixThisSup = '1-2-3-4-5-10-11-12-13'
    }
    const listeTypeQuestionsBase = gestionnaireFormulaireTexte({
      saisie: choixThisSup,
      min: 1,
      max: 13,
      defaut: 1,
      melange: 0,
      // shuffle: false, //true bien pour les tests
      nbQuestions: Math.min(nbElements, 50),
    })
    const listeTypeQuestions = combinaisonListes(
      listeTypeQuestionsBase,
      nbElements,
    )

    type MotVocabulaire = {
      num: number
      txtEnonce: string
      txtCorrection: string
      txtFormule: string
    }
    const listeMots: MotVocabulaire[] = [
      {
        num: 1,
        txtEnonce: 'Son double',
        txtCorrection: 'le double de ',
        txtFormule: '=B1*2',
      },
      {
        num: 2,
        txtEnonce: 'Son triple',
        txtCorrection: 'le triple de ',
        txtFormule: '=B1*3',
      },
      {
        num: 3,
        txtEnonce: 'Sa moitié',
        txtCorrection: 'la moitié de ',
        txtFormule: '=B1/2',
      },
      {
        num: 4,
        txtEnonce: 'Son quart',
        txtCorrection: 'le quart de ',
        txtFormule: '=B1/4',
      },
      {
        num: 5,
        txtEnonce: 'Son dixième',
        txtCorrection: 'le dixième de ',
        txtFormule: '=B1/10',
      },
      {
        num: 6,
        txtEnonce: 'Son carré',
        txtCorrection: 'le carré de ',
        txtFormule: `=B1^2`,
      },
      {
        num: 7,
        txtEnonce: 'Son cube',
        txtCorrection: 'le cube de ',
        txtFormule: '=B1^3',
      },
      {
        num: 8,
        txtEnonce: 'Son opposé',
        txtCorrection: `l'opposé de `,
        txtFormule: '=-B1',
      },
      {
        num: 9,
        txtEnonce: 'Son inverse',
        txtCorrection: `l'inverse de `,
        txtFormule: '=1/B1',
      },
      {
        num: 10,
        txtEnonce: 'La somme de number1 et number2',
        txtCorrection: 'la somme de ',
        txtFormule: '=B1+B2',
      },
      {
        num: 11,
        txtEnonce: 'La différence entre number1 et number2',
        txtCorrection: 'la différence entre ',
        txtFormule: '=B1-B2',
      },
      {
        num: 12,
        txtEnonce: 'Le produit de number1 par number2',
        txtCorrection: 'le produit de ',
        txtFormule: '=B1*B2',
      },
      {
        num: 13,
        txtEnonce: 'Le quotient de number1 par number2',
        txtCorrection: 'le quotient de ',
        txtFormule: '=B1/B2',
      },
    ]

    for (let q = 0, cpt = 0; q < this.nbQuestions && cpt < 50; cpt++) {
      // const q = 0
      let texte = ''
      let texteCorr = ''
      const listeMotsEnonce: string[] = []
      const nbColTableur = 2
      const nbDepart = randint(15, 40)
      type CellType = 1 | 2 | 3

      interface CellData {
        v: string | number
        s: string
        t: CellType
        formule?: string
      }
      const cellDatas: CellData[][] = [[]]
      const lesBonnesFormules: GoodAnswersFormulas = []
      cellDatas[0][0] = {
        v: 'Nombre de départ',
        s: '', // 'style_id_orange', // couleur uniquement apriori ?
        t: 1, //  1:raggedright, 2:raggedleft, 3:center
      }
      cellDatas[0][1] = {
        v: `${nbDepart}`,
        s: '', // 'style_id_orange', // couleur uniquement apriori ?
        t: 3, // 1:raggedright, 2:raggedleft, 3:center
      }
      let enonce: string = ''
      let formule: string = ''

      for (let i = q * nbLignes; i < (q + 1) * nbLignes; i++) {
        const lOperation = Number(listeTypeQuestions[i])
        enonce = listeMots[lOperation - 1].txtEnonce
        formule = listeMots[lOperation - 1].txtFormule
        const nb2 = randint(15, 40, [nbDepart])
        switch (lOperation) {
          case 10: // somme
            enonce = enonce
              .replace('de number1', 'du nombre de départ')
              .replace('number2', `de ${nb2}`)
            formule = formule.replace('B2', `${nb2}`)
            break
          case 11: // différence
            if (nb2 < nbDepart) {
              enonce = enonce.replace(
                'entre number1 et number2',
                `entre le nombre de départ et ${nb2}`,
              )
              formule = formule.replace('B2', `${nb2}`)
            } else {
              enonce = enonce.replace(
                'entre number1 et number2',
                `entre ${nb2} et le nombre de départ`,
              )
              formule = formule.replace('B1-B2', `${nb2}-B1`)
            }
            break
          case 12: // produit
            enonce = enonce
              .replace('de number1', 'du nombre de départ')
              .replace('number2', `${nb2}`)
            formule = formule.replace('B2', `${nb2}`)
            break
          case 13: // quotient
            if (nb2 < nbDepart) {
              enonce = enonce.replace(
                'de number1 par number2',
                `du nombre de départ par ${nb2}`,
              )
              formule = formule.replace('B2', `${nb2}`)
            } else {
              enonce = enonce.replace(
                'de number1 par number2',
                `de ${nb2} par le nombre de départ`,
              )
              formule = formule.replace('B1/B2', `${nb2}/B1`)
            }
            break
        }
        listeMotsEnonce.push(enonce)
        lesBonnesFormules.push({
          ref: `B${i - q * nbLignes + 2}`,
          formula: formule,
        })
      }

      // GoodAnswersFormulas
      for (let i = 0; i < nbLignes; i++) {
        cellDatas.push([]) // creer une ligne par question
        cellDatas[i + 1][0] = {
          v: `${listeMotsEnonce[i]}`,
          s: '',
          t: 1,
        }
      }

      // data et style pour le tableur interactif
      const data: (number | string)[][] = [[]]
      data[0][0] = cellDatas[0][0].v
      data[0][1] = cellDatas[0][1].v

      for (let i = 0; i < nbLignes; i++) {
        data.push([]) // creer une ligne par question
        data[i + 1][0] = cellDatas[i + 1][0].v
      }

      data.push([]) // ligne vide en plus
      const style: Record<string, string> = {}
      for (let i = 0; i < nbLignes + 2; i++) {
        const key = `A${i}`
        style[key] = 'text-align: left' // 'background: #eca2a2'
      }

      const mot =
        listeMotsEnonce[0].charAt(0).toLowerCase() + listeMotsEnonce[0].slice(1)
      texte += `On choisit un nombre de départ, ici $${nbDepart}$ <br>
      Par exemple, la cellule B2 doit contenir la formule pour calculer ${mot}.<br>`
      texte +=
        nbLignes === 1 ? '' : 'Faire de même pour les autres cellules.<br>'
      texte += 'Attention, '
      texte += nbLignes === 1 ? 'la formule doit' : 'les formules doivent'
      texte +=
        ' fonctionner même si le nombre de départ change (Cellule B1).<br>'

      const latexOptions: {
        formule?: boolean
        formuleTexte?: string
        formuleCellule?: string
        firstColHeaderWidth?: string
      } = {
        formule: true,
        formuleTexte: '=?',
        formuleCellule: 'B1',
      }

      texte += renderSheetMarkup({
        numeroExercice: this.numeroExercice,
        questionIndex: q,
        data,
        minDimensions: [nbColTableur, 2],
        style,
        columns: [{ width: 180 }, { width: 90 }, { width: 90 }, { width: 90 }],
        interactif: this.interactif,
        showVerifyButton: false,
        readOnlyCells: [`A1:A${nbLignes + 1}`],
        latexData: cellDatas,
        latexStyles: ExerciceTableurVocabulaireOld.styles,
        latexOptions,
        appendFeedbackBlocks: this.interactif,
      })

      if (this.interactif) {
        handleAnswers(
          this,
          q,
          {
            sheetAnswer: {
              goodAnswerFormulas: lesBonnesFormules,
              sheetTestDatas: [
                {
                  ref: `B1`,
                  rangeValues: [1, 10],
                },
              ],
            },
          },
          { formatInteractif: 'my-spreadsheet' },
        )
      }

      texteCorr = 'Voici les formules à saisir dans le tableur :<br>'
      for (let i = 0; i < nbLignes; i++) {
        const index = i + q * nbLignes
        const lOperation = Number(listeTypeQuestions[index])
        let formule = lesBonnesFormules[i].formula
        if (typeof formule === 'string')
          if (!context.isHtml && formule.includes('^')) {
            formule = formule.replace(/\^/g, `\\^{}`)
          }
        texteCorr += `Pour calculer ${listeMots[lOperation - 1].txtCorrection}${nbDepart}, la formule à saisir dans la cellule ${lesBonnesFormules[i].ref} est : ${formule}.<br>`
      }
      /****************************************************/
      if (this.questionJamaisPosee(q, nbDepart, listeMotsEnonce[0])) {
        this.listeQuestions[q] = texte
        this.listeCorrections[q] = texteCorr
        q++
      }
      listeQuestionsToContenu(this)
    }
  }
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'] // A1..F1 max

/**
 * Construit l'objet `style` de type { 'A1': '#color', ... } à partir de `colos`
 * Nombre de cellules = listeSteps + 1, borné à A1..F1.
 *
 * Règles:
 * - Si colos est plus court que le nombre de cellules, on répète la dernière couleur.
 * - Si listeSteps + 1 > 6, on tronque à F1.
 */
export function buildStyleFromColos(
  colos: string[],
  listeSteps: number,
): Record<string, string> {
  const nbCells = Math.max(1, Math.min(listeSteps + 1, LETTERS.length))
  const style: Record<string, string> = {}
  for (let i = 0; i < nbCells; i++) {
    const key = `${LETTERS[i]}1`
    const color = colos[i] ? `background: ${colos[i]}` : 'background: #ffffff'
    style[key] = color
  }
  return style
}
