import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import AutoQ4AGt2026 from '../EAMPremiere/EAM-AGTechno-2026-Q4'
import { genereReponsesCourtes } from '../ExerciceQcmACourt'

export const dateDeModifImportante = '21/10/2026'

export const uuid = 'efc9a'
export const refs = {
  'fr-fr': ['1A-C12-2', '2A-C5-2'],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const titre = 'Convertir des degrés Celsius en degrés Fahrenheit'
export const dateDePublication = '06/08/2026'

/**
 * @author Jean-Claude Lhote, clone de Stéphane Guyon
 * Clone de EAM-AGTechno-2026-Q4 en version exclusivement aléatoire.
 */
export default class ConvertirCelsiusEnFahrenheit extends AutoQ4AGt2026 {
  reponseCourte = () => this.reponses[0].slice(1).split('\\,^')[0]
  correctionCourte = () => {
    const c = this.temperatureCelsius
    return `On applique la formule $F=1,8C+32$ avec $C=${texNombre(c, 2)}$ :<br>
$F=1,8\\times ${ecritureParentheseSiNegatif(c)}+32=${texNombre(1.8 * c, 2)}+32=${miseEnEvidence(this.reponseCourte())}$ $^\\circ$F`
  }
  enonceCourt = () =>
    this.enonce.replace(
      /,\s*(?:sa conversion|la température d'ébulition de l'eau) en degrés Fahrenheit est donc :<br>/,
      '.<br>Calculer la température correspondante en degrés Fahrenheit.',
    )
  optionsChampReponseCourte = {
    texteAvant: 'La température en degrés Fahrenheit est ',
    texteApres: '.',
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    this.spacing = 1.5
    this.sup3 = false
    this.besoinFormulaire3CaseACocher = ['Version QCM', false]
    const versionAleatoire = this.versionAleatoire
    this.versionAleatoire = () => {
      versionAleatoire()
      this.enonce = this.enonceCourt()
    }
    this.versionAleatoire()
  }

  nouvelleVersion() {
    if (this.sup3) super.nouvelleVersion()
    else genereReponsesCourtes(this)
  }
}
