import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = 'fdaf5'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer un ordre de grandeur'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ5FMs2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    c: number,
    d: number,
    zN: number,
    offset: number,
    repOrigine?: string,
    d1Origine?: string,
    d2Origine?: string,
    d3Origine?: string,
  ): void {
    // N est construit pour commencer par c * d (ex: 5 * 3 = 15) suivi de zN zéros
    const nBase = c * d
    const N = nBase * Math.pow(10, zN)

    // D est construit autour des milliers (ex: 3000) avec un décalage (ex: +200)
    const dArrondi = d * 1000
    const D = dArrondi + offset

    this.enonce = `Parmi les réponses proposées, la valeur la plus proche de $\\dfrac{${texNombre(N, 0)}}{${texNombre(D, 0)}}$ est :`

    // La bonne réponse correspond à la puissance calculée (zN - 3 car D est en milliers)
    const power = zN - 3
    const correctVal = c * Math.pow(10, power)

    let correct: string
    let dist1: string, dist2: string, dist3: string

    // Si on a forcé les réponses (pour la version originale calquée sur l'image)
    if (repOrigine && d1Origine && d2Origine && d3Origine) {
      correct = repOrigine
      dist1 = d1Origine
      dist2 = d2Origine
      dist3 = d3Origine
    } else {
      correct = texNombre(correctVal, 0)

      // Les propositions sont les 4 ordres de grandeurs classiques : c, c*10, c*100, c*1000
      const options = [c, c * 10, c * 100, c * 1000]
      const idx = options.indexOf(correctVal)

      // On retire la bonne réponse des options pour créer les distracteurs
      if (idx > -1) {
        options.splice(idx, 1)
      } else {
        options.pop()
      }

      dist1 = texNombre(options[0], 0)
      dist2 = texNombre(options[1], 0)
      dist3 = texNombre(options[2], 0)
    }

    this.reponses = [`$${correct}$`, `$${dist1}$`, `$${dist2}$`, `$${dist3}$`]

    // Rédaction d'une correction très simple et visuelle
    const nSimp = N / 1000

    this.correction = `On cherche d'abord un ordre de grandeur du dénominateur :<br>`
    this.correction += `$${texNombre(D, 0)} \\approx ${texNombre(dArrondi, 0)}$.<br><br>`
    this.correction += `Le calcul devient alors : $\\dfrac{${texNombre(N, 0)}}{${texNombre(dArrondi, 0)}}$.<br><br>`
    this.correction += `On simplifie la fraction par $1\\,000$  : `
    this.correction += `$\\dfrac{${texNombre(nSimp, 0)}}{${d}} = ${texNombre(correctVal, 0)}$.<br><br>`
    this.correction += `Un ordre de grandeur est donc $${miseEnEvidence(correct)}$.`
  }

  versionOriginale: () => void = () => {
    // Valeurs strictes de l'image (150 000 / 3 200) -> c=5, d=3, zN=4, offset=200
    this.appliquerLesValeurs(5, 3, 4, 200, '50', '5', '500', '5\\,000')
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      const c = choice([2, 3, 4, 5, 6, 7, 8]) // Chiffre cible (le résultat)
      const d = choice([2, 3, 4, 5, 6, 7, 8]) // Chiffre du dénominateur
      const zN = choice([3, 4, 5, 6]) // Nombre de zéros du numérateur (définit la réponse: 5, 50, 500, 5000)
      const offset = choice([-200, -100, 100, 200, 300]) // Décalage (ex: +200 pour faire 3200)

      this.appliquerLesValeurs(c, d, zN, offset)
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
        /^Parmi les réponses proposées, la valeur la plus proche de (\$.*\$) est :\s*$/,
        (_, fraction: string) =>
          `Donner un ordre de grandeur de ${fraction}, en arrondissant le dénominateur au millier le plus proche.`,
      )
    this.clavierReponseCourte = KeyboardType.clavierNumbers
  }
}
