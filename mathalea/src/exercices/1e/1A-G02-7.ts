import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  compareGrandeur,
  optionsClavierGrandeur,
  reponseGrandeur,
} from '../../lib/interactif/saisieGrandeur'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const titre = "Calculer l'aire d'un terrain rectangulaire"
export const dateDePublication = '23/06/2026'

export const dateDeModifImportante = '22/10/2026'

export const uuid = 'a2f91'

export const refs = {
  'fr-fr': ['1A-G02-7', '2A-G3-7'],
  'fr-ch': ['9R1GM2B-8', '9R2GM2B-8', '9R3GM2B-8'],
}

export const interactifReady = true

export const amcReady = true

/**
 * Calculer l'aire d'un terrain rectangulaire avec deux dimensions exprimées
 * dans des unités différentes.
 * @author Stéphane Guyon
 */
export default class AireTerrainRectangulaireQcm extends ExerciceQcmACourt {
  // En saisie libre, la question est portée par la phrase placée avant le champ
  private enonceFigure = ''
  private reponseSaisie = ''
  clavierReponseCourte = KeyboardType.clavierEntierementPersonnalisable
  texteAvantReponseCourte = "L'aire du terrain vaut "
  texteApresReponseCourte = ". (Préciser l'unité.)"
  enonceCourt = () =>
    this.enonceFigure +
    (this.interactif ? '' : "<br>Calculer l'aire de ce terrain.")
  reponseCourte = () => this.reponseSaisie
  compareReponseCourte = compareGrandeur

  private appliquerLesValeurs(longueurEnM: number, largeurEnCm: number) {
    const largeurEnM = largeurEnCm / 100
    const aireEnM2 = longueurEnM * largeurEnM
    const aireSansConversion = longueurEnM * largeurEnCm
    const aireAvecErreurDeConversion = longueurEnM * (largeurEnCm / 10)
    const perimetreEnM = 2 * (longueurEnM + largeurEnM)

    this.enonceFigure = `Un terrain rectangulaire mesure $${longueurEnM}\\text{ m}$ de long et $${largeurEnCm}\\text{ cm}$ de large.`
    this.enonce = `${this.enonceFigure}<br>
Son aire est égale à :`
    this.reponseSaisie = reponseGrandeur(aireEnM2, 'm^2')
    this.optionsChampReponseCourte = optionsClavierGrandeur({
      unitesEnonce: ['cm', 'm'],
      dimension: 2,
      unitePrincipale: 'm',
    })

    this.reponses = [
      `$${texNombre(aireEnM2)}\\text{ m}^2$`,
      `$${texNombre(aireSansConversion)}\\text{ m}^2$`,
      `$${texNombre(perimetreEnM)}\\text{ m}^2$`,
      `$${texNombre(aireAvecErreurDeConversion)}\\text{ m}^2$`,
    ]

    this.correction = `Pour calculer l'aire, il faut d'abord exprimer les deux dimensions dans la même unité :<br>
$${largeurEnCm}\\text{ cm}=${texNombre(largeurEnM)}\\text{ m}$.<br>
L'aire d'un rectangle est le produit de sa longueur par sa largeur :<br>
$\\mathcal{A}=${longueurEnM}\\times ${texNombre(largeurEnM)}=${miseEnEvidence(texNombre(aireEnM2))}$ ${texteEnCouleurEtGras('m$^2$')}`
  }

  versionOriginale = () => {
    this.appliquerLesValeurs(7, 300)
  }

  versionAleatoire = () => {
    let longueurEnM: number
    let largeurEnM: number
    do {
      longueurEnM = randint(3, 12)
      largeurEnM = choice([2, 3, 4, 5, 6, 8, 9])
    } while (longueurEnM * largeurEnM === 2 * (longueurEnM + largeurEnM))
    const largeurEnCm = 100 * largeurEnM
    this.appliquerLesValeurs(longueurEnM, largeurEnCm)
  }

  constructor() {
    super()

    this.nbQuestions = 1
    this.versionAleatoire()
  }
}
