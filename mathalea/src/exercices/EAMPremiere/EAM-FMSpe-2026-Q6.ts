import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = 'b44b5'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Effectuer un calcul de conversion'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ6FMs2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    minutes: number,
    secondes: number,
    totalImages: number,
    repOrigine?: string,
    d1Origine?: string,
    d2Origine?: string,
    d3Origine?: string,
  ): void {
    let dureeStr = `$${minutes}$ minute${minutes > 1 ? 's' : ''}`
    if (secondes > 0) {
      dureeStr += ` et $${secondes}$ secondes`
    }

    this.enonce = `Une vidéo, d'une durée de ${dureeStr}, contient $${texNombre(totalImages, 0)}$ images.<br>`
    this.enonce += `Le nombre d'images par seconde est égal à :`

    const totalSecondes = minutes * 60 + secondes
    const fps = totalImages / totalSecondes

    let correct: string
    let d1: string, d2: string, d3: string

    // Si on a forcé les réponses (pour la version originale calquée sur l'image)
    if (repOrigine && d1Origine && d2Origine && d3Origine) {
      correct = repOrigine
      d1 = d1Origine
      d2 = d2Origine
      d3 = d3Origine
    } else {
      correct = `${fps}`

      // On utilise les cadences vidéos standards comme distracteurs réalistes
      const cadencesStandards = [15, 24, 30, 60, 120]
      const optionsFaux = shuffle(
        cadencesStandards.filter((val) => val !== fps),
      )

      d1 = `${optionsFaux[0]}`
      d2 = `${optionsFaux[1]}`
      d3 = `${optionsFaux[2]}`
    }

    // On sort l'unité du mode mathématique
    this.reponses = [
      `$${correct}$ images/seconde`,
      `$${d1}$ images/seconde`,
      `$${d2}$ images/seconde`,
      `$${d3}$ images/seconde`,
    ]

    // Rédaction adaptative de la correction
    this.correction = `On convertit la durée totale de la vidéo en secondes :<br>`
    if (secondes > 0) {
      this.correction += `$${minutes}$ min $${secondes}$ s $= ${totalSecondes}$ s.<br><br>`
    } else {
      this.correction += `$${minutes}$ min $= ${totalSecondes}$ s.<br><br>`
    }

    this.correction += `On divise ensuite le nombre total d'images par la durée en secondes : `
    this.correction += `$\\dfrac{${texNombre(totalImages, 0)}}{${totalSecondes}} = ${fps}$.<br><br>`
    this.correction += `La vidéo comporte donc $${miseEnEvidence(`${fps}`)}$ images/seconde.`
  }

  versionOriginale: () => void = () => {
    // Valeurs strictes de l'image (on ne passe que les nombres)
    this.appliquerLesValeurs(1, 40, 2400, '24', '60', '120', '15')
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      // Choix de la durée (1 min, 1 min 20 s, 1 min 40 s)
      const t = choice([
        { m: 1, s: 0 },
        { m: 1, s: 20 },
        { m: 1, s: 40 },
        { m: 1, s: 10 },
        { m: 1, s: 30 },
      ])

      // Choix d'une cadence cible parmi les formats usuels
      const fps = choice([20, 30, 60])

      const totalImages = (t.m * 60 + t.s) * fps

      this.appliquerLesValeurs(t.m, t.s, totalImages)
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
        /Le nombre d'images par seconde est égal à :\s*$/,
        this.interactif
          ? "Le nombre d'images par seconde est "
          : "Calculer le nombre d'images par seconde de cette vidéo.",
      )
    // La bonne réponse du QCM est de la forme « $24$ images/seconde » : on ne garde que le nombre
    this.reponseCourte = () =>
      this.reponses[0].replace(/^\$([^$]*)\$.*$/, (_, nombre: string) => nombre)
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = ' images/seconde.'
  }
}
