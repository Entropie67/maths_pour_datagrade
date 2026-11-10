// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 48aff continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = '48aff'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Amérique 05/22 : somme'
export const dateDePublication = '09/03/2025'
/**
 * Ceci est un exo construit à partir d'une question de qcm de Bac.
 * Il utilise la classe ExerciceQcm qui définit les contours de l'exo (sans version aléatoire)
 * Ce moule à exo dispose d'une méthode qcmCamExport qui permet de récupérer le JSON de la question et de la reponse pour qcmCam.
 * Il est interactif et dispose d'un export AMC d'office
 */
/**
 *
 * @author Stéphane Guyon
 *
 */
export default class SujetZero2024Ex5Q5Old extends ExerciceQcm {
  versionOriginale: () => void = () => {
    this.reponses = [
      '$ -\\dfrac{1}{2} \\ln (3) $', // Réponse correcte (d)
      '$ 1 - \\dfrac{1}{2} \\ln (3) $', // Mauvaise réponse (a)
      '$ \\dfrac{1}{2} \\ln (3) $', // Mauvaise réponse (b)
      '$ 3 \\ln (3) + \\dfrac{1}{2} $', // Mauvaise réponse (c)
    ]

    this.enonce = 'Le réel $a$ est défini par '
    this.enonce +=
      '$a = \\ln (9) + \\ln \\left(\\dfrac{\\sqrt{3}}{3} \\right) + \\ln \\left(\\dfrac{1}{9} \\right).$<br>'
    this.enonce += `Quelle est la valeur de $a$${sp()}?`

    this.correction = `On simplifie l'expression de $a$ étape par étape${sp()}:<br>`
    this.correction += '$\\begin{aligned}'
    this.correction +=
      'a &= \\ln (9) + \\ln \\left(\\dfrac{\\sqrt{3}}{3} \\right) + \\ln \\left(\\dfrac{1}{9} \\right) \\\\'
    this.correction +=
      '&= \\ln \\left(3^2 \\right) + \\ln \\left(\\sqrt{3} \\right) - \\ln (3) - \\ln \\left(3^2 \\right) \\\\'
    this.correction +=
      '&= 2 \\ln (3) + \\dfrac{1}{2} \\ln (3) - \\ln (3) - 2 \\ln (3) \\\\'
    this.correction +=
      '&= \\left(2 + \\dfrac{1}{2} - 1 - 2 \\right) \\ln (3) \\\\'
    this.correction += '&= -\\dfrac{1}{2} \\ln (3)'
    this.correction += '\\end{aligned}$<br>'
    this.correction += `La bonne réponse est donc la réponse $${miseEnEvidence(' -\\dfrac{1}{2} \\ln (3) ')}$`
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
