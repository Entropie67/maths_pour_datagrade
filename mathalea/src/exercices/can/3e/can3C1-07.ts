import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { pgcd, ppcm } from '../../../lib/outils/primalite'
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
export const dateDeModifImportante = '11/09/2026'

export const uuid = 'f26bc'

export const refs = {
  'fr-fr': ['can3C1-07'],
  'fr-ch': [],
}

// Paires de dénominateurs abordables mentalement pour un élève de 3e :
// tables de multiplication usuelles (jusqu'à 12), PPCM toujours <= 36.
const LISTE_PAIRES_DENOMINATEURS: [number, number][] = [
  [2, 3],
  [2, 5],
  [2, 6],
  [2, 8],
  [2, 9],
  [2, 10],
  [2, 12],
  [3, 4],
  [3, 5],
  [3, 6],
  [3, 8],
  [3, 9],
  [3, 12],
  [4, 5],
  [4, 6],
  [4, 8],
  [4, 9],
  [4, 10],
  [4, 12],
  [5, 6],
  [5, 10],
  [6, 8],
  [6, 9],
  [6, 10],
  [6, 12],
  [8, 12],
  [9, 12],
  // Cas où le dénominateur commun est un multiple des deux, mais pas leur
  // produit (les deux partagent un facteur, sans que l'un divise l'autre) :
  // répétés pour que ce cas, plus formateur, revienne plus souvent.
  [4, 6],
  [4, 10],
  [6, 8],
  [6, 9],
  [6, 10],
  [8, 12],
  [9, 12],
  [6, 15],
  [10, 15],
  [12, 18],
]

/** Numérateur tiré au hasard, premier avec le dénominateur (fraction déjà irréductible). */
function numerateurCoprimeAvec(denominateur: number): number {
  let numerateur: number
  do {
    numerateur = randint(1, denominateur - 1)
  } while (pgcd(numerateur, denominateur) !== 1)
  return numerateur
}

export default class DenominateurCommun2 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.correctionDetailleeDisponible = true
    this.versionQcmDisponible = true
    this.versionQcmOptions = { radio: true, compact: true }
    this.spacing = 2
    this.spacingCorr = 2
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  nouvelleVersion() {
    const [den1, den2] = this.quotaChoice(
      'denominateurs',
      LISTE_PAIRES_DENOMINATEURS,
    )
    const num1 = numerateurCoprimeAvec(den1)
    const num2 = numerateurCoprimeAvec(den2)
    const frac1 = fraction(num1, den1)
    const frac2 = fraction(num2, den2)
    const resultat = ppcm(den1, den2)
    const k1 = resultat / den1
    const k2 = resultat / den2
    const numScale1 = num1 * k1
    const numScale2 = num2 * k2

    this.question = `Voici deux fractions : $${frac1.texFraction}$ et $${frac2.texFraction}$.<br>
Quel est le plus petit dénominateur commun de ces deux fractions ?`

    let correction = `Les dénominateurs des fractions $${frac1.texFraction}$ et $${frac2.texFraction}$ sont $${den1}$ et $${den2}$.<br>
On cherche le plus petit multiple commun de $${den1}$ et $${den2}$.<br>`
    if (this.correctionDetaillee) {
      correction += `On multiplie le dénominateur de la première fraction par $${k1}$ : $${den1}\\times ${k1} = ${resultat}$.<br>`
      correction += `On multiplie le dénominateur de la deuxième fraction par $${k2}$ : $${den2}\\times ${k2} = ${resultat}$.<br>`
      correction += `Les numérateurs correspondants deviennent $${num1}\\times ${k1} = ${numScale1}$ et $${num2}\\times ${k2} = ${numScale2}$.<br>`
      correction += `Les fractions s'écrivent donc avec le dénominateur commun $${resultat}$ :<br>`
      correction += ` $${frac1.texFraction} = \\dfrac{${numScale1}}{${resultat}}$ et $${frac2.texFraction} = \\dfrac{${numScale2}}{${resultat}}$.<br>`
    }
    correction += `Le plus petit dénominateur commun est $${miseEnEvidence(resultat)}$.`

    this.correction = correction
    this.reponse = resultat

    // proposer des distracteurs pour la version QCM
    if (this.versionQcm) {
      // le produit des deux dénominateurs est l'erreur la plus fréquente
      // (surtout quand ils partagent un facteur, donc PPCM < produit) :
      // on le garantit dans les distracteurs plutôt que de le laisser au hasard.
      const produit = den1 * den2
      const pgcdDen = pgcd(den1, den2) // confondre avec le PGCD
      const minDen = Math.min(den1, den2)
      const maxDen = Math.max(den1, den2)
      const diffDen = Math.abs(den1 - den2) || 1
      const half = Math.max(1, Math.floor(resultat / 2))
      const double = resultat * 2

      const autresCandidats = [pgcdDen, minDen, maxDen, diffDen, half, double]

      // filtrer, dédupliquer et retirer la bonne réponse et le produit (déjà garanti)
      const uniq = Array.from(
        new Set(
          autresCandidats.filter(
            (n) => n > 0 && n !== resultat && n !== produit,
          ),
        ),
      )

      // le produit n'est un distracteur utile que s'il diffère de la bonne réponse
      // (cas des dénominateurs premiers entre eux, où PPCM = produit)
      const produitEstUtile = produit !== resultat
      const picked = shuffle(uniq).slice(0, produitEstUtile ? 3 : 4)

      this.distracteurs = (
        produitEstUtile ? [produit, ...picked] : picked
      ).map((n) => `$${n}$`)
    }
  }
}
