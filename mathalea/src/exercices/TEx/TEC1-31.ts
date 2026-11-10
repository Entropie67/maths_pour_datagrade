import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { Complexe } from '../../lib/mathFonctions/Complexe'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Développer une expression avec le binôme de Newton'
export const interactifReady = true
export const dateDePublication = '30/08/2026'
export const dateDeModifImportante = '31/10/2026'
export const uuid = 'ba2f2'

export const refs = {
  'fr-fr': ['TEC1-31'],
  'fr-ch': [],
}

function coefficientBinomial(n: number, k: number): number {
  let resultat = 1
  for (let j = 1; j <= k; j++) resultat = (resultat * (n - j + 1)) / j
  return resultat
}

function triangleDePascal(ligneAEvidencer: number): string {
  const lignes = Array.from({ length: 6 }, (_, n) => {
    const cellules = Array<string>(11).fill('')
    for (let k = 0; k <= n; k++) {
      const coefficient = coefficientBinomial(n, k)
      cellules[5 - n + 2 * k] =
        n === ligneAEvidencer
          ? miseEnEvidence(coefficient)
          : String(coefficient)
    }
    return `${n}&${cellules.join('&')}`
  }).join('\\\\')
  return `\\begin{array}{c|ccccccccccc}
  n&&&&&&&&&&&\\\\
  ${lignes}
  \\end{array}`
}

function termeSigne(
  coefficient: number,
  suffixe: string,
  premier: boolean,
): string {
  if (coefficient === 0) return ''
  const signe = coefficient < 0 ? '-' : premier ? '' : '+'
  const valeurAbsolue = Math.abs(coefficient)
  const valeur = suffixe === '' ? valeurAbsolue : rienSi1(valeurAbsolue)
  return `${signe}${valeur}${suffixe}`
}

function developpementNumerique(a: number, b: number, n: number): string {
  return Array.from({ length: n + 1 }, (_, k) => {
    const coefficient = coefficientBinomial(n, k) * a ** (n - k) * b ** k
    const suffixe = k === 0 ? '' : k === 1 ? 'i' : `i^{${k}}`
    return termeSigne(coefficient, suffixe, k === 0)
  }).join('')
}

function reductionPuissancesDeI(a: number, b: number, n: number): string {
  return Array.from({ length: n + 1 }, (_, k) => {
    let coefficient = coefficientBinomial(n, k) * a ** (n - k) * b ** k
    const reste = k % 4
    if (reste === 2 || reste === 3) coefficient *= -1
    const suffixe = reste === 1 || reste === 3 ? 'i' : ''
    return termeSigne(coefficient, suffixe, k === 0)
  }).join('')
}

function developpementNewton(a: number, b: number, n: number): string {
  const aTex = ecritureParentheseSiNegatif(a)
  const biTex = b === 1 ? 'i' : b === -1 ? '(-i)' : `(${b}i)`
  return Array.from({ length: n + 1 }, (_, k) => {
    const puissanceA = n - k
    const facteurA =
      puissanceA === 0 || a === 1
        ? ''
        : puissanceA === 1
          ? aTex
          : `${aTex}^{${puissanceA}}`
    const facteurBi = k === 0 ? '' : k === 1 ? biTex : `${biTex}^{${k}}`
    return [`\\binom{${n}}{${k}}`, facteurA, facteurBi]
      .filter((facteur) => facteur !== '')
      .join('\\times ')
  }).join('+')
}

function remplaceCoefficientsBinomiaux(
  a: number,
  b: number,
  n: number,
): string {
  const aTex = ecritureParentheseSiNegatif(a)
  const biTex = b === 1 ? 'i' : b === -1 ? '(-i)' : `(${b}i)`
  return Array.from({ length: n + 1 }, (_, k) => {
    const puissanceA = n - k
    const facteurA =
      puissanceA === 0 || a === 1
        ? ''
        : puissanceA === 1
          ? aTex
          : `${aTex}^{${puissanceA}}`
    const facteurBi = k === 0 ? '' : k === 1 ? biTex : `${biTex}^{${k}}`
    const facteurs = [
      rienSi1(coefficientBinomial(n, k)),
      facteurA,
      facteurBi,
    ].filter((facteur) => facteur !== '')
    return facteurs.length === 0 ? '1' : facteurs.join('\\times ')
  }).join('+')
}

/**
 * Développer une puissance d'un nombre complexe avec le binôme de Newton.
 *
 * @author Stéphane Guyon
 */
export default class BinomeNewtonComplexes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.spacing = 1.5
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    this.consigne =
      'Développer à l’aide du binôme de Newton, puis donner le résultat sous forme algébrique.'
    const exposants = combinaisonListes([3, 4, 5, 5], this.nbQuestions)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const exposant = exposants[i]
      const borne = exposant <= 3 ? 3 : 2
      const a = randint(-borne, borne, 0)
      let b = randint(-borne, borne, 0)
      if (exposant === 5 && Math.abs(a) === 2 && Math.abs(b) === 2) {
        b = b < 0 ? -1 : 1
      }
      const z = new Complexe(a, b)
      const resultat = z.pow(exposant)
      const facteurAFormule =
        a === 1
          ? '1\\times '
          : `${ecritureParentheseSiNegatif(a)}^{${exposant}-k}\\times `
      const facteurImaginaireFormule =
        b === 1 ? 'i^k' : b === -1 ? '(-i)^k' : `(${b}i)^k`
      let texte = `$${z.parentheseSiComplexe()}^{${exposant}}$`
      const texteCorr = `On utilise le binôme de Newton : pour tous nombres complexes $a$ et $b$ :<br>
      $\\begin{aligned}
      (a+b)^n&=\\displaystyle\\sum_{k=0}^{n}\\binom{n}{k}a^{n-k}b^k\\\\
      &=\\binom{n}{0}\\times a^n+\\binom{n}{1}\\times a^{n-1}\\times b\\\\ &\\quad+\\binom{n}{2}\\times a^{n-2}\\times b^2\\\\ &\\quad+\\cdots+\\binom{n}{n}\\times b^n\\end{aligned}$.<br>
      Le triangle de Pascal permet de lire les coefficients binomiaux. Sa première ligne est numérotée $0$ :<br>
      $${triangleDePascal(exposant)}$<br>
      La ligne $n=${exposant}$ donne successivement les coefficients $\\displaystyle\\binom{${exposant}}{0},\\binom{${exposant}}{1},\\ldots,\\binom{${exposant}}{${exposant}}$.<br>
      Ici, $a=${a}$, $b=${rienSi1(b)}i$ et $n=${exposant}$. On obtient donc :<br>
      $\\begin{aligned}
      ${z.parentheseSiComplexe()}^{${exposant}}
      &=\\sum_{k=0}^{${exposant}}\\binom{${exposant}}{k}\\times ${facteurAFormule}${facteurImaginaireFormule}\\\\
      &=${developpementNewton(a, b, exposant)}\\\\
      &=${remplaceCoefficientsBinomiaux(a, b, exposant)}\\\\
      &=${developpementNumerique(a, b, exposant)}\\\\
      &=${reductionPuissancesDeI(a, b, exposant)}\\\\
      &=${miseEnEvidence(resultat.tex())}.
      \\end{aligned}$`

      if (this.interactif) {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.complexes, {
          texteAvant: '<br>',
        })
      }
      handleAnswers(this, i, { reponse: { value: resultat.tex() } })

      if (this.questionJamaisPosee(i, a, b, exposant)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
