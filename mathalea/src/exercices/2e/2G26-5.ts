import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { ecritureParentheseSiMoins } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const titre =
  "Calculer les coordonnées du $4^\\text{e}$ sommet d'un parallélogramme"
export const dateDePublication = '11/11/2023'
export const dateDeModifImportante = '30/03/2026'
export const interactifReady = true

/**
 * Calculer les coordonnées du 4e sommet d\'un parallélogramme
 * @author Rémi Angot
 */
export const uuid = '6b705'

export const refs = {
  'fr-fr': ['2G26-5'],
  'fr-ch': ['3G92-8'],
}

class CoordonneesParallelogramme extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacingCorr = 3
    this.typeExercice = 'simple'
    this.formatChampTexte =
      KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets
  }

  nouvelleVersion(): void {
    // Lettre entre A et W mais pas L, M, N ou O pour ne pas avoir O dans les 4 points
    const indiceFirstLetter = randint(65, 87, [76, 77, 78, 79])
    const nomA = String.fromCharCode(indiceFirstLetter)
    const nomB = String.fromCharCode(indiceFirstLetter + 1)
    const nomC = String.fromCharCode(indiceFirstLetter + 2)
    const nomD = String.fromCharCode(indiceFirstLetter + 3)
    const ax = randint(-10, 10)
    const ay = randint(-10, 10)
    const bx = randint(-10, 10, [ax - 1, ax, ax + 1])
    const by = randint(-10, 10, [ay - 1, ay, ay + 1])
    const cx = randint(-10, 10, [ax - 1, ax, ax + 1, bx - 1, bx, bx + 1])
    const cy = randint(-10, 10, [ay - 1, ay, ay + 1, by - 1, by, by + 1])
    const dx = cx + ax - bx
    const dy = cy + ay - by
    this.question = `Dans un repère $(O\\;;\\;\\vec{i}\\;;\\;\\vec{j})$, on considère les points $${nomA}(${ax}\\;;\\;${ay})$, `
    this.question += `$${nomB}(${bx}\\;;\\;${by})$ et $${nomC}(${cx}\\;;\\;${cy})$.<br>`
    this.question += `Déterminer les coordonnées du point $${nomD}$ tel que $${nomA}${nomB}${nomC}${nomD}$ soit un parallélogramme.`
    if (this.interactif) {
      this.question += `<br><br>$${nomD}$ a pour coordonnées : `
    }
    this.reponse = `(${dx}\\;;\\;${dy})`
    this.correction = `$${nomA}${nomB}${nomC}${nomD}$ est un parallélogramme si et seulement si $\\overrightarrow{${nomA}${nomB}} = \\overrightarrow{${nomD}${nomC}}$.`
    this.correction += `<br>En notant $(x\\;;\\;y)$ les coordonnées du point $${nomD}$, on a :`
    this.correction += `<br>Le vecteur $\\overrightarrow{${nomA}${nomB}}$ a pour coordonnées : $\\dbinom{x_${nomB} - x_${nomA}}{y_${nomB} - y_${nomA} }`
    this.correction += `=\\dbinom{${bx}-${ecritureParentheseSiMoins(ax)}}{${by}-${ecritureParentheseSiMoins(ay)}} = \\dbinom{${bx - ax}}{${by - ay}}$.`
    this.correction += `<br>Le vecteur $\\overrightarrow{${nomD}${nomC}}$ a pour coordonnées : $\\dbinom{x_${nomC} - x_${nomD}}{y_${nomC} - y_${nomD} }`
    this.correction += `=\\dbinom{${cx} - x}{${cy} - y}$.`
    this.correction += `<br>L'égalité $\\overrightarrow{${nomA}${nomB}} = \\overrightarrow{${nomD}${nomC}}$ se traduit donc par : `
    this.correction += `$\\begin{cases}${cx} - x &= ${bx - ax} \\\\ ${cy} - y &= ${by - ay}\\end{cases}\\quad$ soit $\\quad\\begin{cases}x &= ${dx} \\\\ y &= ${dy}\\end{cases}$.`
    this.correction += `<br>Les coordonnées du point $${nomD}$ sont donc $${miseEnEvidence(`(${dx}\\;;\\;${dy})`)}$.`
  }
}

export default CoordonneesParallelogramme
