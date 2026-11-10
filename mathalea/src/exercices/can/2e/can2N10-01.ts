import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Déterminer le plus petit ensemble de nombres'
export const interactifReady = true

export const dateDePublication = '07/02/2022'
export const dateDeModifImportante = '02/11/2026'

/**
 * @author Gilles Mora
 */
export const uuid = 'e31d1'

export const refs = {
  'fr-fr': ['can2N10-01', '2N10-flash1'],
  'fr-ch': [],
}
export default class PlusPetitEnsemble extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1

    this.optionsDeComparaison = { texteSansCasse: true }
    this.formatChampTexte = `${KeyboardType.clavierEnsemblePredefini}`
  }

  nouvelleVersion() {
    let a,
      b,
      c,
      d,
      listeFractions1,
      listeFractions2,
      fraction1,
      fraction2,
      choix,
      choix2,
      N
    this.question =
      'Parmi $\\mathbb{R}$, $\\mathbb{Q}$, $\\mathbb{D}$, $\\mathbb{Z}$ et $\\mathbb{N}$, quel est le plus petit ensemble de nombres auquel appartient '
    switch (
      this.quotaChoice('type', ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']) //
    ) {
      case 'a':
        a = randint(0, 150)
        this.question += `$${a}$ ?`
        this.correction = `$${a}$ est un entier naturel. On a donc $${a}\\in ${miseEnEvidence('\\mathbb{N}')}$.`
        this.reponse = '\\mathbb{N}'
        break
      case 'b':
        a = randint(0, 150) * -1
        this.question += `$${a}$ ?`
        this.correction = `$${a}$ est un entier relatif. On a donc $${a}\\in ${miseEnEvidence('\\mathbb{Z}')}$.`
        this.reponse = '\\mathbb{Z}'
        break
      case 'c':
        d = randint(0, 9, 0)
        b = randint(0, 9) * choice([-1, 1])
        c = randint(0, 9)
        this.question += `$${texNombre(b + c / 10 + d / 100)}$ ?`
        this.correction = `$${texNombre(b + c / 10 + d / 100)}$ est un nombre décimal. On a donc $${texNombre(b + c / 10 + d / 100)}\\in ${miseEnEvidence('\\mathbb{D}')}$.
            `
        this.reponse = '\\mathbb{D}'
        break
      case 'd':
        choix = choice([true, false])
        a = randint(1, 12)
        this.question += `$${choix ? '-' : ''}\\sqrt{${texNombre(a * a)}}$ ?`
        this.correction = `$${choix ? '-' : ''}\\sqrt{${a * a}}=${choix ? '-' : ''}${a}$ est un entier ${choix ? 'relatif' : 'naturel'}. On a donc $${choix ? '-' : ''}\\sqrt{${texNombre(a * a)}}\\in ${miseEnEvidence(choix ? '\\mathbb{Z}' : '\\mathbb{N}')}$.
            `
        this.reponse = choix ? '\\mathbb{Z}' : '\\mathbb{N}'
        break
      case 'e':
        a = randint(2, 10)
        b = randint(2, 6)
        choix = choice([true, false])
        this.question += `$${choix ? '-' : ''}\\dfrac{${texNombre(b * a)}}{${a}}$ ?`
        this.correction = `$${choix ? '-' : ''}\\dfrac{${texNombre(b * a)}}{${a}}=${choix ? '-' : ''}\\dfrac{${b}\\times ${a}}{${a}}=${choix ? '-' : ''}${b}$ est un entier ${choix ? 'relatif' : 'naturel'}. On a donc $${choix ? '-' : ''}\\dfrac{${texNombre(b * a)}}{${a}}\\in ${miseEnEvidence(choix ? '\\mathbb{Z}' : '\\mathbb{N}')}$.
            `

        this.reponse = choix ? '\\mathbb{Z}' : '\\mathbb{N}'
        break

      case 'f':
        choix = choice([true, false])
        choix2 = choice([true, false])
        listeFractions1 = [
          [1, 3],
          [2, 3],
          [5, 3],
          [7, 3],
          [10, 3],
          [11, 3],
          [1, 7],
          [2, 7],
          [3, 7],
          [4, 7],
          [6, 7],
          [5, 7],
        ]
        listeFractions2 = [
          [1, 2],
          [1, 4],
          [3, 4],
          [1, 5],
          [2, 5],
          [3, 5],
          [4, 5],
          [6, 5],
          [7, 5],
          [8, 5],
          [9, 5],
          [5, 4],
          [7, 4],
          [1, 10],
          [3, 10],
          [7, 10],
          [9, 10],
          [17, 100],
          [23, 100],
        ]
        fraction1 = choice(listeFractions1)
        fraction2 = choice(listeFractions2)
        a = fraction1[0]
        b = fraction1[1]
        c = fraction2[0]
        d = fraction2[1]
        this.question += `$${choix ? '-' : ''}${choix2 ? `\\dfrac{${a}}{${b}}` : `\\dfrac{${c}}{${d}}`}$ ?`
        this.correction = `$${choix ? '-' : ''}${choix2 ? `\\dfrac{${a}}{${b}}` : `\\dfrac{${c}}{${d}}=${choix ? '-' : ''}${texNombre(c / d)}`}$ ${choix2 ? 'n’' : ''} est ${choix2 ? 'pas' : ''} un nombre décimal.
          On a donc $${choix ? '-' : ''}${choix2 ? `\\dfrac{${a}}{${b}}` : `\\dfrac{${c}}{${d}}`}\\in ${miseEnEvidence(choix2 ? '\\mathbb{Q}' : '\\mathbb{D}')}$.
              `
        this.reponse = choix2 ? '\\mathbb{Q}' : '\\mathbb{D}'

        break
      case 'g':
        choix = choice([true, false])
        listeFractions1 = [
          [1, 2],
          [1, 4],
          [3, 4],
          [1, 5],
          [2, 5],
          [3, 5],
          [4, 5],
          [6, 5],
          [7, 5],
          [8, 5],
          [9, 5],
          [5, 4],
          [7, 4],
        ]
        fraction1 = choice(listeFractions1)
        a = fraction1[0]
        b = fraction1[1]
        this.question += `$${choix ? '-' : ''}\\sqrt{\\dfrac{${a * a}}{${b * b}}}$ ?`
        this.correction = `$${choix ? '-' : ''}\\sqrt{\\dfrac{${a * a}}{${b * b}}}=${choix ? '-' : ''}\\dfrac{${a}}{${b}}=${choix ? '-' : ''}${texNombre(a / b)}$ est un nombre décimal. On a donc $${choix ? '-' : ''}\\sqrt{\\dfrac{${a * a}}{${b * b}}}\\in ${miseEnEvidence('\\mathbb{D}')}$.
              `
        this.reponse = '\\mathbb{D}'

        break

      case 'h':
        choix = choice([true, false])
        if (choix === true) {
          a = randint(2, 100, [4, 9, 16, 25, 36, 49, 64, 81])
          this.question += `$\\sqrt{${a}}$ ?`
          this.correction = `$\\sqrt{${a}}$ est un nombre irrationnel. On a donc $\\sqrt{${a}}\\in ${miseEnEvidence('\\mathbb{R}')}$.
            `
          this.reponse = '\\mathbb{R}'
        } else {
          a = randint(1, 12, 10)
          this.question += `$\\sqrt{${texNombre((a * a) / 100)}}$ ?`
          this.correction = `$\\sqrt{${texNombre((a * a) / 100)}}=${texNombre(a / 10)}$ est un nombre décimal. On a donc $\\sqrt{${texNombre((a * a) / 100)}}\\in ${miseEnEvidence('\\mathbb{D}')}$.`
          this.reponse = '\\mathbb{D}'
        }
        break
      case 'i': // un peu de tout
        choix = choice([true, false])
        N = choice([1, 2, 3])
        if (N === 1) {
          a = randint(2, 9)
          this.question += `$${a}${choix ? '+' : ''}\\pi$ ?`
          this.correction = `$${a}${choix ? '+' : ''}\\pi$ est un nombre irrationnel. On a donc $${a}${choix ? '+' : ''}\\pi \\in ${miseEnEvidence('\\mathbb{R}')}$. `
          this.reponse = '\\mathbb{R}'
        }
        if (N === 2) {
          a = choice([2, 4, 5])
          b = randint(2, 5)
          this.question += `$${choix ? `${a}^{-1}` : `${a}^{${b}}`}$ ?`
          this.correction = `$${choix ? `${a}^{-1}` : `${a}^{${b}}`}=${choix ? `\\dfrac{1}{${a}}` : `${a ** b}`}${choix ? `=${texNombre(1 / a)}` : ''}$ est un nombre ${choix ? 'décimal' : 'entier naturel'}.
          On a donc $${choix ? `${a}^{-1} \\in ${miseEnEvidence('\\mathbb{D}')}.` : `${a}^{${b}}\\in ${miseEnEvidence('\\mathbb{N}')}.`}$ `
          this.reponse = choix ? '\\mathbb{D}' : '\\mathbb{N}'
        }
        if (N === 3) {
          a = randint(1, 4)
          b = randint(1, 9)
          this.question += `$${b}\\times 10^{${choix ? '-' : ''}${a}}$ ?`
          this.correction = `$${b}\\times 10^{${choix ? '-' : ''}${a}}=${choix ? `${texNombre(b * 10 ** -a)}` : `${texNombre(b * 10 ** a)}`}$ est un nombre ${choix ? 'décimal' : 'entier naturel'}. On a donc $${b}\\times 10^{${choix ? '-' : ''}${a}} \\in ${miseEnEvidence(choix ? '\\mathbb{D}' : '\\mathbb{N}')}$. `
          this.reponse = choix ? '\\mathbb{D}' : '\\mathbb{N}'
        }
        break
    }
    this.canEnonce = this.question // 'Compléter'
    this.canReponseACompleter = ''
  }
}
