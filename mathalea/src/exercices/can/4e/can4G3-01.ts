import ExerciceSimple from '../../ExerciceSimple'

import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'

import { randint } from '../../../modules/outils'

export const titre = 'Comparer des périmètres'
export const interactifReady = true

export const dateDeModifImportante = '09/12/2025'
/**
 * @author Gilles Mora

 * 
*/
export const uuid = 'b1a48'

export const refs = {
  'fr-fr': ['can4G3-01'],
  'fr-ch': [],
}
export default class QuestionsAiresEtPerimetres0 extends ExerciceSimple {
  constructor() {
    super()
    this.formatInteractif = 'qcm'
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 3, 9) // Côté du carré
    const perimetreCarre = 4 * a

    // On choisit aléatoirement si l'affirmation est vraie ou fausse
    const estVrai = this.quotaChoice('estVrai', [true, false])

    let largeur: number
    let longueur: number

    if (estVrai) {
      // Cas VRAI : on construit un rectangle avec le même périmètre
      // Périmètre rectangle = 2(L + l) = 4a
      // Donc L + l = 2a
      // On choisit une largeur, puis on calcule la longueur correspondante
      largeur = randint(1, 2 * a - 2) // largeur entre 1 et 2a-2 pour avoir longueur > 0
      longueur = 2 * a - largeur
    } else {
      // Cas FAUX : on construit un rectangle avec un périmètre proche mais différent
      // On part d'une somme L + l proche de 2a
      const ecart = choice([-2, -1, 1, 2]) // Écart de ±1 ou ±2 sur la somme
      const somme = 2 * a + ecart

      // On choisit une largeur, puis on calcule la longueur correspondante
      largeur = randint(
        Math.max(1, Math.floor(somme / 3)),
        Math.floor((2 * somme) / 3),
      )
      longueur = somme - largeur

      // On s'assure que largeur et longueur sont positifs
      if (longueur <= 0) {
        longueur = 1
        largeur = somme - 1
      }
    }

    const perimetreRectangle = 2 * (largeur + longueur)

    const question = `Un carré de côté $${a}\\text{ cm}$ a le même périmètre qu'un rectangle de largeur $${largeur}\\text{ cm}$ et de longueur $${longueur}\\text{ cm}$ ?`

    this.autoCorrection[0] = {
      options: { ordered: false, vertical: false },
      enonce: question,
      propositions: [
        {
          texte: 'Vrai',
          statut: estVrai,
        },
        {
          texte: 'Faux',
          statut: !estVrai,
        },
      ],
    }

    const qcm = propositionsQcm(this, 0)
    this.question = question + qcm.texte

    if (estVrai) {
      this.correction = `${texteEnCouleurEtGras('Vrai')}<br>
Le périmètre du carré est : $4\\times ${a}\\text{ cm} = ${perimetreCarre}\\text{ cm}$.<br>
Le périmètre du rectangle est : $2\\times ${largeur}\\text{ cm} + 2\\times ${longueur}\\text{ cm} = ${perimetreRectangle}\\text{ cm}$.<br>
Les deux périmètres sont égaux.`
    } else {
      this.correction = `${texteEnCouleurEtGras('Faux')}<br>
Le périmètre du carré est : $4\\times ${a}\\text{ cm} = ${perimetreCarre}\\text{ cm}$.<br>
Le périmètre du rectangle est : $2\\times ${largeur}\\text{ cm} + 2\\times ${longueur}\\text{ cm} = ${perimetreRectangle}\\text{ cm}$.<br>
Les deux périmètres sont différents.`
    }
    this.canEnonce = `Un carré de côté $${a}\\text{ cm}$ a le même périmètre qu'un rectangle de largeur $${largeur}\\text{ cm}$ et de longueur $${longueur}\\text{ cm}$ ?`
    this.canReponseACompleter =
      '\\faSquare[regular] Vrai <br>\\faSquare[regular] Faux'
    this.listeCanEnonces.push(this.canEnonce)
    this.listeCanReponsesACompleter.push(this.canReponseACompleter)
  }
}
