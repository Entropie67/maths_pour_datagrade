import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '7d3aa'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['11CTFA1A-5', '11LCFA1A-5', '11LSFA1A-5'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Déterminer un nombre de km à partir d'une vitesse moyenne"
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ4AGns2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    v: number,
    h: number,
    m: number,
    distracteurs?: string[],
  ): void {
    const tDec = h + m / 60
    const d = v * tDec

    this.enonce = `Un automobiliste roule à $${v}$ km/h de moyenne pendant $${h}$ h $${m}$ min. La distance parcourue est :`

    const repCorrecte = `$${d}$ km`

    if (distracteurs && distracteurs.length >= 3) {
      this.reponses = [
        repCorrecte,
        distracteurs[0],
        distracteurs[1],
        distracteurs[2],
      ]
    } else {
      // Génération dynamique de mauvaises réponses
      // Erreur classique : considérer 2h30 comme 2,3h (d = v * (h + 0.3))
      const err1 = Math.round(v * (h + m / 100))

      // Distracteurs proches (+10, -10, -20)
      const err2 = d - 10
      const err3 = d + 10
      const err4 = d - 20

      const faussesReponses = new Set<string>()
      if (err1 !== d) faussesReponses.add(`$${err1}$ km`)
      faussesReponses.add(`$${err2}$ km`)
      faussesReponses.add(`$${err3}$ km`)
      faussesReponses.add(`$${err4}$ km`)

      const arrDist = Array.from(faussesReponses)
      this.reponses = [repCorrecte, arrDist[0], arrDist[1], arrDist[2]]
    }

    // Nouvelle correction basée sur le sens et la décomposition
    this.correction = `Rouler à $${v}$ km/h signifie que l'on parcourt $${v}$ km en $1$ heure.<br>`
    this.correction += `$\\bullet$ Pendant $${h}$ heures, l'automobiliste parcourt : $${h} \\times ${v} = ${h * v}$ km.<br>`
    this.correction += `$\\bullet$ Pendant $30$ minutes (qui représente une demi-heure), il parcourt la moitié de la distance, soit : $${v} \\div 2 = ${v / 2}$ km.<br><br>`
    this.correction += `La distance totale parcourue est donc de : $${h * v} + ${v / 2} = ${miseEnEvidence(d)}$ km.`
  }

  versionOriginale: () => void = () => {
    // Reproduction exacte de la question de l'image
    this.appliquerLesValeurs(60, 2, 30, ['$140$ km', '$130$ km', '$120$ km'])
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      // Tirage selon les consignes
      const v = choice([50, 60, 70, 80, 90])
      const h = choice([1, 2, 3])
      const m = 30 // Pour avoir 1h30, 2h30 ou 3h30

      this.appliquerLesValeurs(v, h, m)
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
        /La distance parcourue est :\s*$/,
        this.interactif
          ? 'La distance parcourue est '
          : 'Calculer la distance parcourue.',
      )
    // La bonne réponse du QCM est de la forme « $140$ km » : on ne garde que le nombre
    this.reponseCourte = () =>
      this.reponses[0].replace(/^\$([^$]*)\$.*$/, (_, nombre: string) =>
        nombre.replace(/\\,/g, ''),
      )
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = ' km.'
  }
}
