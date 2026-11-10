import { propositionsQcm } from '../../../lib/interactif/qcm'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Trouver le plus grand nombre'
export const interactifReady = true

export const uuid = 'ea002'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class PlusGrandNombre extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.formatInteractif = 'qcm'
  }

  nouvelleVersion() {
    const [aa, bb, cc] = this.quotaChoice('typeFraction', [
      [2025, 'dixièmes', 10],
      [2025, 'centièmes', 100],
      [2025, 'millièmes', 1000],
    ])
    const a = aa
    const b = bb
    const c = cc
    const nbA = a / c
    const nbB = randint(2023, 2030, aa) / 10

    this.correction = `$${texNombre(a, 0)}$ ${b} $=${texNombre(nbA, 3)}$ et ${nbA > nbB ? `$${texNombre(nbA, 3)}>${texNombre(nbB, 3)}$` : `$${texNombre(nbB, 3)}>${texNombre(nbA, 3)}$`}. Donc le plus grand nombre des deux est   ${nbA > nbB ? `$${miseEnEvidence(texNombre(a, 3))}$ ${texteEnCouleurEtGras(b)}` : `$${miseEnEvidence(texNombre(nbB, 1))}$`}.`

    this.autoCorrection[0] = {
      options: { ordered: true },
      enonce: 'Cocher le plus grand nombre : ',
      propositions: [
        {
          texte: `$${texNombre(a, 0)}$ ${b}  `,
          statut: nbA > nbB,
        },
        {
          texte: `$${texNombre(nbB, 1)}$`,
          statut: nbB > nbA,
        },
      ],
    }
    const qcm = propositionsQcm(this, 0)
    if (!this.interactif) {
      this.question = 'Entourer le plus grand nombre : '
      this.question += `${sp(7)}$${texNombre(a, 0)}$ ${b} ${sp(7)} $${texNombre(nbB, 1)}$`
    } else {
      this.question = 'Cocher le plus grand nombre : ' + qcm.texte
    }

    this.canEnonce = 'Cocher le plus grand nombre.'
    this.canReponseACompleter = `$${texNombre(a, 0)}$ ${b} ${sp(7)} $${texNombre(nbB, 1)}$`
  }
}
