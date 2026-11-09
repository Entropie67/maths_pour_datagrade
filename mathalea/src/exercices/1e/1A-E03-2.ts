import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { abs } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import { nombreElementsDifferents } from '../ExerciceQcm'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const dateDeModifImportante = '07/10/2026'

export const uuid = '5f0b4'
export const refs = {
  'fr-fr': ['1A-E03-2', '2A-E3-2', 'BP1CF03'],
  'fr-ch': ['10CTQCMFA1-10', '10LCQCMFA1-10', '10LSQCMFA1-10', '11CTQCMFA1-5', '11LCQCMFA1-5', '11LSQCMFA1-5'],
}
export const interactifReady = true

export const amcReady = 'true'
export const titre = "Calculer un taux d'évolution entre deux grandeurs"
export const dateDePublication = '10/07/2025'
/**
 * @author Stéphane Guyon
 */

export default class TauxEvolution extends ExerciceQcmACourt {
  // Données du dernier tirage, utilisées par la saisie courte
  private taux = 0
  private correctionSaisie = ''

  private appliquerLesValeurs(
    valeurInitiale: number,
    valeurFinale: number,
    evo: string,
  ): void {
    const taux = ((valeurFinale - valeurInitiale) / valeurInitiale) * 100
    const tauxInverse = ((valeurInitiale - valeurFinale) / valeurFinale) * 100
    const diffBrute = valeurFinale - valeurInitiale
    let distracteur = taux + choice([-10, -5, 5, 10])
    do {
      distracteur = taux + choice([-10, -5, 5, 10])
    } while (
      distracteur === taux ||
      distracteur === tauxInverse ||
      distracteur === diffBrute ||
      distracteur === 0
    )

    this.reponses = [
      `Une ${evo} de $${texNombre(Math.round(abs(taux)))}\\ \\%$`,
      `Une ${evo}  de $${texNombre(Math.round(abs(tauxInverse)))}\\, \\%$`,
      `Une ${evo}  de $${texNombre(abs(diffBrute))}\\, \\%$`,
      `Une ${evo}  de $${abs(distracteur)}\\, \\%$`,
    ]
    const bonneReponseColoree = `${texteEnCouleurEtGras(`une ${evo} de `)}$${miseEnEvidence(`${texNombre(Math.round(abs(taux)))}\\ \\%`)}$`
    this.enonce = `Une grandeur passe de $${texNombre(valeurInitiale)}$ à  $${texNombre(valeurFinale)}$.<br>
    L'évolution est :`

    this.correction = `Le taux d'évolution $t$ est donné par la formule :<br>
    $t = \\dfrac{\\text{valeur finale} - \\text{valeur initiale}}{\\text{valeur initiale}}$<br><br>
    Ici :
    $t=\\dfrac{${texNombre(valeurFinale)} - ${texNombre(valeurInitiale)}}{${texNombre(valeurInitiale)}}  = ${texNombre(taux / 100, 4)}=${new FractionEtendue(taux, 100).texFractionSignee}=${texNombre(taux)}\\,\\%  $<br>
    Le taux d'évolution est donc ${bonneReponseColoree}.`
    this.reponse = ` $${texNombre(Math.round(abs(taux)))}\\, \\%$`

    this.taux = taux
    this.correctionSaisie = `Le taux d'évolution $t$ est donné par la formule :<br>
    $t = \\dfrac{\\text{valeur finale} - \\text{valeur initiale}}{\\text{valeur initiale}}$<br><br>
    Ici :
    $t=\\dfrac{${texNombre(valeurFinale)} - ${texNombre(valeurInitiale)}}{${texNombre(valeurInitiale)}}  = ${texNombre(taux / 100, 4)}=${new FractionEtendue(taux, 100).texFractionSignee}$.<br>
    Le taux d'évolution est donc $t=${miseEnEvidence(texNombre(taux))}\\,\\%$ : c'est une ${evo} de $${texNombre(abs(taux))}\\,\\%$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(80, 100, 'augmentation')
    this.reponses = [
      'Une augmentation  de $25\\, \\%$',
      'Une diminution de $-20\\, \\%$',
      'Une augmentation $20\\, \\%$',
      'Une diminution de $-0.2\\, \\%$',
    ]
  }

  versionAleatoire: () => void = () => {
    const n = 4
    do {
      const base = randint(3, 7)
      const coeff = choice([2, 4, 5, 10])
      const valeurInitiale = base * coeff * 10
      let valeurFinale =
        valeurInitiale + randint(-1, 1, 0) * base * randint(1, 5) * 10
      do {
        valeurFinale =
          valeurInitiale + randint(-1, 1, 0) * base * randint(1, 5) * 10
      } while (valeurFinale === valeurInitiale || valeurFinale <= 0)

      // Vérification pour éviter les cas problématiques
      const taux = ((valeurFinale - valeurInitiale) / valeurInitiale) * 100
      const diffBrute = valeurFinale - valeurInitiale

      // Si le taux arrondi égale la différence brute, on recommence
      if (Math.round(abs(taux)) === abs(diffBrute)) {
        continue
      }

      const evo = valeurFinale < valeurInitiale ? 'diminution' : 'augmentation'
      this.appliquerLesValeurs(valeurInitiale, valeurFinale, evo)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    this.options.vertical = true
    this.options.compact = true // moins d'espace avant les propositions du QCM
    // Version sans QCM : l'élève donne le taux d'évolution (signé) en pourcentage
    this.enonceCourt = () =>
      this.enonce.replace(
        "L'évolution est :",
        "Quel est le taux d'évolution de cette grandeur ?",
      )
    this.reponseCourte = () => String(this.taux)
    this.optionsChampReponseCourte = {
      texteAvant: '$t=$',
      texteApres: '$\\,\\%$',
    }
    this.correctionCourte = () => this.correctionSaisie
    this.versionAleatoire()
  }
}
