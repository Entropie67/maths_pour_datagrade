import {
  MySpreadsheetElement,
  renderSheetMarkup,
} from '../../lib/customElements/MySpreadSheet'
import { DomReadyActionElement } from '../../lib/customElements/DomReadyAction'
import { vertMathalea } from '../../lib/colors'
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

export const uuid = '46bae'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

const sheetCheckListenerAction = '6I1B-5-old-old:sheet-check-listener'
const exercicesTableur = new Map<number, ExerciceTableur>()
let sheetCheckListenerRegistered = false

// const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export default class ExerciceTableur extends Exercice {
  niveau: number = 6
  constructor() {
    super()
    this.nbQuestions = 3

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
      bg: ExerciceTableur.colors.rouge,
    },
    style_id_bleu: {
      fs: 12,
      bg: ExerciceTableur.colors.bleu,
    },
    style_id_orange: {
      fs: 12,
      bg: ExerciceTableur.colors.orange,
    },
    style_id_violet: {
      fs: 12,
      bg: ExerciceTableur.colors.violet,
    },
    style_id_vert: {
      fs: 12,
      bg: ExerciceTableur.colors.vert,
    },
    style_id_jaune: {
      fs: 12,
      bg: ExerciceTableur.colors.jaune,
    },
  }

  validateFormulas(
    q: number,
    userSheet: MySpreadsheetElement,
    corrections: MotsQR[],
    nbLignes: number[],
  ): { isOk: boolean; messages: string } {
    // 1. Récupère les données de l'utilisateur
    const userData = userSheet.getData()
    const nbSteps = nbLignes[q]
    const testSheet = MySpreadsheetElement.createEltToAppendToDom({
      data: userData,
      minDimensions: userSheet.getMinDimensions(),
      style: userSheet.getStyle(),
      columns: userSheet.getColumns(),
      interactif: false,
      id: 'testSheet',
    })
    testSheet.style.position = 'absolute'
    testSheet.style.left = '-9999px'
    document.body.appendChild(testSheet)

    const correctionSheet = MySpreadsheetElement.createEltToAppendToDom({
      data: userData,
      minDimensions: userSheet.getMinDimensions(),
      style: userSheet.getStyle(),
      columns: userSheet.getColumns(),
      interactif: false,
      id: 'correctionSheet',
    })
    correctionSheet.style.position = 'absolute'
    correctionSheet.style.left = '-8999px'
    document.body.appendChild(correctionSheet)
    let cell = { col: 0, lig: 0 }
    for (let i = 0; i < nbSteps; i++) {
      const index = i + q * nbSteps
      cell = toRefCellule(corrections[index].ref)
      correctionSheet.setCellValue(
        cell.col,
        cell.lig,
        corrections[index].txtFormule,
      )
    }

    const messages: string[][] = []
    // for (let n = 0; n < nbSteps; n++) {
    messages[q] = []
    const a1 = randint(1, 10)
    testSheet.setCellValue(1, 0, a1) // B1
    correctionSheet.setCellValue(1, 0, a1)
    const resultats: number[] = []
    for (let i = 0; i < nbSteps; i++) {
      const index = i + q * nbSteps
      cell = toRefCellule(corrections[index].ref)
      resultats.push(
        parseFloat(String(testSheet.getCellValue(cell.col, cell.lig))),
      )
    }
    // Recupere les données B1, C1, D1 ... pour les comparer aux résultats attendus
    const correctionResultats: number[] = []
    for (let i = 0; i < nbSteps; i++) {
      const index = i + q * nbSteps
      cell = toRefCellule(corrections[index].ref)
      correctionResultats.push(
        parseFloat(String(correctionSheet.getCellValue(cell.col, cell.lig))),
      )
    }

    // analyse les réponses de l'utilisateur
    for (let i = 0; i < nbSteps; i++) {
      const index = i + q * nbSteps
      if (typeof resultats[i] !== 'number' || isNaN(resultats[i])) {
        messages[q].push(
          `La cellule ${corrections[index].ref} ne contient pas un nombre valide.<br>`,
        )
      }
    }
    for (let i = 0; i < nbSteps; i++) {
      const index = i + q * nbSteps
      cell = toRefCellule(corrections[index].ref)
      if (
        typeof testSheet.getCellFormula(cell.col, cell.lig) !== 'string' ||
        !testSheet.getCellFormula(cell.col, cell.lig).startsWith('=')
      ) {
        messages[q].push(
          `La cellule ${corrections[index].ref} ne contient pas une formule valide.<br>`,
        )
      }
    }
    // compare les résultats de l'utilisateur avec les réponses attendues
    for (let i = 0; i < nbSteps; i++) {
      const index = i + q * nbSteps
      if (Math.abs(correctionResultats[i] - resultats[i]) > 1e-6) {
        messages[q].push(
          `Pour un nombre de départ égal à ${a1}, la cellule ${corrections[index].ref} devrait contenir ${correctionResultats[i]} mais elle contient ${resultats[i]}.<br>`,
        )
      }
    }
    // }

    const maxMessages = messages.reduce(
      (max, arr) => (arr.length > max.length ? arr : max),
      [],
    )

    document.body.removeChild(testSheet)
    document.body.removeChild(correctionSheet)
    const feedback =
      maxMessages.length === 0
        ? '✅ Toutes les formules sont correctes !'
        : '❌ Des erreurs ont été détectées.'
    return {
      isOk: maxMessages.length === 0,
      messages: maxMessages.join('') + feedback,
    }
  }

  checkSolution(event?: CustomEvent, corrections: MotsQR[] = []): void {
    const eventName = event?.type
    const q = Number(eventName?.match(/Q(\d+)/)?.[1])
    if (!Number.isInteger(q)) {
      console.error('Question number not found in event name:', eventName)
      return
    }
    if (this.numeroExercice === undefined) {
      console.error('Exercise number not found for event:', eventName)
      return
    }
    const sheetElt =
      event?.detail?.sheet ??
      MySpreadsheetElement.findSheetElement(this.numeroExercice, q)
    if (sheetElt && sheetElt.isMounted()) {
      const { messages } = this.validateFormulas(
        q,
        sheetElt,
        corrections,
        listeNbLignes,
      )
      const messagesDiv = sheetElt.querySelector(
        '#message-faux',
      ) as HTMLDivElement
      if (messages && messagesDiv) {
        messagesDiv.style.color = vertMathalea
        messagesDiv.innerHTML = messages
      }
    }
  }

  nouvelleVersion(): void {
    registerSheetCheckListener()
    if (this.numeroExercice !== undefined) {
      exercicesTableur.set(this.numeroExercice, this)
    }
    listeMotsQR = []
    listeNbLignes = []
    nbLignes = this.sup2
    const nbElements = this.nbQuestions * this.sup2
    /*     const nbOperations =
      this.sup === 1 ? randint(2, 5) : Math.min(Math.max(2, this.sup), 5)
 */
    let choixThisSup = this.sup
    if (this.niveau === 6 && choixThisSup === 0) {
      choixThisSup = '1-2-3-4-5-10-11-12-13'
    }
    const listeTypeQuestions = gestionnaireFormulaireTexte({
      saisie: choixThisSup,
      min: 1,
      max: 13,
      defaut: 1,
      melange: 0,
      // shuffle: false, //true bien pour les tests
      nbQuestions: nbElements,
    })

    type MotVocabulaire = {
      num: number
      txtEnonce: string
      txtCorrection: string
      txtFormule: string
      enchainement: string
      fct: (x: number, y: number) => number
    }
    const listeMots: MotVocabulaire[] = [
      {
        num: 1,
        txtEnonce: 'Son double',
        txtCorrection: 'le double de ',
        txtFormule: '=B1*2',
        enchainement: `$number1 \\times 2 = $`,
        fct: (x: number) => 2 * x,
      },
      {
        num: 2,
        txtEnonce: 'Son triple',
        txtCorrection: 'le triple de ',
        txtFormule: '=B1*3',
        enchainement: `$number1 \\times 3 = $`,
        fct: (x: number) => 3 * x,
      },
      {
        num: 3,
        txtEnonce: 'Sa moitié',
        txtCorrection: 'la moitié de ',
        txtFormule: '=B1/2',
        enchainement: `$number1 \\div 2 = $`,
        fct: (x: number) => x / 2,
      },
      {
        num: 4,
        txtEnonce: 'Son quart',
        txtCorrection: 'le quart de ',
        txtFormule: '=B1/4',
        enchainement: `$number1 \\div 4 = $`,
        fct: (x: number) => x / 4,
      },
      {
        num: 5,
        txtEnonce: 'Son dixième',
        txtCorrection: 'le dixième de ',
        txtFormule: '=B1/10',
        enchainement: `$number1 \\div 10 = $`,
        fct: (x: number) => x / 10,
      },
      {
        num: 6,
        txtEnonce: 'Son carré',
        txtCorrection: 'le carré de ',
        txtFormule: `=B1^2`,
        enchainement: `$number1^2 = number1 \\times number1 = $`,
        fct: (x: number) => x * x,
      },
      {
        num: 7,
        txtEnonce: 'Son cube',
        txtCorrection: 'le cube de ',
        txtFormule: '=B1^3',
        enchainement: `$number1^3 = number1 \\times number1 \\times number1 = $`,
        fct: (x: number) => x * x * x,
      },
      {
        num: 8,
        txtEnonce: 'Son opposé',
        txtCorrection: `l'opposé de `,
        txtFormule: '=-B1',
        enchainement: ``,
        fct: (x: number) => -x,
      },
      {
        num: 9,
        txtEnonce: 'Son inverse',
        txtCorrection: `l'inverse de `,
        txtFormule: '=1/B1',
        enchainement: `$\\dfrac{1}{number1}$`,
        fct: (x: number) => (x !== 0 ? 1 / x : NaN),
      },
      {
        num: 10,
        txtEnonce: 'La somme de number1 et number2',
        txtCorrection: 'la somme de ',
        txtFormule: '=B1+B2',
        enchainement: `$number1 + number2 = $`,
        fct: (x: number, y: number) => x + y,
      },
      {
        num: 11,
        txtEnonce: 'La différence entre number1 et number2',
        txtCorrection: 'la différence entre ',
        txtFormule: '=B1-B2',
        enchainement: `$number1 - number2 = $`,
        fct: (x: number, y: number) => x - y,
      },
      {
        num: 12,
        txtEnonce: 'Le produit de number1 par number2',
        txtCorrection: 'le produit de ',
        txtFormule: '=B1*B2',
        enchainement: `$number1 \\times number2 = $`,
        fct: (x: number, y: number) => x * y,
      },
      {
        num: 13,
        txtEnonce: 'Le quotient de number1 par number2',
        txtCorrection: 'le quotient de ',
        txtFormule: '=B1/B2',
        enchainement: `$number1 \\div number2 = $`,
        fct: (x: number, y: number) => (y !== 0 ? x / y : NaN),
      },
    ]
    // const colorsArr = Object.entries(ExerciceTableur.colors)
    for (let q = 0, cpt = 0; q < this.nbQuestions && cpt < 50; cpt++) {
      // const q = 0
      let texte = ''
      let texteCorr = ''
      listeNbLignes.push(nbLignes)
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

      cellDatas[0][0] = {
        v: 'Nombre de départ',
        s: '', // 'style_id_orange',
        t: 2,
      }
      cellDatas[0][1] = {
        v: `${nbDepart}`,
        s: '', // 'style_id_orange',
        t: 2,
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
                `entre $${nb2}$ et le nombre de départ`,
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
        listeMotsQR.push({
          ref: `B${i - q * nbLignes + 2}`,
          txtQuestion: enonce,
          txtFormule: formule,
        })
      }
      for (let i = q * nbLignes; i < (q + 1) * nbLignes; i++) {
        cellDatas.push([]) // creer une ligne par question
        cellDatas[i - q * nbLignes + 1][0] = {
          v: `${listeMotsQR[i].txtQuestion}`,
          s: 'text-align: left',
          t: 2,
        }
      }

      // data et style pour le tableur interactif
      const data: (number | string)[][] = [[]]
      data[0][0] = cellDatas[0][0].v
      data[0][1] = cellDatas[0][1].v
      /*     for (let i = 0; i < steps.length; i++) {
      data[0][i + 1] = cellDatas[0][i + 1].v
     } */
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
        listeMotsQR[q * nbLignes].txtQuestion.charAt(0).toLowerCase() +
        listeMotsQR[q * nbLignes].txtQuestion.slice(1)
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

      texte +=
        renderSheetMarkup({
          numeroExercice: this.numeroExercice,
          questionIndex: q,
          data,
          minDimensions: [nbColTableur, 2],
          style,
          columns: [
            { width: 180 },
            { width: 90 },
            { width: 90 },
            { width: 90 },
          ],
          interactif: this.interactif,
          showVerifyButton: true,
          latexData: cellDatas,
          latexStyles: ExerciceTableur.styles,
          latexOptions,
          appendFeedbackBlocks: this.interactif,
        }) +
        DomReadyActionElement.create({
          action: sheetCheckListenerAction,
          payload: {
            numeroExercice: this.numeroExercice,
            question: q,
          },
        })

      texteCorr = 'Voici les formules à saisir dans le tableur :<br>'
      for (let i = 0; i < nbLignes; i++) {
        const index = i + q * nbLignes
        const lOperation = Number(listeTypeQuestions[index])
        let formule = listeMotsQR[index].txtFormule
        if (!context.isHtml && formule.includes('^')) {
          formule = formule.replace(/\^/g, `\\^{}`)
        }
        texteCorr += `Pour calculer ${listeMots[lOperation - 1].txtCorrection}${nbDepart}, la formule à saisir dans la cellule ${listeMotsQR[index].ref} est : ${formule}.<br>`
      }
      /****************************************************/
      if (this.questionJamaisPosee(q, texte)) {
        this.listeQuestions[q] = texte
        this.listeCorrections[q] = texteCorr
        q++
      }
      listeQuestionsToContenu(this)
    }
  }

  correctionInteractive = (i: number) => {
    if (i === undefined) return ''
    if (this.answers === undefined) this.answers = {}
    let result = 'KO'
    const sheetId = `my-spreadsheetEx${this.numeroExercice}Q${i}`
    const legacySheetId = `sheet-Ex${this.numeroExercice}Q${i}`
    const sheetElement = (document.getElementById(sheetId) ??
      document.getElementById(legacySheetId)) as MySpreadsheetElement
    if (!sheetElement) {
      console.error(`${sheetId} not found`)
      return result
    }
    if (sheetElement && sheetElement.isMounted()) {
      this.answers[sheetId] = JSON.stringify(sheetElement.getData())
      const spanResultat = document.querySelector(
        `#resultatCheckEx${this.numeroExercice}Q${i}`,
      )
      const divFeedback = document.querySelector<HTMLElement>(
        `#feedbackEx${this.numeroExercice}Q${i}`,
      )

      const { isOk, messages } = this.validateFormulas(
        i,
        sheetElement,
        listeMotsQR,
        listeNbLignes,
      )
      if (messages.length > 0 && spanResultat && divFeedback) {
        divFeedback.innerHTML = messages
        if (!isOk) {
          if (spanResultat) spanResultat.innerHTML = '☹️'
        } else {
          if (spanResultat) spanResultat.innerHTML = '😎'
          result = 'OK'
        }
      }
    }
    return result
  }
}

let listeMotsQR: MotsQR[] = []
let listeNbLignes: number[] = []
let nbLignes = 0

function registerSheetCheckListener() {
  if (sheetCheckListenerRegistered) return
  sheetCheckListenerRegistered = true
  DomReadyActionElement.registerCallback<{
    numeroExercice: number
    question: number
  }>(sheetCheckListenerAction, ({ payload }) => {
    const exercice = exercicesTableur.get(payload.numeroExercice)
    const sheet = MySpreadsheetElement.findSheetElement(
      payload.numeroExercice,
      payload.question,
    )
    const eventName = `checkEx${payload.numeroExercice}Q${payload.question}`
    if (!exercice || !sheet) {
      console.error(
        `SheetElement not found or eventName invalid for question ${payload.question} in exercice ${payload.numeroExercice}`,
      )
      return
    }

    const listener = (event: Event) => {
      exercice.checkSolution(event as CustomEvent, listeMotsQR)
    }
    sheet.addListener(eventName, listener)
    return () => sheet.removeEventListener(eventName, listener)
  })
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

type MotsQR = {
  ref: string
  txtQuestion: string
  txtFormule: string
}

function toRefCellule(ref: string): { col: number; lig: number } {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const match = ref.match(/^([A-Z])(\d+)$/)
  if (!match) {
    throw new Error(`Invalid cell reference: ${ref}`)
  }
  const col = alphabet.indexOf(match[1])
  const lig = parseInt(match[2]) - 1
  return { col, lig }
}
