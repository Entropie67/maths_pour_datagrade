import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import ExerciceQcmACourt, {
  genereComparaisonsDeroulantes,
} from '../ExerciceQcmACourt'

export const uuid = '83877'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  'Utiliser les propriétés de la différence de deux nombres pour les comparer'
export const dateDePublication = '05/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ1ANns2026 extends ExerciceQcmACourt {
  /** Symbole de la bonne réponse du QCM : « $A < B$ » donne « < ». */
  symboleBonneReponse(): string {
    return /^\$A\s*([<>=])\s*B\$$/.exec(this.reponses[0])?.[1] ?? '='
  }

  // condition : 'strictPos' | 'strictNeg' | 'nulle'
  // differenceAB : true => on parle de A - B ; false => B - A (échange de A et B)
  private appliquerLesValeurs(condition: string, differenceAB: boolean): void {
    const diffTex = differenceAB ? 'A-B' : 'B-A'

    const optAinfB = '$A < B$'
    const optAsupB = '$A > B$'
    const optAegB = '$A=B$'
    const optSaitPas = 'On ne peut pas savoir.'

    let conditionTex = '' // phrase de l'énoncé
    let symbDiff = '' // signe imposé à la différence
    let conclusion = '' // relation obtenue entre A et B
    let correct = ''

    switch (condition) {
      case 'strictPos':
        conditionTex = 'strictement positive'
        symbDiff = '>'
        if (differenceAB) {
          conclusion = 'A > B'
          correct = optAsupB
        } else {
          conclusion = 'A < B'
          correct = optAinfB
        }
        break

      case 'strictNeg':
        conditionTex = 'strictement négative'
        symbDiff = '<'
        if (differenceAB) {
          conclusion = 'A < B'
          correct = optAinfB
        } else {
          conclusion = 'A > B'
          correct = optAsupB
        }
        break

      case 'nulle':
        conditionTex = 'nulle'
        symbDiff = '='
        conclusion = 'A=B'
        correct = optAegB
        break
    }

    this.enonce = `On veut comparer deux nombres réels notés $A$ et $B$.<br>
On sait que la différence $${diffTex}$ est ${conditionTex}. Alors :`

    this.correction = `$${diffTex}${symbDiff}0$ signifie que $${miseEnEvidence(conclusion)}$.`

    // Correcte en premier, puis les trois autres propositions.
    // « On ne peut pas savoir. » reste toujours une proposition, mais n'est jamais correcte.
    this.reponses = [
      correct,
      ...[optAinfB, optAsupB, optAegB, optSaitPas].filter((r) => r !== correct),
    ]
  }

  versionOriginale: () => void = () => {
    // A - B strictement positive  ->  A > B
    this.appliquerLesValeurs('strictPos', true)
  }

  versionAleatoire: () => void = () => {
    // Pont avec le mécanisme Can : « sujet officiel » => version originale figée.
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    // Plus de cas « positive ou nulle » / « négative ou nulle » :
    // « On ne peut pas savoir. » ne peut donc jamais être la bonne réponse.
    const condition = choice(['strictPos', 'strictNeg', 'nulle'])
    const differenceAB = choice([true, false]) // échange de A et B
    this.appliquerLesValeurs(condition, differenceAB)
  }

  /**
   * La question n'est un QCM que si la case « Version QCM » est cochée. Sinon, l'élève compare
   * $A$ et $B$ avec une liste déroulante : les tirages sont ceux du QCM.
   */
  nouvelleVersion() {
    if (this.sup3) super.nouvelleVersion()
    else genereComparaisonsDeroulantes(this, { gauche: 'A', droite: 'B' })
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(/Alors :\s*$/, 'Comparer $A$ et $B$.')
  }
}
