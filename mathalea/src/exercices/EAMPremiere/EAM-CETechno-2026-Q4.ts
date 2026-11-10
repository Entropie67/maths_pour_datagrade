import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '35553'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Effectuer un calcul avec des fractions'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ4ANt2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    p: number,
    askComplementary: boolean,
    repOrigine?: string,
    d1Origine?: string,
    d2Origine?: string,
    d3Origine?: string,
  ): void {
    const pStr = texNombre(p, 2)
    const probaDouble = texNombre(2 * p, 2)
    const probaContraire = texNombre(1 - 2 * p, 2)

    this.enonce = `On considère un dé truqué tel que la probabilité d'obtenir un $5$ et celle d'obtenir un $6$ sont chacune égales à $${pStr}$.<br>`
    this.enonce += `On lance le dé. La probabilité d'obtenir un nombre `

    let correct: string
    let d1: string, d2: string, d3: string

    // Si on a forcé les réponses (pour la version originale calquée sur l'image)
    if (repOrigine && d1Origine && d2Origine && d3Origine) {
      this.enonce += `supérieur ou égal à $5$ est :`
      correct = repOrigine
      d1 = d1Origine
      d2 = d2Origine
      d3 = d3Origine

      this.correction = `L'événement «\u00a0obtenir un nombre supérieur ou égal à $5$\u00a0» est réalisé si l'on obtient un $5$ ou un $6$.<br>`
      this.correction += `Ces deux issues étant incompatibles, on additionne leurs probabilités :<br>`
      this.correction += `$P(5) + P(6) = ${pStr} + ${pStr} = ${probaDouble}$.<br>`
      this.correction += `La bonne réponse est donc $${miseEnEvidence(correct)}$.`
    } else {
      // Version aléatoire
      if (!askComplementary) {
        this.enonce += `supérieur ou égal à $5$ est :`
        correct = probaDouble
        d1 = pStr // Erreur : on ne prend qu'une seule issue
        d2 = `\\dfrac{2}{6}` // Erreur : on calcule avec un dé non truqué (équiprobabilité)
        d3 = `\\dfrac{1}{6}` // Erreur : probabilité d'une issue sur un dé non truqué

        this.correction = `L'événement «\u00a0obtenir un nombre supérieur ou égal à $5$\u00a0» est réalisé si l'on obtient un $5$ ou un $6$.<br>`
        this.correction += `Ces deux issues étant incompatibles, on additionne leurs probabilités :<br>`
        this.correction += `$P(5) + P(6) = ${pStr} + ${pStr} = ${miseEnEvidence(correct)}$.<br>`
      } else {
        this.enonce += `inférieur ou égal à $4$ est :`
        correct = probaContraire
        d1 = probaDouble // Erreur : on calcule P(>= 5) au lieu de l'événement contraire
        d2 = `\\dfrac{4}{6}` // Erreur : on calcule avec un dé non truqué (équiprobabilité)
        d3 = texNombre(1 - p, 2) // Erreur : on soustrait une seule des deux issues

        this.correction = `L'événement «\u00a0obtenir un nombre inférieur ou égal à $4$\u00a0» est l'événement contraire de l'événement «\u00a0obtenir un nombre supérieur ou égal à $5$\u00a0».<br>`
        this.correction += `On calcule d'abord la probabilité d'obtenir $5$ ou $6$ :<br>`
        this.correction += `$P(5) + P(6) = ${pStr} + ${pStr} = ${probaDouble}$.<br>`
        this.correction += `La probabilité $P$ cherchée s'obtient donc en utilisant la formule de l'événement contraire :<br>`
        this.correction += `$P = 1 - ${probaDouble} = ${miseEnEvidence(correct)}$.`
      }
    }

    this.reponses = [`$${correct}$`, `$${d1}$`, `$${d2}$`, `$${d3}$`]
  }

  versionOriginale: () => void = () => {
    // Valeurs strictes de l'image (calcul de P(>=5) avec p = 0.3)
    this.appliquerLesValeurs(
      0.3,
      false,
      '0,6',
      '\\dfrac{2}{6}',
      '\\dfrac{1}{6}',
      '0,3',
    )
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      // Probabilités possibles pour le dé truqué
      const p = choice([0.1, 0.15, 0.2, 0.25, 0.35, 0.4])
      const askComplementary = choice([true, false])

      this.appliquerLesValeurs(p, askComplementary)
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
        /La probabilité d'obtenir un nombre (.*) est :\s*$/,
        (_, evenement: string) =>
          this.interactif
            ? `La probabilité d'obtenir un nombre ${evenement} est `
            : `Calculer la probabilité d'obtenir un nombre ${evenement}.`,
      )
    // Pas de « bonne réponse » parmi des propositions en saisie libre
    this.correctionCourte = () =>
      (this.correction ?? '').replace(
        /La bonne réponse est donc /,
        'La probabilité est donc ',
      )
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = '.'
  }
}
