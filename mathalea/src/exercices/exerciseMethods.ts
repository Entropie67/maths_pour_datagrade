import Figure from 'apigeom/src/Figure'
import type Decimal from 'decimal.js'
import seedrandom from 'seedrandom'
import type { IExercice, IExerciceSimple } from '../lib/types'
import { alignerCorrectionsQcmEcrites } from '../lib/interactif/alignerMiseEnEvidenceQcm'
import { attachExerciseCustomCallbacks } from '../lib/customElements/MetaCustomElement'
import { CRC32 } from '../modules/crc32'
import FractionEtendue from '../modules/FractionEtendue'
import type { IFractionEtendue } from '../modules/FractionEtendue.type'
type EventListener = (evt: Event) => void

export function exportedNouvelleVersionWrapper(
  this: IExercice,
  numeroExercice?: number,
  numeroQuestion?: number,
): void {
  const signature = [
    this.seed,
    this.sup,
    this.sup2,
    this.sup3,
    this.sup4,
    this.sup5,
    this.correctionDetaillee,
    this.interactif,
    this.nbQuestions,
    numeroExercice,
    numeroQuestion,
  ]
    .map(String)
    .join('')
  if (this.lastCallback === signature) {
    // identique
    // pas de recalcul à faire
    return
  }
  this.lastCallback = signature
  this.reinit()
  seedrandom(this.seed, { global: true })
  this.nouvelleVersion(numeroExercice, numeroQuestion)
  alignerCorrectionsQcmEcrites(this)
  attachExerciseCustomCallbacks(this)
  this.checkSum = CRC32.hexQuestions(this.listeQuestions)
}

export function exportedReinit(this: IExerciceSimple) {
  this.listeQuestions = []
  this.listeCorrections = []
  this.listeReponsesCourtes = []
  this.reponseCourteExplicite = undefined
  this.listeCanEnonces = []
  this.listeCanReponsesACompleter = []
  this.listeCanLiees = []
  this.listeCanNumerosLies = []
  this.listeArguments = []
  this.autoCorrection = []
  this.autoCorrectionAMC = []
  this.distracteurs = []
  this.tiragesParQuestion = undefined
  this.checkSum = undefined
  if (this.figuresApiGeom) {
    // figures apigeom auto-enregistrées par figureApigeom()
    this.figuresApiGeom.forEach((fig) => {
      if (fig instanceof Figure) {
        fig.destroy()
      }
    })
    this.figuresApiGeom = []
  }
  if (this.figuresApiGeomCorr) {
    // figures apigeom auto-enregistrées par figureApigeom()
    this.figuresApiGeomCorr.forEach((fig) => {
      if (fig instanceof Figure) {
        fig.destroy()
      }
    })
    this.figuresApiGeomCorr = []
  }

  this.cliqueFiguresArray = []
  if (this.dragAndDrops && this.dragAndDrops.length > 0) {
    for (const leDragAndDrop of this.dragAndDrops) {
      if (leDragAndDrop == null) continue
      for (const [element, type, listener] of leDragAndDrop.listeners) {
        element.removeEventListener(type, listener as EventListener)
      }
    }
    this.dragAndDrops = []
  }
}

export function exportedApplyNewSeed(this: IExercice) {
  const seed = generateSeed({
    includeUpperCase: true,
    includeNumbers: true,
    length: 4,
    startsWithLowerCase: false,
  })
  this.seed = seed
}

function empreinteTexte(str: string): string {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ c, 2654435761)
    h2 = Math.imul(h2 ^ c, 1597334677)
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  const hash = (4294967296 * (2097151 & h2) + (h1 >>> 0))
    .toString(16)
    .padStart(16, '0')
  return hash.length > str.length ? str : hash
}

/**
 * Compare chaque nouvelle version d'un exercice aux précédentes pour s'assurer de ne pas avoir deux exercices identiques
 * @param {int} i indice de la question
 * @param  {...any} args toutes les variables pertinentes qui "résumeraient" la question
 * @returns {boolean} true si la question n'a jamais été posée
 */
export function exportedQuestionJamaisPosee(
  this: IExercice,
  i: number,
  ...args: (string | number | IFractionEtendue | Decimal)[]
) {
  if (i === 0) this.listeArguments = []
  let argsConcatenes = ''
  for (const arg of args) {
    if (arg !== undefined)
      argsConcatenes +=
        arg instanceof FractionEtendue ? arg.texFraction : arg.toString()
  }
  const empreinte = empreinteTexte(argsConcatenes)
  if (
    this.listeArguments != null &&
    this.listeArguments.indexOf(empreinte) > -1
  ) {
    return false
  } else if (this.listeArguments != null) {
    this.listeArguments.push(empreinte)
    return true
  }
}

function generateSeed({
  includeUpperCase = true,
  includeNumbers = true,
  length = 4,
  startsWithLowerCase = false,
}: {
  includeUpperCase?: boolean
  includeNumbers?: boolean
  length?: number
  startsWithLowerCase?: boolean
} = {}) {
  let a = 10
  const b = 'abcdefghijklmnopqrstuvwxyz'
  let c = ''
  let d = 0
  let e = '' + b
  if (startsWithLowerCase) {
    c = b[Math.floor(Math.random() * b.length)]
    d = 1
  }
  if (length) {
    a = length
  }
  if (includeUpperCase) {
    e += b.toUpperCase()
  }
  if (includeNumbers) {
    e += '1234567890'
  }

  for (; d < a; d++) {
    c += e[Math.floor(Math.random() * e.length)]
  }
  return c
}
