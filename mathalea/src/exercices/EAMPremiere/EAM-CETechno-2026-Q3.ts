import Decimal from 'decimal.js'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = 'eb3f5'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Retrouver une expression de calcul de pourcentage'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ3ANt2026 extends ExerciceQcmACourt {
  private prix = 0
  private taux = 0

  private coefficientBaisse(): Decimal {
    return new Decimal(1).minus(new Decimal(this.taux).div(100))
  }

  private prixApresBaisse(): Decimal {
    return new Decimal(this.prix).times(this.coefficientBaisse())
  }

  private appliquerLesValeurs(
    prix: number,
    taux: number,
    formeParenthese: boolean,
    repOrigine?: string,
    d1Origine?: string,
    d2Origine?: string,
    d3Origine?: string,
  ): void {
    this.prix = prix
    this.taux = taux
    const cm = 1 - taux / 100
    const cmString = texNombre(cm, 2)
    const tauxDec = texNombre(taux / 100, 2)
    const cmAugmentation = texNombre(1 + taux / 100, 2)

    this.enonce = `Un téléphone coûte $${prix}$ euros. Le prix baisse de $${taux}\\,\\%$.<br>Son nouveau prix est :`

    let correct: string
    let d1: string, d2: string, d3: string

    // Si on a forcé les réponses (pour la version originale calquée sur l'image)
    if (repOrigine && d1Origine && d2Origine && d3Origine) {
      correct = repOrigine
      d1 = d1Origine
      d2 = d2Origine
      d3 = d3Origine

      this.correction = `Diminuer un prix de $${taux}\\,\\%$ revient à le multiplier par $1 - \\dfrac{${taux}}{100}$.<br>`
      this.correction += `$1 - \\dfrac{${taux}}{100} = 1 - ${tauxDec} = ${cmString}$.<br>`
      this.correction += `Le nouveau prix s'obtient donc par le calcul : $${prix} \\times ${cmString}$.<br>`
      this.correction += `La bonne réponse est $${miseEnEvidence(correct)}$.`
    } else {
      // Sinon, on génère les réponses aléatoires selon la forme demandée
      if (formeParenthese) {
        // Forme avec parenthèses et fractions
        correct = `${prix} \\times \\left(1 - \\dfrac{${taux}}{100}\\right)`
        d1 = `${prix} - \\dfrac{${taux}}{100}` // Erreur classique : on soustrait directement le taux au lieu d'appliquer la proportion
        d2 = `${prix} \\times \\left(1 + \\dfrac{${taux}}{100}\\right)` // Erreur : augmentation
        d3 = `${prix} \\times \\dfrac{${taux}}{100}` // Erreur : on calcule seulement la remise

        this.correction = `Diminuer un prix de $${taux}\\,\\%$ revient à soustraire $${taux}\\,\\%$ de ce prix.<br>`
        this.correction += `Cela revient à multiplier le prix de départ par : $\\left(1 - \\dfrac{${taux}}{100}\\right)$.<br>`
        this.correction += `Le nouveau prix s'obtient donc par le calcul : $${prix} \\times \\left(1 - \\dfrac{${taux}}{100}\\right)$.<br>`
        this.correction += `La bonne réponse est $${miseEnEvidence(correct)}$.`
      } else {
        // Forme calcul direct (100% décimal, 0 parenthèse)
        correct = `${prix} \\times ${cmString}`
        d1 = `${prix} \\times ${tauxDec}` // Erreur : on calcule la remise au lieu du prix final
        d2 = `${prix} \\times ${cmAugmentation}` // Erreur : on calcule une augmentation
        d3 = `${prix} - ${tauxDec}` // Erreur classique : on soustrait directement le taux décimal au prix

        this.correction = `Diminuer un prix de $${taux}\\,\\%$ revient à le multiplier par le coefficient multiplicateur $CM = 1 - \\dfrac{${taux}}{100}$.<br>`
        this.correction += `$CM = 1 - ${tauxDec} = ${cmString}$.<br>`
        this.correction += `Le nouveau prix s'obtient donc par le calcul : $${prix} \\times ${cmString}$.<br>`
        this.correction += `La bonne réponse est $${miseEnEvidence(correct)}$.`
      }
    }

    this.reponses = [`$${correct}$`, `$${d1}$`, `$${d2}$`, `$${d3}$`]
  }

  versionOriginale: () => void = () => {
    // Valeurs strictes de l'image d'origine
    this.appliquerLesValeurs(
      990,
      20,
      false,
      '990 \\times 0,8',
      '990 \\times 0,2',
      '990 \\times \\left(1 + \\dfrac{20}{100}\\right)',
      '990 \\times \\left(-\\dfrac{20}{100}\\right)',
    )
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      const prix = randint(65, 99, [70, 80, 90]) * 10
      const taux = choice([5, 10, 15, 20, 25, 30, 40, 50, 60])
      const formeParenthese = choice([true, false])

      this.appliquerLesValeurs(prix, taux, formeParenthese)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /Son nouveau prix est :\s*$/,
        this.interactif
          ? 'Son nouveau prix est '
          : 'Calculer son nouveau prix.',
      )
    this.reponseCourte = () => this.prixApresBaisse().toString()
    this.correctionCourte = () => {
      const coefficient = this.coefficientBaisse()
      return `Diminuer un prix de $${this.taux}\\,\\%$ revient à le multiplier par le coefficient multiplicateur $CM=1-\\dfrac{${this.taux}}{100}=${texNombre(coefficient)}$.<br>
Le nouveau prix est donc $${texNombre(this.prix)}\\times ${texNombre(coefficient)}=${miseEnEvidence(texNombre(this.prixApresBaisse()))}$ euros.`
    }
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = ' euros.'
  }
}
