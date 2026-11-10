import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  compareGrandeur,
  optionsClavierGrandeur,
  reponseGrandeur,
} from '../../lib/interactif/saisieGrandeur'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const titre =
  "Calculer le volume d'un prisme droit à base triangulaire rectangle"
export const dateDePublication = '24/06/2026'

export const dateDeModifImportante = '22/10/2026'

export const uuid = 'a95f8'

export const refs = {
  'fr-fr': ['1A-G02-12', '2A-G3-12'],
  'fr-ch': ['10CTGM2A-2', '10LCGM2A-2', '10LSGM2A-2'],
}

export const interactifReady = true

export const amcReady = true

/**
 * Calculer le volume d'un prisme droit dont la base est un triangle rectangle.
 * @author Stéphane Guyon
 */
export default class VolumePrismeDroitBaseTriangleRectangleQcm extends ExerciceQcmACourt {
  // En saisie libre, la question est portée par la phrase placée avant le champ
  private enonceFigure = ''
  private reponseSaisie = ''
  clavierReponseCourte = KeyboardType.clavierEntierementPersonnalisable
  texteAvantReponseCourte = 'Le volume de ce prisme droit vaut '
  texteApresReponseCourte = ". (Préciser l'unité.)"
  enonceCourt = () =>
    this.enonceFigure +
    (this.interactif ? '' : '<br>Calculer le volume de ce prisme droit.')
  reponseCourte = () => this.reponseSaisie
  compareReponseCourte = compareGrandeur

  private appliquerLesValeurs(
    coteAngleDroit1: number,
    coteAngleDroit2: number,
    hauteurPrisme: number,
  ) {
    const produitDesTroisCotes =
      coteAngleDroit1 * coteAngleDroit2 * hauteurPrisme
    const aireBase = (coteAngleDroit1 * coteAngleDroit2) / 2
    const volume = aireBase * hauteurPrisme

    this.enonceFigure = `Un prisme droit a pour base un triangle rectangle dont les côtés de l'angle droit mesurent $${coteAngleDroit1}\\text{ cm}$ et $${coteAngleDroit2}\\text{ cm}$.<br>
La hauteur du prisme est $${hauteurPrisme}\\text{ cm}$.`
    this.enonce = `${this.enonceFigure}<br>
Son volume est égal à :`
    this.reponseSaisie = reponseGrandeur(volume, 'cm^3')
    this.optionsChampReponseCourte = optionsClavierGrandeur({
      unitesEnonce: ['cm'],
      dimension: 3,
      unitePrincipale: 'cm',
    })

    this.reponses = [
      `$${texNombre(volume)}\\text{ cm}^3$`,
      `$${texNombre(volume / 3)}\\text{ cm}^3$`,
      `$${texNombre(produitDesTroisCotes)}\\text{ cm}^3$`,
      `$${texNombre(volume / 2)}\\text{ cm}^3$`,
    ]

    this.correction = `
Si $\\mathcal{A}$ désigne l'aire de la base et si $h$ désigne la hauteur du prisme, alors le volume d'un prisme droit est donné par :<br>
$V=\\mathcal{A}\\times h$<br>
Or, la base est un triangle rectangle. Si $a$ et $b$ désignent les deux côtés de l'angle droit, alors :<br>
$\\mathcal{A}=\\dfrac{a\\times b}{2}$<br>
Donc $\\mathcal{A}=\\dfrac{${coteAngleDroit1}\\times ${coteAngleDroit2}}{2}=\\dfrac{${coteAngleDroit1 * coteAngleDroit2}}{2}=${texNombre(aireBase)}\\text{ cm}^2$.<br>
$V=${texNombre(aireBase)}\\times ${hauteurPrisme}=${miseEnEvidence(texNombre(volume))}$ ${texteEnCouleurEtGras('cm$^3$')}.`
  }

  versionOriginale = () => {
    this.appliquerLesValeurs(6, 8, 9)
  }

  versionAleatoire = () => {
    let coteAngleDroit1: number
    let coteAngleDroit2: number
    let hauteurPrisme: number
    do {
      coteAngleDroit1 = randint(3, 12)
      coteAngleDroit2 = randint(3, 12, coteAngleDroit1)
      hauteurPrisme = randint(3, 12)
    } while ((coteAngleDroit1 * coteAngleDroit2 * hauteurPrisme) % 12 !== 0)
    this.appliquerLesValeurs(coteAngleDroit1, coteAngleDroit2, hauteurPrisme)
  }

  constructor() {
    super()

    this.nbQuestions = 1
    this.versionAleatoire()
  }
}
