import AutoQ7AGns2026 from '../EAMPremiere/EAM-AGnonSpe-2026-Q7'
import { genereReponsesCourtes } from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const dateDeModifImportante = '21/10/2026'

export const uuid = 'd23e7'
export const refs = {
  'fr-fr': ['1A-C12-3', '2A-C5-3'],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const titre = 'Effectuer une application numérique'
export const dateDePublication = '06/08/2026'

/**
 * @author Gilles Mora , clone de Stéphane Guyon
 * Clone de EAM-AGnonSpe-2026-Q7 en version exclusivement aléatoire.
 */
export default class CalculerUneResistance extends AutoQ7AGns2026 {
  optionsChampReponseCourte = {
    texteAvant: 'La résistance est égale à ',
    texteApres: ' ohms.',
  }

  enonceCourt = () => this.enonce.replace('<br><br>', '<br>')

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
    this.spacing = 1.5
    this.sup3 = false
    this.besoinFormulaire3CaseACocher = ['Version QCM', false]
    this.versionAleatoire()
  }

  nouvelleVersion() {
    if (this.sup3) super.nouvelleVersion()
    else genereReponsesCourtes(this)
  }
}
