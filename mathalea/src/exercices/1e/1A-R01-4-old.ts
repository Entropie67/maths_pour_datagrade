// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 28d47 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const dateDePublication = '22/07/2025'
export const uuid = '28d47'
/**
 * @author Claude (ia) et un peu Gilles Mora
 *
 */
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Comparer des proportions (sous différentes formes)'

export default class ElectionPourcentagesOld extends ExerciceQcmA {
  versionOriginale: () => void = () => {
    this.enonce =
      "Lors d'une élection, le quart des électeurs a voté pour X, $20\\,\\%$ a voté pour Y, un tiers a voté pour Z, et le reste a voté pour T.<br>Le candidat ayant recueilli le moins de votes est :"
    this.spacingCorr = 2.5
    this.correction = `Exprimons chaque proportion sous forme de fraction :<br>
    • Candidat X : $\\dfrac{1}{4}$<br>
    • Candidat Y : $20\\,\\% = \\dfrac{20}{100} = \\dfrac{1}{5}$<br>
    • Candidat Z : $\\dfrac{1}{3}$<br>
    • Candidat T : $1 - \\dfrac{1}{4} - \\dfrac{1}{5} - \\dfrac{1}{3} = \\dfrac{60 - 15 - 12 - 20}{60} = \\dfrac{13}{60}$<br>
    En comparant les fractions, on a : $\\dfrac{1}{5} < \\dfrac{13}{60} < \\dfrac{1}{4} < \\dfrac{1}{3}$.<br>
    Le candidat ayant recueilli le moins de votes est donc $${miseEnEvidence('Y')}$.`

    this.reponses = [
      'le candidat Y',
      'le candidat X',
      'le candidat Z',
      'le candidat T',
    ]
  }

  // Fonction pour convertir une fraction en fraction de dénominateur 60
  private convertirVers60(numerateur: number, denominateur: number): number {
    return (numerateur * 60) / denominateur
  }

  // Fonction pour convertir un pourcentage en fraction de dénominateur 60
  private convertirPourcentageVers60(pourcentage: number): number {
    return (pourcentage * 60) / 100
  }

  // Fonction pour formater l'affichage d'un pourcentage avec étape intermédiaire si nécessaire
  private formaterPourcentage(pourcentage: number): string {
    if (pourcentage % 5 === 0) {
      // Pourcentage se terminant par 5 (ou 0) : ajouter l'étape intermédiaire
      const fractionSur100 = `\\dfrac{${pourcentage}}{100}`
      const fractionSimplifiee = `\\dfrac{${pourcentage / 5}}{20}`
      const fractionSur60 = `\\dfrac{${this.convertirPourcentageVers60(pourcentage)}}{60}`
      return `$${pourcentage}\\,\\% = ${fractionSur100} = ${fractionSimplifiee} = ${fractionSur60}$`
    } else {
      // Pourcentage normal : affichage direct
      const fractionSur100 = `\\dfrac{${pourcentage}}{100}`
      const fractionSur60 = `\\dfrac{${this.convertirPourcentageVers60(pourcentage)}}{60}`
      return `$${pourcentage}\\,\\% = ${fractionSur100} = ${fractionSur60}$`
    }
  }

  versionAleatoire = () => {
    const proportions = [
      { tex: 'un dixième', frac: [1, 10], val: 0.1, singulier: true },
      { tex: 'trois dixièmes', frac: [3, 10], val: 0.3, singulier: false },
      { tex: 'un cinquième', frac: [1, 5], val: 0.2, singulier: true },
      { tex: 'un sixième', frac: [1, 6], val: 1 / 6, singulier: true },
      { tex: 'deux cinquièmes', frac: [2, 5], val: 0.4, singulier: false },
      { tex: 'trois cinquièmes', frac: [3, 5], val: 0.6, singulier: false },
      { tex: 'un tiers', frac: [1, 3], val: 1 / 3, singulier: true },
      { tex: 'un quart', frac: [1, 4], val: 0.25, singulier: true },
    ]

    // Fonction pour vérifier que les valeurs sont différentes
    const sontDifferentes = (valeurs: number[]) => {
      for (let i = 0; i < valeurs.length; i++) {
        for (let j = i + 1; j < valeurs.length; j++) {
          if (Math.abs(valeurs[i] - valeurs[j]) < 0.001) return false
        }
      }
      return true
    }

    // Fonction pour créer la comparaison des fractions avec dénominateur 60
    const creerComparaison = (
      fractions: FractionEtendue[],
      candidats: string[],
    ) => {
      const fractionsAvecCandidats = fractions.map((frac, index) => ({
        fraction: frac,
        candidat: candidats[index],
        valeur: frac.valeurDecimale,
      }))

      // Trier par valeur croissante
      fractionsAvecCandidats.sort((a, b) => a.valeur - b.valeur)

      // Créer la chaîne de comparaison avec dénominateur 60
      const comparaison = fractionsAvecCandidats
        .map((item) => {
          const numSur60 = Math.round(item.valeur * 60)
          return `\\dfrac{${numSur60}}{60}`
        })
        .join(' < ')

      return comparaison
    }

    switch (randint(1, 4)) {
      case 1: {
        // A a le moins de votes ET C a le plus de votes
        const choix = choice([true, false]) // true = "le moins", false = "le plus"
        let propA, pB, propC, fA, fB, fC, fD

        do {
          propA = choice(proportions.filter((p) => p.val < 0.25)) // A doit être petit
          pB = choice([20, 25, 30])
          propC = choice(proportions.filter((p) => p.val > 0.3)) // C doit être grand

          fA = new FractionEtendue(propA.frac[0], propA.frac[1])
          fB = new FractionEtendue(pB, 100)
          fC = new FractionEtendue(propC.frac[0], propC.frac[1])
          fD = new FractionEtendue(1, 1)
            .differenceFraction(fA)
            .differenceFraction(fB)
            .differenceFraction(fC)
        } while (
          !sontDifferentes([
            propA.val,
            pB / 100,
            propC.val,
            fD.valeurDecimale,
          ]) ||
          fD.valeurDecimale <= 0 ||
          fA.valeurDecimale >
            Math.min(pB / 100, propC.val, fD.valeurDecimale) ||
          propC.val < Math.max(propA.val, pB / 100, fD.valeurDecimale)
        )

        this.enonce = `Lors d'une élection, ${propA.tex} des électeurs ${propA.singulier ? 'a' : 'ont'} voté pour X, $${pB}\\,\\%$ ont voté pour Y, ${propC.tex} ${propC.singulier ? 'a' : 'ont'} voté pour Z, et le reste a voté pour T.<br>Le candidat ayant recueilli ${choix ? 'le moins' : 'le plus'} de votes est :`

        const comparaison1 = creerComparaison(
          [fA, fB, fC, fD],
          ['A', 'B', 'C', 'D'],
        )

        const numA60 = Math.round(
          this.convertirVers60(propA.frac[0], propA.frac[1]),
        )
        const numC60 = Math.round(
          this.convertirVers60(propC.frac[0], propC.frac[1]),
        )
        const numD60 = Math.round(fD.valeurDecimale * 60)

        this.correction = `Exprimons chaque proportion sous forme de fraction :<br>
• Candidat X : ${propA.tex} $= \\dfrac{${propA.frac[0]}}{${propA.frac[1]}} = \\dfrac{${numA60}}{60}$<br>
• Candidat Y : ${this.formaterPourcentage(pB)}<br>
• Candidat Z : ${propC.tex} $= \\dfrac{${propC.frac[0]}}{${propC.frac[1]}} = \\dfrac{${numC60}}{60}$<br>
• Candidat T : $1 - \\dfrac{${propA.frac[0]}}{${propA.frac[1]}} - \\dfrac{${pB}}{100} - \\dfrac{${propC.frac[0]}}{${propC.frac[1]}} = \\dfrac{${numD60}}{60}$<br>
En comparant les fractions, on a : $${comparaison1}$.<br>
Le candidat ayant recueilli ${choix ? 'le moins' : 'le plus'} de votes est donc ${texteEnCouleurEtGras(choix ? 'le candidat X' : 'le candidat Z')}.`

        this.reponses = choix
          ? ['le candidat X', 'le candidat Y', 'le candidat Z', 'le candidat T']
          : ['le candidat Z', 'le candidat Y', 'le candidat X', 'le candidat T']

        break
      }
      case 2: {
        // B a le moins de votes ET D a le plus de votes
        const choix = choice([true, false]) // true = "le moins", false = "le plus"
        let pB, propA, propC, fA, fB, fC, fD

        do {
          pB = choice([10, 15]) // B doit être petit
          propA = choice(proportions.filter((p) => p.val > 0.15 && p.val < 0.4)) // A intermédiaire
          propC = choice(proportions.filter((p) => p.val > 0.15 && p.val < 0.4)) // C intermédiaire

          fA = new FractionEtendue(propA.frac[0], propA.frac[1])
          fB = new FractionEtendue(pB, 100)
          fC = new FractionEtendue(propC.frac[0], propC.frac[1])
          fD = new FractionEtendue(1, 1)
            .differenceFraction(fA)
            .differenceFraction(fB)
            .differenceFraction(fC)
        } while (
          !sontDifferentes([
            propA.val,
            pB / 100,
            propC.val,
            fD.valeurDecimale,
          ]) ||
          fD.valeurDecimale <= 0 ||
          pB / 100 >= Math.min(propA.val, propC.val, fD.valeurDecimale) ||
          fD.valeurDecimale <= Math.max(propA.val, pB / 100, propC.val)
        )

        this.enonce = `Lors d'une élection, ${propA.tex} des électeurs ${propA.singulier ? 'a' : 'ont'} voté pour X, $${pB}\\,\\%$ ont voté pour Y, ${propC.tex} ${propC.singulier ? 'a' : 'ont'} voté pour Z, et le reste a voté pour T.<br>Le candidat ayant recueilli ${choix ? 'le moins' : 'le plus'} de votes est :`

        const comparaison2 = creerComparaison(
          [fA, fB, fC, fD],
          ['A', 'B', 'C', 'D'],
        )

        const numA60Case2 = Math.round(
          this.convertirVers60(propA.frac[0], propA.frac[1]),
        )
        const numC60Case2 = Math.round(
          this.convertirVers60(propC.frac[0], propC.frac[1]),
        )
        const numD60Case2 = Math.round(fD.valeurDecimale * 60)

        this.correction = `Exprimons chaque proportion sous forme de fraction :<br>
• Candidat X : ${propA.tex} $= \\dfrac{${propA.frac[0]}}{${propA.frac[1]}} = \\dfrac{${numA60Case2}}{60}$<br>
• Candidat Y : ${this.formaterPourcentage(pB)}<br>
• Candidat Z : ${propC.tex} $= \\dfrac{${propC.frac[0]}}{${propC.frac[1]}} = \\dfrac{${numC60Case2}}{60}$<br>
• Candidat T : $1 - \\dfrac{${propA.frac[0]}}{${propA.frac[1]}} - \\dfrac{${pB}}{100} - \\dfrac{${propC.frac[0]}}{${propC.frac[1]}} = \\dfrac{${numD60Case2}}{60}$<br>
En comparant les fractions, on a : $${comparaison2}$.<br>
Le candidat ayant recueilli ${choix ? 'le moins' : 'le plus'} de votes est donc ${texteEnCouleurEtGras(choix ? 'le candidat Y' : 'le candidat T')}.`

        this.reponses = choix
          ? ['le candidat Y', 'le candidat X', 'le candidat Z', 'le candidat T']
          : ['le candidat T', 'le candidat Y', 'le candidat X', 'le candidat Z']
        break
      }
      case 3: {
        // C a le moins de votes ET B a le plus de votes
        const choix = choice([true, false]) // true = "le moins", false = "le plus"
        let propA, pB, propC, fA, fB, fC, fD

        do {
          propA = choice(proportions.filter((p) => p.val > 0.15 && p.val < 0.4)) // A intermédiaire
          pB = choice([35, 40]) // B doit être grand
          propC = choice(proportions.filter((p) => p.val < 0.2)) // C doit être petit

          fA = new FractionEtendue(propA.frac[0], propA.frac[1])
          fB = new FractionEtendue(pB, 100)
          fC = new FractionEtendue(propC.frac[0], propC.frac[1])
          fD = new FractionEtendue(1, 1)
            .differenceFraction(fA)
            .differenceFraction(fB)
            .differenceFraction(fC)
        } while (
          !sontDifferentes([
            propA.val,
            pB / 100,
            propC.val,
            fD.valeurDecimale,
          ]) ||
          fD.valeurDecimale <= 0 ||
          propC.val >= Math.min(propA.val, pB / 100, fD.valeurDecimale) ||
          pB / 100 <= Math.max(propA.val, propC.val, fD.valeurDecimale)
        )

        this.enonce = `Lors d'une élection, ${propA.tex} des électeurs ${propA.singulier ? 'a' : 'ont'} voté pour X, $${pB}\\,\\%$ ont voté pour Y, ${propC.tex} ${propC.singulier ? 'a' : 'ont'} voté pour Z, et le reste a voté pour T.<br>Le candidat ayant recueilli ${choix ? 'le moins' : 'le plus'} de votes est :`

        const comparaison3 = creerComparaison(
          [fA, fB, fC, fD],
          ['A', 'B', 'C', 'D'],
        )

        const numA60Case3 = Math.round(
          this.convertirVers60(propA.frac[0], propA.frac[1]),
        )
        const numC60Case3 = Math.round(
          this.convertirVers60(propC.frac[0], propC.frac[1]),
        )
        const numD60Case3 = Math.round(fD.valeurDecimale * 60)

        this.correction = `Exprimons chaque proportion sous forme de fraction :<br>
• Candidat X : ${propA.tex} $= \\dfrac{${propA.frac[0]}}{${propA.frac[1]}} = \\dfrac{${numA60Case3}}{60}$<br>
• Candidat Y : ${this.formaterPourcentage(pB)}<br>
• Candidat Z : ${propC.tex} $= \\dfrac{${propC.frac[0]}}{${propC.frac[1]}} = \\dfrac{${numC60Case3}}{60}$<br>
• Candidat T : $1 - \\dfrac{${propA.frac[0]}}{${propA.frac[1]}} - \\dfrac{${pB}}{100} - \\dfrac{${propC.frac[0]}}{${propC.frac[1]}} = \\dfrac{${numD60Case3}}{60}$<br>
En comparant les fractions, on a : $${comparaison3}$.<br>
Le candidat ayant recueilli ${choix ? 'le moins' : 'le plus'} de votes est donc ${texteEnCouleurEtGras(choix ? 'le candidat Z' : 'le candidat Y')}.`

        this.reponses = choix
          ? ['le candidat Z', 'le candidat X', 'le candidat Y', 'le candidat T']
          : ['le candidat Y', 'le candidat Z', 'le candidat X', 'le candidat T']
        break
      }
      case 4:
      default: {
        // D a le moins de votes ET A a le plus de votes
        const choix = choice([true, false]) // true = "le moins", false = "le plus"
        let propA, pB, propC, fA, fB, fC, fD

        do {
          propA = choice(proportions.filter((p) => p.val > 0.3)) // A doit être grand
          pB = choice([20, 25, 30]) // B intermédiaire
          propC = choice(proportions.filter((p) => p.val > 0.15 && p.val < 0.4)) // C intermédiaire

          fA = new FractionEtendue(propA.frac[0], propA.frac[1])
          fB = new FractionEtendue(pB, 100)
          fC = new FractionEtendue(propC.frac[0], propC.frac[1])
          fD = new FractionEtendue(1, 1)
            .differenceFraction(fA)
            .differenceFraction(fB)
            .differenceFraction(fC)
        } while (
          !sontDifferentes([
            propA.val,
            pB / 100,
            propC.val,
            fD.valeurDecimale,
          ]) ||
          fD.valeurDecimale <= 0 ||
          fD.valeurDecimale >= Math.min(propA.val, pB / 100, propC.val) ||
          propA.val <= Math.max(pB / 100, propC.val, fD.valeurDecimale)
        )

        this.enonce = `Lors d'une élection, ${propA.tex} des électeurs ${propA.singulier ? 'a' : 'ont'} voté pour X, $${pB}\\,\\%$ ont voté pour Y, ${propC.tex} ${propC.singulier ? 'a' : 'ont'} voté pour Z, et le reste a voté pour T.<br>Le candidat ayant recueilli ${choix ? 'le moins' : 'le plus'} de votes est :`

        const comparaison4 = creerComparaison(
          [fA, fB, fC, fD],
          ['A', 'B', 'C', 'D'],
        )

        const numA60Case4 = Math.round(
          this.convertirVers60(propA.frac[0], propA.frac[1]),
        )
        const numC60Case4 = Math.round(
          this.convertirVers60(propC.frac[0], propC.frac[1]),
        )
        const numD60Case4 = Math.round(fD.valeurDecimale * 60)

        this.correction = `Exprimons chaque proportion sous forme de fraction :<br>
• Candidat X : ${propA.tex} $= \\dfrac{${propA.frac[0]}}{${propA.frac[1]}} = \\dfrac{${numA60Case4}}{60}$<br>
• Candidat Y : ${this.formaterPourcentage(pB)}<br>
• Candidat Z : ${propC.tex} $= \\dfrac{${propC.frac[0]}}{${propC.frac[1]}} = \\dfrac{${numC60Case4}}{60}$<br>
• Candidat T : $1 - \\dfrac{${propA.frac[0]}}{${propA.frac[1]}} - \\dfrac{${pB}}{100} - \\dfrac{${propC.frac[0]}}{${propC.frac[1]}} = \\dfrac{${numD60Case4}}{60}$<br>
En comparant les fractions, on a : $${comparaison4}$.<br>
Le candidat ayant recueilli ${choix ? 'le moins' : 'le plus'} de votes est donc ${texteEnCouleurEtGras(choix ? 'le candidat T' : 'le candidat X')}.`

        this.reponses = choix
          ? ['le candidat T', 'le candidat X', 'le candidat Y', 'le candidat Z']
          : ['le candidat X', 'le candidat T', 'le candidat Y', 'le candidat Z']
        break
      }
    }
  }

  constructor() {
    super()
    this.versionAleatoire()
    this.spacingCorr = 2.5
    // this.options = { ordered: true }
  }
}
