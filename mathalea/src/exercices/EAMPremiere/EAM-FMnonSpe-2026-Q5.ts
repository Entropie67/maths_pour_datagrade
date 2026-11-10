import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence, texteGras } from '../../lib/outils/embellissements'
import { texNombre, texPrix } from '../../lib/outils/texNombre'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '064b5'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer un prix après deux évolutions'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ5FMns2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    prixInit: number,
    taux: number,
    d1?: number,
    d2?: number,
    d3?: number,
  ): void {
    const cm1 = 1 - taux / 100
    const cm2 = 1 + taux / 100

    // Calcul de l'étape intermédiaire
    const prixInter = prixInit * cm1
    const reponse = prixInter * cm2

    this.enonce = `Un article coûte initialement $${prixInit}$ €. Son prix diminue de $${taux}\\,\\%$ puis augmente de $${taux}\\,\\%$.<br>`
    this.enonce += `Son prix final est de :`

    this.correction = `Pour trouver le prix final, on calcule le prix intermédiaire après la première évolution, puis on applique la deuxième évolution sur ce nouveau prix.<br><br>`

    this.correction += `$\\bullet$ ${texteGras('Étape $1$ :')} Prix après la diminution de $${taux}\\,\\%$<br>`
    this.correction += `Diminuer un prix de $${taux}\\,\\%$ revient à le multiplier par $1 - ${texNombre(taux / 100, 2)} = ${texNombre(cm1, 2)}$.<br>`
    this.correction += `Le prix intermédiaire est donc : $${prixInit} \\times ${texNombre(cm1, 2)} = ${texPrix(prixInter)}\\text{ €}$.<br><br>`

    this.correction += `$\\bullet$ ${texteGras('Étape $2$ : ')}Prix final après l'augmentation de $${taux}\\,\\%$<br>`
    this.correction += `Augmenter un prix de $${taux}\\,\\%$ revient à le multiplier par $1 + ${texNombre(taux / 100, 2)} = ${texNombre(cm2, 2)}$.<br>`
    this.correction += `On applique cette augmentation sur le prix intermédiaire :<br>`
    this.correction += `$${texPrix(prixInter)} \\times ${texNombre(cm2, 2)} = ${miseEnEvidence(texPrix(reponse) + '\\text{ €}')}$.<br><br>`

    this.correction += `${texteGras(' Remarque : ')} Une baisse de $${taux}\\,\\%$ suivie d'une hausse de $${taux}\\,\\%$ ne ramène pas le prix à sa valeur initiale, car la hausse s'applique sur un prix qui a déjà diminué.`

    // Génération des distracteurs
    const dist1 = d1 ?? prixInit // Piège 1 : L'élève pense que les deux évolutions s'annulent
    const dist2 = d2 ?? reponse + 0.4
    const dist3 = d3 ?? reponse + 0.6

    // Sécurité pour garantir 3 distracteurs uniques par rapport à la réponse
    const candidates = [dist1, dist2, dist3]
    const uniqueDists = [...new Set(candidates)].filter(
      (d) => Math.abs(d - reponse) > 0.001,
    )

    let offset = 0.5
    while (uniqueDists.length < 3) {
      const newD = reponse + offset
      if (
        !uniqueDists.some((d) => Math.abs(d - newD) < 0.001) &&
        Math.abs(newD - reponse) > 0.001
      ) {
        uniqueDists.push(newD)
      }
      offset = offset > 0 ? -offset : -offset + 0.5
    }

    this.reponses = [
      `$${texPrix(reponse)}$ €`,
      `$${texPrix(uniqueDists[0])}$ €`,
      `$${texPrix(uniqueDists[1])}$ €`,
      `$${texPrix(uniqueDists[2])}$ €`,
    ]
  }

  versionOriginale: () => void = () => {
    // Énoncé : Prix = 50 €, Diminution de 10 % puis Augmentation de 10 %
    // Distracteurs de l'image : 49,90 € ; 50 € ; 50,10 €
    this.appliquerLesValeurs(50, 10, 49.9, 50, 50.1)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    // On définit des paires [prixInitial, taux] qui donnent des calculs mentaux très simples.
    const donneesMentalesFaciles: [number, number][] = [
      [50, 10], // 50 -> 45 -> 49.5
      [100, 10], // 100 -> 90 -> 99
      [200, 10], // 200 -> 180 -> 198
      [50, 20], // 50 -> 40 -> 48
      [100, 20], // 100 -> 80 -> 96
      [200, 20], // 200 -> 160 -> 192
      [25, 20], // 25 -> 20 -> 24
      [100, 30], // 100 -> 70 -> 91
      [200, 30], // 200 -> 140 -> 182
      [50, 40], // 50 -> 30 -> 42
      [100, 40], // 100 -> 60 -> 84
      [25, 40], // 25 -> 15 -> 21
      [40, 50], // 40 -> 20 -> 30
      [60, 50], // 60 -> 30 -> 45
      [80, 50], // 80 -> 40 -> 60
      [100, 50], // 100 -> 50 -> 75
    ]

    let compteur = 0
    do {
      const [p, t] = choice(donneesMentalesFaciles)
      this.appliquerLesValeurs(p, t)
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
        /Son prix final est de :\s*$/,
        this.interactif ? 'Son prix final est de ' : 'Calculer son prix final.',
      )
    // La bonne réponse du QCM est de la forme « $49,5$ € » : on ne garde que le nombre
    this.reponseCourte = () =>
      this.reponses[0].replace(/^\$([^$]*)\$.*$/, (_, nombre: string) =>
        nombre.replace(/\\,/g, ''),
      )
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = ' €.'
  }
}
