import seedrandom from 'seedrandom'
import { choixDeroulant } from '../../lib/customElements/ListeDeroulanteElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const dateDePublication = '22/07/2025'
export const dateDeModifImportante = '21/10/2026'

export const uuid = '73f3e'
/**
 * @author Claude (ia) et un peu Gilles Mora
 *
 */
export const refs = {
  'fr-fr': ['1A-R01-4', '2A-R1-4'],
  'fr-ch': ['10CTFA1D-3', '10LCFA1D-3', '10LSFA1D-3'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Comparer des proportions (sous différentes formes)'

export default class ElectionPourcentages extends ExerciceQcmACourt {
  versionOriginale: () => void = () => {
    this.enonce =
      "Lors d'une élection, le quart des électeurs a voté pour Léa, $20\\,\\%$ a voté pour Hugo, un tiers a voté pour Inès, et le reste a voté pour Karim.<br>La personne ayant recueilli le moins de votes est :"
    this.spacingCorr = 2.5
    this.correction = `Exprimons chaque proportion sous forme de fraction :<br>
    • Léa : $\\dfrac{1}{4}$<br>
    • Hugo : $20\\,\\% = \\dfrac{20}{100} = \\dfrac{1}{5}$<br>
    • Inès : $\\dfrac{1}{3}$<br>
    • Karim : $1 - \\dfrac{1}{4} - \\dfrac{1}{5} - \\dfrac{1}{3} = \\dfrac{60 - 15 - 12 - 20}{60} = \\dfrac{13}{60}$<br>
    En comparant les fractions, on a : $\\dfrac{1}{5} < \\dfrac{13}{60} < \\dfrac{1}{4} < \\dfrac{1}{3}$.<br>
    La personne ayant recueilli le moins de votes est donc ${miseEnEvidence('Hugo')}.`

    this.reponses = ['Hugo', 'Léa', 'Inès', 'Karim']
  }

  /**
   * Choisit quatre prénoms distincts pour les candidats.
   * Le tirage utilise un générateur local initialisé par les données de
   * l'énoncé : il ne consomme pas le générateur global, donc les valeurs
   * tirées pour une graine donnée restent celles des liens déjà partagés.
   */
  private choisirCandidats(...cle: (string | number | boolean)[]): string[] {
    const prenomsCandidats = [
      'Léa',
      'Hugo',
      'Inès',
      'Karim',
      'Manon',
      'Lucas',
      'Yasmine',
      'Théo',
      'Zoé',
      'Mehdi',
      'Sofia',
      'Paul',
    ]
    const rng = seedrandom(`candidats-${cle.join('-')}`)
    const melanges = [...prenomsCandidats]
    for (let k = melanges.length - 1; k > 0; k--) {
      const j = Math.floor(rng() * (k + 1))
      ;[melanges[k], melanges[j]] = [melanges[j], melanges[k]]
    }
    return melanges.slice(0, 4)
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

        const [nX, nY, nZ, nT] = this.choisirCandidats(
          propA.tex,
          pB,
          propC.tex,
          choix,
        )

        this.enonce = `Lors d'une élection, ${propA.tex} des électeurs ${propA.singulier ? 'a' : 'ont'} voté pour ${nX}, $${pB}\\,\\%$ ont voté pour ${nY}, ${propC.tex} ${propC.singulier ? 'a' : 'ont'} voté pour ${nZ}, et le reste a voté pour ${nT}.<br>La personne ayant recueilli ${choix ? 'le moins' : 'le plus'} de votes est :`

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
• ${nX} : ${propA.tex} $= \\dfrac{${propA.frac[0]}}{${propA.frac[1]}} = \\dfrac{${numA60}}{60}$<br>
• ${nY} : ${this.formaterPourcentage(pB)}<br>
• ${nZ} : ${propC.tex} $= \\dfrac{${propC.frac[0]}}{${propC.frac[1]}} = \\dfrac{${numC60}}{60}$<br>
• ${nT} : $1 - \\dfrac{${propA.frac[0]}}{${propA.frac[1]}} - \\dfrac{${pB}}{100} - \\dfrac{${propC.frac[0]}}{${propC.frac[1]}} = \\dfrac{${numD60}}{60}$<br>
En comparant les fractions, on a : $${comparaison1}$.<br>
La personne ayant recueilli ${choix ? 'le moins' : 'le plus'} de votes est donc ${texteEnCouleurEtGras(choix ? nX : nZ)}.`

        this.reponses = choix ? [nX, nY, nZ, nT] : [nZ, nY, nX, nT]

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

        const [nX, nY, nZ, nT] = this.choisirCandidats(
          propA.tex,
          pB,
          propC.tex,
          choix,
        )

        this.enonce = `Lors d'une élection, ${propA.tex} des électeurs ${propA.singulier ? 'a' : 'ont'} voté pour ${nX}, $${pB}\\,\\%$ ont voté pour ${nY}, ${propC.tex} ${propC.singulier ? 'a' : 'ont'} voté pour ${nZ}, et le reste a voté pour ${nT}.<br>La personne ayant recueilli ${choix ? 'le moins' : 'le plus'} de votes est :`

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
• ${nX} : ${propA.tex} $= \\dfrac{${propA.frac[0]}}{${propA.frac[1]}} = \\dfrac{${numA60Case2}}{60}$<br>
• ${nY} : ${this.formaterPourcentage(pB)}<br>
• ${nZ} : ${propC.tex} $= \\dfrac{${propC.frac[0]}}{${propC.frac[1]}} = \\dfrac{${numC60Case2}}{60}$<br>
• ${nT} : $1 - \\dfrac{${propA.frac[0]}}{${propA.frac[1]}} - \\dfrac{${pB}}{100} - \\dfrac{${propC.frac[0]}}{${propC.frac[1]}} = \\dfrac{${numD60Case2}}{60}$<br>
En comparant les fractions, on a : $${comparaison2}$.<br>
La personne ayant recueilli ${choix ? 'le moins' : 'le plus'} de votes est donc ${texteEnCouleurEtGras(choix ? nY : nT)}.`

        this.reponses = choix ? [nY, nX, nZ, nT] : [nT, nY, nX, nZ]
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

        const [nX, nY, nZ, nT] = this.choisirCandidats(
          propA.tex,
          pB,
          propC.tex,
          choix,
        )

        this.enonce = `Lors d'une élection, ${propA.tex} des électeurs ${propA.singulier ? 'a' : 'ont'} voté pour ${nX}, $${pB}\\,\\%$ ont voté pour ${nY}, ${propC.tex} ${propC.singulier ? 'a' : 'ont'} voté pour ${nZ}, et le reste a voté pour ${nT}.<br>La personne ayant recueilli ${choix ? 'le moins' : 'le plus'} de votes est :`

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
• ${nX} : ${propA.tex} $= \\dfrac{${propA.frac[0]}}{${propA.frac[1]}} = \\dfrac{${numA60Case3}}{60}$<br>
• ${nY} : ${this.formaterPourcentage(pB)}<br>
• ${nZ} : ${propC.tex} $= \\dfrac{${propC.frac[0]}}{${propC.frac[1]}} = \\dfrac{${numC60Case3}}{60}$<br>
• ${nT} : $1 - \\dfrac{${propA.frac[0]}}{${propA.frac[1]}} - \\dfrac{${pB}}{100} - \\dfrac{${propC.frac[0]}}{${propC.frac[1]}} = \\dfrac{${numD60Case3}}{60}$<br>
En comparant les fractions, on a : $${comparaison3}$.<br>
La personne ayant recueilli ${choix ? 'le moins' : 'le plus'} de votes est donc ${texteEnCouleurEtGras(choix ? nZ : nY)}.`

        this.reponses = choix ? [nZ, nX, nY, nT] : [nY, nZ, nX, nT]
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

        const [nX, nY, nZ, nT] = this.choisirCandidats(
          propA.tex,
          pB,
          propC.tex,
          choix,
        )

        this.enonce = `Lors d'une élection, ${propA.tex} des électeurs ${propA.singulier ? 'a' : 'ont'} voté pour ${nX}, $${pB}\\,\\%$ ont voté pour ${nY}, ${propC.tex} ${propC.singulier ? 'a' : 'ont'} voté pour ${nZ}, et le reste a voté pour ${nT}.<br>La personne ayant recueilli ${choix ? 'le moins' : 'le plus'} de votes est :`

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
• ${nX} : ${propA.tex} $= \\dfrac{${propA.frac[0]}}{${propA.frac[1]}} = \\dfrac{${numA60Case4}}{60}$<br>
• ${nY} : ${this.formaterPourcentage(pB)}<br>
• ${nZ} : ${propC.tex} $= \\dfrac{${propC.frac[0]}}{${propC.frac[1]}} = \\dfrac{${numC60Case4}}{60}$<br>
• ${nT} : $1 - \\dfrac{${propA.frac[0]}}{${propA.frac[1]}} - \\dfrac{${pB}}{100} - \\dfrac{${propC.frac[0]}}{${propC.frac[1]}} = \\dfrac{${numD60Case4}}{60}$<br>
En comparant les fractions, on a : $${comparaison4}$.<br>
La personne ayant recueilli ${choix ? 'le moins' : 'le plus'} de votes est donc ${texteEnCouleurEtGras(choix ? nT : nX)}.`

        this.reponses = choix ? [nT, nX, nY, nZ] : [nX, nT, nY, nZ]
        break
      }
    }
  }

  /**
   * Version sans QCM : l'élève choisit la personne dans une liste déroulante.
   * La case « Version QCM » (`sup3`) réactive le QCM d'origine.
   */
  nouvelleVersion() {
    if (this.sup3) {
      super.nouvelleVersion()
      return
    }
    if (context.isAmc) {
      // L'export AMC reste un QCM : on court-circuite ExerciceQcmACourt
      ExerciceQcmA.prototype.nouvelleVersion.call(this)
      return
    }

    this.consigne = ''
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 30; cpt++) {
      this.versionAleatoire()

      const bonneReponse = this.reponses[0]
      if (this.questionJamaisPosee(i, this.enonce, bonneReponse)) {
        const choices = [
          { label: 'Choisir une personne', value: '' },
          ...shuffle([...this.reponses]).map((reponse) => ({
            label: reponse,
            value: reponse,
          })),
        ]

        // En non interactif, pas de liste déroulante : on reformule la phrase
        // en vraie question plutôt que de laisser « … est : » sans réponse.
        const enonceAffiche = this.interactif
          ? this.enonce
          : this.enonce.replace(
              /La personne ayant recueilli (le moins|le plus) de votes est :$/,
              'Quelle personne a recueilli $1 de votes ?',
            )

        this.listeQuestions[i] =
          enonceAffiche +
          (this.interactif ? `<br>${choixDeroulant(this, i, { choices })}` : '')
        this.listeCorrections[i] = this.correction ?? ''

        handleAnswers(
          this,
          i,
          { reponse: { value: bonneReponse } },
          { formatInteractif: 'liste-deroulante' },
        )
        i++
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
