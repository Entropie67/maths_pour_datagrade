import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  combinaisonListes,
  sortRandomlyLikeV8,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  obtenirListeFacteursPremiers,
  ppcm,
  texFactorisation,
} from '../../lib/outils/primalite'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { texNombre } from '../../lib/outils/texNombre'

export const uuid = 'ff20c'
export const refs = {
  'fr-fr': ['4A12-1'],
  'fr-ch': ['9R2NO1H-1', '9R3NO1H-1', '10CTNO1B-1', 'PRQNO09C-3'],
}
export const titre =
  'Déterminer le PPCM à partir des décompositions en produits de facteurs premiers'
export const interactifReady = true

/**
 * Détermine le plus petit multiple commun à partir des décompositions en produits de facteurs premiers
 * @author Rémi Angot
 */
export default class PPCMDecompositionFacteursPremiers extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.besoinFormulaireCaseACocher = [
      'Afficher les décompositions avec des puissances',
      true,
    ]
    this.comment =
      'Pour permettre de faire cet exercice sans calculatrice, en mode interactif, les réponses sous forme de produit sont acceptées.'
  }

  nouvelleVersion() {
    const listeSaveurs = combinaisonListes(
      ['facile', 'facile', 'facile', 'piege'],
      this.nbQuestions,
    )

    // Nombres premiers disponibles pour les cas faciles
    const primes = [2, 3, 5, 7, 11, 13]

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      let A: number
      let B: number

      if (listeSaveurs[i] === 'piege') {
        // A = 2² × p, B = 2³ × q avec p ≠ q premiers impairs
        const primesImpairsA = [3, 5, 7, 11, 13, 17, 19, 23] // 4p < 100
        const primesImpairsB = [3, 5, 7, 11] // 8q < 100
        const p = primesImpairsA[randint(0, primesImpairsA.length - 1)]
        const primesImpairsBSansP = primesImpairsB.filter((x) => x !== p)
        if (primesImpairsBSansP.length === 0) continue
        const q =
          primesImpairsBSansP[randint(0, primesImpairsBSansP.length - 1)]
        A = 4 * p
        B = 8 * q
      } else {
        // Cas facile : choisir 3 premiers distincts p, q, r
        // puis une variante parmi :
        //   1. A = p×q,   B = p×r
        //   2. A = p²×q,  B = p×r  (si < 100)
        const shuffled = sortRandomlyLikeV8([...primes])
        const [p, q, r] = shuffled
        const variante = randint(1, 2)
        if (variante === 2 && p * p * q < 100) {
          A = p * p * q
          B = p * r
        } else {
          A = p * q
          B = p * r
        }
        // Rejeter si l'un divise l'autre (PPCM trivial)
        if (A % B === 0 || B % A === 0) continue
      }

      if (!this.questionJamaisPosee(i, A, B)) continue

      const lePPCM = ppcm(A, B)

      // Décomposition pour l'affichage de la question
      const avecPuissances = this.sup === true || this.sup === 1
      const texDecompA = texFactorisation(A, avecPuissances)
      const texDecompB = texFactorisation(B, avecPuissances)

      // Calcul des facteurs manquants de B par rapport à A (liste plate)
      const factA = obtenirListeFacteursPremiers(A)
      const factB = obtenirListeFacteursPremiers(B)

      // Compter les occurrences de chaque premier dans A et B
      const countA = new Map<number, number>()
      const countB = new Map<number, number>()
      for (const f of factA) countA.set(f, (countA.get(f) ?? 0) + 1)
      for (const f of factB) countB.set(f, (countB.get(f) ?? 0) + 1)

      // Facteurs à ajouter : pour chaque premier de B, les exemplaires en plus que A
      const facteursManquants: number[] = []
      for (const [prime, countInB] of countB) {
        const countInA = countA.get(prime) ?? 0
        for (let k = 0; k < countInB - countInA; k++) {
          facteursManquants.push(prime)
        }
      }

      // Construction de la correction (liste plate)
      const factATexte = factA.map((f) => String(f)).join(' \\times ')
      const factManquantsTexte = facteursManquants
        .map((f) => miseEnEvidence(String(f), 'green'))
        .join(' \\times ')

      let texteDecompPPCM = `$${factATexte}`
      if (facteursManquants.length > 0) {
        texteDecompPPCM += ` \\times ${factManquantsTexte}`
      }
      texteDecompPPCM += `$`

      const texte =
        `On donne les décompositions en produits de facteurs premiers :<br>` +
        `$${A} = ${texDecompA}$ et $${B} = ${texDecompB}.$<br>` +
        `Quel est le plus petit multiple commun ($\\text{PPCM}$) de $${A}$ et $${B}$ ?` +
        (this.interactif
          ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
          : '')

      let texteCorr = `On recopie la décomposition de $${A}$ : $${factATexte}.$<br>`
      if (facteursManquants.length > 0) {
        texteCorr += `On ajoute les facteurs manquants de $${B}$ (en vert) : ${texteDecompPPCM.replace(/\$$/, '.$')}<br>`
      }
      texteCorr += `Donc $\\text{PPCM}$$(${A}, ${B}) = ${texteDecompPPCM.replace(/^\$/, '').replace(/\$$/, '')} = ${miseEnEvidence(texNombre(lePPCM))}.$`

      handleAnswers(this, i, {
        reponse: { value: String(lePPCM) },
      })

      this.listeQuestions[i] = texte
      this.listeCorrections[i] = texteCorr
      i++
    }

    listeQuestionsToContenu(this)
  }
}
