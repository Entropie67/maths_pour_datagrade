import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '61302'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Calculer un effectif à partir d'un pourcentage"
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '08/11/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ7AGs2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    pHommes: number,
    nbFemmes: number,
    repOrigine?: string,
    d1Origine?: string,
    d2Origine?: string,
    d3Origine?: string,
  ): void {
    const pFemmes = 100 - pHommes
    const total = Math.round(nbFemmes / (pFemmes / 100))

    this.enonce = `On s'intéresse aux adhérents d'une association.<br>`
    this.enonce += `On sait que $${pHommes}\\,\\%$ d'entre eux sont des hommes et qu'il y a $${nbFemmes}$ femmes.<br><br>`
    this.enonce += `Le nombre total d'adhérents de cette association est égal à :`

    let correct = ''
    let d1 = ''
    let d2 = ''
    let d3 = ''

    if (repOrigine && d1Origine && d2Origine && d3Origine) {
      correct = repOrigine
      d1 = d1Origine
      d2 = d2Origine
      d3 = d3Origine
    } else {
      correct = `$${total}$`
      const faussesReponses = new Set<number>()

      // Distracteur 1 : L'erreur additive (ex: 30 + 40 = 70)
      faussesReponses.add(nbFemmes + pHommes)

      // Distracteur 2 : Utilisation du mauvais pourcentage (ex: 30 / 0.40 = 75)
      const errPourcent = Math.round(nbFemmes / (pHommes / 100))
      faussesReponses.add(errPourcent)

      // Distracteur 3 : La valeur du pourcentage proposée comme un nombre d'adhérents (ex: 40)
      faussesReponses.add(pHommes)

      // Sécurité : on complète avec des valeurs proches si les pièges tombent sur la bonne réponse
      let offset = 10
      while (faussesReponses.size < 4) {
        faussesReponses.add(total + offset)
        offset += 10
      }

      faussesReponses.delete(total)

      const arrDist = Array.from(faussesReponses)
      d1 = `$${arrDist[0]}$`
      d2 = `$${arrDist[1]}$`
      d3 = `$${arrDist[2]}$`
    }

    this.reponses = [correct, d1, d2, d3]

    // Rédaction de la correction (Approche algébrique avec N)
    const coeff = pFemmes / 100

    this.correction = `Puisqu'il y a $${pHommes}\\,\\%$ d'hommes, le pourcentage de femmes dans l'association est de :<br>`
    this.correction += `$100\\,\\% - ${pHommes}\\,\\% = ${pFemmes}\\,\\%$.<br><br>`
    this.correction += `Notons $N$ la population totale cherchée.<br>`
    this.correction += `On sait que $${pFemmes}\\,\\%$ de $N$ correspond aux $${nbFemmes}$ femmes, ce qui peut s'écrire :<br>`
    this.correction += `$${texNombre(coeff, 2)} \\times N = ${nbFemmes}$<br><br>`
    this.correction += `On en déduit :<br>`
    this.correction += `$N = \\dfrac{${nbFemmes}}{${texNombre(coeff, 2)}} = ${miseEnEvidence(`${total}`)}$`
  }

  versionOriginale: () => void = () => {
    // 40% d'hommes, 30 femmes. Distracteurs : 70, 40, 75. Réponse : 50.
    this.appliquerLesValeurs(40, 30, '$50$', '$70$', '$40$', '$75$')
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      // Sans tirage valide à cette itération, le test ci-dessous ne doit pas juger les réponses d'un tirage précédent.
      this.reponses = []
      // On choisit d'abord un total rond puis un pourcentage "propre"
      const total = choice([40, 50, 60, 80, 100, 120, 140, 150, 200, 250])
      const pHommes = choice([10, 20, 25, 30, 40, 60, 70, 75, 80])

      const pFemmes = 100 - pHommes
      const nbFemmes = (total * pFemmes) / 100

      // On valide l'itération seulement si le nombre de femmes est un nombre entier strict
      if (Number.isInteger(nbFemmes)) {
        this.appliquerLesValeurs(pHommes, nbFemmes)
        compteur++
      }
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
        /Le nombre total d'adhérents de cette association est égal à :\s*$/,
        this.interactif
          ? "Le nombre total d'adhérents de cette association est égal à "
          : "Calculer le nombre total d'adhérents de cette association.",
      )
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = '.'
  }
}
