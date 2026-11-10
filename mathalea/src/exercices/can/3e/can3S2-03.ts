import { orangeMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import { fraction } from '../../../modules/fractions'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une probabilité'
export const interactifReady = true

/**
 * @author Gilles Mora
 */
export const uuid = 'd86be'
export const dateDeModificationImportante = '12/10/2025' // ajout de versionQcmDisponible Jean-claude Lhote

export const refs = {
  'fr-fr': ['can3S2-03', 'BP2FLUC17', '3AutoS01-5', 'BP1AUTO014'],
  'fr-ch': [],
}
export default class CalculsProbabilite2 extends ExerciceSimple {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.versionQcmDisponible = true
    this.spacing = 1.5
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    let a: number, b: number
    const choix = this.quotaChoice('choix', [true, false])

    // On choisit le "scénario" global : a (noire/blanche, fraction) ou b (bleue/rouge, décimal)
    const scenario = this.quotaChoice('scenario', ['a', 'a', 'b'])
    const formatDecimal = scenario === 'b'
    // Une fraction irréductible ou un décimal est demandé : un quotient comme 3÷5 est refusé
    this.optionsDeComparaison = formatDecimal
      ? { nombreDecimalSeulement: true }
      : { fractionIrreductible: true }

    // Pour le scénario b, on peut avoir un total à 10 ou 100 (comme dans l'ancien code)
    let denom = 0
    if (!formatDecimal) {
      // scénario a : fraction classique avec a in [2,9], b in [5,15]
      a = randint(2, 9)
      b = randint(5, 15)
      denom = a + b
    } else {
      // scénario b : total 10 ou 100
      if (choice([true, false])) {
        a = randint(2, 9)
        b = 10 - a
      } else {
        a = randint(10, 80)
        b = 100 - a
      }
      denom = a + b
    }

    // Choix des couleurs selon le scénario pour garder l'ancienne formulation
    const couleur1 = formatDecimal ? 'bleue' : 'noire'
    const couleur2 = formatDecimal ? 'rouge' : 'blanche'
    const couleurDemandee = choix ? couleur1 : couleur2

    // Construction de l'énoncé
    this.question = `On tire une boule au hasard dans une urne contenant $${a}$ boules ${couleur1}s et $${b}$ boules ${couleur2}s.<br>

             Quelle est la probabilité d'obtenir une boule ${couleurDemandee} ? <br>

             ${formatDecimal ? 'On donnera le résultat sous forme décimale.' : "On donnera le résultat sous forme d'une fraction irréductible."}`

    // Correction commune + partie spécifique selon format
    const correctionCommun = `Dans une situation d'équiprobabilité,
        on calcule la probabilité d'un événement par le quotient :
        $\\dfrac{\\text{Nombre d'issues favorables}}{\\text{Nombre total d'issues}}$. <br>
        La probabilité est donc donnée par : `
    if (!formatDecimal) {
      // fraction
      const reponsepossible = `${choix ? fraction(a, denom).texFraction : fraction(b, denom).texFraction}`
      this.correction = `${correctionCommun}
        $\\dfrac{\\text{Nombre de boules ${couleurDemandee}s}}{\\text{Nombre total de boules}}
             =${new FractionEtendue(a, denom).estIrreductible ? miseEnEvidence(reponsepossible) : reponsepossible}  ${choix ? fraction(a, denom).texSimplificationAvecEtapes(false, orangeMathalea) : fraction(b, denom).texSimplificationAvecEtapes(false, orangeMathalea)}$`
      this.reponse = choix
        ? `${fraction(a, denom).texFractionSimplifiee}`
        : `${fraction(b, denom).texFractionSimplifiee}`
    } else {
      // décimal
      this.correction = `${correctionCommun}
        $\\dfrac{\\text{Nombre de boules ${couleurDemandee}s}}{\\text{Nombre total de boules}}
             =${choix ? fraction(a, denom).texFraction : fraction(b, denom).texFraction} =${miseEnEvidence(`${choix ? texNombre(a / denom) : texNombre(b / denom)}`)}$`
      this.reponse = choix ? texNombre(a / denom) : texNombre(b / denom)
    }

    // Version QCM : proposer des distracteurs plausibles
    if (this.versionQcm) {
      const numCorrect = choix ? a : b
      const correctTex = formatDecimal
        ? texNombre(numCorrect / denom)
        : fraction(numCorrect, denom).texFractionSimplifiee

      const candidates: string[] = []

      if (!formatDecimal) {
        // erreurs typiques en fraction
        candidates.push(fraction(numCorrect, denom).texFraction) // éventuelle écriture non réduite
        candidates.push(fraction(denom - numCorrect, denom).texFraction) // complémentaire 1-p (non réduite)
        candidates.push(
          fraction(denom - numCorrect, denom).texFractionSimplifiee,
        ) // complémentaire réduite
        // mauvaise lecture: inverser num/den
        candidates.push(fraction(denom, numCorrect).texFraction)
        // confusion avec la partie non demandée
        const otherNum = choix ? b : a
        candidates.push(fraction(otherNum, denom).texFraction)
      } else {
        // erreurs typiques en décimal
        candidates.push(texNombre(numCorrect / denom)) // écriture correcte (peut être identique)
        candidates.push(texNombre((denom - numCorrect) / denom)) // complémentaire 1-p
        candidates.push(texNombre(numCorrect, 0)) // oublier le dénominateur
        // erreurs d'arrondi ou confusion entre 10/100
        candidates.push(texNombre(Math.round((numCorrect / denom) * 100) / 100))
        candidates.push(texNombre(Math.round((denom / numCorrect) * 100) / 100))
      }

      // filtrer, dédupliquer et retirer la bonne réponse
      const uniq = Array.from(
        new Set(candidates.filter((s) => s && s !== correctTex)),
      )
      const picked = shuffle(uniq).slice(0, 3)
      // formatage pour QCM : mettre entre $...$
      this.distracteurs = picked.map((n) => `$${n}$`)
      this.reponse = `$${correctTex}$`
    }
  }
}
