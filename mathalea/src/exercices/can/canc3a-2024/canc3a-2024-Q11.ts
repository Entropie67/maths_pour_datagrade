import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
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

export const uuid = '74ad3'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora (reprise du fichier de Jean-claude Lhote 6ième)

*/
export default class CompareNombre extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.formatInteractif = 'qcm'
    this.canOfficielle = false
  }

  nouvelleVersion() {
    const [aa, bb, cc] = this.canOfficielle
      ? [5, 'dixièmes', 10]
      : choice([
          [randint(2, 50), 'dixièmes', 10],
          [randint(20, 500), 'centièmes', 100],
          [randint(200, 5000), 'millièmes', 1000],
        ])
    const a = aa
    const b = bb
    const c = cc
    const nbA = a / c
    const nbB = this.canOfficielle ? 4.8 : randint(21, 49, aa) / 10
    if (this.canOfficielle) {
      this.correction = `Comme $5$ dixième est égal à $0,5$, le plus grand nombre est  $${miseEnEvidence(texNombre(4.8, 1))}$.`
    } else {
      this.correction = `Comme $${texNombre(a, 0)}$ ${b} est égal à $${texNombre(nbA, 3)}$, alors le plus grand nombre est   ${nbA > nbB ? `$${miseEnEvidence(texNombre(a, 3))}$ ${texteEnCouleurEtGras(b)}` : `$${miseEnEvidence(texNombre(nbB, 1))}$`}.`
    }

    this.autoCorrection[0] = {
      options: { ordered: true },
      enonce: 'Coche le plus grand nombre : ',
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
      this.question = 'Entoure le plus grand nombre : '
      this.question += `${sp(7)}$${texNombre(a, 0)}$ ${b} ${sp(7)} $${texNombre(nbB, 1)}$`
    } else {
      this.question = 'Coche le plus grand nombre : ' + qcm.texte
    }

    this.canEnonce = 'Entoure le plus grand nombre.'
    this.canReponseACompleter = `$${texNombre(a, 0)}$ ${b} ${sp(7)} $${texNombre(nbB, 1)}$`
  }
}
