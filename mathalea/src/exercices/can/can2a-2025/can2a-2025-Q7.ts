import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer un prix après des évolutions successives'
export const interactifReady = true

export const uuid = '82a41'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class SignePuissance extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = true
    this.formatInteractif = 'qcm'
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    const valeurs = this.canOfficielle
      ? [3, 2]
      : choice([
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
    const puiss = valeurs[1]
    const question = `Signe de $${ecritureParentheseSiNegatif(valeurs[0])}^{-${puiss}}$`
    this.autoCorrection[0] = {
      options: { ordered: true, vertical: false },
      enonce: question,
      propositions: [
        {
          texte: 'Positif',
          statut: valeurs[0] > 0 || (valeurs[0] < 0 && valeurs[1] % 2 === 0),
        },
        {
          texte: 'Négatif',
          statut: valeurs[0] < 0 && valeurs[1] % 2 !== 0,
        },
      ],
    }
    const qcm = propositionsQcm(this, 0)

    this.question = question + qcm.texte

    this.correction = `$${ecritureParentheseSiNegatif(valeurs[0])}^{-${puiss}}=\\dfrac{1}{${ecritureParentheseSiNegatif(valeurs[0])}^{${puiss}}}$<br>
     Comme $${ecritureParentheseSiNegatif(valeurs[0])}^{${puiss}}$ est ${valeurs[0] < 0 && valeurs[1] % 2 !== 0 ? "négatif (puissance impaire d'un nombnre négatif)" : "positif (puissance paire d'un nombre négatif)"}, on en déduit que $\\dfrac{1}{${ecritureParentheseSiNegatif(valeurs[0])}^{${puiss}}}$ est ${valeurs[0] < 0 && valeurs[1] % 2 !== 0 ? 'négatif' : 'positif'}.<br>
    Ainsi, $${ecritureParentheseSiNegatif(valeurs[0])}^{-${puiss}}$ est ${valeurs[0] < 0 && valeurs[1] % 2 !== 0 ? `${texteEnCouleurEtGras('négatif')}` : `${texteEnCouleurEtGras('positif')}`}.`
    this.canEnonce = `Signe de $${ecritureParentheseSiNegatif(valeurs[0])}^{-${puiss}}$`
  }
}
