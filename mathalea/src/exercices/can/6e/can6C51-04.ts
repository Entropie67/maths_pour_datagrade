import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Compléter des égalités avec des fractions simples'
export const interactifReady = true

export const dateDePublication = '05/07/2025'
export const uuid = 'c0043'
export const refs = {
  'fr-fr': ['can6C51-04', '6N3autoB-1'],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora avec IA
 */
export default class FractionsSimplesEgalite extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.formatInteractif = 'fillInTheBlank'
  }

  nouvelleVersion() {
    const tex = (n: number, d: number) =>
      d === 1 ? '1' : n === d ? '1' : `\\dfrac{${n}}{${d}}`
    const setExercice = (
      f1: { num: number; den: number },
      f2: { num: number; den: number },
      resultat: { num: number; den: number } | string,
      operation: '+' | '-',
      trou: 'resultat' | 'terme1' | 'terme2',
    ) => {
      const texF1 = tex(f1.num, f1.den)
      const texF2 = tex(f2.num, f2.den)
      const texRes =
        typeof resultat === 'string'
          ? resultat
          : tex(resultat.num, resultat.den)

      this.consigne = 'Compléter.'
      this.canEnonce = this.consigne

      const baseExpr = {
        resultat: () => {
          this.question = `${texF1} ${operation} ${texF2} = %{champ1}`
          this.reponse = texRes
          this.correction =
            operation === '+'
              ? `$${texF1} + ${texF2} = \\dfrac{${f1.num + f2.num}}{${f1.den}} = ${miseEnEvidence(texRes)}$`
              : `$${texF1} - ${texF2} = \\dfrac{${f1.num * f2.den}}{${f2.den}} - \\dfrac{${f2.num}}{${f2.den}} = ${miseEnEvidence(texRes)}$`
          this.canReponseACompleter = `$${texF1} ${operation} ${texF2} = \\ldots$`
        },
        terme1: () => {
          this.question = `%{champ1} ${operation} ${texF2} = ${texRes}`
          this.reponse = texF1
          this.correction = `$${miseEnEvidence(texF1)} ${operation} ${texF2} = ${texRes}$`
          this.canReponseACompleter = `$\\ldots ${operation} ${texF2} = ${texRes}$`
        },
        terme2: () => {
          this.question = `${texF1} ${operation} %{champ1} = ${texRes}`
          this.reponse = texF2
          this.correction = `$${texF1} ${operation} ${miseEnEvidence(texF2)} = ${texRes}$`
          this.canReponseACompleter = `$${texF1} ${operation} \\ldots = ${texRes}$`
        },
      }

      baseExpr[trou]()
    }

    // Cas possibles
    switch (this.quotaChoice('typeDeQuestions', [1, 2, 3, 4, 5, 6])) {
      case 1: {
        const cas = choice(['un', 'demi'])
        const trou = choice(['resultat', 'terme1', 'terme2'] as const)
        const f1 = { num: 1, den: cas === 'un' ? 2 : 4 }
        const f2 = { ...f1 }
        const resultat = cas === 'un' ? '1' : '\\dfrac{1}{2}'
        setExercice(f1, f2, resultat, '+', trou)
        break
      }

      case 2: {
        const trou = choice(['resultat', 'terme1', 'terme2'] as const)
        const f1 = { num: 1, den: 2 }
        const f2 = { num: 1, den: 4 }
        const resultat = { num: 3, den: 4 }
        setExercice(f1, f2, resultat, '+', trou)

        if (trou === 'resultat') {
          this.correction = `
Pour additionner $\\dfrac{1}{2}$ et $\\dfrac{1}{4}$, on met au même dénominateur :<br>
$\\dfrac{1}{2} = \\dfrac{2}{4}$ donc $\\dfrac{2}{4} + \\dfrac{1}{4} = ${miseEnEvidence('\\dfrac{3}{4}')}$`
        } else if (trou === 'terme2') {
          this.correction = `$\\dfrac{1}{2} = \\dfrac{2}{4}$ donc $\\dfrac{2}{4} + ${miseEnEvidence('\\dfrac{1}{4}')} = \\dfrac{3}{4}$`
        }
        break
      }

      case 3: {
        const trou = choice(['resultat', 'terme1', 'terme2'] as const)
        const cas = choice([
          {
            f1: { num: 1, den: 1 },
            f2: { num: 1, den: 4 },
            res: { num: 3, den: 4 },
          },
          {
            f1: { num: 1, den: 1 },
            f2: { num: 1, den: 2 },
            res: { num: 1, den: 2 },
          },
          {
            f1: { num: 1, den: 1 },
            f2: { num: 3, den: 4 },
            res: { num: 1, den: 4 },
          },
        ])
        setExercice(cas.f1, cas.f2, cas.res, '-', trou)
        break
      }

      case 4: {
        const trou = choice(['resultat', 'terme1', 'terme2'] as const)
        const f1 = { num: 3, den: 4 }
        const f2 = { num: 1, den: 4 }
        const resultat = { num: 4, den: 4 }
        setExercice(f1, f2, resultat, '+', trou)
        break
      }

      case 5: {
        const trou = choice(['resultat', 'terme1', 'terme2'] as const)
        const f1 = { num: 1, den: 2 }
        const f2 = { num: 1, den: 4 }
        const resultat = { num: 1, den: 4 }
        setExercice(f1, f2, resultat, '-', trou)
        break
      }

      case 6:
      default: {
        const trou = choice(['resultat', 'terme1', 'terme2'] as const)
        const f1 = { num: 3, den: 4 }
        const f2 = { num: 1, den: 2 }
        const resultat = { num: 1, den: 4 }
        setExercice(f1, f2, resultat, '-', trou)
        if (trou === 'resultat') {
          this.correction = `$\\dfrac{3}{4} - \\dfrac{2}{4} = ${miseEnEvidence('\\dfrac{1}{4}')}$`
        }
        break
      }
    }
  }
}
