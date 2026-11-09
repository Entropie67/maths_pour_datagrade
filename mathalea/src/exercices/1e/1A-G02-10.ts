import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  compareGrandeurAvecPi,
  optionsClavierGrandeur,
  reponseGrandeurAvecPi,
} from '../../lib/interactif/saisieGrandeur'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const titre = "Calculer le volume d'un cône (sans figure)"
export const dateDePublication = '23/06/2026'

export const dateDeModifImportante = '22/10/2026'

export const uuid = 'b3a06'

export const refs = {
  'fr-fr': ['1A-G02-10', '2A-G3-10'],
  'fr-ch': ['11LCGM1C-2', '11LSGM1C-2'],
}

export const interactifReady = true

export const amcReady = true

/**
 * Calculer le volume exact d'un cône à partir du rayon de sa base et de sa hauteur.
 * @author Stéphane Guyon
 */
export default class VolumeConeQcm extends ExerciceQcmACourt {
  // En saisie libre, la question est portée par la phrase placée avant le champ
  private enonceFigure = ''
  private reponseSaisie = ''
  clavierReponseCourte = KeyboardType.clavierEntierementPersonnalisable
  texteAvantReponseCourte = 'La valeur exacte du volume de ce cône vaut '
  texteApresReponseCourte = ". (Préciser l'unité.)"
  enonceCourt = () =>
    this.enonceFigure +
    (this.interactif ? '' : '<br>Donner la valeur exacte du volume de ce cône.')
  reponseCourte = () => this.reponseSaisie
  compareReponseCourte = compareGrandeurAvecPi

  private appliquerLesValeurs(rayon: number, hauteur: number) {
    const produit = rayon ** 2 * hauteur
    const coefficientVolume = produit / 3
    const coefficientAvecDivisionParDeux = produit / 2
    const volumeAvecPiDecimal = coefficientVolume * 3.14

    this.enonceFigure = `Un cône a pour rayon de base $${rayon}\\text{ cm}$ et pour hauteur $${hauteur}\\text{ cm}$.`
    this.enonce = `${this.enonceFigure}<br>
La valeur exacte de son volume est :`
    this.reponseSaisie = reponseGrandeurAvecPi(
      `${coefficientVolume}\\pi`,
      'cm^3',
    )
    this.optionsChampReponseCourte = optionsClavierGrandeur({
      unitesEnonce: ['cm'],
      dimension: 3,
      unitePrincipale: 'cm',
      avecPi: true,
    })

    this.reponses = [
      `$${texNombre(coefficientVolume)}\\pi\\text{ cm}^3$`,
      `$${texNombre(volumeAvecPiDecimal)}\\text{ cm}^3$`,
      `$${texNombre(coefficientAvecDivisionParDeux)}\\pi\\text{ cm}^3$`,
      `$${texNombre(coefficientVolume)}\\text{ cm}^3$`,
    ]

    this.correction = `Le volume d'un cône de rayon de base $r$ et de hauteur $h$ est donné par la formule :<br>
$V=\\dfrac{\\pi r^2h}{3}$.<br>
Ici, $r=${rayon}\\text{ cm}$ et $h=${hauteur}\\text{ cm}$.<br>
Donc $V=\\dfrac{\\pi\\times ${rayon}^2\\times ${hauteur}}{3}=\\dfrac{${produit}\\pi}{3}=${miseEnEvidence(`${texNombre(coefficientVolume)}\\pi\\text{ cm}^3`)}$.<br>
$${texNombre(volumeAvecPiDecimal)}\\text{ cm}^3$ n'est qu'une version approchée du volume.`
  }

  versionOriginale = () => {
    this.appliquerLesValeurs(3, 6)
  }

  versionAleatoire = () => {
    let rayon: number
    let hauteur: number
    do {
      rayon = randint(2, 9)
      hauteur = randint(3, 12)
    } while ((rayon ** 2 * hauteur) % 6 !== 0)
    this.appliquerLesValeurs(rayon, hauteur)
  }

  constructor() {
    super()

    this.nbQuestions = 1
    this.versionAleatoire()
  }
}
