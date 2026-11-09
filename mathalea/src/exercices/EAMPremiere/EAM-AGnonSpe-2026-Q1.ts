import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = 'd1c29'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer une différence de fractions'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ1AGns2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    n1: number,
    d1: number,
    n2: number,
    d2: number,
    distracteurs?: string[],
  ): void {
    const f1 = new FractionEtendue(n1, d1)
    const f2 = new FractionEtendue(n2, d2)
    const k = Math.round(d2 / d1)

    // Calcul de la fraction non réduite puis de sa version simplifiée
    const nonReduite = new FractionEtendue(n1 * k - n2, d2)
    const repSimp = nonReduite.simplifie()

    // On utilise texFSD pour garantir que le signe moins est devant la fraction et non au numérateur
    const correctLatex = repSimp.texFSD

    this.enonce = `$${f1.texFraction} - ${f2.texFraction} =$`

    // Gestion des distracteurs (soit forcés depuis la version originale, soit générés aléatoirement)
    if (distracteurs && distracteurs.length >= 3) {
      this.reponses = [
        `$${correctLatex}$`,
        distracteurs[0],
        distracteurs[1],
        distracteurs[2],
      ]
    } else {
      // Génération dynamique de mauvaises réponses classiques
      const dist1 = new FractionEtendue(n1 - n2, d2).simplifie().texFSD // Oubli de multiplier le numérateur
      const dist2 = new FractionEtendue(n1 - n2, d1).simplifie().texFSD // Oubli total de mise au même dénominateur
      const dist3 = f1.sommeFraction(f2).simplifie().texFSD // Addition au lieu de soustraction
      const dist4 = f2.differenceFraction(f1).simplifie().texFSD // Inversion de la soustraction (erreur de signe)

      const faussesReponses = new Set<string>()
      if (dist1 !== correctLatex) faussesReponses.add(`$${dist1}$`)
      if (dist2 !== correctLatex) faussesReponses.add(`$${dist2}$`)
      if (dist3 !== correctLatex) faussesReponses.add(`$${dist3}$`)
      if (dist4 !== correctLatex) faussesReponses.add(`$${dist4}$`)

      // Complétion au cas où les erreurs génèrent accidentellement la bonne réponse (ou des doublons)
      let iter = 1
      while (faussesReponses.size < 3) {
        const val = new FractionEtendue(
          repSimp.num + iter,
          repSimp.den,
        ).simplifie().texFSD
        if (val !== correctLatex) {
          faussesReponses.add(`$${val}$`)
        }
        iter++
      }

      const arrDist = Array.from(faussesReponses)
      this.reponses = [`$${correctLatex}$`, arrDist[0], arrDist[1], arrDist[2]]
    }

    // Rédaction détaillée de la correction
    this.correction = `Pour soustraire deux fractions, on les réduit au même dénominateur.<br>`
    this.correction += `$\\begin{aligned}
    ${f1.texFraction} - ${f2.texFraction} &= \\dfrac{${n1} \\times ${k}}{${d1} \\times ${k}} - ${f2.texFraction}\\\\
    & = \\dfrac{${n1 * k}}{${d2}} - ${f2.texFraction}\\\\
   & = \\dfrac{${n1 * k} - ${n2}}{${d2}}\\\\
${nonReduite.texFSD === repSimp.texFSD ? `&=${miseEnEvidence(repSimp.texFSD)}` : `&=${nonReduite.texFSD} \\\\&= ${miseEnEvidence(repSimp.texFSD)}`}
   \\end{aligned}$`
  }

  versionOriginale: () => void = () => {
    // Reproduction exacte des conditions et distracteurs de l'image
    this.appliquerLesValeurs(2, 5, 3, 10, [
      '$-\\dfrac{3}{25}$',
      '$-\\dfrac{1}{5}$',
      '$\\dfrac{1}{5}$',
    ])
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    // Liste pédagogique de soustractions garantissant des calculs sains et des simplifications variées
    const listeFractions = [
      // --- Réponses positives ---
      [1, 2, 1, 4], // 1/2 - 1/4 = 2/4 - 1/4 = 1/4
      [1, 2, 3, 8], // 1/2 - 3/8 = 4/8 - 3/8 = 1/8
      [2, 3, 1, 6], // 2/3 - 1/6 = 4/6 - 1/6 = 1/2
      [2, 3, 5, 12], // 2/3 - 5/12 = 8/12 - 5/12 = 1/4
      [3, 4, 5, 12], // 3/4 - 5/12 = 9/12 - 5/12 = 1/3
      [3, 4, 1, 8], // 3/4 - 1/8 = 6/8 - 1/8 = 5/8
      [4, 5, 3, 10], // 4/5 - 3/10 = 8/10 - 3/10 = 1/2
      [3, 5, 4, 15], // 3/5 - 4/15 = 9/15 - 4/15 = 1/3
      [5, 6, 7, 18], // 5/6 - 7/18 = 15/18 - 7/18 = 4/9
      [2, 7, 3, 14], // 2/7 - 3/14 = 4/14 - 3/14 = 1/14
      // --- Réponses négatives ---
      [1, 3, 5, 6], // 1/3 - 5/6 = 2/6 - 5/6 = -1/2
      [1, 4, 5, 12], // 1/4 - 5/12 = 3/12 - 5/12 = -1/6
      [2, 5, 7, 10], // 2/5 - 7/10 = 4/10 - 7/10 = -3/10
      [1, 5, 8, 15], // 1/5 - 8/15 = 3/15 - 8/15 = -1/3
      [1, 6, 5, 12], // 1/6 - 5/12 = 2/12 - 5/12 = -1/4
      [3, 7, 11, 14], // 3/7 - 11/14 = 6/14 - 11/14 = -5/14
      [3, 8, 9, 16], // 3/8 - 9/16 = 6/16 - 9/16 = -3/16
      [2, 9, 7, 18], // 2/9 - 7/18 = 4/18 - 7/18 = -1/6
      [3, 10, 9, 20], // 3/10 - 9/20 = 6/20 - 9/20 = -3/20
      [5, 12, 17, 24], // 5/12 - 17/24 = 10/24 - 17/24 = -7/24
    ]

    let compteur = 0
    do {
      const [n1, d1, n2, d2] = choice(listeFractions)
      this.appliquerLesValeurs(n1, d1, n2, d2)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, {
        fractionEgale: true,
        nombreDecimalSeulement: true,
      })
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(/^\$(.*) =\$\s*$/, (_, expression: string) =>
        this.interactif ? `$${expression}=$` : `Calculer $${expression}$.`,
      )
    this.clavierReponseCourte = KeyboardType.clavierDeBaseAvecFraction
    this.champReponseCourteEnLigne = true
  }
}
