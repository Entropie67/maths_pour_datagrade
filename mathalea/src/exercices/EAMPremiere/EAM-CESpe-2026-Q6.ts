import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = 'c31e7'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer une évolution successive de pourcentages'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ6CEs2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    hausse: number,
    ordreInverse: boolean,
    d1?: number,
    d2?: number,
    d3?: number,
  ): void {
    const cmHausse = 1 + hausse / 100
    const cmBaisse = 0.5
    const cmGlobal = cmHausse * cmBaisse
    const reponse = 50 - hausse / 2 // La baisse globale sera toujours (50 - hausse/2) %

    // Énoncé dynamique selon l'ordre
    if (!ordreInverse) {
      this.enonce = `L'évolution globale correspondant à une hausse de $${hausse}\\,\\%$ puis une baisse de $50\\,\\%$, est une baisse de :`
    } else {
      this.enonce = `L'évolution globale correspondant à une baisse de $50\\,\\%$ puis une hausse de $${hausse}\\,\\%$, est une baisse de :`
    }

    // Chaînes de calculs pour la correction
    const strHausse = `1 + ${texNombre(hausse / 100, 2)}= ${texNombre(cmHausse, 2)}`
    const strBaisse = `1 - 0,5 = 0,5`

    this.correction = `Le coefficient multiplicateur global est égal au produit des coefficients multiplicateurs successifs.<br><br>`

    if (!ordreInverse) {
      this.correction += `$\\bullet$ Pour la hausse de $${hausse}\\,\\%$ : $CM_1 = ${strHausse}$<br>`
      this.correction += `$\\bullet$ Pour la baisse de $50\\,\\%$ : $CM_2 = ${strBaisse}$<br>`
      this.correction += `Le coefficient multiplicateur global est : $CM = CM_1 \\times CM_2 = ${texNombre(cmHausse, 2)} \\times 0,5 = ${texNombre(cmGlobal, 3)}$.<br><br>`
    } else {
      this.correction += `$\\bullet$ Pour la baisse de $50\\,\\%$ : $CM_1 = ${strBaisse}$<br>`
      this.correction += `$\\bullet$ Pour la hausse de $${hausse}\\,\\%$ : $CM_2 = ${strHausse}$<br>`
      this.correction += `Le coefficient multiplicateur global est : $CM = CM_1 \\times CM_2 = 0,5 \\times ${texNombre(cmHausse, 2)} = ${texNombre(cmGlobal, 3)}$.<br>`
    }

    this.correction += `Le taux d'évolution global est donc : $t = CM - 1 = ${texNombre(cmGlobal, 3)} - 1 = -${texNombre(1 - cmGlobal, 3)}$.<br>`
    this.correction += `Cela correspond donc à une baisse de $${this.versionQcm ? miseEnEvidence(texNombre(reponse, 1) + '\\,\\%') : `${miseEnEvidence(texNombre(reponse, 1))}\\,\\%`}$.`

    // Génération des distracteurs
    const dist1 = d1 ?? Math.abs(50 - hausse) // Piège 1 : Additionner/soustraire les pourcentages
    const dist2 = d2 ?? 50 + hausse / 2 // Piège 2 : Erreur de signe ou mauvaise base
    const dist3 = d3 ?? hausse / 2 // Piège 3 : Moitié de la hausse

    // Sécurité pour garantir 3 distracteurs uniques par rapport à la réponse
    const candidates = [dist1, dist2, dist3]
    const uniqueDists = [...new Set(candidates)].filter((d) => d !== reponse)

    while (uniqueDists.length < 3) {
      const newD = randint(1, 9) * 10
      if (newD !== reponse && !uniqueDists.includes(newD)) {
        uniqueDists.push(newD)
      }
    }

    this.reponses = [
      `$${texNombre(reponse, 1)}\\,\\%$`,
      `$${texNombre(uniqueDists[0], 1)}\\,\\%$`,
      `$${texNombre(uniqueDists[1], 1)}\\,\\%$`,
      `$${texNombre(uniqueDists[2], 1)}\\,\\%$`,
    ]
  }

  versionOriginale: () => void = () => {
    // Énoncé : Hausse de 20 % puis Baisse de 50 %
    // Distracteurs stricts du PDF : 10 %, 30 %, 60 %
    this.appliquerLesValeurs(20, false, 10, 30, 60)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    const casHausse = [10, 20, 30, 40, 50, 60, 70, 80, 90]

    let compteur = 0
    do {
      const h = choice(casHausse)
      const inv = choice([true, false])

      this.appliquerLesValeurs(h, inv)
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
        /^L'évolution globale correspondant à (.*), est une baisse de :\s*$/,
        (_, evolutions: string) =>
          this.interactif
            ? `L'évolution globale correspondant à ${evolutions}, est une baisse de `
            : `Un prix subit ${evolutions}.<br>Déterminer le pourcentage de baisse de l'évolution globale.`,
      )
    // La bonne réponse du QCM est de la forme « $40\,\%$ » : on ne garde que le nombre
    this.reponseCourte = () =>
      this.reponses[0].replace(/\\,\\%/, '').replace(/\$/g, '')
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = ' %.'
  }
}
