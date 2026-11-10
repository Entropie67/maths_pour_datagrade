import CalculerUnModule from '../can/Ex/canTEC2-01'
export const titre = 'Calculer un module'
export const interactifReady = true
export const dateDePublication = '29/10/2026'
export const uuid = '68c70'
export const refs = {
  'fr-fr': ['TEC2-20'],
  'fr-ch': [],
}
export default class CalculerUnModuleTEC2 extends CalculerUnModule {
  nouvelleVersion() {
    super.nouvelleVersion()
    // Même tirage que canTEC2-01, seul l'énoncé change : z n'est plus donné dans ℂ
    this.question = (this.question ?? '').replace('\\in\\mathbb{C}$', '$')
  }
}
