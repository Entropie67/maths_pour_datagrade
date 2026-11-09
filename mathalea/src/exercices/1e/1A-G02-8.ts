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

export const titre = "Calculer le volume d'un cylindre (sans figure)"
export const dateDePublication = '23/06/2026'

export const dateDeModifImportante = '22/10/2026'

export const uuid = 'e4c72'

export const refs = {
  'fr-fr': ['1A-G02-8', '2A-G3-8'],
  'fr-ch': ['10LCGM2B-2', '10LSGM2B-2', '11CTGM1A-2'],
}

export const interactifReady = true

export const amcReady = true

/**
 * Calculer le volume d'un cylindre à partir du rayon de sa base et de sa hauteur.
 * @author Stéphane Guyon
 */
export default class VolumeCylindreQcm extends ExerciceQcmACourt {
  // En saisie libre, la question est portée par la phrase placée avant le champ
  private enonceFigure = ''
  private reponseSaisie = ''
  clavierReponseCourte = KeyboardType.clavierEntierementPersonnalisable
  texteAvantReponseCourte = 'La valeur exacte du volume du cylindre vaut '
  texteApresReponseCourte = ". (Préciser l'unité.)"
  enonceCourt = () =>
    this.enonceFigure +
    (this.interactif
      ? ''
      : '<br>Donner la valeur exacte du volume de ce cylindre.')
  reponseCourte = () => this.reponseSaisie
  compareReponseCourte = compareGrandeurAvecPi

  private appliquerLesValeurs(rayon: number, hauteur: number) {
    const coefficientVolume = rayon ** 2 * hauteur
    const volumeAvecPiDecimal = coefficientVolume * 3.14
    const coefficientAvecPerimetreBase = 2 * rayon * hauteur
    const volumeSansPi = coefficientVolume

    this.enonceFigure = `Un cylindre a pour rayon de base $${rayon}\\text{ cm}$ et pour hauteur $${hauteur}\\text{ cm}$.`
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
      `$${coefficientVolume}\\pi\\text{ cm}^3$`,
      `$${texNombre(volumeAvecPiDecimal)}\\text{ cm}^3$`,
      `$${coefficientAvecPerimetreBase}\\pi\\text{ cm}^3$`,
      `$${volumeSansPi}\\text{ cm}^3$`,
    ]

    this.correction = `Le volume d'un cylindre de rayon de base $r$ et de hauteur $h$ est donné par la formule :<br>
$V=\\pi r^2h$.<br>
Ici, $r=${rayon}\\text{ cm}$ et $h=${hauteur}\\text{ cm}$.<br>
Donc $V=\\pi\\times ${rayon}^2\\times ${hauteur}=${miseEnEvidence(`${coefficientVolume}\\pi\\text{ cm}^3`)}$.`
    this.correction += `<br>
$${texNombre(volumeAvecPiDecimal)}\\text{ cm}^3$ n'est qu'une version approchée du volume.`
  }

  versionOriginale = () => {
    this.appliquerLesValeurs(4, 7)
  }

  versionAleatoire = () => {
    const rayon = randint(3, 9)
    const hauteur = randint(3, 12)
    this.appliquerLesValeurs(rayon, hauteur)
  }

  constructor() {
    super()

    this.nbQuestions = 1
    this.versionAleatoire()
  }
}
