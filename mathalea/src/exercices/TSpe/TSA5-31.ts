import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { reduireAxPlusB } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Trinome from '../../modules/Trinome'
import Exercice from '../Exercice'
export const titre = 'Calculer la dérivée de $\\ln(u)$'
export const interactifReady = true

export const uuid = '25135'
export const refs = {
  'fr-fr': ['TSA5-31', 'TCA4-31'],
  'fr-ch': ['4mDer-1'],
}

export const dateDePublication = '17/04/2024'

/**
 * Dérivée de ln(u)
 * @author Jean-claude Lhote
 *
 */
class DerivationLnU extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Types de fonctions : ',
      'Nombres séparés par des tirets :\n1 : ln(ax+b)\n2 : ln(ax²+bx+c)\n3 : ln(x^n)\n4 : Mélange',
    ]
    this.sup = '1'
    this.nbQuestions = 5
    this.correctionDetailleeDisponible = true
  }

  nouvelleVersion() {
    const listeTypeDeQuestion = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      defaut: 4,
      melange: 4,
      nbQuestions: this.nbQuestions,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let laFonctionFEnLatex: string
      let df: string
      let formeGeneraleDerivee: string
      let formeGenerale: string
      let fPrime: string
      let fPrimeDetaillee: string
      let a = randint(-10, 10, 0)
      let b = randint(-5, 5, 0)
      let c = randint(-10, 10)
      let u: string
      let uPrime: string
      let valeurInterdite: string
      let domaine: [number, number] = [1, 10] // la variable domaine pour la fonction de comparaison
      if (listeTypeDeQuestion[i] === 1) {
        u = reduireAxPlusB(a, b)
        uPrime = String(a)
        valeurInterdite = new FractionEtendue(-b, a).simplifie().texFSD
        fPrimeDetaillee = `\\dfrac{${String(a)}}{${u}}`
        fPrime = `\\dfrac{${String(a)}}{${u}}`
        laFonctionFEnLatex = `\\ln\\left( ${u}\\right)`
        df =
          a < 0
            ? `\\left]-\\infty;${valeurInterdite}\\right[`
            : `\\left]${valeurInterdite};+\\infty\\right[`
        formeGenerale = 'ln(u)'
        formeGeneraleDerivee = '(ln(u))^\\prime=\\dfrac{u^\\prime}{u}'
        domaine = a < 0 ? [-b / a - 10, -b / a - 1] : [-b / a + 1, -b / a + 10]
      } else if (listeTypeDeQuestion[i] === 2) {
        while (b ** 2 - 4 * a * c <= 0) {
          // On veut éviter un domaine de définition vide
          a = randint(-10, 10, 0)
          b = randint(-5, 5, 0)
          c = randint(-10, 10)
        }
        const poly = new Trinome(a, b, c)
        u = poly.tex
        uPrime = reduireAxPlusB(2 * a, b)
        fPrimeDetaillee = `\\dfrac{${uPrime}}{${u}}`
        fPrime = `\\dfrac{${uPrime}}{${u}}`
        laFonctionFEnLatex = `\\ln\\left( ${u}\\right)`
        df =
          a > 0
            ? `\\left]-\\infty;${poly.texX1}\\right[\\cup \\left]${poly.texX2};+\\infty\\right[`
            : `\\left]${poly.texX1};${poly.texX2}\\right[`
        formeGenerale = 'ln(u)'
        formeGeneraleDerivee = '(ln(u))^\\prime=\\dfrac{u^\\prime}{u}'
        domaine =
          a > 0
            ? [Number(poly.x1) - 10, Number(poly.x1) - 1]
            : [Number(poly.x1) + 0.01, Number(poly.x2) - 0.01]
      } else {
        const n = randint(3, 9)
        u = `x^{${n}}`
        uPrime = `${String(n)}x^{${n - 1}}`
        fPrimeDetaillee = `\\dfrac{${uPrime}}{${u}}=\\dfrac{${String(n)}}{x}`
        fPrime = `\\dfrac{${String(n)}}{x}`
        laFonctionFEnLatex = `\\ln(${u})`
        df = '\\R_+^*'
        formeGenerale = '\\ln(u)'
        formeGeneraleDerivee = '(\\ln(u))^\\prime=\\dfrac{u^\\prime}{u}'
        domaine = [1, 10]
      }
      const texte =
        `Donner l'expression de la dérivée de la fonction $f$ définie sur $${df}$ par :<br>$f(x)=${laFonctionFEnLatex}$.<br>` +
        ajouteChampTexteMathLive(this, i, KeyboardType.clavierFullOperations, {
          texteAvant: "$f'(x)=$",
        })
      let texteCorr = ''
      if (this.correctionDetaillee) {
        texteCorr += `La fonction $f$ est de la forme $${formeGenerale}$ donc la dérivée est de la forme $${formeGeneraleDerivee}$.<br>`
        texteCorr += `On a $u(x)=${u}$ et $u^\\prime(x)=${uPrime}$.<br>`
        texteCorr += `$f^\\prime(x)=${fPrimeDetaillee}$.<br>`
        if (listeTypeDeQuestion[i] === 3) {
          texteCorr +=
            'On peut utiliser ici la propriété $\\ln(x^n)=n\\ln(x)$ et donc $(\\ln(x^n))^\\prime=n(\\ln(x))^\\prime=\\dfrac{n}{x}$.<br>'
        }
      }
      texteCorr += `L'expression de la dérivée de la fonction $f$ définie par $f(x)=${laFonctionFEnLatex}$ est : `
      texteCorr += `$f'(x)=${miseEnEvidence(fPrime)}$.`

      if (this.questionJamaisPosee(i, laFonctionFEnLatex, fPrime)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        handleAnswers(this, i, {
          reponse: {
            value: fPrime,
            options: { fonction: true, variable: 'x', domaine },
          },
        })
        i++
        cpt--
      }
      cpt++
    }
  }
}

export default DerivationLnU
