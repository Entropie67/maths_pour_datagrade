import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '22207'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  "Calculer le nombre d'élèves à partir d'un pourcentage et d'un effectif"
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ3FMs2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    p: number,
    n: number,
    total: number,
    d1Origine?: string,
    d2Origine?: string,
    d3Origine?: string,
  ): void {
    const pctRestant = 100 - p

    this.enonce = `Dans une classe de première, $${p}\\,\\%$ des élèves étudient le grec.<br>`
    this.enonce += `Les autres élèves étudient le latin : ils sont $${n}$.<br>`
    this.enonce += `Le nombre d'élèves de cette classe de première est égal à :`

    let correct: string
    let d1: string, d2: string, d3: string

    // Si on a forcé les réponses (pour la version originale de l'image)
    if (d1Origine && d2Origine && d3Origine) {
      correct = `${total}`
      d1 = d1Origine
      d2 = d2Origine
      d3 = d3Origine
    } else {
      // Génération de distracteurs intelligents pour l'aléatoire
      correct = `${total}`
      const effectifGrec = total - n

      // Erreur 1 : l'élève calcule le nombre d'élèves faisant du grec au lieu du total
      d1 = `${effectifGrec}`

      // Erreur 2 : l'élève divise le nombre n par le pourcentage de l'énoncé (ex: 9 / 0.75 = 12)
      const erreurDiv = Math.round(n / (p / 100))
      d2 =
        erreurDiv !== total && erreurDiv !== effectifGrec
          ? `${erreurDiv}`
          : `${total - 4}`

      // Erreur 3 : un effectif plausible proche
      d3 = `${total > 30 ? total - 6 : total + 6}`
    }

    this.reponses = [`$${correct}$`, `$${d1}$`, `$${d2}$`, `$${d3}$`]

    // Rédaction adaptative de la correction
    this.correction = `Si $${p}\\,\\%$ des élèves étudient le grec, alors $100\\,\\% - ${p}\\,\\% = ${pctRestant}\\,\\%$ des élèves étudient le latin.<br>`
    this.correction += `On sait que ces $${pctRestant}\\,\\%$ représentent $${n}$ élèves.<br><br>`

    switch (pctRestant) {
      case 25:
        this.correction += `Or, $25\\,\\%$ correspond à un quart de la classe.<br>`
        this.correction += `Le nombre total d'élèves est donc $4 \\times ${n} = ${miseEnEvidence(`${total}`)}$.`
        break
      case 75:
        this.correction += `Or, $75\\,\\%$ correspond à trois quarts de la classe.<br>`
        this.correction += `Un quart de la classe représente donc $${n} \\div 3 = ${n / 3}$ élèves.<br>`
        this.correction += `Le nombre total d'élèves est donc $4 \\times ${n / 3} = ${miseEnEvidence(`${total}`)}$.`
        break
      case 20:
        this.correction += `Or, $20\\,\\%$ correspond à un cinquième de la classe.<br>`
        this.correction += `Le nombre total d'élèves est donc $5 \\times ${n} = ${miseEnEvidence(`${total}`)}$.`
        break
      case 80:
        this.correction += `Or, $80\\,\\%$ correspond à quatre cinquièmes de la classe.<br>`
        this.correction += `Un cinquième de la classe représente donc $${n} \\div 4 = ${n / 4}$ élèves.<br>` // <-- C'est ici qu'était la coquille (/5 remplacé par /4)
        this.correction += `Le nombre total d'élèves est donc $5 \\times ${n / 4} = ${miseEnEvidence(`${total}`)}$.`
        break
      case 10:
        this.correction += `Or, $10\\,\\%$ correspond à un dixième de la classe.<br>`
        this.correction += `Le nombre total d'élèves est donc $10 \\times ${n} = ${miseEnEvidence(`${total}`)}$.`
        break
      case 90:
        this.correction += `Or, $90\\,\\%$ correspond à neuf dixièmes de la classe.<br>`
        this.correction += `Un dixième de la classe représente donc $${n} \\div 9 = ${n / 9}$ élèves.<br>`
        this.correction += `Le nombre total d'élèves est donc $10 \\times ${n / 9} = ${miseEnEvidence(`${total}`)}$.`
        break
    }
  }

  versionOriginale: () => void = () => {
    // Valeurs strictes du sujet de l'image
    this.appliquerLesValeurs(75, 9, 36, '24', '30', '34')
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      // On choisit le pourcentage de ceux qui font du grec (le reste fait du latin)
      const p = choice([10, 20, 25, 75, 80, 90])

      let total = 0
      // On garantit que l'effectif total est entre 20 et 40, et donne un nombre rond
      if (p === 75 || p === 25) {
        total = choice([20, 24, 28, 32, 36])
      } else if (p === 80 || p === 20) {
        total = choice([20, 25, 30, 35])
      } else if (p === 90 || p === 10) {
        total = choice([20, 30])
      }

      const n = (total * (100 - p)) / 100

      this.appliquerLesValeurs(p, n, total)
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
        /Le nombre d'élèves de cette classe de première est égal à :\s*$/,
        this.interactif
          ? "Le nombre d'élèves de cette classe de première est "
          : "Déterminer le nombre d'élèves de cette classe de première.",
      )
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = '.'
  }
}
