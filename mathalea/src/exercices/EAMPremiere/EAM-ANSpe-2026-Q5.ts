import { choice } from '../../lib/outils/arrayOutils'
import { texteItalique } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '7057b'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer une probabilité conditionnelle'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ5ANs2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    eventVoyelle: boolean, // true : événement « voyelle » (V) ; false : « consonne » (C)
    conditionneParMot: boolean, // true : P_M(X) ; false : P_X(M)
  ): void {
    const mot = 'SINGE'
    const voyellesAlphabet = 'AEIOUY'
    const lettresMot = [...mot] // S, I, N, G, E (toutes distinctes)
    const n = lettresMot.length // |M| = 5
    const nbVoyelles = 6 // A, E, I, O, U, Y
    const nbConsonnes = 26 - nbVoyelles // 20

    const voyellesMot = lettresMot.filter((l) => voyellesAlphabet.includes(l)) // I, E
    const consonnesMot = lettresMot.filter((l) => !voyellesAlphabet.includes(l)) // S, N, G

    const lettreEvent = eventVoyelle ? 'V' : 'C'
    const nomEvent = eventVoyelle ? 'voyelle' : 'consonne'
    const tailleEvent = eventVoyelle ? nbVoyelles : nbConsonnes // |V|=6 ou |C|=20
    const lettresEventMot = eventVoyelle ? voyellesMot : consonnesMot
    const inter = lettresEventMot.length // |événement ∩ M| : 2 ou 3

    const notation = conditionneParMot
      ? `P_{M}(${lettreEvent})`
      : `P_{${lettreEvent}}(M)`

    // Réponse correcte et distracteurs (fractions affichées non simplifiées)
    const denCorrect = conditionneParMot ? n : tailleEvent
    const correct = new FractionEtendue(inter, denCorrect)
    const dMarginal = conditionneParMot
      ? new FractionEtendue(tailleEvent, 26) // P(événement) : on oublie la condition
      : new FractionEtendue(n, 26) // P(M)
    const dInverse = conditionneParMot
      ? new FractionEtendue(inter, tailleEvent) // conditionnement inversé : P_X(M)
      : new FractionEtendue(inter, n) // conditionnement inversé : P_M(X)
    const dRatio = new FractionEtendue(n, tailleEvent) // rapport |M| / |événement|

    // Énoncé
    const defEvent = `$${lettreEvent}$ : «\u00a0Le singe choisit une ${nomEvent}.\u00a0»`
    const defMot = '$M$ : «\u00a0Le singe choisit une des lettres du mot SINGE.\u00a0»'
    const phraseProba = conditionneParMot
      ? `la probabilité que le singe choisisse une ${nomEvent} sachant qu'il a choisi une lettre du mot SINGE`
      : `la probabilité que le singe ait choisi une lettre du mot SINGE sachant qu'il a choisi une ${nomEvent}`

    this.enonce = `Un singe choisit une lettre au hasard parmi les lettres de l'alphabet.<br>
On note les évènements :<br>
• ${defEvent}<br>
• ${defMot}<br><br>
${texteItalique("Rappel : l'alphabet est constitué de $26$ lettres dont les voyelles sont : A, E, I, O, U, Y.")} <br><br>
On note $${notation}$ ${phraseProba}. <br>On peut alors affirmer que $${notation}$ vaut :`

    // Correction
    const pgcd = (a: number, b: number): number =>
      b === 0 ? a : pgcd(b, a % b)
    const simplif =
      pgcd(inter, denCorrect) > 1 ? `=${correct.texFractionSimplifiee}` : ''

    this.correction = conditionneParMot
      ? `La lettre choisie appartient au mot SINGE : on se limite aux $${n}$ lettres ${lettresMot.join(
          ', ',
        )}.<br>
Parmi elles, $${inter}$ sont des ${nomEvent}s : ${lettresEventMot.join(
          ', ',
        )}.<br>
Ainsi $${notation}=${miseEnEvidence(`\\dfrac{${inter}}{${n}}`)}${simplif}$.`
      : `La lettre choisie est une ${nomEvent} : on se limite aux $${tailleEvent}$ ${nomEvent}s de l'alphabet.<br>
Parmi elles, $${inter}$ appartiennent au mot SINGE : ${lettresEventMot.join(
          ', ',
        )}.<br>
Ainsi $${notation}=${miseEnEvidence(`\\dfrac{${inter}}{${tailleEvent}}`)}${simplif}$.`

    this.reponses = [
      `$${correct.texFraction}$`,
      `$${dMarginal.texFraction}$`,
      `$${dInverse.texFraction}$`,
      `$${dRatio.texFraction}$`,
    ]
  }

  versionOriginale: () => void = () => {
    // P_M(V) : la question de l'énoncé officiel
    this.appliquerLesValeurs(true, true)
  }

  versionAleatoire: () => void = () => {
    // Pont avec le mécanisme Can : « sujet officiel » => version originale figée.
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    // Exactement 4 versions : {voyelle, consonne} × {P_M(X), P_X(M)}.
    const eventVoyelle = choice([true, false])
    const conditionneParMot = choice([true, false])
    this.appliquerLesValeurs(eventVoyelle, conditionneParMot)
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, {
        fractionEgale: true,
        nombreDecimalSeulement: true,
      })
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /On peut alors affirmer que \$(P_\{.*?\}\(.*?\))\$ vaut :\s*$/,
        (_, proba: string) =>
          this.interactif ? `$${proba}=$` : `Calculer $${proba}$.`,
      )
    this.clavierReponseCourte = KeyboardType.clavierDeBaseAvecFraction
    this.champReponseCourteEnLigne = true
  }
}
