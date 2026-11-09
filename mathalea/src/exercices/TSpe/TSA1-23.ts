import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiMoins } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Calculer des limites simples de suites par produit'
export const dateDePublication = '03/08/2026'
export const interactifReady = true

export const uuid = 'b5ad9'
export const refs = {
  'fr-fr': ['TSA1-23', 'TCA1-13'],
  'fr-ch': [],
}

type Terme = {
  coefficient: number
  puissance: number
}

type Limite = {
  estInfinie: boolean
  signe: -1 | 1
  valeur: number | string
}

type TypeQuestion =
  | 'lineaireLineaire'
  | 'quadratiqueLineaire'
  | 'quadratiqueFini'
  | 'lineaireFini'
  | 'finiFini'

function ecritureInverse(coefficient: number, puissance: number) {
  const valeurAbsolue = Math.abs(coefficient)
  const numerateur = valeurAbsolue === 1 ? '1' : `${valeurAbsolue}`
  const denominateur = puissance === -1 ? 'n' : `n^{${-puissance}}`
  return `\\dfrac{${numerateur}}{${denominateur}}`
}

function ecritureTerme(coefficient: number, puissance: number) {
  if (puissance >= 0) {
    return new Polynome({
      coeffs: [...Array.from({ length: puissance }, () => 0), coefficient],
      letter: 'n',
    }).toString()
  }
  return `${coefficient < 0 ? '-' : ''}${ecritureInverse(coefficient, puissance)}`
}

function ecritureSomme(termes: Terme[]) {
  const termesPolynomiaux = termes.filter(({ puissance }) => puissance >= 0)
  const degre = Math.max(...termesPolynomiaux.map(({ puissance }) => puissance))
  const coefficients = Array.from({ length: degre + 1 }, () => 0)
  for (const { coefficient, puissance } of termesPolynomiaux) {
    coefficients[puissance] += coefficient
  }
  let expression = new Polynome({
    coeffs: coefficients,
    letter: 'n',
  }).toString()
  for (const { coefficient, puissance } of termes.filter(
    ({ puissance }) => puissance < 0,
  )) {
    const inverse = ecritureInverse(coefficient, puissance)
    expression += coefficient < 0 ? `-${inverse}` : `+${inverse}`
  }
  return expression
}

function limiteTerme(coefficient: number, puissance: number) {
  if (puissance < 0) return '0'
  if (puissance === 0) return `${coefficient}`
  return coefficient > 0 ? '+\\infty' : '-\\infty'
}

function limiteFacteur(termes: Terme[]): Limite {
  const termeDivergent = termes.find(({ puissance }) => puissance > 0)
  if (termeDivergent) {
    const signe = termeDivergent.coefficient > 0 ? 1 : -1
    return {
      estInfinie: true,
      signe,
      valeur: signe > 0 ? '+\\infty' : '-\\infty',
    }
  }
  const constante = termes.find(({ puissance }) => puissance === 0)
  const valeur = constante?.coefficient ?? 0
  return {
    estInfinie: false,
    signe: valeur > 0 ? 1 : -1,
    valeur,
  }
}

function correctionFacteur(termes: Terme[], nom: string) {
  const limitesDesTermes = termes
    .map(
      ({ coefficient, puissance }) =>
        `$\\displaystyle \\lim_{n\\to+\\infty}${ecritureParentheseSiMoins(ecritureTerme(coefficient, puissance))}=${limiteTerme(coefficient, puissance)}$`,
    )
    .join(' et ')
  return `${limitesDesTermes}.<br>Par somme, $\\displaystyle \\lim_{n\\to+\\infty}${nom}=${limiteFacteur(termes).valeur}$.`
}

/**
 * Limites de produits simples sans forme indéterminée.
 * @author Stéphane Guyon
 */
export default class LimitesSimplesParProduit extends Exercice {
  constructor() {
    super()
    this.consigne =
      'Déterminer la limite de chaque suite lorsque $n$ tend vers $+\\infty$.'
    this.nbQuestions = 2
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? 'Déterminer la limite de la suite lorsque $n$ tend vers $+\\infty$.'
        : 'Déterminer la limite de chaque suite lorsque $n$ tend vers $+\\infty$.'

    const typesDeQuestions = combinaisonListes<TypeQuestion>(
      [
        'lineaireLineaire',
        'quadratiqueLineaire',
        'quadratiqueFini',
        'lineaireFini',
        'finiFini',
      ],
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const type = typesDeQuestions[i]
      let facteur1: Terme[]
      let facteur2: Terme[]

      switch (type) {
        case 'lineaireLineaire':
          facteur1 = [
            { coefficient: randint(-5, 5, 0), puissance: 1 },
            { coefficient: randint(-6, 6, 0), puissance: 0 },
          ]
          facteur2 = [
            { coefficient: randint(-6, 6, 0), puissance: 0 },
            { coefficient: randint(-5, 5, 0), puissance: 1 },
          ]
          break
        case 'quadratiqueLineaire':
          facteur1 = [
            { coefficient: randint(-5, 5, 0), puissance: 2 },
            { coefficient: randint(-6, 6, 0), puissance: 0 },
          ]
          facteur2 = [
            { coefficient: randint(-5, 5, 0), puissance: 1 },
            { coefficient: randint(-6, 6, 0), puissance: 0 },
          ]
          break
        case 'quadratiqueFini':
          facteur1 = [
            { coefficient: randint(-5, 5, 0), puissance: 2 },
            { coefficient: randint(-6, 6, 0), puissance: 0 },
          ]
          facteur2 = [
            { coefficient: randint(-5, 5, 0), puissance: -randint(1, 2) },
            { coefficient: randint(-6, 6, 0), puissance: 0 },
          ]
          break
        case 'lineaireFini':
          facteur1 = [
            { coefficient: randint(-5, 5, 0), puissance: 1 },
            { coefficient: randint(-6, 6, 0), puissance: 0 },
          ]
          facteur2 = [
            { coefficient: randint(-6, 6, 0), puissance: 0 },
            { coefficient: randint(-5, 5, 0), puissance: -randint(1, 2) },
          ]
          break
        case 'finiFini':
          facteur1 = [
            { coefficient: randint(-6, 6, 0), puissance: 0 },
            { coefficient: randint(-5, 5, 0), puissance: -1 },
          ]
          facteur2 = [
            { coefficient: randint(-5, 5, 0), puissance: -2 },
            { coefficient: randint(-6, 6, 0), puissance: 0 },
          ]
          break
      }

      const expression1 = ecritureSomme(facteur1)
      const expression2 = ecritureSomme(facteur2)
      const expression = `\\left(${expression1}\\right)\\left(${expression2}\\right)`
      const limite1 = limiteFacteur(facteur1)
      const limite2 = limiteFacteur(facteur2)
      const signeProduit = limite1.signe * limite2.signe
      const reponse =
        limite1.estInfinie || limite2.estInfinie
          ? signeProduit > 0
            ? '+\\infty'
            : '-\\infty'
          : `${Number(limite1.valeur) * Number(limite2.valeur)}`

      let texte = `La suite $(u_n)$ est définie, pour tout entier naturel $n$ non nul, par :<br>$u_n=${expression}$.`
      if (this.interactif) {
        texte += `<br>$\\displaystyle \\lim_{n\\to+\\infty}u_n=$${ajouteChampTexteMathLive(this, i, KeyboardType.clavierLimites)}`
      }

      let texteCorr = 'D’après les limites de référence :<br>'
      texteCorr += correctionFacteur(facteur1, `\\left(${expression1}\\right)`)
      texteCorr += '<br>'
      texteCorr += correctionFacteur(facteur2, `\\left(${expression2}\\right)`)
      texteCorr += '<br>'
      texteCorr += `Par produit, $\\displaystyle \\lim_{n\\to+\\infty}u_n=${miseEnEvidence(reponse)}$.`

      if (this.questionJamaisPosee(i, expression)) {
        handleAnswers(this, i, { reponse: { value: reponse } })
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
