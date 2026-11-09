// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid c9fb7 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
// import ExerciceQcmA from '../../ExerciceQcmA'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'c9fb7'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Résoudre un problème d'abonnement"
export const dateDePublication = '15/12/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class Auto1C15rOld extends ExerciceQcmA {
  private appliquerLesValeurs(
    prixH: number,
    nbreSeance1: number,
    nbreSeance2: number,
    abo: number,
  ): void {
    this.enonce = `Pour s'entraîner dans une salle de sport, on règle chaque mois un abonnement pour une carte d'adhérent.<br>
    Cette carte donne droit à un tarif préférentiel pour chaque séance.<br>
    Un client ne se souvient pas du montant du forfait mensuel, ni du tarif préférentiel, mais il a retrouvé ses deux derniers tickets de caisse.<br>
    Le premier ticket indique qu'il a payé $${texNombre(abo + nbreSeance1 * prixH)}$ euros pour $${nbreSeance1}$ séances d'entraînement.<br>
    Le second ticket indique qu'il a payé $${texNombre(abo + nbreSeance2 * prixH)}$ euros pour $${nbreSeance2}$ séances d'entraînement.<br>
    Quel est le montant de l'abonnement mensuel ?`

    this.correction = `On note $a$ le montant de l'abonnement mensuel et $p$ le prix d'une séance.<br>
D'après le premier ticket : $a + ${nbreSeance1} \\times p = ${texNombre(abo + nbreSeance1 * prixH)}$ soit $a + ${nbreSeance1}p = ${texNombre(abo + nbreSeance1 * prixH)}$.<br>
D'après le second ticket : $a + ${nbreSeance2} \\times p = ${texNombre(abo + nbreSeance2 * prixH)}$ soit $a + ${nbreSeance2} p = ${texNombre(abo + nbreSeance2 * prixH)}$<br>
En faisant la différence entre ces deux montants, on obtient :<br>
$${nbreSeance2} p - ${nbreSeance1}  p = ${texNombre((nbreSeance2 - nbreSeance1) * prixH)}$ soit $${texNombre(nbreSeance2 - nbreSeance1)}p=${texNombre((nbreSeance2 - nbreSeance1) * prixH)}$.<br>

Donc le montant pour $1$ séance  est : $p = ${prixH}$ €.<br>
On peut alors calculer le montant de l'abonnement mensuel :<br>
$a = ${texNombre(abo + nbreSeance1 * prixH)} - ${nbreSeance1} \\times ${prixH} = ${texNombre(abo + nbreSeance1 * prixH)} - ${texNombre(nbreSeance1 * prixH)} = ${abo}$ €.<br>
Le montant de l'abonnement mensuel est donc de $${miseEnEvidence(abo + sp(1) + '€')}$.`

    this.reponses = [
      `$${abo}\\text{ €}$`,
      `$${prixH}\\text{ €}$`,
      `$${abo + 1}\\text{ €}$`,
      `$${nbreSeance2}\\text{ €}$`,
    ]
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(4, 3, 5, 11)
  }

  versionAleatoire: () => void = () => {
    let compteur = 0
    do {
      const abo = randint(8, 12)

      const prixH = randint(3, 6)
      const nbreSeance1 = randint(2, 6)
      const nbreSeance2 = randint(2, 6, [nbreSeance1, prixH])

      this.appliquerLesValeurs(prixH, nbreSeance1, nbreSeance2, abo)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, false)) // On s'assure d'avoir 4 réponses différentes, sinon on régénère
  }

  constructor() {
    super()
    this.versionAleatoire()
    this.spacing = 1.3
  }
}
