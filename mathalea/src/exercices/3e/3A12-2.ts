import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  dents,
  multiplesJusqua,
  tireTroisRoues,
  toursAvec,
} from '../../lib/outils/engrenages'
import { numAlpha } from '../../lib/outils/outilString'
import { ppcm } from '../../lib/outils/primalite'
import ExerciceEngrenages, { type CasEngrenage } from '../ExerciceEngrenages'
import { texNombre } from '../../lib/outils/texNombre'

export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'

export const titre = 'Synchroniser trois engrenages'
export const dateDePublication = '11/10/2026'
export const dateDeModifImportante = '11/10/2026'

/**
 * Trouver avec le plus petit multiple commun le nombre de tours de la roue de gauche
 * avant que les trois roues d'un engrenage retrouvent leur position initiale.
 * @author Rémi Angot
 */
export const uuid = '5d0ee'

export const refs = {
  'fr-fr': ['3A12-2'],
  'fr-ch': ['9R2NO1H-11', '9R3NO1H-11', '10CTNO1B-11'],
}

export default class SynchroniserTroisRoues extends ExerciceEngrenages {
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
    const train = tireTroisRoues()
    const {
      dents: [a, b, c],
      cycle,
      tours: [toursTotal],
    } = train
    const toursMilieu = toursAvec(train, 1)
    const toursDroite = toursAvec(train, 2)
    const cycleGaucheMilieu = ppcm(a, b)
    const cycleGaucheDroite = ppcm(a, c)
    return {
      train,
      introduction: `La roue de gauche possède ${dents(a)}, celle du milieu ${dents(b)} et celle de droite ${dents(c)}.`,
      questions: [
        'Combien de tours la roue de gauche doit-elle effectuer pour que son repère et celui de la roue du milieu soient à nouveau comme dans la position initiale ?',
        'Combien de tours la roue de gauche doit-elle effectuer pour que son repère et celui de la roue de droite soient à nouveau comme dans la position initiale ?',
        `Dans la situation ${numAlpha(1, true)}, la roue du milieu n'est pas dans sa position initiale. Combien de tours la roue de gauche doit-elle effectuer pour que les trois roues retrouvent leur position initiale ?`,
      ],
      reponses: [toursMilieu, toursDroite, toursTotal],
      correction: '',
      corrections: [
        `On cherche le plus petit multiple commun à $${a}$ et $${b}$.<br>` +
          multiplesJusqua(a, cycleGaucheMilieu) +
          multiplesJusqua(b, cycleGaucheMilieu) +
          `La roue de gauche effectue $${miseEnEvidence(toursMilieu)}$ tours.`,
        `On cherche le plus petit multiple commun à $${a}$ et $${c}$.<br>` +
          multiplesJusqua(a, cycleGaucheDroite) +
          multiplesJusqua(c, cycleGaucheDroite) +
          `La roue de gauche effectue $${miseEnEvidence(toursDroite)}$ tours.`,
        `Dans la situation ${numAlpha(1, true)}, $${cycleGaucheDroite}$ dents ont défilé. Ce n'est pas un multiple de $${b}$, donc la roue du milieu n'est pas dans sa position initiale.<br>` +
          `Les trois roues sont synchronisées quand le nombre de dents qui ont défilé est un multiple de $${a}$, de $${b}$ et de $${c}$ : le plus petit est $${texNombre(cycle)}$.<br>` +
          `La roue de gauche effectue alors $${texNombre(cycle)}\\div${a}=${miseEnEvidence(toursTotal)}$ tours, la roue du milieu $${cycle / b}$ tours et la roue de droite $${cycle / c}$ tours.`,
      ],
    }
  }
}
