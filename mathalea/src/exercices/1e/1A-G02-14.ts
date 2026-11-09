import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  compareGrandeurAvecPi,
  optionsClavierGrandeur,
  reponseGrandeurAvecPi,
} from '../../lib/interactif/saisieGrandeur'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { fraction } from '../../modules/fractions'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const titre = "Calculer le volume d'une boule"
export const dateDePublication = '24/06/2026'

export const dateDeModifImportante = '23/10/2026'

export const uuid = 'c2f91'

export const refs = {
  'fr-fr': ['1A-G02-14', '2A-G3-14'],
  'fr-ch': ['11LSGM1D-2'],
}

export const interactifReady = true

export const amcReady = true

/**
 * Calculer le volume exact d'une boule à partir de son rayon.
 * @author Stéphane Guyon
 */
export default class VolumeBouleQcm extends ExerciceQcmACourt {
  // En saisie libre, la question est portée par la phrase placée avant le champ
  private enonceFigure = ''
  private reponseSaisie = ''
  clavierReponseCourte = KeyboardType.clavierEntierementPersonnalisable
  texteAvantReponseCourte = 'La valeur exacte du volume de la boule vaut '
  texteApresReponseCourte = ". (Préciser l'unité.)"
  enonceCourt = () =>
    this.enonceFigure +
    (this.interactif
      ? ''
      : '<br>Donner la valeur exacte du volume de cette boule.')
  reponseCourte = () => this.reponseSaisie
  compareReponseCourte = compareGrandeurAvecPi

  private appliquerLesValeurs(rayon: number) {
    const coefficientVolume = fraction(4 * rayon ** 3, 3).texFractionSimplifiee
    const coefficientAvecFacteurInverse = fraction(
      3 * rayon ** 3,
      4,
    ).texFractionSimplifiee
    const coefficientSansFacteurQuatreTiers = fraction(
      rayon ** 3,
      1,
    ).texFractionSimplifiee
    const coefficientAvecAireSphere = fraction(
      4 * rayon ** 2,
      1,
    ).texFractionSimplifiee
    const coefficientAlternative = fraction(
      2 * rayon ** 3,
      1,
    ).texFractionSimplifiee
    const quatriemeDistracteur =
      rayon === 3 || rayon === 4
        ? coefficientAlternative
        : coefficientAvecAireSphere

    this.enonceFigure = `Une boule a pour rayon $${rayon}\\text{ cm}$.`
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
      avecFraction: true,
    })

    this.reponses = [
      `$${coefficientVolume}\\pi\\text{ cm}^3$`,
      `$${coefficientAvecFacteurInverse}\\pi\\text{ cm}^3$`,
      `$${coefficientSansFacteurQuatreTiers}\\pi\\text{ cm}^3$`,
      `$${quatriemeDistracteur}\\pi\\text{ cm}^3$`,
    ]

    this.correction = `Le volume d'une boule de rayon $r$ est donné par la formule :<br>
$V=\\dfrac{4}{3}\\pi r^3$<br>
Ici, $r=${rayon}\\text{ cm}$.<br>
Donc $V=\\dfrac{4}{3}\\times \\pi\\times ${rayon}^3=${miseEnEvidence(`${coefficientVolume}\\pi\\text{ cm}^3`)}$.`
  }

  versionOriginale = () => {
    this.appliquerLesValeurs(4)
  }

  versionAleatoire = () => {
    const rayon = choice([1, 2, 3, 4, 5, 6, 8, 10])
    this.appliquerLesValeurs(rayon)
  }

  constructor() {
    super()

    this.nbQuestions = 1
    this.versionAleatoire()
  }
}
