import { lampeMessage } from '../../lib/format/message'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  isEqual,
  isReduced,
  onlyIrreducibleFractions,
  seq,
} from '../../lib/interactif/checks'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreMinusculeDepuisChiffre } from '../../lib/outils/outilString'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Déterminer l'équation d'une tangente avec la dérivée d'une fonction composée"
export const dateDePublication = '02/11/2026'
export const interactifReady = true
export const interactifType = 'mathLive'

export const uuid = 'ef486'

export const refs = {
  'fr-fr': ['TSA3-31'],
  'fr-ch': [],
}

type TypeDeFonction = 'puissance' | 'exp' | 'racine'

/**
 * Déterminer l'équation réduite d'une tangente à la courbe de u^n, e^u ou √u,
 * avec u polynôme du second degré.
 * @author Arnaud Meistermann
 */
export default class TangenteFonctionComposee extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de fonction',
      [
        'Nombres séparés par des tirets :',
        '1 : $u^n$',
        '2 : $\\mathrm{e}^u$',
        '3 : $\\sqrt{u}$',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.sup = '4'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const listeTypes = combinaisonListes(
      gestionnaireFormulaireTexte({
        saisie: this.sup,
        min: 1,
        max: 3,
        melange: 4,
        defaut: 4,
        nbQuestions: this.nbQuestions,
        listeOfCase: ['puissance', 'exp', 'racine'],
      }) as TypeDeFonction[],
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const typeF = listeTypes[i]
      const nomF = lettreMinusculeDepuisChiffre(i + 6)
      const a = randint(-3, 3)
      // u(x) = α(x-a)² + q(x-a) + v, donc u(a) = v et u'(a) = q
      let alpha = 1
      let q = 0
      let v = 0
      let n = 1
      // f'(a) = numerateurPente / denominateurPente
      let numerateurPente = 0
      let denominateurPente = 1
      let imageA = 0
      switch (typeF) {
        case 'puissance':
          n = randint(2, 4)
          alpha = choice([-1, 1])
          q = randint(-3, 3, 0)
          v = n === 4 ? choice([-1, 1]) : choice([-1, 1, 2])
          imageA = v ** n
          numerateurPente = n * v ** (n - 1) * q
          break
        case 'exp':
          alpha = choice([-1, 1])
          q = randint(-4, 4, 0)
          v = 0
          imageA = 1
          numerateurPente = q
          break
        case 'racine': {
          // Δ = q² - 4m² < 0 : u est strictement positive sur ℝ
          const m = randint(1, 3)
          q = randint(-(2 * m - 1), 2 * m - 1, 0)
          v = m * m
          imageA = m
          numerateurPente = q
          denominateurPente = 2 * m
          break
        }
      }
      const coeffX = q - 2 * alpha * a
      const constante = alpha * a * a - q * a + v
      const u = new Polynome({ coeffs: [constante, coeffX, alpha] })
      const uPrime = u.derivee()
      const pente = new FractionEtendue(
        numerateurPente,
        denominateurPente,
      ).simplifie()
      const ordonneeOrigine = new FractionEtendue(
        imageA * denominateurPente - numerateurPente * a,
        denominateurPente,
      ).simplifie()
      const reponse = reduireAxPlusB(pente, ordonneeOrigine)

      // u(a) et u'(a) avec a substitué, pour détailler le calcul de f(a) et f'(a)
      const aTex = ecritureParentheseSiNegatif(a)
      const uDeA = `${alpha === 1 ? '' : '-'}${aTex}^2${coeffX === 0 ? '' : `${ecritureAlgebrique(coeffX)}\\times${aTex}`}${constante === 0 ? '' : ecritureAlgebrique(constante)}`
      const uPrimeDeA = `${2 * alpha}\\times${aTex}${coeffX === 0 ? '' : ecritureAlgebrique(coeffX)}`
      const vTex = ecritureParentheseSiNegatif(v)
      const qTex = ecritureParentheseSiNegatif(q)
      let expression = ''
      let cours = ''
      let derivee = ''
      let valeurs = ''
      switch (typeF) {
        case 'puissance':
          expression = `\\left(${u.toLatex()}\\right)^{${n}}`
          cours = `Si $u$ est une fonction dérivable sur un intervalle $I$ et $n$ un entier naturel non nul, alors $u^n$ est dérivable sur $I$ et on a :\\[(u^n)'=nu'u^{n-1}.\\]`
          derivee = `${n}\\left(${uPrime.toLatex()}\\right)\\left(${u.toLatex()}\\right)${n === 2 ? '' : `^{${n - 1}}`}`
          valeurs = `$${nomF}(${a})=\\left(${uDeA}\\right)^{${n}}=${vTex}^{${n}}=${imageA}$<br>$${nomF}'(${a})=${n}\\left(${uPrimeDeA}\\right)\\left(${uDeA}\\right)${n === 2 ? '' : `^{${n - 1}}`}=${n}\\times${qTex}\\times${vTex}${n === 2 ? '' : `^{${n - 1}}`}=${pente.texFSD}$`
          break
        case 'exp':
          expression = `\\mathrm{e}^{${u.toLatex()}}`
          cours = `Si $u$ est une fonction dérivable sur un intervalle $I$, alors $\\mathrm{e}^u$ est dérivable sur $I$ et on a :\\[(\\mathrm{e}^u)'=u'\\mathrm{e}^u.\\]`
          derivee = `\\left(${uPrime.toLatex()}\\right)\\mathrm{e}^{${u.toLatex()}}`
          valeurs = `$${nomF}(${a})=\\mathrm{e}^{${uDeA}}=\\mathrm{e}^{0}=1$<br>$${nomF}'(${a})=\\left(${uPrimeDeA}\\right)\\mathrm{e}^{${uDeA}}=${qTex}\\times\\mathrm{e}^{0}=${pente.texFSD}$`
          break
        case 'racine':
          expression = `\\sqrt{${u.toLatex()}}`
          cours = `Si $u$ est une fonction dérivable et strictement positive sur un intervalle $I$, alors $\\sqrt{u}$ est dérivable sur $I$ et on a :\\[(\\sqrt{u})'=\\dfrac{u'}{2\\sqrt{u}}.\\]`
          derivee = `\\dfrac{${uPrime.toLatex()}}{2\\sqrt{${u.toLatex()}}}`
          valeurs = `$${nomF}(${a})=\\sqrt{${uDeA}}=\\sqrt{${v}}=${imageA}$<br>$${nomF}'(${a})=\\dfrac{${uPrimeDeA}}{2\\sqrt{${uDeA}}}=\\dfrac{${q}}{2\\times${imageA}}=${pente.texFSD}$`
          break
      }

      let texte = `${typeF === 'racine' ? `On admet que, pour tout réel $x$, $${u.toLatex()}>0$.<br>` : ''}Soit $${nomF}$ la fonction définie sur $\\mathbb R$ par $${nomF}(x)=${expression}$.<br>On note $\\mathcal C_${nomF}$ sa courbe représentative.<br>Déterminer l'équation réduite de la tangente à $\\mathcal C_${nomF}$ au point d'abscisse $${a}$.`
      texte += ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierFonctionsTerminales,
        { texteAvant: '<br>$y=$' },
      )

      let texteCorr = lampeMessage({ titre: 'Rappel :', texte: cours })
      texteCorr += `Soit $x\\in\\mathbb R$. On pose $u(x)=${u.toLatex()}$ donc $u'(x)=${uPrime.toLatex()}$.<br>`
      texteCorr += `On a, en appliquant la formule ci-dessus${typeF === 'puissance' ? ` avec $n=${n}$` : ''} : \\[${nomF}'(x)=${derivee}.\\]`
      texteCorr += `${valeurs}<br>`
      texteCorr += `L'équation réduite de la tangente au point d'abscisse $${a}$ est $y=${nomF}'(${a})(x-${a < 0 ? `(${a})` : a})+${nomF}(${a})$, c'est-à-dire :<br>`
      // Si a = 0, l'équation est déjà réduite : pas d'étape intermédiaire
      if (a !== 0) {
        texteCorr += `$y=${pente.texFractionSaufUn}\\left(x${ecritureAlgebrique(-a)}\\right)${ecritureAlgebrique(imageA)}$<br>`
      }
      texteCorr += `$y=${miseEnEvidence(reponse)}$.`

      if (this.questionJamaisPosee(i, typeF, a, alpha, q, v, n)) {
        handleAnswers(this, i, {
          reponse: {
            value: reponse,
            compare: seq([isEqual(), isReduced(), onlyIrreducibleFractions()]),
          },
        })
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
