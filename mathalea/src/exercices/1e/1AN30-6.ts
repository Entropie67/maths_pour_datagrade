import { createList } from '../../lib/format/lists'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { tableauDeVariation } from '../../lib/mathFonctions/etudeFonction'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { reduireAxPlusB, rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Résoudre des inéquations produit avec la fonction exponentielle'
export const dateDePublication = '23/05/2026'
export const interactifReady = true

/**
 * Résoudre des inéquations produit avec des exponentielles, sans logarithme.
 * @author Stéphane Guyon
 */

export const uuid = '61ed3'

export const refs = {
  'fr-fr': ['1AN30-6', 'TSA3-24', 'TCA7-24'],
  'fr-ch': [''],
}

type SigneInegalite = '<' | '\\leqslant' | '>' | '\\geqslant'

type CibleExponentielle = {
  exposant: -1 | 0 | 1
  tex: string
}

type FacteurInequation = {
  nom: string
  fonction: (x: number) => number
  zero?: FractionEtendue
  resolution: string
}

const signes: SigneInegalite[] = ['<', '\\leqslant', '>', '\\geqslant']

const ciblesExponentielles: CibleExponentielle[] = [
  { exposant: 0, tex: '1' },
  { exposant: 1, tex: '\\mathrm{e}' },
  { exposant: -1, tex: '\\dfrac{1}{\\mathrm{e}}' },
]

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

function proprieteCroissanceExponentielle(signe: SigneInegalite): string {
  return `\\quad\\text{car pour tous réels } a \\text{ et } b,\\; \\mathrm{e}^{a}${signeTex(signe)}\\mathrm{e}^{b}\\iff a${signeTex(signe)}b`
}

function estSigneCherche(signeProduit: number, signe: SigneInegalite): boolean {
  switch (signe) {
    case '<':
      return signeProduit < 0
    case '\\leqslant':
      return signeProduit <= 0
    case '>':
      return signeProduit > 0
    case '\\geqslant':
      return signeProduit >= 0
  }
}

function resolutionAffine(a: number, b: number): FractionEtendue {
  return new FractionEtendue(-b, a).simplifie()
}

function resolutionExponentielle(
  a: number,
  b: number,
  cible: CibleExponentielle,
): FractionEtendue {
  return new FractionEtendue(cible.exposant - b, a).simplifie()
}

function facteurAffine(a: number, b: number): FacteurInequation {
  const expression = reduireAxPlusB(a, b)
  const zero = resolutionAffine(a, b)
  const signeApresDivision = a > 0 ? '>' : signeInverse('>')
  const etapeCoefficient = a === 1 ? '' : `&\\iff ${rienSi1(a)}x>${-b}\\\\`
  return {
    nom: expression,
    fonction: (x: number) => a * x + b,
    zero,
    resolution: `On résout :<br>$\\begin{aligned}
    ${expression}>0\\\\
    ${etapeCoefficient}
    &\\iff x${signeTex(signeApresDivision)}${zero.texFractionSimplifiee}
    \\end{aligned}$`,
  }
}

function facteurExponentiel(
  a: number,
  b: number,
  cible: CibleExponentielle,
): FacteurInequation {
  const expression = reduireAxPlusB(a, b)
  const zero = resolutionExponentielle(a, b, cible)
  const signeApresDivision = a > 0 ? '>' : signeInverse('>')
  const etapeCoefficient =
    a === 1 ? '' : `\\iff& ${rienSi1(a)}x>${cible.exposant - b}\\\\`
  return {
    nom: `\\mathrm{e}^{${expression}}-${cible.tex}`,
    fonction: (x: number) => Math.exp(a * x + b) - Math.exp(cible.exposant),
    zero,
    resolution: `On résout :<br>$\\begin{aligned}
    \\phantom{\\iff}&\\mathrm{e}^{${expression}}-${cible.tex}>0\\\\
    \\iff &\\mathrm{e}^{${expression}}>${cible.tex}\\\\
    \\iff &\\mathrm{e}^{${expression}}>\\mathrm{e}^{${cible.exposant}}\\\\
    \\iff &${expression}>${cible.exposant}${proprieteCroissanceExponentielle('>')}\\\\
   ${etapeCoefficient}
    \\iff &x${signeTex(signeApresDivision)}${zero.texFractionSimplifiee}
    \\end{aligned}$`,
  }
}

function facteurToujoursPositif(
  a: number,
  b: number,
  n: number,
): FacteurInequation {
  const expression = reduireAxPlusB(a, b)
  return {
    nom: `\\mathrm{e}^{${expression}}+${n}`,
    fonction: (x: number) => Math.exp(a * x + b) + n,
    resolution: `On sait que pour tout réel $x$, on a $\\mathrm{e}^x>0$. Donc $\\mathrm{e}^{${expression}}>0$ et $\\mathrm{e}^{${expression}}+${n}>0$ pour tout réel $x$.`,
  }
}

function compareFractions(a: FractionEtendue, b: FractionEtendue): number {
  return a.valeurDecimale - b.valeurDecimale
}

function dedoublonneRacines(racines: FractionEtendue[]): FractionEtendue[] {
  return racines
    .sort(compareFractions)
    .filter((racine, index, sorted) =>
      index === 0 ? true : !racine.isEqual(sorted[index - 1]),
    )
}

function intervalleSolution(
  gauche: string,
  droite: string,
  inclureGauche: boolean,
  inclureDroite: boolean,
): string {
  const crochetGauche =
    gauche === '-\\infty' ? '\\left]' : inclureGauche ? '\\left[' : '\\left]'
  const crochetDroite =
    droite === '+\\infty' ? '\\right[' : inclureDroite ? '\\right]' : '\\right['
  return `${crochetGauche}${gauche};${droite}${crochetDroite}`
}

function fractionTexTableau(fraction: FractionEtendue): string {
  return fraction.texFractionSimplifiee.replaceAll('\\dfrac', '\\frac')
}

function valeurTestEntreBornes(bornes: number[], index: number): number {
  const gauche = bornes[index]
  const droite = bornes[index + 1]
  if (gauche === Number.NEGATIVE_INFINITY) return droite - 1
  if (droite === Number.POSITIVE_INFINITY) return gauche + 1
  return (gauche + droite) / 2
}

function signeFacteurSurIntervalle(
  facteur: FacteurInequation,
  bornes: number[],
  index: number,
): string {
  return facteur.fonction(valeurTestEntreBornes(bornes, index)) > 0 ? '+' : '-'
}

function tableauSignesFacteursExercice(facteurs: FacteurInequation[]): string {
  const racines = dedoublonneRacines(
    facteurs
      .map((facteur) => facteur.zero)
      .filter((zero): zero is FractionEtendue => zero !== undefined),
  )
  const bornes = [
    Number.NEGATIVE_INFINITY,
    ...racines.map((racine) => racine.valeurDecimale),
    Number.POSITIVE_INFINITY,
  ]
  const premiereLigne: (string | number)[] = ['', 20]
  const entetes: [string, number, number][] = [
    ['x', 1.5, 10],
    ...facteurs.map(
      (facteur) => [`$${facteur.nom}$`, 1.5, 100] as [string, number, number],
    ),
    ['$\\text{Produit}$', 1.5, 60],
  ]

  for (const racine of racines) {
    premiereLigne.push(fractionTexTableau(racine), 28)
  }
  premiereLigne.push('', 20)

  const lignesFacteurs = facteurs.map((facteur) => {
    const ligne: (string | number)[] = ['Line', 30, '', 10]
    for (let index = 0; index < bornes.length - 1; index++) {
      ligne.push(signeFacteurSurIntervalle(facteur, bornes, index), 10)
      if (index < racines.length) {
        ligne.push(facteur.zero?.isEqual(racines[index]) ? 'z' : 't', 10)
      }
    }
    return ligne
  })

  const ligneProduit: (string | number)[] = ['Line', 30, '', 10]
  for (let index = 0; index < bornes.length - 1; index++) {
    const test = valeurTestEntreBornes(bornes, index)
    const signeProduit = facteurs.reduce(
      (produit, facteur) => produit * Math.sign(facteur.fonction(test)),
      1,
    )
    ligneProduit.push(signeProduit > 0 ? '+' : '-', 10)
    if (index < racines.length) {
      ligneProduit.push('z', 10)
    }
  }

  return tableauDeVariation({
    tabInit: [entetes, premiereLigne],
    tabLines: [...lignesFacteurs, ligneProduit],
    espcl: 4.6,
    deltacl: 0.8,
    lgt: 5.2,
  })
}

function ensembleSolutions(
  facteurs: FacteurInequation[],
  signe: SigneInegalite,
): string {
  const racines = dedoublonneRacines(
    facteurs
      .map((facteur) => facteur.zero)
      .filter((zero): zero is FractionEtendue => zero !== undefined),
  )
  const bornes = [
    Number.NEGATIVE_INFINITY,
    ...racines.map((racine) => racine.valeurDecimale),
    Number.POSITIVE_INFINITY,
  ]
  const morceaux: string[] = []
  const inclureRacines = signe === '\\leqslant' || signe === '\\geqslant'

  for (let index = 0; index < bornes.length - 1; index++) {
    const gauche = bornes[index]
    const droite = bornes[index + 1]
    const test =
      gauche === Number.NEGATIVE_INFINITY
        ? droite - 1
        : droite === Number.POSITIVE_INFINITY
          ? gauche + 1
          : (gauche + droite) / 2
    const signeProduit = facteurs.reduce(
      (produit, facteur) => produit * Math.sign(facteur.fonction(test)),
      1,
    )

    if (estSigneCherche(signeProduit, signe)) {
      const borneGauche =
        index === 0 ? '-\\infty' : racines[index - 1].texFractionSimplifiee
      const borneDroite =
        index === racines.length
          ? '+\\infty'
          : racines[index].texFractionSimplifiee
      morceaux.push(
        intervalleSolution(
          borneGauche,
          borneDroite,
          inclureRacines,
          inclureRacines,
        ),
      )
    }
  }

  if (inclureRacines) {
    for (const racine of racines) {
      const dejaIncluse = morceaux.some((morceau) =>
        morceau.includes(racine.texFractionSimplifiee),
      )
      if (!dejaIncluse) {
        morceaux.push(`\\left\\{${racine.texFractionSimplifiee}\\right\\}`)
      }
    }
  }

  if (morceaux.length === 0) return '\\emptyset'
  return morceaux.join('\\cup')
}

export default class InequationsProduitExponentielles extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.consigne = 'Résoudre, dans $\\mathbb{R}$, les inéquations suivantes.'
    this.spacing = 1.5
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? 'Résoudre, dans $\\mathbb{R}$, les inéquations suivantes.'
        : "Résoudre, dans $\\mathbb{R}$, l'inéquation suivante."

    const types = combinaisonListes(
      ['affineEtExponentielle', 'deuxExponentielles', 'facteurPositif'],
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const a = randint(-8, 8, 0)
      const b = randint(-6, 6)
      const c = randint(-8, 8, 0)
      const d = randint(-6, 6)
      const n = randint(1, 5)
      const cible1 = choice(ciblesExponentielles)
      const cible2 = choice(ciblesExponentielles)
      const signe = choice(signes)
      let facteurs: FacteurInequation[]

      switch (types[i]) {
        case 'deuxExponentielles':
          facteurs = [
            facteurExponentiel(a, b, cible1),
            facteurExponentiel(c, d, cible2),
          ]
          break
        case 'facteurPositif':
          facteurs = [
            facteurExponentiel(a, b, cible1),
            facteurToujoursPositif(c, d, n),
          ]
          break
        case 'affineEtExponentielle':
        default:
          facteurs = [facteurAffine(a, b), facteurExponentiel(c, d, cible1)]
          break
      }

      const produitTex = facteurs.map((facteur) => `(${facteur.nom})`).join('')
      const racines = facteurs
        .map((facteur) => facteur.zero)
        .filter((zero): zero is FractionEtendue => zero !== undefined)
      if (dedoublonneRacines(racines).length !== racines.length) {
        cpt++
        continue
      }
      const value = ensembleSolutions(facteurs, signe)
      let texte = `$${produitTex}${signeTex(signe)}0$`
      let texteCorr =
        'On étudie séparément le signe de chaque facteur :<br>' +
        createList({
          items: facteurs.map((facteur) => facteur.resolution),
          style: 'fleches',
        }) +
        'On en déduit le tableau de signes suivant :<br>' +
        tableauSignesFacteursExercice(facteurs)

      texteCorr += `<br>D'après le tableau de signes, $S=${miseEnEvidence(value)}$.`

      texte += ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierFonctionsTerminalesEnsemble,
        { texteAvant: '<br>$S=$' },
      )

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
