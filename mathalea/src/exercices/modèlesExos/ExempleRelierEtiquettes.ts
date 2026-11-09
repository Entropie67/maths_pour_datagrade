import { addRelierEtiquettes } from '../../lib/customElements/RelierEtiquettesElement'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const titre = 'Relier des sommes à leurs résultats'
export const interactifReady = true

export const dateDePublication = '31/07/2026'
export const uuid = 'bd726'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * Modèle minimal d'exercice utilisant le custom element « Relier les étiquettes ».
 * @author Rémi Angot
 */
export default class ExempleRelierEtiquettes extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    // Indispensable : sans lui, un champ MathLive serait ajouté après le composant.
    this.formatInteractif = 'relier-etiquettes'
    this.nbQuestions = 2
    this.consigne = 'Relier chaque somme à son résultat.'
  }

  nouvelleVersion() {
    const a = randint(1, 9)
    const b = randint(1, 9)
    const c = randint(1, 9)
    const d = randint(1, 9)
    const e = randint(1, 9)
    const f = randint(1, 9)

    // Chaque étiquette a un identifiant (G0, G1... à gauche, D0, D1... à
    // droite) : c'est ce couple d'identifiants, dans `liens`, qui définit la
    // bonne réponse, indépendamment de l'ordre d'affichage.
    const gauche = [
      { id: 'G0', texte: `$${a}+${b}$` },
      { id: 'G1', texte: `$${c}+${d}$` },
      { id: 'G2', texte: `$${e}+${f}$` },
    ]
    // Les résultats sont volontairement rangés dans un autre ordre que les sommes.
    const droite = [
      { id: 'D0', texte: `$${c + d}$` },
      { id: 'D1', texte: `$${e + f}$` },
      { id: 'D2', texte: `$${a + b}$` },
    ]
    const liens = [
      { gauche: 'G0', droite: 'D2' },
      { gauche: 'G1', droite: 'D0' },
      { gauche: 'G2', droite: 'D1' },
    ]

    // Dans un exercice simple l'indice de question vaut toujours 0 : le moteur
    // renumérote les identifiants du composant lors de la génération.
    this.question = addRelierEtiquettes(this, 0, {
      gauche,
      droite,
      interactivityOn: this.interactif,
    })
    this.correction = `$${a}+${b}=${a + b}$ ; $${c}+${d}=${c + d}$ ; $${e}+${f}=${e + f}$`
    this.reponse = JSON.stringify(liens)
  }
}
