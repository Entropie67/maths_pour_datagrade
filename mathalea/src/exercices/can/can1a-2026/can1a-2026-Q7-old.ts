import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Déterminer le signe d'une puissance"
export const interactifReady = true

export const uuid = '4y4ea'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2026Q7 extends ExerciceCan {
  enonce(a?: number, puiss?: number) {
    if (a == null || puiss == null) {
      const valeurs = choice([
        [-9, 2],
        [7, 2],
        [-3, 5],
        [-6, 4],
        [-3, 3],
        [-4, 4],
        [6, 4],
        [8, 3],
        [-2, 5],
        [-6, 5],
      ])
      a = valeurs[0]
      puiss = valeurs[1]
    }

    const estPositif = a > 0 || (a < 0 && puiss % 2 === 0)
    const question = `Signe de  $${ecritureParentheseSiNegatif(a)}^{-${puiss}}$`

    this.formatInteractif = 'qcm'
    this.autoCorrection[0] = {
      options: { ordered: false, vertical: !context.isHtml },
      enonce: question,
      propositions: [
        {
          texte: 'Positif',
          statut: estPositif,
        },
        {
          texte: 'Négatif',
          statut: !estPositif,
        },
      ],
    }
    const qcm = propositionsQcm(this, 0)

    this.question = question + qcm.texte

    this.correction = `$${ecritureParentheseSiNegatif(a)}^{-${puiss}}=\\dfrac{1}{${ecritureParentheseSiNegatif(a)}^{${puiss}}}$<br>
     Comme  $${ecritureParentheseSiNegatif(a)}^{${puiss}}$ est  ${!estPositif ? "négatif (puissance impaire d'un nombre négatif)" : a > 0 ? "positif (puissance d'un nombre positif)" : "positif (puissance paire d'un nombre négatif)"}, on en déduit que  $\\dfrac{1}{${ecritureParentheseSiNegatif(a)}^{${puiss}}}$ est ${!estPositif ? 'négatif' : 'positif'}.<br>
    Ainsi, $${ecritureParentheseSiNegatif(a)}^{-${puiss}}$ est ${!estPositif ? `${texteEnCouleurEtGras('négatif')}` : `${texteEnCouleurEtGras('positif')}`}.`
    this.canEnonce = question
    this.canReponseACompleter = 'Entourer la réponse : POSITIF / NÉGATIF'
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(5, 4)
    else this.enonce()
  }
}
