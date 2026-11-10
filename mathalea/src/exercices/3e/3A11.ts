import {
  addPossibleMultiLinesAnswer,
  baremeMultiLignes,
  besoinFormulaireVerificationMultiLignes,
  commentaireMultiLignes,
} from '../../lib/customElements/PossibleMultiLinesAnswerElement'
import { all, isEqual, isPrimeFactorization } from '../../lib/interactif/checks'
import { createQuestion } from '../../lib/interactif/createQuestion'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  premiersEntreBornes,
  texCalculDecomposition,
  texFactorisation,
} from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Rendre irréductible une fraction'
export const interactifReady = true
export const interactifType = 'mathLive'
export const dateDeModifImportante = '23/10/2026'

export const uuid = 'fb5c5'

export const refs = {
  'fr-fr': ['3A11'],
  'fr-ch': ['10CTNO3A-13', '10LCNO3A-13', '10LSNO3A-13', '9R1NO4D-10', '9R2NO4D-10', '9R3NO4D-10', 'PRQNO10B-10'],
}

/** Facteurs de A et de B : `facteursCommuns × premierA` et `facteursCommuns × premierB`. */
type Tirage = {
  facteursCommuns: number[]
  premierA: number
  premierB: number
}

const CLAVIER = KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets

const fraction = (numerateur: string | number, denominateur: string | number) =>
  `\\dfrac{${numerateur}}{${denominateur}}`

const produit = (facteurs: (string | number)[]): string =>
  facteurs.join('\\times ')

const valeur = (facteurs: number[]): number =>
  facteurs.reduce((a, b) => a * b, 1)

/**
 * Tire les facteurs de A et de B.
 *
 * Parmi les facteurs premiers communs candidats, l'un est absent, les autres
 * ont l'exposant 1 sauf un (ou plusieurs dans la version simple) d'exposant 2.
 */
function tireFacteurs(simple: boolean): Tirage {
  const candidats = simple ? [2, 3, 5] : premiersEntreBornes(2, 13)
  const nbCommuns = simple ? 3 : 4
  const communs = shuffle(candidats).slice(0, nbCommuns)
  const manquant = randint(0, nbCommuns - 1)
  const presents = communs.filter((_, k) => k !== manquant)
  const auCarre = simple
    ? presents.filter(() => randint(0, 1) === 1)
    : [presents[randint(0, presents.length - 1)]]
  const facteursCommuns = presents
    .flatMap((premier) =>
      auCarre.includes(premier) ? [premier, premier] : [premier],
    )
    .sort((x, y) => x - y)
  const propres = premiersEntreBornes(2, simple ? 13 : 30)
  const premierA = propres[randint(0, propres.length - 1)]
  const premierB = choice(propres, [premierA])
  return { facteursCommuns, premierA, premierB }
}

/** Correction de la simplification de A/B en barrant les facteurs communs. */
function correctionSimplification(
  { facteursCommuns, premierA, premierB }: Tirage,
  nbA: number,
  nbB: number,
): string {
  const barres = facteursCommuns.map((f) => `\\cancel{${f}}`)
  const numerateur = produit([...barres, premierA])
  const denominateur = produit([...barres, premierB])
  return (
    'On simplifie les facteurs premiers communs au numérateur et au dénominateur.<br>' +
    `$${fraction(texNombre(nbA), texNombre(nbB))} = ${fraction(numerateur, denominateur)} = ${miseEnEvidence(fraction(premierA, premierB))}$`
  )
}

/**
 * Décomposer deux entiers A et B en produit de facteurs premiers (calcul étape
 * par étape), puis rendre irréductibles A/B et B/A.
 *
 * A et B ont les mêmes facteurs premiers communs et un facteur premier propre
 * chacun : A/B se simplifie en `premierA/premierB`.
 * @author Rémi Angot
 */
export default class FractionsIrreductibles extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Décomposition « simple »']
    this.besoinFormulaire2Numerique = besoinFormulaireVerificationMultiLignes
    this.comment = commentaireMultiLignes
    this.consigne =
      'Décomposer deux nombres en produit de facteurs premiers puis rendre irréductibles une fraction et son inverse.'
    this.spacing = 2
    this.spacingCorr = 2
    this.nbQuestions = 4
    this.nbQuestionsModifiable = false
    this.sup = true
    this.sup2 = 1
  }

  nouvelleVersion() {
    const tirage = tireFacteurs(this.sup)
    const { facteursCommuns, premierA, premierB } = tirage
    const nbA = valeur([...facteursCommuns, premierA])
    const nbB = valeur([...facteursCommuns, premierB])

    this.questionDecomposition(0, 'A', nbA)
    this.questionDecomposition(1, 'B', nbB)
    this.questionFraction(2, {
      numerateur: nbA,
      denominateur: nbB,
      reponse: fraction(premierA, premierB),
      correction: correctionSimplification(tirage, nbA, nbB),
    })
    this.questionFraction(3, {
      numerateur: nbB,
      denominateur: nbA,
      reponse: fraction(premierB, premierA),
      correction: `$${fraction(texNombre(nbB), texNombre(nbA))} = ${miseEnEvidence(fraction(premierB, premierA))}$<br>Remarque : cette fraction est l'inverse de la précédente, il suffit donc d'inverser la fraction irréductible obtenue.`,
    })
    listeQuestionsToContenu(this)
  }

  /** Décomposition de `nb` en produit de facteurs premiers, calcul étape par étape. */
  private questionDecomposition(i: number, nom: string, nb: number) {
    handleAnswers(this, i, {
      reponse: {
        value: texFactorisation(nb),
        compare: all([isEqual(), isPrimeFactorization()]),
      },
    })
    this.listeQuestions[i] =
      `Décomposer $${nom} = ${texNombre(nb)}$ en produit de facteurs premiers.` +
      addPossibleMultiLinesAnswer(this, i, {
        prefix: `${nom} =`,
        style: CLAVIER,
        bareme: baremeMultiLignes(this.sup2),
        produitSeulement: true,
        valeurDeDepart: texNombre(nb),
      })
    this.listeCorrections[i] = texCalculDecomposition(nb, { nom })
  }

  /** Fraction `numerateur/denominateur` à rendre irréductible. */
  private questionFraction(
    i: number,
    {
      numerateur,
      denominateur,
      reponse,
      correction,
    }: {
      numerateur: number
      denominateur: number
      reponse: string
      correction: string
    },
  ) {
    const enonce = fraction(texNombre(numerateur), texNombre(denominateur))
    createQuestion(this, i, {
      question: `Rendre la fraction $${enonce}$ irréductible.`,
      answer: { value: reponse, options: { fractionIrreductible: true } },
      field: { keyboard: CLAVIER, texteAvant: `<br>$${enonce} =$` },
      correction,
    })
  }
}
