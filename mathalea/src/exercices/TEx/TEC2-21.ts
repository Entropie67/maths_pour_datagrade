import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { createQuestion } from '../../lib/interactif/createQuestion'
import { all, isEqual } from '../../lib/interactif/checks'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Déterminer le module de l'inverse ou d'une puissance d'un nombre complexe"
export const interactifReady = true
export const dateDePublication = '29/10/2026'
export const uuid = 'c4fdc'
export const refs = {
  'fr-fr': ['TEC2-21'],
  'fr-ch': [],
}

/** Vrai si n n'est divisible par aucun carré parfait supérieur à 1. */
const estSansFacteurCarre = (n: number) => {
  for (let k = 2; k * k <= n; k++) if (n % (k * k) === 0) return false
  return true
}

/**
 * Déterminer le module de 1/z ou de z⁴ à partir de la forme algébrique de z.
 * @author Stéphane Guyon
 */
export default class ModuleInverseOuPuissance extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    // Module de 1/z (1) ou de z⁴ (2), dans un ordre aléatoire
    const types = combinaisonListes([1, 2], this.nbQuestions)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 100; cpt++) {
      const a = randint(-6, 6, 0)
      const b = randint(-6, 6, 0)
      const n = a * a + b * b
      const racine = Math.round(Math.sqrt(n))
      const estCarre = racine * racine === n
      // Pour 1/z, le module de z est entier ou racine d'un entier sans facteur carré
      if (types[i] === 1 && !estCarre && !estSansFacteurCarre(n)) continue
      if (!this.questionJamaisPosee(i, a, b, types[i])) continue

      const z = `${a}${ecritureAlgebriqueSauf1(b)}\\mathrm{i}`
      const calculModule =
        `$\\begin{aligned}\\vert z\\vert&=\\sqrt{${ecritureParentheseSiNegatif(a)}^2+${ecritureParentheseSiNegatif(b)}^2}\\\\` +
        `&=\\sqrt{${a * a}+${b * b}}\\\\` +
        `&=${estCarre ? racine : `\\sqrt{${n}}`}\\end{aligned}$`
      const moduleZ = estCarre ? `${racine}` : `\\sqrt{${n}}`
      let question: string
      let correction: string
      let valeur: string
      let texteAvant: string
      if (types[i] === 1) {
        valeur = estCarre ? `\\dfrac{1}{${racine}}` : `\\dfrac{\\sqrt{${n}}}{${n}}`
        question = `Soit $z=${z}$.<br><br>${this.interactif ? '' : 'Déterminer le module de $\\dfrac{1}{z}$.'}`
        texteAvant = '$\\left\\vert\\dfrac{1}{z}\\right\\vert=$'
        correction =
          `Calculons $\\vert z\\vert$ :<br>${calculModule}<br>` +
          'Or le module d\'un quotient est le quotient des modules, donc, pour $z\\neq0$, ' +
          '$\\left\\vert\\dfrac{1}{z}\\right\\vert=\\dfrac{1}{\\vert z\\vert}$.<br>' +
          (estCarre
            ? `$\\begin{aligned}\\left\\vert\\dfrac{1}{z}\\right\\vert&=\\dfrac{1}{\\vert z\\vert}\\\\&=\\dfrac{1}{${racine}}\\end{aligned}$<br>`
            : `$\\begin{aligned}\\left\\vert\\dfrac{1}{z}\\right\\vert&=\\dfrac{1}{\\vert z\\vert}\\\\&=\\dfrac{1}{\\sqrt{${n}}}\\\\&=\\dfrac{\\sqrt{${n}}}{${n}}\\end{aligned}$<br>`) +
          `Donc $\\left\\vert\\dfrac{1}{z}\\right\\vert=${miseEnEvidence(valeur)}$.`
      } else {
        valeur = `${n * n}`
        question = `Soit $z=${z}$.<br><br>${this.interactif ? '' : 'Déterminer le module de $z^4$.'}`
        texteAvant = '$\\left\\vert z^4\\right\\vert=$'
        correction =
          `Calculons $\\vert z\\vert$ :<br>${calculModule}<br>` +
          'Or le module d\'une puissance est la puissance du module, donc ' +
          '$\\left\\vert z^4\\right\\vert=\\vert z\\vert^4$.<br>' +
          `$\\begin{aligned}\\left\\vert z^4\\right\\vert&=\\left(${moduleZ}\\right)^4\\\\&=${texNombre(n * n)}\\end{aligned}$<br>` +
          `Donc $\\left\\vert z^4\\right\\vert=${miseEnEvidence(texNombre(n * n))}$.`
      }
      createQuestion(this, i, {
        question,
        correction,
        answer: { value: valeur, compare: all([isEqual()]) },
        field: { keyboard: KeyboardType.clavierFullOperations, texteAvant },
      })
      i++
    }
    listeQuestionsToContenu(this)
  }
}
