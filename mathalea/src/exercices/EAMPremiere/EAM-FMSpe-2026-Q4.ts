import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '859ff'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  "Calculer un coefficient multiplicateur à partir d'un pourcentage"
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ4FMs2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    p: number,
    reponseFraction: boolean,
    repOrigine?: string,
    d1Origine?: string,
    d2Origine?: string,
    d3Origine?: string,
  ): void {
    this.enonce = `Le prix d'un article augmente de $${p}\\,\\%$.<br>`
    this.enonce += `Cela signifie que le prix de cet article a été multiplié par :`

    let correct: string
    let d1: string, d2: string, d3: string

    // Si on est dans la version originale calquée sur l'image
    if (repOrigine && d1Origine && d2Origine && d3Origine) {
      correct = repOrigine
      d1 = d1Origine
      d2 = d2Origine
      d3 = d3Origine
    } else {
      const decDecrease = `0,${100 - p}` // Ex: 0,85 pour 15% (baisse)
      const weirdDec = `1,1${p}` // Ex: 1,115 pour 15% (distracteur d)

      if (reponseFraction) {
        // La bonne réponse attendue est la fraction
        correct = `\\dfrac{${100 + p}}{100}`
        d1 = `0,${p}` // Confusion avec juste l'ajout du taux
        d2 = decDecrease
        d3 = weirdDec
      } else {
        // La bonne réponse attendue est le nombre décimal
        correct = `1,${p}`
        d1 = `\\dfrac{${p}}{100}` // Confusion avec la fraction du taux (distracteur a)
        d2 = decDecrease
        d3 = weirdDec
      }
    }

    this.reponses = [`$${correct}$`, `$${d1}$`, `$${d2}$`, `$${d3}$`]

    // Rédaction adaptative de la correction
    this.correction = `Augmenter le prix d'un article de $${p}\\,\\%$ revient à multiplier le prix par un coefficient multiplicateur égal à : <br>`

    if (!reponseFraction) {
      this.correction += `$1+${texNombre(p / 100, 2)} = ${miseEnEvidence(correct)}$.`
    } else {
      this.correction += `$1+${texNombre(p / 100, 2)}= ${texNombre((100 + p) / 100, 2)}$, soit $${miseEnEvidence(correct)}$.<br>`
    }
  }

  versionOriginale: () => void = () => {
    // Valeurs strictes du sujet de l'image (15% avec décimal)
    this.appliquerLesValeurs(
      15,
      false,
      '1,15',
      '\\dfrac{15}{100}',
      '0,85',
      '1,115',
    )
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      // Pourcentage entre 11 et 19 comme demandé
      const p = randint(11, 19)

      // On choisit au hasard si on attend la fraction ou le décimal
      const reponseFraction = choice([true, false])

      this.appliquerLesValeurs(p, reponseFraction)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(
        saisie,
        reponse,
        reponse.includes('frac')
          ? { fractionEgale: true, nombreDecimalSeulement: true }
          : { nombreDecimalSeulement: true },
      )
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /Cela signifie que le prix de cet article a été multiplié par :\s*$/,
        this.interactif
          ? 'Le coefficient multiplicateur associé à cette augmentation est '
          : 'Déterminer le coefficient multiplicateur associé à cette augmentation.',
      )
    this.clavierReponseCourte = KeyboardType.clavierDeBaseAvecFraction
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = '.'
  }
}
