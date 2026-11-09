import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { isEqual, seq } from '../../lib/interactif/checks'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { lampeMessage } from '../../lib/format/message'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Dériver une fonction du type $u^n$, $\\mathrm{e}^u$ ou $\\sqrt{u}$'
export const dateDePublication = '02/11/2026'
export const interactifReady = true
export const interactifType = 'mathLive'

export const uuid = '5fe20'

export const refs = {
  'fr-fr': ['TSA3-30'],
  'fr-ch': [],
}

type TypeDeFonction = 'puissance' | 'exp' | 'racine'
type TypeDeU = 'polynome' | 'exponentielle'

type DescriptionU = {
  /** u(x) */
  tex: string
  /** u'(x) */
  primeTex: string
  /** u' facteur d'un produit dans la formule : n×(-3)×…, n×(2x+1)×… */
  facteur: string
  constante: boolean
  /** k×u' en tête d'un produit simplifié : 6(…), 6e^{2x}(…), (6x+3)(…) */
  fois: (k: number) => string
  /** u'/2 quand la simplification par 2 est possible */
  demi?: string
  /** Ensemble de définition de la fonction (où u > 0 pour √u) */
  ensemble: string
  /** Pourquoi u > 0 sur l'ensemble (pour √u) */
  raisonPositive: string
  cle: number[]
}

const R = '\\mathbb R'

/**
 * Polynôme de 2 ou 3 monômes, de degré 2 à 6 : coefficients par degré
 * croissant et ensemble de définition. Si positive (pour √u), u > 0 sur
 * l'ensemble :
 * - puissances paires à coefficients positifs et constante positive : sur ℝ ;
 * - coefficients positifs : sur ]0 ; +∞[.
 */
function coefficientsPolynome(positive: boolean): {
  coeffs: number[]
  ensemble: string
  raisonPositive: string
} {
  const nbMonomes = randint(2, 3)
  const surR = positive && choice([true, false])
  const degres = surR
    ? [0, ...shuffle([2, 4, 6]).slice(0, nbMonomes - 1)]
    : (() => {
        const degreMax = randint(2, 6)
        const autres = Array.from({ length: degreMax }, (_, k) => k)
        return [degreMax, ...shuffle(autres).slice(0, nbMonomes - 1)]
      })()
  const coeffs = new Array(Math.max(...degres) + 1).fill(0)
  for (const d of degres) {
    coeffs[d] = positive ? randint(1, 5) : randint(-5, 5, 0)
  }
  return {
    coeffs,
    ensemble: !positive || surR ? R : '\\left]0\\,;\\,+\\infty\\right[',
    raisonPositive: surR
      ? "car $u(x)$ est la somme d'une constante strictement positive et de puissances paires de $x$ multipliées par des coefficients positifs"
      : 'car tous les coefficients de $u(x)$ sont positifs et $x>0$',
  }
}

/** u polynôme, strictement positif sur l'ensemble si demandé (pour √u). */
function uPolynome(positive: boolean): DescriptionU {
  const { coeffs, ensemble, raisonPositive } = coefficientsPolynome(positive)
  const u = new Polynome({ coeffs })
  const uPrime = u.derivee()
  const constante = uPrime.deg === 0
  // u' réduit à un monôme (-6x^5) : pas de parenthèses en tête de produit
  const unSeulMonome =
    uPrime.monomes.filter((c) => Number(c) !== 0).length === 1
  return {
    tex: u.toLatex(),
    primeTex: uPrime.toLatex(),
    facteur: constante
      ? ecritureParentheseSiNegatif(Number(uPrime.monomes[0]))
      : unSeulMonome && Number(uPrime.monomes[uPrime.deg]) > 0
        ? uPrime.toLatex()
        : `\\left(${uPrime.toLatex()}\\right)`,
    constante,
    fois: (k) => {
      const p = uPrime.multiply(k)
      return p.deg === 0
        ? rienSi1(Number(p.monomes[0]))
        : unSeulMonome
          ? p.toLatex()
          : `\\left(${p.toLatex()}\\right)`
    },
    demi: uPrime.monomes.every((c) => Number(c) % 2 === 0)
      ? new Polynome({
          coeffs: uPrime.monomes.map((c) => Number(c) / 2),
        }).toLatex()
      : undefined,
    ensemble,
    raisonPositive,
    cle: coeffs,
  }
}

/** u(x) = αe^{kx} + b, strictement positive si demandé (pour √u). */
function uExponentielle(positive: boolean): DescriptionU {
  const alpha = positive ? randint(1, 3) : randint(-3, 3, 0)
  const k = choice([-2, -1, 1, 2, 3])
  const b = positive ? randint(1, 5) : randint(-5, 5, 0)
  const eTex = `\\mathrm{e}^{${k === 1 ? '' : k === -1 ? '-' : k}x}`
  const primeTex = `${rienSi1(alpha * k)}${eTex}`
  return {
    tex: `${rienSi1(alpha)}${eTex}${ecritureAlgebrique(b)}`,
    primeTex,
    facteur: alpha * k < 0 ? `\\left(${primeTex}\\right)` : primeTex,
    constante: false,
    fois: (m) => `${rienSi1(m * alpha * k)}${eTex}`,
    demi:
      (alpha * k) % 2 === 0 ? `${rienSi1((alpha * k) / 2)}${eTex}` : undefined,
    ensemble: R,
    raisonPositive: `car $${eTex}>0$`,
    cle: [alpha, k, b],
  }
}

/**
 * Calculer la dérivée de u^n, e^u ou √u, avec u polynôme (2 ou 3 monômes, degré 6 au plus)
 * ou u(x) = αe^{kx} + b (pour u^n et √u seulement).
 * @author Arnaud Meistermann
 */
export default class DeriveeFonctionComposee extends Exercice {
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
    this.besoinFormulaire2Texte = [
      'Type de fonction $u$',
      [
        'Nombres séparés par des tirets :',
        '1 : Polynôme',
        '2 : Exponentielle (pour $u^n$ et $\\sqrt{u}$)',
        '3 : Mélange',
      ].join('\n'),
    ]
    this.sup = '4'
    this.sup2 = '3'
    this.nbQuestions = 2
    this.nbCols = 2
    this.nbColsCorr = 2
  }

  nouvelleVersion() {
    const listeTypesF = combinaisonListes(
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
    const listeTypesU = combinaisonListes(
      gestionnaireFormulaireTexte({
        saisie: this.sup2,
        min: 1,
        max: 2,
        melange: 3,
        defaut: 3,
        nbQuestions: this.nbQuestions,
        listeOfCase: ['polynome', 'exponentielle'],
      }) as TypeDeU[],
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const typeF = listeTypesF[i]
      // e^u avec u exponentielle n'est pas proposé : on prend alors u polynôme
      const typeU = typeF === 'exp' ? 'polynome' : listeTypesU[i]
      // Pas de i ni de j, réservés aux complexes et aux indices
      const nomF = ['f', 'g', 'h', 'k', 'p', 'q', 'r', 's', 'v', 'w'][i % 10]
      const u =
        typeU === 'exponentielle'
          ? uExponentielle(typeF === 'racine')
          : uPolynome(typeF === 'racine')
      const n = randint(2, 5)

      let expression = ''
      let cours = ''
      let reponse = ''
      switch (typeF) {
        case 'puissance':
          expression = `\\left(${u.tex}\\right)^{${n}}`
          cours = `Si $u$ est une fonction dérivable sur un intervalle $I$ et $n$ un entier naturel non nul, alors $u^n$ est dérivable sur $I$ et on a :\\[(u^n)'=nu'u^{n-1}.\\]`
          reponse = `${u.fois(n)}\\left(${u.tex}\\right)${n === 2 ? '' : `^{${n - 1}}`}`
          break
        case 'exp':
          expression = `\\mathrm{e}^{${u.tex}}`
          cours = `Si $u$ est une fonction dérivable sur un intervalle $I$, alors $\\mathrm{e}^u$ est dérivable sur $I$ et on a :\\[(\\mathrm{e}^u)'=u'\\mathrm{e}^u.\\]`
          reponse = `${u.fois(1)}\\mathrm{e}^{${u.tex}}`
          break
        case 'racine':
          cours = `Si $u$ est une fonction dérivable et strictement positive sur un intervalle $I$, alors $\\sqrt{u}$ est dérivable sur $I$ et on a :\\[(\\sqrt{u})'=\\dfrac{u'}{2\\sqrt{u}}.\\]`
          expression = `\\sqrt{${u.tex}}`
          reponse = u.demi
            ? `\\dfrac{${u.demi}}{\\sqrt{${u.tex}}}`
            : `\\dfrac{${u.primeTex}}{2\\sqrt{${u.tex}}}`
          break
      }
      const formule = {
        puissance: `${n}\\times${u.facteur}\\times\\left(${u.tex}\\right)${n === 2 ? '' : `^{${n - 1}}`}`,
        exp: u.constante
          ? `${u.facteur}\\times\\mathrm{e}^{${u.tex}}`
          : reponse,
        racine: `\\dfrac{${u.primeTex}}{2\\sqrt{${u.tex}}}`,
      }[typeF]

      let texte = `Soit $${nomF}$ la fonction définie sur $${u.ensemble}$ par $${nomF}(x)=${expression}$.<br>Déterminer l'expression de sa fonction dérivée.`
      texte += ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierFonctionsTerminales,
        { texteAvant: `<br>$${nomF}'(x)=$` },
      )

      let texteCorr = lampeMessage({ titre: 'Rappel :', texte: cours })
      texteCorr += `Soit $x\\in${u.ensemble}$. On pose $u(x)=${u.tex}$ donc $u'(x)=${u.primeTex}$.<br>`
      if (typeF === 'racine') {
        texteCorr += `On remarque que $u(x)>0$ ${u.raisonPositive}.<br>`
      }
      texteCorr += `On a, en appliquant la formule ci-dessus${typeF === 'puissance' ? ` avec $n=${n}$` : ''} :`
      if (formule === reponse) {
        texteCorr += `\\[${nomF}'(x)=${miseEnEvidence(reponse)}.\\]`
      } else {
        texteCorr += `\\[${nomF}'(x)=${formule}.\\]`
        texteCorr += "D'où, en simplifiant :"
        texteCorr += `\\[${nomF}'(x)=${miseEnEvidence(reponse)}.\\]`
      }

      if (this.questionJamaisPosee(i, typeF, typeU, n, ...u.cle)) {
        handleAnswers(this, i, {
          reponse: { value: reponse, compare: seq([isEqual()]) },
        })
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
