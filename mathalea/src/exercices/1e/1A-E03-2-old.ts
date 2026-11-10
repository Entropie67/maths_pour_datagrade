// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 97101 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
// Version publiée jusqu'au 07/10/2026 (commit c93cc0ca5).
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
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '97101'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Calculer un taux d'évolution entre deux grandeurs"
export const dateDePublication = '10/07/2025'
/**
 * @author Stéphane Guyon
 */

export default class TauxEvolutionOld extends ExerciceQcmA {
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
    this.options.vertical = true
    this.versionAleatoire()
  }
}
