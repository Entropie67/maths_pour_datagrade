import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = '6eba5'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['9R2FA3A-8', '9R3FA3A-8', '10CTFA4B-8', '10LCFA4B-8', '10LSFA4B-8', '11CTFA3B-8', '11LCFA3B-8', '11LSFA3B-8'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Convertir des degrés Celsius en degrés Fahrenheit'
export const dateDePublication = '29/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Jean-Claude Lhote
 *
 */
export default class AutoQ4AGt2026 extends ExerciceQcmACourt {
  protected temperatureCelsius = 0

  private appliquerLesValeurs(
    temperatureCelsius: number,
    debutPhrase: string,
    finPhrase: string,
  ): void {
    this.temperatureCelsius = temperatureCelsius
    const sol = texNombre(1.8 * temperatureCelsius + 32, 2)
    const dist1 = texNombre(temperatureCelsius + 32, 2) // oubli du × 1,8
    const dist2 = texNombre(0.18 * temperatureCelsius + 32, 2)
    const dist3 = texNombre(temperatureCelsius, 2)
    this.enonce = `On considère la formule suivante permettant de transformer des degrés Celsius ($^\\circ \\text{C}$) en degrés Fahrenheit ($^\\circ \\text{F}$) : $F =1,8C +32$<br>
où $F$ désigne la température en $^\\circ \\text{F}$ et $C$ désigne la température en $^\\circ \\text{C}$.<br>
${debutPhrase} $${texNombre(temperatureCelsius, 2)}\\,^\\circ \\text{C}$, ${finPhrase} en degrés Fahrenheit est donc :<br>`

    this.correction = `On applique la formule de conversion :<br>
$F = 1,8\\times ${ecritureParentheseSiNegatif(temperatureCelsius)} + 32 =${texNombre(1.8 * temperatureCelsius, 2)} + 32 = ${miseEnEvidence(`${sol}\\,^\\circ \\text{F}`)}$.`
    this.correction +=
      '<br>On aurait aussi pu raisonner par valeur approchée de la façon suivante.<br>'
    this.correction += `$${texNombre(1.8)}$ est proche de $2$ donc $1,8\\times ${ecritureParentheseSiNegatif(temperatureCelsius)} + 32$ est proche de $2\\times ${ecritureParentheseSiNegatif(temperatureCelsius)} + 32=${2 * temperatureCelsius + 32}$<br>`
    this.correction += `Et parmi les $4$ valeurs proposées, la plus proche de $${2 * temperatureCelsius + 32}\\,^\\circ \\text{F}$ est $${miseEnEvidence(`${sol}\\,^\\circ \\text{F}`)}$.`

    this.reponses = [sol, dist1, dist2, dist3].map(
      (x) => `$${x}\\,^\\circ \\text{F}$`,
    )
  }

  versionOriginale: () => void = () => {
    // Version de l'image : 500 élèves, 20 %  => 100
    this.appliquerLesValeurs(
      100,
      "Sachant que l'eau bout à ",
      "la température d'ébulition de l'eau",
    )
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    // Températures « rondes » pour un calcul mental accessible.
    const positifs = [
      10, 20, 30, 40, 50, 60, 70, 80, 90, 200, 300, 400, 500, 600, 700, 800,
      900, 1000,
    ]
    const negatifs = [-10, -20, -30, -40, -50, -60, -70, -80, -90, -100, -200]

    let compteur = 0
    do {
      const temperatureCelsius = choice([...positifs, ...negatifs])
      this.appliquerLesValeurs(
        temperatureCelsius,
        'On considère une température de',
        'sa conversion',
      )
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.reponseCourte = () => this.reponses[0].slice(1).split('\\,^')[0]
    this.correctionCourte = () => {
      const c = this.temperatureCelsius
      return `On applique la formule $F=1,8C+32$ avec $C=${texNombre(c, 2)}$ :<br>
$F=1,8\\times ${ecritureParentheseSiNegatif(c)}+32=${texNombre(1.8 * c, 2)}+32=${miseEnEvidence(this.reponseCourte?.() ?? '')}$`
    }
    this.enonceCourt = () =>
      this.enonce.replace(
        /,\s*(?:sa conversion|la température d'ébulition de l'eau) en degrés Fahrenheit est donc :<br>/,
        '.<br>Calculer la température correspondante en degrés Fahrenheit.',
      )
    this.optionsChampReponseCourte = {
      texteAvant: '<br>La température en degrés Fahrenheit est ',
      texteApres: '.',
    }
  }
}
