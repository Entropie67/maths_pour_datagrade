// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 3b4d5 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { pgcd, ppcm } from '../../../lib/outils/primalite'
import type FractionEtendue from '../../../modules/FractionEtendue'
import { fraction } from '../../../modules/fractions'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  'Déterminer le plus petit dénominateur commun à deux fractions'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '11/10/2025'

/**
 * @author Jean-claude Lhote
 */
export const uuid = '3b4d5'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

const listeDesDénominateursAEviter = [
  11, 13, 17, 19, 22, 23, 29, 31, 33, 34, 37, 38, 41, 43, 44, 46, 47, 49, 51,
  53, 55, 57, 59, 61, 62, 65, 66, 67, 69, 71, 73, 74, 77, 79, 82, 86, 87, 88,
  91, 93, 94, 95, 97,
]
export default class DenominateurCommun2Old extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.correctionDetailleeDisponible = true
    this.versionQcmDisponible = true
    this.spacing = 2
    this.spacingCorr = 2
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  nouvelleVersion() {
    // générer deux fractions avec dénominateurs différents dans [4,80]
    // s'assurer que le résultat (ppcm des dénominateurs réduits) soit < 100
    let frac1: FractionEtendue
    let frac2: FractionEtendue
    let resultat: number
    let attempts = 0
    let sontPremiersEntreEux: boolean
    do {
      const den1 = randint(4, 80, listeDesDénominateursAEviter)
      const num1 = randint(1, den1 - 1, listeDesDénominateursAEviter)
      frac1 = fraction(num1, den1)

      let den2: number, num2: number
      do {
        den2 = randint(4, 80, listeDesDénominateursAEviter)
        num2 = randint(1, den2 - 1, listeDesDénominateursAEviter)
        frac2 = fraction(num2, den2)
      } while (frac2.den === frac1.den)

      resultat = ppcm(frac1.denIrred, frac2.denIrred)
      attempts++
      // si boucle trop longue, restreindre la plage des dénominateurs pour favoriser ppcm < 100
      if (attempts === 150) {
        // forcer dénominateurs plus petits afin d'obtenir un PPCM < 100
        const denA = randint(4, 30)
        const numA = randint(1, denA - 1)
        frac1 = fraction(numA, denA)
        const denB = randint(4, 30)
        const numB = randint(1, denB - 1)
        frac2 = fraction(numB, denB)
        resultat = ppcm(frac1.denIrred, frac2.denIrred)
        break
      }
      sontPremiersEntreEux = pgcd(frac1.denIrred, frac2.denIrred) === 1
    } while (
      (resultat >= 100 && !sontPremiersEntreEux) ||
      listeDesDénominateursAEviter.includes(frac1.denIrred) ||
      listeDesDénominateursAEviter.includes(frac2.denIrred)
    ) // si ppcm >= 100, forcer fractions premières entre elles pour limiter le ppcm
    // réduire chaque fraction si possible
    const k1 = resultat / frac1.denIrred
    const k2 = resultat / frac2.denIrred
    const numScale1 = frac1.numIrred * k1
    const numScale2 = frac2.numIrred * k2

    this.question = `Voici deux fractions : $${frac1.texFraction}$ et $${frac2.texFraction}$.<br>
Quel est le plus petit dénominateur commun de ces deux fractions ?`

    let correction = `Les dénominateurs initiaux des fractions $${frac1.texFraction}$ et $${frac2.texFraction}$ sont $${frac1.den}$ et $${frac2.den}$.<br>`
    if (!frac1.estIrreductible || !frac2.estIrreductible) {
      // au moins une fraction se simplifie
      correction += `Après simplification on obtient `
      correction += ` $${frac1.texFractionSimplifiee}$` // affichage simple
      correction += ` et `
      correction += ` $${frac2.texFractionSimplifiee}$` // affichage simple
      correction += `.<br>On prend ensuite le plus petit multiple commun des dénominateurs simplifiés $${frac1.denIrred}$ et $${frac2.denIrred}$.<br>`
    } else {
      correction += `Les deux fractions sont déjà irréductibles.<br>On cherche le plus petit multiple commun de $${frac1.denIrred}$ et $${frac2.denIrred}$.<br>`
    }
    if (this.correctionDetaillee) {
      correction += `On multiplie le dénominateur de la première fraction par ${k1} : $${frac1.denIrred}\\times ${k1} = ${resultat}$.<br>`
      correction += `On multiplie le dénominateur de la deuxième fraction par ${k2} : $${frac2.denIrred}\\times ${k2} = ${resultat}$.<br>`
    }
    if (this.correctionDetaillee) {
      correction += `Les numérateurs correspondants deviennent $${frac1.numIrred}\\times ${k1} = ${numScale1}$ et $${frac2.numIrred}\\times ${k2} = ${numScale2}$.<br>`
      correction += `Les fractions s'écrivent donc avec le dénominateur commun $${resultat}$ :<br>`
      correction += ` $${frac1.texFractionSimplifiee} = \\dfrac{${numScale1}}{${resultat}}$ et $${frac2.texFractionSimplifiee} = \\dfrac{${numScale2}}{${resultat}}$.<br>`
    }
    correction += `Le plus petit dénominateur commun est $${miseEnEvidence(resultat)}$.`

    this.correction = correction
    this.reponse = resultat

    // proposer des distracteurs pour la version QCM
    if (this.versionQcm) {
      // construire une liste de candidats d'erreurs courantes puis filtrer pour éviter la bonne réponse
      const ppcmOriginal = ppcm(frac1.den, frac2.den) // oublier de simplifier
      const produitOriginal = frac1.den * frac2.den // confondre avec le produit
      const produitIrreductible = frac1.denIrred * frac2.denIrred // confondre produit des dénominateurs réduits
      const pgcdOriginal = pgcd(frac1.den, frac2.den) // confondre avec le PGCD
      const pgcdIrred = pgcd(frac1.denIrred, frac2.denIrred)
      const minDen = Math.min(frac1.denIrred, frac2.denIrred)
      const maxDen = Math.max(frac1.denIrred, frac2.denIrred)
      const diffDen = Math.abs(frac1.denIrred - frac2.denIrred) || 1
      const half = Math.max(1, Math.floor(resultat / 2))
      const double = resultat * 2

      const candidates = [
        ppcmOriginal,
        produitOriginal,
        produitIrreductible,
        pgcdOriginal,
        pgcdIrred,
        minDen,
        maxDen,
        diffDen,
        half,
        double,
      ]

      // filtrer, dédupliquer et retirer la bonne réponse
      const uniq = Array.from(
        new Set(candidates.filter((n) => n > 0 && n !== resultat)),
      )

      const picked = shuffle(uniq).slice(0, 4)

      this.distracteurs = picked.map((n) => `$${n}$`)
    }
  }
}
