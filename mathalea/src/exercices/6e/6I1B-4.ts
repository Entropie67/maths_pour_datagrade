import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { DomReadyActionElement } from '../../lib/customElements/DomReadyAction'
import { MySpreadsheetElement } from '../../lib/customElements/MySpreadSheet'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { range1 } from '../../lib/outils/nombres'
import { listeDesDiviseurs } from '../../lib/outils/primalite'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'

import { orangeMathalea, vertMathalea } from '../../lib/colors'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Programmer des calculs sur tableur'
export const dateDePublication = '12/08/2025'

export const interactifReady = true

/*
 * Programmer des calculs sur tableur : New programme de 6eme 2025
 * @author Mickael Guironnet
 * revisité par Jean-claude Lhote (intoduction du custom élément sheet-element) et modification de la librairie utilisée.
 */

export const uuid = 'ae07c'

export const refs = {
  'fr-fr': ['6I1B-4'],
  'fr-ch': [],
}
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const sheetCheckListenerAction = '6I1B-4:sheet-check-listener'
const exercicesTableur = new Map<number, ExerciceTableur>()

export default class ExerciceTableur extends Exercice {
  listeSteps: Steps[] = []

  constructor() {
    super()
    this.nbQuestions = 2
    this.besoinFormulaireNumerique = [
      "Nombre d'opérations (entre 2 et 5 ou bien 1 si vous laissez le hasard décider)",
      5,
    ]
    this.besoinFormulaire2Texte = [
      "Type d'opérations",
      [
        'Nombres séparés par des tirets  :',
        '1 : Addition',
        '2 : Soustraction',
        '3 : Multiplication',
        '4 : Division',
        '5 : Mélange',
      ].join('\n'),
    ]
    this.sup = 3
    this.sup2 = 5
    this.listeSteps = []
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
  ): { isOk: boolean; messages: string } {
    // 1. Récupère les données de l'utilisateur
    const userData = userSheet.getData()
    const nbSteps = this.listeSteps[q].length
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

    const messages: string[][] = []
    for (let n = 0; n < nbSteps; n++) {
      messages[n] = []
      const a1 = randint(1, 10)
      testSheet.setCellValue(0, 0, a1) // A1
      const resultats = range1(nbSteps).map((i) =>
        parseFloat(String(testSheet.getCellValue(i, 0))),
      )

      // compare les résultats
      for (let i = 1; i < nbSteps + 1; i++) {
        if (testSheet.getCellFormula(i, 0) === '') {
          messages[n].push(
            `La cellule ${String.fromCharCode(65 + i)}1 est vide.<br>`,
          )
        } else if (!testSheet.getCellFormula(i, 0).startsWith('=')) {
          messages[n].push(
            `La cellule ${String.fromCharCode(65 + i)}1 ne contient pas une formule valide.<br>`,
          )
        } else if (
          typeof resultats[i - 1] !== 'number' ||
          isNaN(resultats[i - 1])
        ) {
          messages[n].push(
            `La cellule ${String.fromCharCode(65 + i)}1 ne contient pas un nombre valide.<br>`,
          )
        }
      }
      let result = a1
      if (messages[n].length === 0) {
        for (let i = 1; i < nbSteps + 1; i++) {
          const steps = this.listeSteps[q]
          result = evaluate(result, steps[i - 1].op, steps[i - 1].val)
          const computed = parseFloat(String(testSheet.getCellValue(i, 0)))
          if (Math.abs(computed - result) > 1e-9) {
            messages[n].push(
              `Mauvaise formule dans la cellule ${String.fromCharCode(65 + i)}1.<br>`,
            )
          }
        }
      }
    }
    const maxMessages = messages.reduce(
      (max, arr) => (arr.length > max.length ? arr : max),
      [],
    )

    document.body.removeChild(testSheet)
    const feedback =
      maxMessages.length === 0
        ? '✅ Toutes les formules sont correctes !'
        : '❌ Des erreurs ont été détectées.'
    return {
      isOk: maxMessages.length === 0,
      messages: maxMessages.join('') + feedback,
    }
  }

  checkSolution(event?: CustomEvent) {
    const eventName = event?.type
    const q = Number(eventName?.match(/Q(\d+)/)?.[1])
    if (!Number.isInteger(q)) {
      console.error('Question number not found in event name:', eventName)
      return
    }
    const sheetElt =
      event?.detail?.sheet ??
      MySpreadsheetElement.findSheetElement(this.numeroExercice ?? 0, q)

    if (sheetElt && sheetElt.isMounted()) {
      const { messages } = this.validateFormulas(q, sheetElt)
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
    const nbOperations =
      this.sup === 1 ? randint(2, 5) : Math.min(Math.max(2, this.sup), 5)

    const typesDeOperations = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: nbOperations,
    })
    this.listeSteps = []
    const colorsArr = Object.entries(ExerciceTableur.colors)
    for (
      let q = 0, cpt = 0, texte, texteCorr: string;
      q < this.nbQuestions && cpt < 50;
      cpt++
    ) {
      const { steps } = programmeCalcul(typesDeOperations as number[])
      this.listeSteps[q] = steps
      const operStr = transformationsOper(steps)
      type CellData =
        | { v: string; s: string; t?: 1; formule?: string }
        | { v: number; s: string; t?: 2; formule?: string }
      type CellGrid = Record<number, Record<number, CellData>>
      const cellDatas: CellGrid = {
        0: {
          0: { v: steps[0].oldn, s: 'style_id_orange', t: 2 },
        },
      }
      for (let i = 0; i < steps.length; i++) {
        cellDatas[0][i + 1] = {
          v: '',
          s: `style_id_${colorsArr[(i + 1) % colorsArr.length][0]}`,
        }
      }

      const data: (number | string)[][] = [[]]
      data[0][0] = cellDatas[0][0].v
      for (let i = 0; i < steps.length; i++) {
        data[0][i + 1] = cellDatas[0][i + 1].v
      }

      const rect: Record<string, { bg?: string; v?: string }> = {
        0: { v: steps[0].oldn.toString(), bg: colorsArr[0][1] },
      }
      for (let i = 0, k = 1; i < steps.length; i++, k += 2) {
        rect[`${k}`] = { v: operStr[i] }
        rect[`${k + 1}`] = { bg: colorsArr[(i + 1) % colorsArr.length][1] }
      }

      texte = 'On a créé le programme de calculs suivant :<br>'
      texte += createDigramm(Object.keys(rect).length, rect) + '<br>'

      texte += `On choisit un nombre dans la première case, ici $${steps[0].oldn}$ et on obtient un nombre à la fin de la chaîne.<br><br>
      On veut programmer cette suite de calculs dans un tableur. <br>`
      if (this.interactif) {
        texte += `Par exemple, la cellule B1 doit contenir la formule du premier calcul.<br>
      Faire de même pour les autres cellules. <br>
      Attention, les formules doivent fonctionner même si le nombre de départ change (Cellule A1).<br>
      `
      } else {
        texte += `Les formules doivent fonctionner même si le nombre de départ change (cellule A1).<br>`
        for (let i = 0; i < steps.length; i++) {
          texte += `Quelle formule saisir dans la cellule ${alphabet[i + 1]}1 ?<br>`
        }
      }
      const style = buildStyleFromColos(
        Object.values(ExerciceTableur.colors),
        steps.length,
      )

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

      const sheetElement = MySpreadsheetElement.createEltToAppendToDom({
        id: `my-spreadsheetEx${this.numeroExercice ?? 0}Q${q}`,
        data,
        minDimensions: [4, 4],
        style,
        columns: [{ width: 90 }, { width: 90 }, { width: 90 }, { width: 90 }],
        interactif: this.interactif,
        showVerifyButton: true,
      })
      sheetElement.setAttribute('latex-data', JSON.stringify(cellDatas))
      sheetElement.setAttribute(
        'latex-styles',
        JSON.stringify(ExerciceTableur.styles),
      )
      sheetElement.setAttribute('latex-options', JSON.stringify(latexOptions))

      const sheetMarkup =
        context.isHtml && !context.isTypst
          ? sheetElement.outerHTML +
            DomReadyActionElement.create({
              action: sheetCheckListenerAction,
              payload: {
                numeroExercice: this.numeroExercice,
                question: q,
              },
            }) +
            (this.interactif
              ? `<div class="ml-2 py-2" id="resultatCheckEx${this.numeroExercice}Q${q}"></div>
<div class ="ml-2 py-2 italic text-coopmaths-warn-darkest dark:text-coopmathsdark-warn-darkest" id="feedbackEx${this.numeroExercice}Q${q}"></div>`
              : '')
          : sheetElement.render()
      texte += context.isHtml && !context.isTypst
        ? `<div class="my-3">${sheetMarkup}</div>`
        : `\\medskip ${sheetMarkup}\\medskip `

      texteCorr = 'Voici les formules à saisir dans le tableur :<br>'
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i]
        texteCorr += `$${step.oldn} ${operStr[i]} = ${step.result}$ devient en cellule ${alphabet[i + 1]}1 la formule suivante : «\u00a0${texteEnCouleurEtGras(`=${alphabet[i]}1${operStr[i].replace('\\times', '*').replace('\\div', '/')}`)}\u00a0»<br>`
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

      const { isOk, messages } = this.validateFormulas(i, sheetElement)
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

let sheetCheckListenerRegistered = false

function registerSheetCheckListener() {
  if (sheetCheckListenerRegistered) return
  sheetCheckListenerRegistered = true
  DomReadyActionElement.registerCallback<{
    numeroExercice: number
    question: number
  }>(sheetCheckListenerAction, ({ payload }) => {
    const exercice = exercicesTableur.get(payload.numeroExercice)
    const sheet = document.getElementById(
      `my-spreadsheetEx${payload.numeroExercice}Q${payload.question}`,
    ) as MySpreadsheetElement | null
    const eventName = `checkEx${payload.numeroExercice}Q${payload.question}`
    if (!exercice || !sheet) {
      console.error(
        `SheetElement not found or eventName invalid for question ${payload.question} in exercice ${payload.numeroExercice}`,
      )
      return
    }

    const listener = (event: Event) => {
      exercice.checkSolution(event as CustomEvent)
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
    const color = colos[i] ? `background: ${colos[i]}` : 'background:  #ffffff'
    style[key] = color
  }
  return style
}

function transformationsOper(
  steps: {
    oldn: number
    op: number
    val: number
    result: number
  }[],
) {
  function stepsToSymbols(
    steps: {
      oldn: number
      op: number
      val: number
      result: number
    }[],
  ) {
    const mapOps: Record<number, string> = {
      1: '+',
      2: '−', // tiret long pour la soustraction
      3: '\\times',
      4: '\\div',
    }
    return steps.map((step) => (mapOps[step.op] || '?') + step.val)
  }
  return stepsToSymbols(steps)
}

function evaluate(a: number, op: number, b: number) {
  if (op === 1) return a + b
  if (op === 2) return a - b
  if (op === 3) return a * b
  if (op === 4) return a / b
  return NaN
}

/**
 * Génère une suite d'opérations arithmétiques (+, −, ×, ÷) appliquées à un nombre de départ,
 * en s’assurant que chaque opération est valide et que le résultat reste dans des limites acceptables.
 *
 * La fonction mélange aléatoirement l’ordre des opérations et choisit les opérandes de façon à ce que
 * chaque étape soit faisable (par exemple : pas de résultats négatifs, division donnant un entier, etc.).
 * Elle essaie jusqu’à 20 fois de trouver une suite valide.
 *
 * @param operations - Un tableau de nombres représentant les opérations à effectuer :
 *   1 pour addition (+), 2 pour soustraction (−), 3 pour multiplication (×), 4 pour division (÷).
 *   Par défaut : [1, 2, 3, 4].
 *
 * @returns Un objet contenant :
 *   - `ops` : L’ordre final des opérations utilisées.
 *   - `steps` : Un tableau d’objets représentant chaque étape, avec :
 *       - `oldn` : Le nombre avant l’opération.
 *       - `op` : L’opération effectuée.
 *       - `val` : L’opérande utilisée.
 *       - `result` : Le résultat après l’opération.
 *   - `final` : Le résultat final après toutes les opérations, ou `null` si échec.
 * @example
 *
 * const resultat = programmeCalcul([1, 2, 3, 4]);
 *
 *
 * {
 *   ops: [3, 1, 4, 2], // ordre : × puis + puis ÷ puis −
 *   steps: [
 *     { oldn: 5, op: 3, val: 4, result: 20 }, // 5 × 4 = 20
 *     { oldn: 20, op: 1, val: 3, result: 23 }, // 20 + 3 = 23
 *     { oldn: 23, op: 4, val: 1, result: 23 }, // 23 ÷ 1 = 23
 *     { oldn: 23, op: 2, val: 5, result: 18 }  // 23 − 5 = 18
 *   ],
 *   final: 18
 * }
 */

type Step = {
  oldn: number
  op: number
  val: number
  result: number
}
type Steps = Step[]
type ProgrammeCalculResult = {
  ops: number[]
  steps: Steps
  final: number | null
}
function programmeCalcul(
  operations: number[] = [1, 2, 3, 4],
): ProgrammeCalculResult {
  let steps: {
    oldn: number
    op: number
    val: number
    result: number
  }[] = []
  let final = null
  let ops: number[] = operations

  let k = 0
  let success = false
  while (!success && k < 20) {
    ops = shuffle(ops) // ordre aléatoire des opérations
    let n = randint(5, 20) // nombre de départ
    steps = [] // les étapes de calcul
    success = true
    for (let ind = 0, tt = 0; ind < ops.length && tt < 4;) {
      if (tt > 0) {
        // tt : le nombre de tentatives
        // on change l'ordre des opérations si ça bloque
        const firstPart = ops.slice(0, ind)
        const shuffledPart = shuffle(ops.slice(ind))
        ops = [...firstPart, ...shuffledPart]
      }
      const op = ops[ind]
      const oldn = n
      let val: number = 1
      const oldval: number = ind > 0 ? steps[ind - 1].val : 1
      if (op === 1) {
        // +
        if (50 - n < 2 || (50 - n === 2 && oldval === 2)) {
          tt++
          continue
        } else {
          val = randint(2, 50 - n, [oldval])
          n += val
          ind++
          tt = 0
        }
      } else if (op === 2) {
        // -
        if (n < 2 || (n === 2 && oldval === 2)) {
          tt++
          continue
        } else {
          val = randint(2, n, [oldval])
          n -= val
          ind++
          tt = 0
        }
      } else if (op === 3) {
        // ×
        const maxMult = n < 1 ? 5 : Math.floor(50 / n)
        if (maxMult < 2 || (maxMult === 2 && oldval === 2)) {
          tt++
          continue
        } else {
          val = randint(2, maxMult, [oldval])
          n *= val
          ind++
          tt = 0
        }
      } else if (op === 4) {
        // ÷
        const divs = listeDesDiviseurs(n).filter((d) => d > 1 && d < n)
        if (divs.length === 0 || (divs.length === 1 && divs[0] === oldval)) {
          tt++
          continue
        } else {
          val = choice<number>(divs, [oldval])
          n /= val
          ind++
          tt = 0
        }
      }

      // sécurité bornes
      if (n < 0 || n > 50 || !Number.isInteger(n)) {
        tt += 10 // on devrait jamais être ici! donc on sort
        continue
      }
      steps.push({ oldn, op, val, result: n })
    }
    if (steps.length !== ops.length) {
      success = false
    }
    if (success) final = n
    k++
  }
  // Les essais au hasard ont échoué (par exemple avec seulement des divisions
  // ou des soustractions) : on cherche une chaîne méthodiquement. Si aucune
  // n'existe (3 multiplications dépassent 50), on retire des opérations.
  if (!success) {
    for (let nb = ops.length; nb >= 1; nb--) {
      const chaine = chaineParRecherche(ops.slice(0, nb))
      if (chaine !== null) {
        steps = chaine
        ops = chaine.map((step) => step.op)
        final = chaine[chaine.length - 1].result
        break
      }
    }
  }

  return { ops, steps, final }
}

/**
 * Valeurs possibles pour appliquer `op` à `n`, avec les règles de
 * `programmeCalcul` : résultats entre 0 et 50, valeur différente de la précédente.
 */
function valeursPossibles(op: number, n: number, precedent: number): number[] {
  let valeurs: number[] = []
  if (op === 1) valeurs = range1(50 - n).filter((val) => val >= 2)
  else if (op === 2) valeurs = range1(n).filter((val) => val >= 2)
  else if (op === 3) {
    const maxMult = n < 1 ? 5 : Math.floor(50 / n)
    valeurs = range1(maxMult).filter((val) => val >= 2)
  } else if (op === 4) {
    valeurs = listeDesDiviseurs(n).filter((d) => d > 1 && d < n)
  }
  return valeurs.filter((val) => val !== precedent)
}

/**
 * Cherche une chaîne qui utilise toutes les opérations de `operations`, dans
 * un ordre quelconque, en partant d'un nombre entre 5 et 20 (puis entre 21 et
 * 50 si besoin, par exemple pour 3 divisions). Renvoie null si aucune n'existe.
 */
function chaineParRecherche(operations: number[]): Steps | null {
  const impasses = new Set<string>()
  const prolonge = (
    n: number,
    precedent: number,
    restantes: number[],
  ): Steps | null => {
    if (restantes.length === 0) return []
    const cle = `${n}|${precedent}|${[...restantes].sort().join('')}`
    if (impasses.has(cle)) return null
    for (const op of shuffle([...new Set(restantes)])) {
      const autres = [...restantes]
      autres.splice(autres.indexOf(op), 1)
      for (const val of shuffle(valeursPossibles(op, n, precedent))) {
        const result =
          op === 1 ? n + val : op === 2 ? n - val : op === 3 ? n * val : n / val
        const suite = prolonge(result, val, autres)
        if (suite !== null) return [{ oldn: n, op, val, result }, ...suite]
      }
    }
    impasses.add(cle)
    return null
  }
  const departs = [
    ...shuffle(range1(20).filter((n) => n >= 5)),
    ...shuffle(range1(50).filter((n) => n > 20)),
  ]
  for (const depart of departs) {
    const chaine = prolonge(depart, 1, operations)
    if (chaine !== null) return chaine
  }
  return null
}

function createDigramm(
  nbre: number,
  rects: Record<string, { bg?: string; v?: string }>,
) {
  const longueur = 1.8
  const largeur = 1.5
  const gap = 0.8
  const objets = []
  for (let i = 0; i < nbre; i++) {
    const A = pointAbstrait(i * longueur + i * gap, 0)
    const B = pointAbstrait(A.x + longueur, 0)
    const C = pointAbstrait(B.x, largeur)
    const D = pointAbstrait(A.x, largeur)
    const rect = rects[i]
    const rectangle = polygone(A, B, C, D)
    if (rect && rect.bg) {
      rectangle.couleurDeRemplissage = colorToLatexOrHTML(rect.bg)
      rectangle.opaciteDeRemplissage = 1
    }
    objets.push(rectangle)
    if (rect && rect.v) {
      const tex = latex2d(`${rect.v}`, (A.x + B.x) / 2, (A.y + D.y) / 2, {
        color: 'red',
        backgroundColor: 'none',
        letterSize: context.isHtml ? 'small' : 'normalsize',
        orientation: 0,
        opacity: 1,
      })
      objets.push(tex)
    }
    if (i > 0) {
      const seg = segment(
        A.x - gap,
        largeur / 2,
        A.x,
        largeur / 2,
        orangeMathalea,
      )
      seg.styleExtremites = '->'
      objets.push(seg)
    }
  }
  const xmin = -0.5
  const ymin = -0.5
  const xmax = +longueur * nbre + gap * (nbre - 1) + 0.5
  const ymax = largeur + 0.5

  return mathalea2d(
    {
      xmin,
      ymin,
      xmax,
      ymax,
      mainlevee: false,
      scale: context.isHtml ? 1 : 0.5,
      center: !context.isHtml,
      optionsTikz: ['baseline=(current bounding box.north)'],
    },
    objets,
  )
}
