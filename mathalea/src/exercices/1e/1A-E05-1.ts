import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '2b0a4'
export const refs = {
  'fr-fr': ['1A-E05-1', 'BP1CF04'],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const titre = 'Calculer un taux réciproque'
export const dateDePublication = '15/07/2025'
export const dateDeModifImportante = '21/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class TauxReciproque extends ExerciceQcmACourt {
  // Fraction exacte saisie lorsque la version QCM est désactivée, et sa correction
  private reponseSaisie = ''
  private correctionSaisie = ''

  // S'occupe de passser les données originales à la fonction appliquerLesValeurs

  versionOriginale: () => void = () => {
    const bonneReponse1 = '\\dfrac{1}{1,27}-1'
    const bonneReponse2 = '\\dfrac{-0,27}{1,27}'
    const bonneReponseRetenue = choice([bonneReponse1, bonneReponse2])
    this.enonce = `Le prix d’un article a subi une augmentation de $27\\,\\%$.<br>
  Le taux à appliquer pour que cet article retrouve son prix initial est donné par :`
    const corrige = (
      reponseMise: string,
    ) => `Le coefficient multiplicateur associé à une augmentation de $27\\,\\%$ est $1+0,27=1,27$.<br>
      Le coefficient multiplicateur réciproque est donc : $\\dfrac{1}{1,27}$.<br>
      On en déduit que le taux réciproque est $\\dfrac{1}{1,27}-1$ ou $\\dfrac{-0,27}{1,27}$.<br>
      Le taux réciproque est donc $${miseEnEvidence(reponseMise)}$.`
    this.correction = corrige(bonneReponseRetenue)
    this.reponseSaisie = new FractionEtendue(-27, 127).texFractionSimplifiee
    this.correctionSaisie = corrige(this.reponseSaisie)

    this.reponses = [
      `$${bonneReponseRetenue}$`,
      '$\\dfrac{1}{1,27}$',
      '$1-\\dfrac{1}{1,27}$',
      '$\\dfrac{0,27}{1,27}$',
    ]
  }

  versionAleatoire: () => void = () => {
    let compteur = 0
    do {
      switch (choice([1, 2])) {
        case 1:
          {
            const taux = randint(5, 49, [10, 20, 30, 40])
            const bonneReponse1 = `\\dfrac{1}{${texNombre(1 + taux / 100, 4)}}-1`
            const bonneReponse2 = `\\dfrac{${texNombre(-taux / 100, 4)}}{${texNombre(1 + taux / 100, 4)}}`
            const bonneReponseRetenue = choice([bonneReponse1, bonneReponse2])
            this.enonce = `Le prix d’un article a subi une augmentation de $${taux}\\,\\%$.<br>
  Le taux à appliquer pour que cet article retrouve son prix initial est donné par :`
            const corrige = (
              reponseMise: string,
            ) => `Le coefficient multiplicateur associé à une augmentation de $${taux}\\,\\%$ est $1+${texNombre(taux / 100, 2)}=${texNombre(1 + taux / 100, 4)}$.<br>
      Le coefficient multiplicateur réciproque est donc $\\dfrac{1}{${texNombre(1 + taux / 100, 4)}}$.<br>
      On en déduit que le taux réciproque est $\\dfrac{1}{${texNombre(1 + taux / 100, 4)}}-1$ ou $-\\dfrac{${texNombre(taux / 100, 4)}}{${texNombre(1 + taux / 100, 4)}}$.<br>
      Le taux réciproque est donc $${miseEnEvidence(reponseMise)}$.`
            this.correction = corrige(bonneReponseRetenue)
            this.reponseSaisie = new FractionEtendue(
              -taux,
              100 + taux,
            ).texFractionSimplifiee
            this.correctionSaisie = corrige(this.reponseSaisie)

            this.reponses = [
              `$${bonneReponseRetenue}$`,
              `$\\dfrac{1}{${texNombre(taux / 100, 4)}}$`,
              `$1-\\dfrac{1}{${texNombre(taux / 100, 4)}}$`,
              `$\\dfrac{1}{${texNombre(1 - taux / 100, 4)}}-1$`,
            ]
          }
          break

        case 2:
        default:
          {
            const taux = randint(5, 49, [10, 20, 30, 40])
            const bonneReponse1 = `\\dfrac{1}{${texNombre(1 - taux / 100, 4)}}-1`
            const bonneReponse2 = `\\dfrac{${texNombre(taux / 100, 4)}}{${texNombre(1 - taux / 100, 4)}}`
            const bonneReponseRetenue = choice([bonneReponse1, bonneReponse2])
            this.enonce = `Le prix d’un article a subi une baisse de $${taux}\\,\\%$.<br>
  Le taux à appliquer pour que cet article retrouve son prix initial est donné par :`
            const corrige = (
              reponseMise: string,
            ) => `Le coefficient multiplicateur associé à une baisse de $${taux}\\,\\%$ est $1-${texNombre(taux / 100, 2)}=${texNombre(1 - taux / 100, 4)}$.<br>
      Le coefficient multiplicateur réciproque est donc $\\dfrac{1}{${texNombre(1 - taux / 100, 4)}}$.<br>
      On en déduit que le taux réciproque est $\\dfrac{1}{${texNombre(1 - taux / 100, 4)}}-1$ ou $\\dfrac{${texNombre(taux / 100, 4)}}{${texNombre(1 - taux / 100, 4)}}$.<br>
      Le taux réciproque est donc $${miseEnEvidence(reponseMise)}$.`
            this.correction = corrige(bonneReponseRetenue)
            this.reponseSaisie = new FractionEtendue(
              taux,
              100 - taux,
            ).texFractionSimplifiee
            this.correctionSaisie = corrige(this.reponseSaisie)

            this.reponses = [
              `$${bonneReponseRetenue}$`,
              `$\\dfrac{1}{${texNombre(taux / 100, 4)}}$`,
              `$1-\\dfrac{1}{${texNombre(1 - taux / 100, 4)}}$`,
              `$-\\dfrac{${texNombre(taux / 100, 4)}}{${texNombre(1 - taux / 100, 4)}}$`,
            ]
          }
          break
      }
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true)) // On s'assure d'avoir 4 réponses différentes, sinon on régénère
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, {
        fractionEgale: true,
        nombreDecimalSeulement: true,
      })
    this.enonceCourt = () =>
      this.enonce.replace(
        /Le taux à appliquer(.*) est donné par\s*:\s*$/,
        'Quel est le taux à appliquer$1 ?',
      )
    this.reponseCourte = () => this.reponseSaisie
    this.correctionCourte = () => this.correctionSaisie

    this.clavierReponseCourte = KeyboardType.clavierDeBaseAvecFraction

    this.versionAleatoire()
  }
}
