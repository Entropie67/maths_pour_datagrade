import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { pgcd } from '../../lib/outils/primalite'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Factoriser une expression algébrique'
export const dateDePublication = '24/08/2026'
export const dateDeModifImportante = '26/10/2026'

export const uuid = 'f4abb'

export const refs = {
  'fr-fr': ['2L11-6'],
  'fr-ch': [],
}

export const interactifReady = true

/**
 * Factoriser des expressions avec un facteur commun ou une identité remarquable.
 * @author Stéphane Guyon
 */
export default class FactoriserAvecFacteurCommun extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.sup = '0'
    this.spacing = 2
    this.spacingCorr = 2
    this.listeAvecNumerotation = false
    this.besoinFormulaireTexte = [
      'Types de questions avec $A=ax+b$',
      [
        'Nombres séparés par des tirets :',
        '1 : $ax^2+bx$',
        '2 : $Ax+kx$',
        '3 : $x^2-a^2$',
        '4 : $x^2-a$',
        '5 : $AB+AC$',
        '6 : $AB-AC$',
        '7 : $A^2+AB$',
        '8 : $A^2-AB$',
        '9 : $A^2-B^2$ avec $A$ et $B$ affines',
        '10 : $AB+A$ (facteur implicite $1$)',
        '11 : $AB-A$ (facteur implicite $-1$)',
        '0 : Mélange des types 1 à 9',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? 'Factoriser au maximum les expressions suivantes.'
        : "Factoriser au maximum l'expression suivante."

    const types = combinaisonListes(
      gestionnaireFormulaireTexte({
        saisie: this.sup,
        min: 1,
        max: 11,
        // Conserver les tirages des liens utilisant le mélange historique.
        melangeMax: 9,
        defaut: 1,
        nbQuestions: this.nbQuestions,
        melange: 0,
      }).map(Number),
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const type = types[i]
      let a = randint(-6, 6, 0)
      let b = randint(-9, 9, 0)
      let c = randint(-6, 6, [0, a])
      let d = randint(-9, 9, [0, b])
      let e = randint(-6, 6, [0, a, c])
      let f = randint(-9, 9, [0, b, d])

      if (type === 1) {
        b = randint(-9, 9, [0, -1, 1])
        while (pgcd(Math.abs(a), Math.abs(b)) !== 1) {
          a = randint(-6, 6, 0)
          b = randint(-9, 9, 0)
          c = randint(-6, 6, [0, a])
        }
      }

      if (type === 2) {
        let k = randint(-9, 9, [0, -b, 1, -1])
        while (pgcd(Math.abs(a), Math.abs(b + k)) !== 1) {
          k = randint(-9, 9, [0, -b, 1, -1])
        }
        c = k
      }

      if (type === 5 || type === 6) {
        while (
          (type === 5 && (c + e === 0 || d + f === 0)) ||
          (type === 6 && (c - e === 0 || d - f === 0))
        ) {
          e = randint(-6, 6, [0, a, c])
          f = randint(-9, 9, [0, b, d])
        }
      }

      if (type === 7 || type === 8) {
        while (
          (type === 7 && (a + e === 0 || b + f === 0)) ||
          (type === 8 && (a - e === 0 || b - f === 0))
        ) {
          e = randint(-6, 6, [0, a])
          f = randint(-9, 9, [0, b])
        }
      }

      if (type === 9) {
        while (
          a === c ||
          a === -c ||
          b === d ||
          b === -d ||
          pgcd(Math.abs(a - c), Math.abs(b - d)) !== 1 ||
          pgcd(Math.abs(a + c), Math.abs(b + d)) !== 1
        ) {
          c = randint(-6, 6, [0, a, -a])
          d = randint(-9, 9, [0, b, -b])
        }
      }

      if (type === 3) {
        a = randint(2, 12)
      }

      if (type === 4) {
        do {
          a = randint(2, 99)
        } while (Number.isInteger(Math.sqrt(a)))
      }

      const facteurCommun = reduireAxPlusB(a, b)
      const facteurC = reduireAxPlusB(c, d)
      const facteurE = reduireAxPlusB(e, f)
      let expression = ''
      let reponse = ''
      let correction = ''

      switch (type) {
        case 1: {
          expression = new Polynome({
            rand: false,
            coeffs: [0, b, a],
          }).toLatex()
          reponse = `x(${facteurCommun})`
          correction = `Les deux termes ont le facteur commun $x$.<br>
          $\\begin{aligned}
          ${expression}&=x\\times(${reduireAxPlusB(a, 0)})+x\\times ${ecritureParentheseSiNegatif(b)}\\\\
          &=${miseEnEvidence(reponse)}.
          \\end{aligned}$`
          break
        }
        case 2: {
          const k = c
          expression = `x(${facteurCommun})${k > 0 ? '+' : ''}${k}x`
          reponse = `x(${reduireAxPlusB(a, b + k)})`
          correction = `Les deux termes ont le facteur commun $x$.<br>
          $\\begin{aligned}
          ${expression}&=x\\left[(${facteurCommun})${k > 0 ? '+' : ''}${k}\\right]\\\\
          &=${miseEnEvidence(reponse)}.
          \\end{aligned}$`
          break
        }
        case 5: {
          expression = `(${facteurCommun})(${facteurC})+(${facteurCommun})(${facteurE})`
          reponse = `(${facteurCommun})(${reduireAxPlusB(c + e, d + f)})`
          correction = `On reconnaît le facteur commun $(${facteurCommun})$.<br>
          $\\begin{aligned}
          ${expression}&=(${facteurCommun})\\left[(${facteurC})+(${facteurE})\\right]\\\\
          &=${miseEnEvidence(reponse)}.
          \\end{aligned}$`
          break
        }
        case 6: {
          expression = `(${facteurCommun})(${facteurC})-(${facteurCommun})(${facteurE})`
          reponse = `(${facteurCommun})(${reduireAxPlusB(c - e, d - f)})`
          correction = `On reconnaît le facteur commun $(${facteurCommun})$.<br>
          $\\begin{aligned}
          ${expression}&=(${facteurCommun})\\left[(${facteurC})-(${facteurE})\\right]\\\\
          &=(${facteurCommun})\\left[${facteurC}${ecritureAlgebriqueSauf1(-e)}x${ecritureAlgebrique(-f)}\\right]\\\\
          &=${miseEnEvidence(reponse)}.
          \\end{aligned}$`
          break
        }
        case 10:
        case 11: {
          const signe = type === 10 ? 1 : -1
          expression = `(${facteurCommun})(${facteurC})${
            type === 10
              ? ecritureAlgebriqueSauf1(a)
              : ecritureAlgebriqueSauf1(-a)
          }x${ecritureAlgebrique(signe * b)}`
          reponse = `(${facteurCommun})(${reduireAxPlusB(c, d + signe)})`
          correction = `On reconnaît le facteur commun $(${facteurCommun})$ en faisant apparaître le facteur $1$.<br>
          $\\begin{aligned}
          ${expression}&=(${facteurCommun})(${facteurC})${type === 10 ? '+' : '-'}(${facteurCommun})\\times 1\\\\
          &=(${facteurCommun})\\left[(${facteurC})${ecritureAlgebrique(signe)}\\right]\\\\
          &=${miseEnEvidence(reponse)}.
          \\end{aligned}$`
          break
        }
        case 7: {
          expression = `(${facteurCommun})^2+(${facteurCommun})(${facteurE})`
          reponse = `(${facteurCommun})(${reduireAxPlusB(a + e, b + f)})`
          correction = `On reconnaît le facteur commun $(${facteurCommun})$.<br>
          $\\begin{aligned}
          ${expression}&=(${facteurCommun})(${facteurCommun})+(${facteurCommun})(${facteurE})\\\\
          &=(${facteurCommun})\\left[(${facteurCommun})+(${facteurE})\\right]\\\\
          &=${miseEnEvidence(reponse)}.
          \\end{aligned}$`
          break
        }
        case 8: {
          expression = `(${facteurCommun})^2-(${facteurCommun})(${facteurE})`
          reponse = `(${facteurCommun})(${reduireAxPlusB(a - e, b - f)})`
          correction = `On reconnaît le facteur commun $(${facteurCommun})$.<br>
          $\\begin{aligned}
          ${expression}&=(${facteurCommun})(${facteurCommun})-(${facteurCommun})(${facteurE})\\\\
          &=(${facteurCommun})\\left[(${facteurCommun})-(${facteurE})\\right]\\\\
          &=(${facteurCommun})\\left[${facteurCommun}${ecritureAlgebriqueSauf1(-e)}x${ecritureAlgebrique(-f)}\\right]\\\\
          &=${miseEnEvidence(reponse)}.
          \\end{aligned}$`
          break
        }
        case 9: {
          const difference = reduireAxPlusB(a - c, b - d)
          const somme = reduireAxPlusB(a + c, b + d)
          expression = `(${facteurCommun})^2-(${facteurC})^2`
          reponse = `(${difference})(${somme})`
          correction = `On reconnaît l'identité remarquable $A^2-B^2=(A-B)(A+B)$.<br>
          $\\begin{aligned}
          ${expression}&=\\left[(${facteurCommun})-(${facteurC})\\right]\\left[(${facteurCommun})+(${facteurC})\\right]\\\\
          &=${miseEnEvidence(reponse)}.
          \\end{aligned}$`
          break
        }
        case 3: {
          expression = `x^2-${a ** 2}`
          reponse = `(x-${a})(x+${a})`
          correction = `Comme $\\sqrt{${a ** 2}}=${a}$, on reconnaît l'identité remarquable $A^2-B^2=(A-B)(A+B)$.<br>
          $\\begin{aligned}
          ${expression}&=${miseEnEvidence(reponse)}.
          \\end{aligned}$`
          break
        }
        case 4: {
          expression = `x^2-${a}`
          reponse = `(x-\\sqrt{${a}})(x+\\sqrt{${a}})`
          correction = `Comme $a=${a}$ est positif, on écrit $${a}=(\\sqrt{${a}})^2$. On reconnaît alors l'identité remarquable $A^2-B^2=(A-B)(A+B)$.<br>
          $\\begin{aligned}
          ${expression}&=x^2-(\\sqrt{${a}})^2\\\\
          &=${miseEnEvidence(reponse)}.
          \\end{aligned}$`
          break
        }
      }

      if (this.questionJamaisPosee(i, expression)) {
        const lettre = lettreDepuisChiffre(i + 1)
        const texte = this.interactif
          ? `$${lettre}=${expression}=$` +
            ajouteChampTexteMathLive(this, i, KeyboardType.lyceeClassique)
          : `$${lettre}=${expression}$`
        this.listeQuestions.push(texte)
        this.listeCorrections.push(`$${lettre}=${expression}$<br>${correction}`)
        handleAnswers(
          this,
          i,
          {
            reponse: {
              value: reponse,
              options: { factorisation: true },
            },
          },
          { formatInteractif: 'mathalea-mathfield' },
        )
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
