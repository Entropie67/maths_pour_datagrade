import EquationsGSplineNombre from '../can/2e/can2F3-04'
export const titre =
  "Déterminer le nombre de solutions d'une équation (graphique)"
export const dateDePublication = '29/07/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can2F3-04 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '20/10/2026'

export const uuid = 'cc322'

export const refs = {
  'fr-fr': ['1A-F04-2'],
  'fr-ch': ['1mQCM-1', '2mQCM-1'],
}
export default class Auto1AF4a extends EquationsGSplineNombre {
  constructor() {
    super()
    this.versionQcm = false
    // On attend le nombre lui-même : « 4/2 » ou « 1+1 » sont refusés pour 2
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    super.nouvelleVersion()
    // En interactif, le champ complète la phrase de l'énoncé
    if (this.interactif && !this.versionQcm) {
      this.question = (this.question ?? '').replace(
        /Donner le nombre de solutions de l'équation (\$[^$]*\$)\.$/,
        "Le nombre de solutions de l'équation $1 est ",
      )
      this.optionsChampTexte = { texteApres: '.' }
    } else {
      this.optionsChampTexte = { texteAvant: '<br>' }
    }
  }
}
