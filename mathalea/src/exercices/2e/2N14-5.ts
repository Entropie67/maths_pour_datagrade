import type { MathfieldElement } from 'mathlive'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import type { IExercice } from '../../lib/types'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const uuid = 'acff'
export const dateDePublication = '27/08/2026'
export const titre = 'Comparer des nombres et des fractions à $1$'
export const interactifReady = true
export const refs = {
  'fr-fr': ['2N14-5'],
  'fr-ch': ['9R1NO4H-6', '9R2NO4H-6', '9R3NO4H-6'],
}

/**
 * @author Jean-Claude Lhote
 */
export default class Comparer4Nombres extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacing = 2
    this.spacingCorr = 2.5
  }
  nouvelleVersion() {
    const listeTypeDeSerie = combinaisonListes([0, 1], this.nbQuestions)
    const extractNumerateurDenominateurFromLatex = (
      latex: string,
    ): [number, number] => {
      const regex = /\\frac(?:\{(-?\d+)\}|(-?\d))(?:\{(-?\d+)\}|(-?\d))/
      const match = latex.match(regex)
      if (match) {
        const numerateur = parseInt(match[1] ?? match[2], 10)
        const denominateur = parseInt(match[3] ?? match[4], 10)
        return [numerateur, denominateur]
      } else {
        throw new Error(`Invalid LaTeX fraction format: ${latex}`)
      }
    }
    const callback = (exercice: IExercice, question: number) => {
      const spanReponseLigne = document.querySelector(
        `#resultatCheckEx${exercice.numeroExercice}Q${question}`,
      )
      let resultat
      let feedback: string = ''
      const mfe = document.querySelector(
        `#champTexteEx${exercice.numeroExercice}Q${question}`,
      ) as MathfieldElement
      const saisie = mfe.value

      const nombres = saisie.split('<').map((el) => el.trim())
      if (nombres.length !== 4) {
        feedback = `Il faut saisir exactement les 4 nombres séparés par le symbole "<".`
        resultat = {
          isOk: false,
          feedback,
          score: { nbBonnesReponses: 0, nbReponses: 1 },
        }
      } else {
        const valeurs = nombres.map((el) => {
          if (el.includes('frac')) {
            const [num, den] = extractNumerateurDenominateurFromLatex(el)
            return new FractionEtendue(num, den)
          } else {
            return parseFloat(el.replace(',', '.'))
          }
        })
        const valeursTriees = [...valeurs].sort((a, b) => {
          if (a instanceof FractionEtendue && b instanceof FractionEtendue) {
            return a.num / a.den - b.num / b.den
          } else if (a instanceof FractionEtendue) {
            return a.num / a.den - Number(b)
          } else if (b instanceof FractionEtendue) {
            return Number(a) - b.num / b.den
          } else {
            return Number(a) - Number(b)
          }
        })
        if (
          valeurs.every((v, idx) => {
            if (
              v instanceof FractionEtendue &&
              valeursTriees[idx] instanceof FractionEtendue
            ) {
              return (
                v.num / v.den ===
                valeursTriees[idx].num / valeursTriees[idx].den
              )
            } else if (v instanceof FractionEtendue) {
              return v.num / v.den === Number(valeursTriees[idx])
            } else if (valeursTriees[idx] instanceof FractionEtendue) {
              return (
                Number(v) === valeursTriees[idx].num / valeursTriees[idx].den
              )
            } else {
              return Number(v) === Number(valeursTriees[idx])
            }
          })
        ) {
          resultat = {
            isOk: true,
            feedback: 'Bravo !',
            score: { nbBonnesReponses: 1, nbReponses: 1 },
          }
        } else {
          feedback = `L'ordre correct est : $${valeursTriees.map((v) => (v instanceof FractionEtendue ? v.texFraction : v.toString().replace('.', ','))).join(' < ')}$.`
          resultat = {
            isOk: false,
            feedback,
            score: { nbBonnesReponses: 0, nbReponses: 1 },
          }
        }
      }

      if (spanReponseLigne != null) {
        spanReponseLigne.innerHTML = resultat.isOk ? '😎' : '☹️'
      }
      const spanFeedback = document.querySelector(
        `#feedbackEx${exercice.numeroExercice}Q${question}`,
      )
      // on met le feedback
      if (feedback != null && spanFeedback != null && feedback.length > 0) {
        spanFeedback.innerHTML = '💡 ' + feedback
        spanFeedback.classList.add(
          'py-2',
          'italic',
          'text-coopmaths-warn-darkest',
          'dark:text-coopmathsdark-warn-darkest',
        )
      }
      return resultat
    }

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let f1: FractionEtendue
      let f2: FractionEtendue
      let f3: FractionEtendue

      let d: number
      switch (listeTypeDeSerie[i]) {
        case 0: // Trois fractions inférieures à 1 et un décimal supérieur à 1
          {
            d = randint(1, 25) / 100 + 1
            do {
              const num1 = randint(2, 5)
              const den1 = randint(num1 + 1, 10)
              const factor = randint(3, 5)
              const num2 = num1 * factor - randint(1, 2)
              const den2 = den1 * factor
              const num3 = num2
              const den3 = den2 + randint(1, 2)
              f1 = new FractionEtendue(num1, den1)
              f2 = new FractionEtendue(num2, den2)
              f3 = new FractionEtendue(num3, den3)
            } while (!f1.estIrreductible)
          }
          break
        case 1: // trois fractions supérieures à 1 et un décimal inférieur à 1
        default:
          {
            d = 1 - randint(1, 25) / 100
            do {
              const den1 = randint(2, 5)
              const num1 = randint(den1 + 1, 10)
              const factor = randint(3, 5)
              const num2 = num1 * factor + randint(1, 2)
              const den2 = den1 * factor
              const num3 = num2
              const den3 = den2 - randint(1, 2)
              f1 = new FractionEtendue(num1, den1)
              f2 = new FractionEtendue(num2, den2)
              f3 = new FractionEtendue(num3, den3)
            } while (!f1.estIrreductible)
          }
          break
      }
      const listeTex = [
        texNombre(d, 2),
        f1.texFraction,
        f2.texFraction,
        f3.texFraction,
      ]
      const listeNbr = [d, f1, f2, f3]
      const texteCorr = `On remarque que les trois fractions sont ${
        listeTypeDeSerie[i] === 0
          ? `inférieures à $1$ et que le nombre décimal est supérieur à $1$.`
          : `supérieures à $1$ et que le nombre décimal est inférieur à $1$.`
      }<br>
    Donc, il suffit de classer les trois fractions dans l'ordre croissant et de placer le nombre décimal ${listeTypeDeSerie[i] === 0 ? 'à la fin' : 'au début'}.<br>
    Dans les $3$ fractions on remarque que $${f2.texFraction}$ et $${f3.texFraction}$ ont le même numérateur et que $${f2.texFraction}$ a un dénominateur plus ${listeTypeDeSerie[i] === 0 ? 'petit' : 'grand'} que $${f3.texFraction}$, donc ${
      listeTypeDeSerie[i] === 0
        ? `$ ${f3.texFraction} < ${f2.texFraction} $`
        : `$${f2.texFraction} < ${f3.texFraction}$`
    }.<br>
    En ce qui concerne $${f1.texFraction}$ et $${f2.texFraction}$, on peut les mettre au même dénominateur, celui de $${f2.texFraction}$ soit $${f1.texFraction}=${f1.reduire(f2.den / f1.den).texFraction}$.<br>
    Et donc $${
      listeTypeDeSerie[i] === 0
        ? `${f2.texFraction} < ${f1.reduire(f2.den / f1.den).texFraction} \\text{ soit }${f2.texFraction} < ${f1.texFraction}`
        : `${f1.reduire(f2.den / f1.den).texFraction} < ${f2.texFraction} \\text{ soit }${f1.texFraction} < ${f2.texFraction}`
    }$.<br>
    On peut donc conclure que $${miseEnEvidence(
      `${
        listeTypeDeSerie[i] === 0
          ? `${f3.texFraction} < ${f2.texFraction} < ${f1.texFraction}<${texNombre(d, 2)}`
          : `${texNombre(d, 2)} < ${f1.texFraction} < ${f2.texFraction} < ${f3.texFraction}`
      }`,
    )}$.<br>`

      const texte = `Classer dans l'ordre croissant les quatre nombres suivants :<br>
      ${listeTex
        .map((el, index) => `$${lettreDepuisChiffre(index + 1)}=${el}$`)
        .slice(0, -1)
        .join(
          ', ',
        )} et $${lettreDepuisChiffre(listeTex.length)}=${listeTex[listeTex.length - 1]}$`
      if (this.questionJamaisPosee(i, ...listeTex)) {
        this.listeQuestions.push(
          texte +
            ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierCompareAvecNombres,
              { texteAvant: '<br>' },
            ),
        )
        const value =
          listeTypeDeSerie[i] === 0
            ? `${f3.texFraction}<${f2.texFraction}<${f1.texFraction}<${texNombre(d, 2)}`
            : `${texNombre(d, 2)}<${f1.texFraction}<${f2.texFraction}<${f3.texFraction}`
        handleAnswers(
          this,
          i,
          { reponse: { value }, callback },
          { formatInteractif: 'mathalea-mathfield' },
        )
        this.listeCorrections.push(texteCorr)
        i++
      }
      cpt++
    }
  }
}
