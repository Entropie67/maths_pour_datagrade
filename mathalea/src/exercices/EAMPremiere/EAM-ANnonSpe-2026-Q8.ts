import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '1de20'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer une évolution globale'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ8ANns2026 extends ExerciceQcmACourt {
  // t1 et t2 représentent ici la valeur en pourcentage des baisses (ex: 10 pour une baisse de 10%)
  private appliquerLesValeurs(t1: number, t2: number): void {
    const dec1 = t1 / 100
    const dec2 = t2 / 100

    const cm1 = 1 - dec1
    const cm2 = 1 - dec2
    const cmGlobal = cm1 * cm2

    // Arrondi mathématique pour contrer les bugs d'affichage flottant de JavaScript
    const tGlobal = Math.round((cmGlobal - 1) * 100)

    this.enonce = `Le taux d'évolution équivalent à une baisse de $${t1}\\,\\%$ suivie d'une baisse de $${t2}\\,\\%$ est :`

    this.correction = `Le coefficient multiplicateur global $CM_G$ est égal au produit des coefficients multiplicateurs successifs $CM_1$ et $CM_2$ :<br>`
    this.correction += `$CM_1 = 1 - ${texNombre(dec1, 2)} = ${texNombre(cm1, 2)}$<br>`
    this.correction += `$CM_2 = 1 - ${texNombre(dec2, 2)} = ${texNombre(cm2, 2)}$<br>`
    this.correction += `$CM_G = CM_1 \\times CM_2 = ${texNombre(cm1, 2)} \\times ${texNombre(cm2, 2)} = ${texNombre(cmGlobal, 4)}$<br>`
    this.correction += `Le taux d'évolution global est donc : <br>
    $T_G=CM_G     - 1 = ${texNombre(cmGlobal, 4)} - 1  =${texNombre(cmGlobal - 1, 2)} =${miseEnEvidence(tGlobal.toString() + '\\,\\%')}$.`

    // Distracteurs pertinents
    const dist1 = -(t1 + t2) // L'erreur classique d'addition des taux : -30%
    const dist2 = tGlobal - 10 // Décalage de -10% : -48%
    const dist3 = tGlobal + 10 // Décalage de +10% : -28%

    this.reponses = [
      `$${tGlobal}\\,\\%$`,
      `$${dist1}\\,\\%$`,
      `$${dist2}\\,\\%$`,
      `$${dist3}\\,\\%$`,
    ]
  }

  versionOriginale: () => void = () => {
    // Version de l'image : baisses de 10 % et 20 %
    this.appliquerLesValeurs(10, 20)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    // Valeurs de baisses possibles (multiples de 10)
    const baisses = [10, 20, 30, 40, 50, 60]

    let compteur = 0
    do {
      const t1 = choice(baisses)
      const t2 = choice(baisses)

      this.appliquerLesValeurs(t1, t2)
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
        /^Le taux d'évolution équivalent à (.*) est :\s*$/,
        (_, evolutions: string) =>
          this.interactif
            ? `Le taux d'évolution équivalent à ${evolutions} est `
            : `Calculer le taux d'évolution équivalent à ${evolutions}, en pourcentage.`,
      )
    // La bonne réponse du QCM est de la forme « $-70\,\%$ » : on ne garde que le nombre
    this.reponseCourte = () =>
      this.reponses[0].replace(/\\,\\%/, '').replace(/\$/g, '')
    this.clavierReponseCourte = KeyboardType.clavierDeBase
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = ' %.'
  }
}
