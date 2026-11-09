import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureAlgebriqueSauf1, rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { obtenirListeFractionsIrreductibles } from '../../modules/fractions'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Dériver une fonction du type $\\lambda u$'
export const interactifReady = true

export const uuid = 'ebd8a'
export const refs = {
  'fr-fr': ['1AN14-1'], // remplace 1AN14-1a
  'fr-ch': ['3mA2-5'],
}
export const dateDePublication = '13/12/2025'

const listFrac = obtenirListeFractionsIrreductibles()

/**
 * Dérivation de fonctions du type x -> ku(x),
 * avec u une fonction de référence.
 * Version étendue avec:
 * 1. Fonctions affines (pente peut être 0)
 * 2. Monômes jusqu'au degré 6 avec coefficient fractionnaire
 * 3. Polynômes de degré 3
 * 4. Fonction inverse avec coefficient
 * 5. Racine carrée avec coefficient
 * #forgeathon2025
 * @author Stéphane Guyon, Nathan Scheinmann
 *
 */
class DerivationFonctionsUsuellesEtendue extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Types de fonctions',
      'Nombres séparés par des tirets : \n1 : Affine avec pente possible nulle\n2 : Monôme degré 2 à 6 avec coeff. fractionnaire\n3 : Polynôme degré 3\n4 : Inverse avec coefficient\n5 : Racine carrée avec coefficient\n6 : Mélange',
    ]
    this.sup = '6'
    this.nbQuestions = 5
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = false
  }

  nouvelleVersion() {
    const listeTypeDeQuestion = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 5,
      defaut: 1,
      melange: 6,
      nbQuestions: this.nbQuestions,
      listeOfCase: ['affine', 'monome', 'polynome3', 'inverse', 'racine'],
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let laFonction: string = ''
      let laDerivee: string = ''
      let df: string = ''
      const nameF = [
        'f',
        'g',
        'h',
        'l',
        'r',
        's',
        't',
        'u',
        'v',
        'w',
        'b',
        'c',
        'd',
        'e',
      ][i % 16]
      let correctionDetaillee = ''

      switch (listeTypeDeQuestion[i]) {
        case 'affine':
          {
            // Fonction affine (pente peut être 0)
            df = 'pour tout $x\\in\\R$'
            const a = randint(-10, 10) // Pente peut être 0
            const b = randint(-10, 10, 0)

            if (choice([true, false])) {
              // Forme ax + b
              laFonction = new Polynome({ coeffs: [b, a] }).toLatex()
              laDerivee = String(a)
            } else {
              // Forme fractionnaire
              const frac = choice(listFrac).multiplieEntier(choice([-1, 1]))
              laFonction = `${frac.texFractionSimplifiee}x${ecritureAlgebriqueSauf1(b)}`
              laDerivee = `${frac.texFractionSimplifiee}`
            }

            correctionDetaillee = `La dérivée d'une fonction affine d'expression $f(x)=ax+b$ est $f'(x)=a$.<br>`
          }
          break

        case 'monome':
          {
            // Monôme avec exposant jusqu'à degré 6 et coefficient fractionnaire
            df = 'pour tout $x\\in\\R$'
            const n = randint(2, 6)
            const frac = choice(listFrac).multiplieEntier(choice([-1, 1]))

            if (choice([true, false])) {
              // Forme a/b x^n
              laFonction = `${frac.texFractionSimplifiee}x^{${n}}`
              const coeffDerivee = new FractionEtendue(frac.num * n, frac.den)
              laDerivee = `${rienSi1(coeffDerivee.simplifie())}x^{${rienSi1(n - 1)}}`
            } else {
              // Forme x^n / b
              const num = choice([-1, 1])
              const den = randint(2, 8)
              laFonction = `\\dfrac{${rienSi1(num)}x^{${rienSi1(n)}}}{${den}}`
              const coeffDerivee = new FractionEtendue(num * n, den)
              laDerivee = `${rienSi1(coeffDerivee.simplifie())}x^{${rienSi1(n - 1)}}`
              correctionDetaillee = `On a $${nameF}(x)=\\dfrac{${num}}{${den}}x^{${n}}$. `
            }

            correctionDetaillee += `La dérivée d'une fonction d'expression $f(x)=ax^n$ est $f'(x)=anx^{n-1}$ pour $a\\in\\mathbb{R}, n\\in\\mathbb{N}$.<br>`
          }
          break

        case 'polynome3':
          {
            // Polynôme de degré 3
            df = 'pour tout $x\\in\\R$'
            const a = randint(-5, 5, 0)
            const b = randint(-8, 8) // b peut être 0
            const c = randint(-10, 10) // c peut être 0
            const d = randint(-10, 10) // d peut être 0

            // Construction de la fonction ax^3 + bx^2 + cx + d
            laFonction = new Polynome({ coeffs: [d, c, b, a] }).toLatex()

            // Dérivée: 3ax^2 + 2bx + c
            const derA = 3 * a
            const derB = 2 * b
            const derC = c

            laDerivee = new Polynome({ coeffs: [derC, derB, derA] }).toLatex()

            correctionDetaillee = `La dérivée d'un polynôme $f(x)=ax^3+bx^2+cx+d$ de degré 3 est $f'(x)=3ax^2+2bx+c$.<br>`
          }
          break

        case 'inverse':
          // Fonction inverse avec coefficient
          df = 'pour tout $x\\in\\R^*$'

          if (choice([true, false])) {
            // Forme simple: a/x
            const a = randint(-10, 10, [-1, 0, 1])
            laFonction = `\\dfrac{${a}}{x}`
            laDerivee = `${a < 0 ? '' : '-'}\\dfrac{${Math.abs(a)}}{x^2}`
            correctionDetaillee = `La dérivée d'une fonction d'expression $f(x)=\\dfrac{a}{x}$ avec $a\\in\\mathbb{R}$ est $f'(x)=-\\dfrac{a}{x^2}$.<br>`
          } else {
            // Forme fractionnaire: (a/b)/x
            const frac = choice(listFrac).multiplieEntier(choice([-1, 1]))
            const num = frac.num
            const den = frac.den
            laFonction = `\\dfrac{${num}}{${den}x}`
            laDerivee = `${num < 0 ? '' : '-'}\\dfrac{${Math.abs(num)}}{${den}x^2}`
            correctionDetaillee = `La dérivée d'une fonction d'expression $f(x)=\\dfrac{a}{x}$ avec $a\\in\\mathbb{R}$ est $f'(x)=-\\dfrac{a}{x^2}$.<br>`
          }

          break

        case 'racine':
          {
            // Racine carrée avec coefficient
            df = 'pour tout $x\\in\\R^*_+$'
            const monChoix = choice([true, false])
            if (monChoix) {
              // Forme simple: a√x
              const a = randint(-10, 10, [-1, 0, 1])
              laFonction = `${rienSi1(a)}\\sqrt{x}`
              const frac = new FractionEtendue(a, 2)
              laDerivee = `\\dfrac{${frac.num}}{${frac.den}\\sqrt{x}}`
              correctionDetaillee = `La dérivée d'une fonction d'expression $f(x)=a\\sqrt{x}$ est $f'(x)=\\dfrac{a}{2\\sqrt{x}}$.<br>`
            } else {
              // Forme fractionnaire: (a/b)√x
              const frac = choice(listFrac).multiplieEntier(choice([-1, 1]))
              laFonction = `${frac.texFractionSimplifiee}\\sqrt{x}`
              const fracDerivee = new FractionEtendue(frac.num, frac.den * 2)
              laDerivee = `${fracDerivee.num < 0 ? '-' : ''}\\dfrac{${Math.abs(fracDerivee.num)}}{${fracDerivee.den}\\sqrt{x}}`
              correctionDetaillee = `La dérivée d'une fonction d'expression $f(x)=a\\sqrt{x}$ avec $a\\in\\mathbb{R}$ et $x\\in \\mathbb{R}^*_+$ est $f'(x)=\\dfrac{a}{2\\sqrt{x}}$.<br>`
            }
          }
          break

        default:
          df = 'pour tout $x\\in\\R$'
          laFonction = '42'
          laDerivee = '0'
          break
      }

      /* const passageDeLigneCorr =
        laDerivee.includes('frac') || laFonction.includes('frac') ? '<br>' : ''
      */
      let texte = `Donner la dérivée de la fonction $${nameF}$, dérivable ${df}, définie par  $${nameF}(x)=${laFonction}$.`
      if (this.interactif)
        texte +=
          `<br>$${nameF}'(x)=$` +
          ajouteChampTexteMathLive(this, i, KeyboardType.lyceeClassique)
      const reponse = laDerivee
      let texteCorr = ''
      if (this.correctionDetaillee) texteCorr += correctionDetaillee + 'Donc '
      // texteCorr += correctionDetaillee.replace('<br>', passageDeLigneCorr)
      texteCorr += `$${nameF}'(x)=${miseEnEvidence(reponse)}$`
      if (this.correctionDetaillee) texteCorr += '.'
      if (this.questionJamaisPosee(i, laFonction)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        handleAnswers(this, i, {
          reponse: {
            value: reponse,
            //  options: { fonction: true, variable: 'x', domaine: [-10, 10] },
            options: { calculFormel: true },
          },
        })
        i++
        cpt--
      }
      cpt++
    }
  }
}

export default DerivationFonctionsUsuellesEtendue
