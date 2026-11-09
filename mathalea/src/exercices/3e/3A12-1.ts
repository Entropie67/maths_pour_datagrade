import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  dents,
  multiplesJusqua,
  tireDeuxRoues,
} from '../../lib/outils/engrenages'
import ExerciceEngrenages, { type CasEngrenage } from '../ExerciceEngrenages'

export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'

export const titre =
  'Trouver le retour à la position initiale de deux engrenages'
export const dateDePublication = '11/10/2026'
export const dateDeModifImportante = '11/10/2026'

/**
 * Trouver avec le plus petit multiple commun le nombre de tours de chaque roue d'un engrenage
 * avant que les deux roues retrouvent leur position initiale.
 * @author Rémi Angot
 */
export const uuid = 'eb561'

export const refs = {
  'fr-fr': ['3A12-1'],
  'fr-ch': ['9R2NO1H-10', '9R3NO1H-10', '10CTNO1B-10', 'PRQNO09A-13'],
}

export default class RetourPositionInitiale extends ExerciceEngrenages {
  declare sup: boolean

  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = false
    this.besoinFormulaireCaseACocher = [
      "Arrêt de l'animation après un cycle lors de la correction",
    ]
  }

  protected nouveauCas(): CasEngrenage {
    const train = tireDeuxRoues()
    const {
      dents: [a, b],
      cycle,
      tours: [ta, tb],
    } = train
    return {
      train,
      introduction: `La roue de gauche possède ${dents(a)} et celle de droite ${dents(b)}.`,
      questions: [
        'Au bout de combien de tours de la roue de gauche les deux roues retrouvent-elles leur position initiale ?',
        'Combien de tours la roue de droite a-t-elle alors effectués ?',
      ],
      reponses: [ta, tb],
      correction:
        'Les deux roues retrouvent leur position initiale quand le nombre de dents qui ont défilé est un multiple du nombre de dents de chacune : on cherche le plus petit multiple commun à ' +
        `$${a}$ et $${b}$.<br>` +
        multiplesJusqua(a, cycle) +
        multiplesJusqua(b, cycle) +
        `Le plus petit multiple commun est $${cycle}$.`,
      corrections: [
        `La roue de gauche effectue $${miseEnEvidence(ta)}$ tours (car $${ta}\\times${a}=${cycle}$).`,
        `La roue de droite effectue alors $${miseEnEvidence(tb)}$ tours (car $${tb}\\times${b}=${cycle}$).`,
      ],
    }
  }
}
