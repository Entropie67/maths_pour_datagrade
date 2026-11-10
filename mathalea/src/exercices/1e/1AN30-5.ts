import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { reduireAxPlusB, rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Résoudre des inéquations avec la fonction exponentielle'
export const dateDePublication = '23/05/2026'
export const interactifReady = true

/**
 * Résoudre des inéquations avec des exponentielles sans utiliser le logarithme.
 * @author Stéphane Guyon
 */

export const uuid = '61ed2'

export const refs = {
  'fr-fr': ['1AN30-5', 'TSA3-23', 'TCA7-23'],
  'fr-ch': [''],
}

type SigneInegalite = '<' | '\\leqslant' | '>' | '\\geqslant'

type CibleExponentielle = {
  exposant: -1 | 0 | 1
  tex: string
}

type SolutionInequation = {
  intervalle: string
  texte: string
  signeApresDivision?: SigneInegalite
  borne?: FractionEtendue
}

const ciblesExponentielles: CibleExponentielle[] = [
  { exposant: 0, tex: '1' },
  { exposant: 1, tex: '\\mathrm{e}' },
  { exposant: -1, tex: '\\dfrac{1}{\\mathrm{e}}' },
]

const signes: SigneInegalite[] = ['<', '\\leqslant', '>', '\\geqslant']

function signeTex(signe: SigneInegalite): string {
  return signe
}

function signeInverse(signe: SigneInegalite): SigneInegalite {
  switch (signe) {
    case '<':
      return '>'
    case '\\leqslant':
      return '\\geqslant'
    case '>':
      return '<'
    case '\\geqslant':
      return '\\leqslant'
  }
}

function estInegaliteVraie(
  gauche: number,
  signe: SigneInegalite,
  droite: number,
): boolean {
  switch (signe) {
    case '<':
      return gauche < droite
    case '\\leqslant':
      return gauche <= droite
    case '>':
      return gauche > droite
    case '\\geqslant':
      return gauche >= droite
  }
}

function intervalleDepuisComparaison(
  borne: FractionEtendue,
  signe: SigneInegalite,
): string {
  const borneTex = borne.texFractionSimplifiee
  switch (signe) {
    case '<':
      return `]-\\infty;${borneTex}[`
    case '\\leqslant':
      return `]-\\infty;${borneTex}]`
    case '>':
      return `]${borneTex};+\\infty[`
    case '\\geqslant':
      return `[${borneTex};+\\infty[`
  }
}

function resoudreInequationLineaire(
  coefficient: number,
  secondMembre: number,
  signe: SigneInegalite,
): SolutionInequation {
  if (coefficient === 0) {
    const estVraie = estInegaliteVraie(0, signe, secondMembre)
    return {
      intervalle: estVraie ? '\\mathbb{R}' : '\\emptyset',
      texte: estVraie
        ? 'Cette inégalité est vraie pour tout réel $x$.'
        : "Cette inégalité n'est vraie pour aucun réel $x$.",
    }
  }

  const borne = new FractionEtendue(secondMembre, coefficient).simplifie()
  const signeApresDivision = coefficient > 0 ? signe : signeInverse(signe)
  return {
    borne,
    signeApresDivision,
    intervalle: intervalleDepuisComparaison(borne, signeApresDivision),
    texte:
      coefficient > 0
        ? `Comme ${coefficient} est strictement positif, le sens de l'inégalité est conservé.`
        : `Comme ${coefficient} est strictement négatif, le sens de l'inégalité est inversé.`,
  }
}

function justificationDivision(coefficient: number): string {
  return coefficient > 0
    ? `\\quad \\text{car } ${coefficient} \\text{ est strictement positif}`
    : `\\quad \\text{car } ${coefficient} \\text{ est strictement négatif}`
}

function proprieteCroissance(signe: SigneInegalite): string {
  return `La fonction exponentielle est strictement croissante sur $\\mathbb{R}$.<br>
      Ainsi, pour tous réels $u$ et $v$, $\\mathrm{e}^u ${signeTex(signe)} \\mathrm{e}^v \\iff u ${signeTex(signe)} v$.<br>`
}

export default class InequationsExponentielles extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Choix des questions',
      'Nombres séparés par des tirets :\n1 : $\\mathrm{e}^{ax+b}$ > $0$, $1$, $\\mathrm{e}$ ou $\\dfrac{1}{\\mathrm{e}}$\n2 : $\\mathrm{e}^{ax+b}>\\mathrm{e}^{cx+d}$\n3 : Mélange',
    ]
    this.sup = '3'
    this.spacing = 1.5
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    const listeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: this.nbQuestions,
    })

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let value = ''
      const texteIntro = "Résoudre, dans $\\mathbb{R}$, l'inéquation : $"

      switch (listeDeQuestions[i]) {
        case 1: {
          const a = randint(-10, 10, 0)
          const b = randint(-6, 6)
          const signe = choice(signes)
          const expression = reduireAxPlusB(a, b)
          const cible = choice([
            { type: 'zero' as const, tex: '0' },
            { type: 'exponentielle' as const, ...choice(ciblesExponentielles) },
          ])

          texte = `${texteIntro}\\mathrm{e}^{${expression}} ${signeTex(signe)} ${cible.tex}$.<br>`

          if (cible.type === 'zero') {
            const estVraie = signe === '>' || signe === '\\geqslant'
            value = estVraie ? '\\mathbb{R}' : '\\emptyset'
            texteCorr = `On sait que pour tout réel $x$, $\\mathrm{e}^x>0$, donc pour tout réel $x$, $\\mathrm{e}^{${expression}}>0$.<br>`
            texteCorr += estVraie
              ? `L'inéquation est donc vraie pour tout réel $x$.`
              : `L'inéquation n'a donc pas de solution.`
          } else {
            const resolution = resoudreInequationLineaire(
              a,
              cible.exposant - b,
              signe,
            )
            value = resolution.intervalle
            texteCorr = proprieteCroissance(signe)
            texteCorr += `$\\begin{aligned}
            \\mathrm{e}^{${expression}}&${signeTex(signe)}${cible.tex}\\\\
            \\iff \\mathrm{e}^{${expression}}&${signeTex(signe)}\\mathrm{e}^{${cible.exposant}}\\\\
            \\iff ${expression}&${signeTex(signe)}${cible.exposant}\\\\
            \\iff ${rienSi1(a)}x&${signeTex(signe)}${cible.exposant - b}\\\\
            \\iff x&${signeTex(resolution.signeApresDivision!)}${resolution.borne!.texFractionSimplifiee}
            ${justificationDivision(a)}
            \\end{aligned}$`
          }
          break
        }

        case 2: {
          const a = randint(-10, 10, 0)
          const b = randint(-6, 6)
          const c = randint(-10, 10, 0)
          const d = randint(-6, 6)
          const signe = choice(signes)
          const expressionGauche = reduireAxPlusB(a, b)
          const expressionDroite = reduireAxPlusB(c, d)
          const coefficient = a - c
          const secondMembre = d - b
          const resolution = resoudreInequationLineaire(
            coefficient,
            secondMembre,
            signe,
          )

          value = resolution.intervalle
          texte = `${texteIntro}\\mathrm{e}^{${expressionGauche}} ${signeTex(signe)} \\mathrm{e}^{${expressionDroite}}$.<br>`
          texteCorr = proprieteCroissance(signe)
          texteCorr +=
            coefficient === 0
              ? `$\\begin{aligned}
          \\mathrm{e}^{${expressionGauche}}&${signeTex(signe)}\\mathrm{e}^{${expressionDroite}}\\\\
          \\iff ${expressionGauche}&${signeTex(signe)}${expressionDroite}\\\\
          \\iff 0&${signeTex(signe)}${secondMembre}
          \\end{aligned}$<br>
          ${resolution.texte}`
              : `$\\begin{aligned}
          \\mathrm{e}^{${expressionGauche}}&${signeTex(signe)}\\mathrm{e}^{${expressionDroite}}\\\\
          \\iff ${expressionGauche}&${signeTex(signe)}${expressionDroite}\\\\
          \\iff ${rienSi1(coefficient)}x&${signeTex(signe)}${secondMembre}\\\\
          \\iff x&${signeTex(resolution.signeApresDivision!)}${resolution.borne!.texFractionSimplifiee}
          ${justificationDivision(coefficient)}
          \\end{aligned}$`

          break
        }
      }

      texte += ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierFonctionsTerminalesEnsemble,
        { texteAvant: '<br>$S=$' },
      )
      texteCorr += `<br>Donc $S=${miseEnEvidence(value)}$.`

      handleAnswers(this, i, {
        reponse: { value, options: { intervalle: true } },
      })

      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
