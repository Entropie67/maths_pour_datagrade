import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = '3a275'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Factoriser ou développer une différence de deux carrés'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ8AGns2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    nombres: { tex: string; val: number; denom: number; isDecimal: boolean }[],
    isPlusGrand: boolean,
    forcedLetters?: boolean, // Utilisé pour forcer l'ordre exact de l'image originale
  ): void {
    // Mélange des 4 nombres pour les attribuer aléatoirement à A, B, C et D
    const variables = forcedLetters ? nombres : shuffle([...nombres])
    const A = variables[0]
    const B = variables[1]
    const C = variables[2]
    const D = variables[3]

    this.enonce = `On considère les nombres suivants : $A = ${A.tex}$, $B = ${B.tex}$, $C = ${C.tex}$ et $D = ${D.tex}$.<br><br>`
    const adjectif = isPlusGrand ? 'plus grand' : 'plus petit'
    this.enonce += `Le ${adjectif} de ces nombres est :`

    // Recherche de la valeur cible (min ou max)
    const targetVal = isPlusGrand
      ? Math.max(A.val, B.val, C.val, D.val)
      : Math.min(A.val, B.val, C.val, D.val)

    // Identification de la lettre correspondante
    let correctLetter = ''
    if (A.val === targetVal) correctLetter = 'A'
    else if (B.val === targetVal) correctLetter = 'B'
    else if (C.val === targetVal) correctLetter = 'C'
    else correctLetter = 'D'

    // Construction du tableau de réponses
    const allLetters = ['A', 'B', 'C', 'D']
    const distractors = allLetters.filter((l) => l !== correctLetter)
    this.reponses = [
      `$${correctLetter}$`,
      `$${distractors[0]}$`,
      `$${distractors[1]}$`,
      `$${distractors[2]}$`,
    ]

    // --- CORRECTION PÉDAGOGIQUE ---
    // On trouve quel est le nombre décimal pour l'expliquer
    const decVar = variables.find((v) => v.isDecimal)
    let letterDec = ''
    if (decVar === A) letterDec = 'A'
    else if (decVar === B) letterDec = 'B'
    else if (decVar === C) letterDec = 'C'
    else letterDec = 'D'

    this.correction = `Pour comparer ces nombres facilement, on peut tous les écrire sous la forme d'une fraction de numérateur $1$.<br>`
    if (decVar) {
      this.correction += `On sait que $${letterDec} = ${decVar.tex} = \\dfrac{1}{${decVar.denom}}$.<br><br>`
    }

    this.correction += `Pour des fractions de même numérateur positif, la plus grande est celle qui a le plus petit dénominateur.<br><br>`

    // Tri des variables par ordre croissant de valeur (donc décroissant de dénominateur)
    const sorted = [...variables].sort((a, b) => a.val - b.val)
    const getLetter = (v: object) => {
      if (v === A) return 'A'
      if (v === B) return 'B'
      if (v === C) return 'C'
      return 'D'
    }

    // Affichage des dénominateurs classés
    const sortedDenoms = [...variables].sort((a, b) => b.denom - a.denom) // Ordre décroissant des dénominateurs
    const denomStr = `${sortedDenoms[0].denom} > ${sortedDenoms[1].denom} > ${sortedDenoms[2].denom} > ${sortedDenoms[3].denom}`

    this.correction += `On compare les dénominateurs : $${denomStr}$.<br>`

    const orderStr = `\\dfrac{1}{${sortedDenoms[0].denom}} < \\dfrac{1}{${sortedDenoms[1].denom}} < \\dfrac{1}{${sortedDenoms[2].denom}} < \\dfrac{1}{${sortedDenoms[3].denom}}`
    this.correction += `On en déduit l'ordre croissant des fractions : $${orderStr}$.<br>`

    const finalOrderStr = `${getLetter(sorted[0])} < ${getLetter(sorted[1])} < ${getLetter(sorted[2])} < ${getLetter(sorted[3])}`
    this.correction += `Soit : $${finalOrderStr}$.<br><br>`

    this.correction += `Le ${adjectif} de ces nombres est donc $${miseEnEvidence(correctLetter)}$.`
  }

  versionOriginale: () => void = () => {
    // Reproduction exacte de la question 8 de l'image (Plus petit)
    const originalNombres = [
      { tex: '\\dfrac{1}{8}', val: 1 / 8, denom: 8, isDecimal: false },
      { tex: '\\dfrac{1}{9}', val: 1 / 9, denom: 9, isDecimal: false },
      { tex: '\\dfrac{1}{12}', val: 1 / 12, denom: 12, isDecimal: false },
      { tex: '0,1', val: 0.1, denom: 10, isDecimal: true },
    ]
    this.appliquerLesValeurs(originalNombres, false, true)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    // Les 10 configurations différentes (mélange de fractions et un décimal qui se transforme en 1/x)
    const lesCas: {
      tex: string
      val: number
      denom: number
      isDecimal: boolean
    }[][] = [
      // 1: Identique original (décimal au milieu)
      [
        { tex: '\\dfrac{1}{8}', val: 1 / 8, denom: 8, isDecimal: false },
        { tex: '\\dfrac{1}{9}', val: 1 / 9, denom: 9, isDecimal: false },
        { tex: '\\dfrac{1}{12}', val: 1 / 12, denom: 12, isDecimal: false },
        { tex: '0,1', val: 0.1, denom: 10, isDecimal: true },
      ],
      // 2: Décimal est le plus grand (0,5 = 1/2)
      [
        { tex: '\\dfrac{1}{3}', val: 1 / 3, denom: 3, isDecimal: false },
        { tex: '\\dfrac{1}{4}', val: 1 / 4, denom: 4, isDecimal: false },
        { tex: '\\dfrac{1}{6}', val: 1 / 6, denom: 6, isDecimal: false },
        { tex: '0,5', val: 0.5, denom: 2, isDecimal: true },
      ],
      // 3: Décimal est au milieu (0,25 = 1/4)
      [
        { tex: '\\dfrac{1}{2}', val: 1 / 2, denom: 2, isDecimal: false },
        { tex: '\\dfrac{1}{3}', val: 1 / 3, denom: 3, isDecimal: false },
        { tex: '\\dfrac{1}{5}', val: 1 / 5, denom: 5, isDecimal: false },
        { tex: '0,25', val: 0.25, denom: 4, isDecimal: true },
      ],
      // 4: Décimal est au milieu (0,2 = 1/5)
      [
        { tex: '\\dfrac{1}{3}', val: 1 / 3, denom: 3, isDecimal: false },
        { tex: '\\dfrac{1}{4}', val: 1 / 4, denom: 4, isDecimal: false },
        { tex: '\\dfrac{1}{7}', val: 1 / 7, denom: 7, isDecimal: false },
        { tex: '0,2', val: 0.2, denom: 5, isDecimal: true },
      ],
      // 5: Décimal est le plus petit (0,1 = 1/10)
      [
        { tex: '\\dfrac{1}{2}', val: 1 / 2, denom: 2, isDecimal: false },
        { tex: '\\dfrac{1}{3}', val: 1 / 3, denom: 3, isDecimal: false },
        { tex: '\\dfrac{1}{4}', val: 1 / 4, denom: 4, isDecimal: false },
        { tex: '0,1', val: 0.1, denom: 10, isDecimal: true },
      ],
      // 6: Décimal est le plus grand (0,1 = 1/10)
      [
        { tex: '\\dfrac{1}{15}', val: 1 / 15, denom: 15, isDecimal: false },
        { tex: '\\dfrac{1}{20}', val: 1 / 20, denom: 20, isDecimal: false },
        { tex: '\\dfrac{1}{50}', val: 1 / 50, denom: 50, isDecimal: false },
        { tex: '0,1', val: 0.1, denom: 10, isDecimal: true },
      ],
      // 7: Décimal est au milieu (0,2 = 1/5)
      [
        { tex: '\\dfrac{1}{2}', val: 1 / 2, denom: 2, isDecimal: false },
        { tex: '\\dfrac{1}{4}', val: 1 / 4, denom: 4, isDecimal: false },
        { tex: '\\dfrac{1}{10}', val: 1 / 10, denom: 10, isDecimal: false },
        { tex: '0,2', val: 0.2, denom: 5, isDecimal: true },
      ],
      // 8: Décimal est le plus petit (0,01 = 1/100)
      [
        { tex: '\\dfrac{1}{20}', val: 1 / 20, denom: 20, isDecimal: false },
        { tex: '\\dfrac{1}{30}', val: 1 / 30, denom: 30, isDecimal: false },
        { tex: '\\dfrac{1}{40}', val: 1 / 40, denom: 40, isDecimal: false },
        { tex: '0,01', val: 0.01, denom: 100, isDecimal: true },
      ],
      // 9: Décimal est au milieu (0,02 = 1/50)
      [
        { tex: '\\dfrac{1}{40}', val: 1 / 40, denom: 40, isDecimal: false },
        { tex: '\\dfrac{1}{60}', val: 1 / 60, denom: 60, isDecimal: false },
        { tex: '\\dfrac{1}{80}', val: 1 / 80, denom: 80, isDecimal: false },
        { tex: '0,02', val: 0.02, denom: 50, isDecimal: true },
      ],
      // 10: Décimal est au milieu (0,1 = 1/10)
      [
        { tex: '\\dfrac{1}{5}', val: 1 / 5, denom: 5, isDecimal: false },
        { tex: '\\dfrac{1}{8}', val: 1 / 8, denom: 8, isDecimal: false },
        { tex: '\\dfrac{1}{20}', val: 1 / 20, denom: 20, isDecimal: false },
        { tex: '0,1', val: 0.1, denom: 10, isDecimal: true },
      ],
    ]

    let compteur = 0
    do {
      const selectedNombres = choice(lesCas)
      const isPlusGrand = choice([true, false]) // 50% de chance plus grand ou plus petit

      this.appliquerLesValeurs(selectedNombres, isPlusGrand, false)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /Le (plus grand|plus petit) de ces nombres est :\s*$/,
        (_, adjectif: string) =>
          this.interactif
            ? `Le ${adjectif} de ces nombres est le nombre `
            : `Indiquer la lettre du nombre le ${adjectif} parmi ces nombres.`,
      )
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { texteAvecCasse: true })
    this.clavierReponseCourte = KeyboardType.clavierMajuscules
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = '.'
  }
}
