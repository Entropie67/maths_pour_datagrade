import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '6ebf5'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  'Déterminer un pourcentage global après une hausse puis une baisse (ou inversement)'
export const dateDePublication = '29/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Jean-Claude Lhote
 *
 */
export default class AutoQ3AGt2026 extends ExerciceQcmACourt {
  private pGlobal = 100

  /** Taux d'évolution global en pourcentage, avec son signe. */
  private tauxGlobal(): string {
    return texNombre(this.pGlobal - 100, 2).replace(/\\,/g, '')
  }

  private appliquerLesValeurs(
    pourcentage1: number,
    pourcentage2: number,
  ): void {
    const pGlobal = ((100 + pourcentage1) * (100 + pourcentage2)) / 100
    this.pGlobal = pGlobal
    const diff = pourcentage1 + pourcentage2
    const sol =
      pGlobal < 100
        ? `Baisse de $${texNombre(100 - pGlobal, 2)}\\,\\%$`
        : `Hausse de $${texNombre(pGlobal - 100, 2)}\\,\\%$`
    const dist1 =
      diff < 0
        ? `Baisse de $${texNombre(-diff, 2)}\\,\\%$`
        : `Hausse de $${texNombre(diff, 2)}\\,\\%$`
    const dist2 =
      diff < 0
        ? `Hausse de $${texNombre(-diff, 2)}\\,\\%$`
        : `Baisse de $${texNombre(diff, 2)}\\,\\%$`
    const dist3 =
      pGlobal < 100
        ? `Baisse de $${texNombre(pGlobal, 2)}\\,\\%$`
        : `Hausse de $${texNombre(pGlobal, 2)}\\,\\%$`

    this.enonce = `Un prix ${pourcentage1 > 0 ? 'augmente' : 'diminue'} de $${texNombre(Math.abs(pourcentage1), 2)}\\,\\%$ puis ${pourcentage2 > 0 ? 'augmente' : 'diminue'} de $${texNombre(
      Math.abs(pourcentage2),
      2,
    )}\\,\\%$.<br>
    Quelle est l'évolution globale de ce prix ?`
    this.correction = `On calcule les coefficients multiplicateurs de chaque évolution ($CM=1+T$, avec $T$ le taux d'évolution) :<br>
    $CM_1=1${pourcentage1 >= 0 ? '+' : '-'}${texNombre(Math.abs(pourcentage1) / 100, 1)}=${texNombre((100 + pourcentage1) / 100, 1)}$ et $CM_2=1${pourcentage2 >= 0 ? '+' : '-'}${texNombre(Math.abs(pourcentage2) / 100, 1)}=${texNombre((100 + pourcentage2) / 100, 1)}$.<br><br>
    Le coefficient multiplicateur global est donné par  :<br>
    $CM_G=CM_1\\times CM_2=${texNombre((100 + pourcentage1) / 100, 1)}\\times ${texNombre((100 + pourcentage2) / 100, 1)}=${texNombre(pGlobal / 100, 2)}$.<br><br>
    Le taux global d'évolution est : <br>
    $T_G=CM_G-1=${texNombre(pGlobal / 100, 2)}-1=${texNombre(pGlobal / 100 - 1, 2)}=${texNombre(pGlobal - 100, 2)}\\,\\%$.<br><br>
   L'évolution globale est une ${texteEnCouleurEtGras(`${pGlobal > 100 ? 'hausse de ' : 'baisse de '}`)}$${miseEnEvidence(texNombre(Math.abs(pGlobal - 100), 2) + '\\,\\%')}$.`

    this.reponses = [sol, dist1, dist2, dist3]
  }

  versionOriginale: () => void = () => {
    // Version de l'image : 500 élèves, 20 %  => 100
    this.appliquerLesValeurs(10, -20)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      const signe1 = choice([-1, 1])
      const signe2 = choice([-1, 1], signe1)
      const pourcentage1 = choice([10, 20, 30, 40])
      const pourcentage2 = choice([10, 20, 30, 40], pourcentage1)

      this.appliquerLesValeurs(signe1 * pourcentage1, signe2 * pourcentage2)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /Quelle est l'évolution globale de ce prix \?\s*$/,
        this.interactif
          ? "Le taux d'évolution global de ce prix est de "
          : "Calculer le taux d'évolution global de ce prix, en pourcentage.",
      )
    this.reponseCourte = () => this.tauxGlobal()
    this.correctionCourte = () => {
      const correction = this.correction ?? ''
      return `${correction.slice(0, correction.indexOf("L'évolution globale est une"))}Le taux d'évolution global est donc $${miseEnEvidence(this.tauxGlobal())}\\,\\%$.`
    }
    this.clavierReponseCourte = KeyboardType.clavierDeBase
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = ' %.'
  }
}
