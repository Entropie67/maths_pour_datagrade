import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique, reduireAxPlusB } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'
export const titre = 'Dériver une fonction du type$\\dfrac{a}{u}$'
export const interactifReady = true

export const uuid = 'b6bda'
export const refs = {
  'fr-fr': ['1AN14-10', 'TSA3-13', 'TCA7-13'],
  'fr-ch': [''],
}
export const dateDePublication = '28/01/2026'

/**
 * Calculer la dérivée d'un quotient particulier
 * @author Gilles Mora
 *
 */
class DerivationQuotientParticulier extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Types de fonctions',
      'Nombres séparés par des tirets :\n1 : $u(x)=x+b$\n2 : $u(x)=mx+p$\n3 : $u(x)=ax^2+b$\n4 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = ['Numérateur égal à $1$']
    this.sup = '4'
    this.sup2 = false
    this.nbQuestions = 3
    this.correctionDetailleeDisponible = true
  }

  nouvelleVersion() {
    // Consigne adaptative
    if (this.nbQuestions > 1) {
      this.consigne =
        "Dans chacun des cas suivants, on admet que la fonction $f$ est définie et dérivable sur un intervalle $I$. <br>Déterminer une expression de la fonction dérivée $f'$ sur $I$."
    } else {
      this.consigne =
        "On admet que la fonction $f$ est définie et dérivable sur un intervalle $I$. <br>Déterminer une expression de la fonction dérivée $f'$ sur $I$."
    }

    this.listeQuestions = []
    this.listeCorrections = []
    this.autoCorrection = []

    const listeTypeDeQuestion = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      defaut: 1,
      melange: 4,
      nbQuestions: this.nbQuestions,
    })

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let laFonction = ''
      let laDerivee = ''
      let laDeriveeIntermediaire = ''
      let uprime = ''
      let uExpression = ''
      // let df = ''
      let a: number
      const choix = choice([true, false])

      // Détermination de a selon sup2
      if (this.sup2) {
        a = 1
      } else {
        a = randint(-10, 10, [0, 1])
      }

      switch (Number(listeTypeDeQuestion[i])) {
        case 1: // u(x) = x + b
          {
            const b = randint(-10, 10, 0)

            if (choix) {
              laFonction = `\\dfrac{${a}}{x${ecritureAlgebrique(b)}}`
              uExpression = `x${ecritureAlgebrique(b)}`
            } else {
              laFonction = `\\dfrac{${a}}{${b}+x}`
              uExpression = `${b}+x`
            }

            uprime = '1'

            if (a === 1) {
              // Pas d'étape intermédiaire si a=1
              if (choix) {
                laDerivee = `-\\dfrac{1}{(x${ecritureAlgebrique(b)})^{2}}`
              } else {
                laDerivee = `-\\dfrac{1}{(${b}+x)^{2}}`
              }
            } else {
              // Étape intermédiaire si a≠1
              if (choix) {
                laDeriveeIntermediaire = `${a}\\times\\dfrac{-1}{(x${ecritureAlgebrique(b)})^{2}}`
                laDerivee = `\\dfrac{${-a}}{(x${ecritureAlgebrique(b)})^{2}}`
              } else {
                laDeriveeIntermediaire = `${a}\\times\\dfrac{-1}{(${b}+x)^{2}}`
                laDerivee = `\\dfrac{${-a}}{(${b}+x)^{2}}`
              }
            }

            // df = `\\mathbb{R}\\smallsetminus\\left\\{${-b}\\right\\}`
          }
          break

        case 2: // u(x) = mx + p
          {
            const m = randint(-4, 9, [0, 1, -1])
            const p = randint(-10, 10, 0)
            const u = reduireAxPlusB(m, p, 'x')

            laFonction = `\\dfrac{${a}}{${u}}`
            uExpression = u
            uprime = `${m}`

            if (a === 1) {
              // Pas d'étape intermédiaire si a=1
              laDeriveeIntermediaire = `\\dfrac{-${m}}{(${u})^{2}}`
              laDerivee = `\\dfrac{${-m}}{(${u})^{2}}`
            } else {
              // Étape intermédiaire si a≠1
              laDeriveeIntermediaire = `${a}\\times\\dfrac{-${m}}{(${u})^{2}}`
              laDerivee = `\\dfrac{${-a * m}}{(${u})^{2}}`
            }
          }
          break

        case 3: // u(x) = ax² + b
          {
            const coeff = randint(2, 5)
            const b = randint(-10, 10, 0)

            if (choix) {
              laFonction = `\\dfrac{${a}}{${coeff}x^{2}${ecritureAlgebrique(b)}}`
              uExpression = `${coeff}x^{2}${ecritureAlgebrique(b)}`
            } else {
              laFonction = `\\dfrac{${a}}{${b}+${coeff}x^{2}}`
              uExpression = `${b}+${coeff}x^{2}`
            }

            uprime = `${2 * coeff}x`

            if (a === 1) {
              // Pas d'étape intermédiaire si a=1
              if (choix) {
                laDerivee = `-\\dfrac{${2 * coeff}x}{(${coeff}x^{2}${ecritureAlgebrique(b)})^{2}}`
              } else {
                laDerivee = `-\\dfrac{${2 * coeff}x}{(${b}+${coeff}x^{2})^{2}}`
              }
            } else {
              // Étape intermédiaire si a≠1
              if (choix) {
                laDeriveeIntermediaire = `${a}\\times\\dfrac{-${2 * coeff}x}{(${coeff}x^{2}${ecritureAlgebrique(b)})^{2}}`
                laDerivee = `\\dfrac{${-a * 2 * coeff}x}{(${coeff}x^{2}${ecritureAlgebrique(b)})^{2}}`
              } else {
                laDeriveeIntermediaire = `${a}\\times\\dfrac{-${2 * coeff}x}{(${b}+${coeff}x^{2})^{2}}`
                laDerivee = `\\dfrac{${-a * 2 * coeff}x}{(${b}+${coeff}x^{2})^{2}}`
              }
            }
          }
          break
      }

      const texte =
        `$f(x)=${laFonction}$<br>` +
        ajouteChampTexteMathLive(this, i, KeyboardType.lyceeClassique, {
          texteAvant: "$f'(x)=$",
        })

      let texteCorr = ''

      if (this.correctionDetaillee) {
        texteCorr += `${a === 1 ? `La fonction $f$ est de la forme $\\dfrac{1}{u}$ avec $u(x)=${uExpression}$.<br>` : `La fonction $f$ est de la forme $a\\times \\dfrac{1}{u}$ avec $a=${a}$  et $u(x)=${uExpression}$.<br>`}`
        texteCorr += ` ${a === 1 ? `On utilise la formule${sp()}: $\\left(\\dfrac{1}{u}\\right)'=\\dfrac{-u'}{u^{2}}$` : `On sait que $\\left(\\dfrac{1}{u}\\right)'=\\dfrac{-u'}{u^{2}}$, donc $f'=${a}\\times \\dfrac{-u'}{u^{2}}$`}.<br>`
        texteCorr += `Puisque $u'(x)=${uprime}$, on obtient${sp()}: `

        if (a === 1) {
          // Si a=1 : affichage direct du résultat en orange
          texteCorr += `$f'(x)=${miseEnEvidence(laDerivee)}$.<br>`
        } else {
          // Si a≠1 : affichage de l'étape intermédiaire puis du résultat en orange
          texteCorr += `$f'(x)=${laDeriveeIntermediaire}=${miseEnEvidence(laDerivee)}$.<br>`
        }
      } else {
        texteCorr += `On obtient${sp()}: $f'(x)=${miseEnEvidence(laDerivee)}$.<br>`
      }

      if (this.questionJamaisPosee(i, laFonction)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        handleAnswers(this, i, {
          reponse: {
            value: laDerivee,
            options: { fonction: true, variable: 'x' },
          },
        })
        i++
        cpt = 0
      }
      cpt++
    }
  }
}

export default DerivationQuotientParticulier
