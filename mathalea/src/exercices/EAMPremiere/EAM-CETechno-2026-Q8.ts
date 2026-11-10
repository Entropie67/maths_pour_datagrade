import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'

import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '26434'
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
export default class AutoQ8ANt2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    total: number,
    partiel: number,
    repOrigine?: string,
    d1Origine?: string,
    d2Origine?: string,
    d3Origine?: string,
  ): void {
    const p = (partiel / total) * 100

    this.enonce = `Dans le lycée Alpha, il y a $${total}$ élèves.<br>`
    this.enonce += `$${partiel}$ lycéens pratiquent un sport.<br>`
    this.enonce += `Le pourcentage d'élèves pratiquant un sport dans ce lycée est égal à :`

    let correct: string
    let d1: string, d2: string, d3: string

    // Si on est dans la version originale, on applique les distracteurs figés
    if (repOrigine && d1Origine && d2Origine && d3Origine) {
      correct = repOrigine
      d1 = d1Origine
      d2 = d2Origine
      d3 = d3Origine
    } else {
      // Sinon on génère les erreurs de la même manière que le sujet
      correct = `${texNombre(p, 0)}\\,\\%`
      const err1 = Math.round(partiel / 10)
      const err2 = p + 5
      const err3 = 100 - err2

      d1 = `${texNombre(err1, 0)}\\,\\%`
      d2 = `${texNombre(err2, 0)}\\,\\%`
      d3 = `${texNombre(err3, 0)}\\,\\%`
    }

    const diviseur = total / 100

    this.correction = `Le pourcentage d'élèves pratiquant un sport correspond à la proportion d'élèves sportifs par rapport au total, ramenée à une fraction sur $100$.<br>`
    this.correction += `$\\begin{aligned}`
    this.correction += `\\dfrac{${partiel}}{${total}} &= \\dfrac{${partiel} \\div ${diviseur}}{${total} \\div ${diviseur}}\\\\[0.5em]`
    this.correction += `&= \\dfrac{${texNombre(p, 0)}}{100}`
    this.correction += `\\end{aligned}$<br>`
    this.correction += `Le pourcentage est donc $${miseEnEvidence(`${texNombre(p, 0)}\\,\\%`)}$.`

    this.reponses = [`$${correct}$`, `$${d1}$`, `$${d2}$`, `$${d3}$`]
  }

  versionOriginale: () => void = () => {
    // Valeurs strictes du sujet de l'image
    this.appliquerLesValeurs(
      500,
      150,
      '30\\,\\%',
      '15\\,\\%',
      '35\\,\\%',
      '65\\,\\%',
    )
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      // Génération d'un total "rond" (200, 300, ..., 900)
      const diviseur = randint(2, 9)
      const total = diviseur * 100

      let p = randint(15, 80)
      let partiel = p * diviseur

      // Filtrage :
      // 1. "partiel" doit être un multiple de 10 pour que l'erreur 1 soit propre.
      // 2. "p = 45" est interdit car l'erreur 2 (50) et l'erreur 3 (100 - 50 = 50) s'annuleraient.
      // 3. Empêche les collisions accidentelles entre l'erreur 1 et les erreurs 2 et 3.
      while (
        partiel % 10 !== 0 ||
        p === 45 ||
        p + 5 === Math.round(partiel / 10) ||
        100 - (p + 5) === Math.round(partiel / 10)
      ) {
        p = randint(15, 80)
        partiel = p * diviseur
      }

      this.appliquerLesValeurs(total, partiel)
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
        /Le pourcentage d'élèves pratiquant un sport dans ce lycée est égal à :\s*$/,
        this.interactif
          ? "Le pourcentage d'élèves pratiquant un sport dans ce lycée est égal à "
          : "Calculer le pourcentage d'élèves pratiquant un sport dans ce lycée.",
      )
    // La bonne réponse du QCM est de la forme « $30\,\%$ » : on ne garde que le nombre
    this.reponseCourte = () =>
      this.reponses[0].replace(/\\,\\%/, '').replace(/\$/g, '')
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = ' %.'
  }
}
