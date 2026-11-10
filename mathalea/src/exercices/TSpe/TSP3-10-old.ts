// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 2ff97 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import ExerciceQcm from '../ExerciceQcm'
import { sp } from '../../lib/outils/outilString'

export const uuid = '2ff97'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Calculer l'espérance d'une variable aléatoire (QCM Bac)"
export const dateDePublication = '05/11/2024'
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
      'perd $0,50$ € .',
      'gagne $3,50$ €',
      'perd $3$ €',
      'perd $1,50$ € ',
    ]

    this.enonce =
      `Pour participer à un jeu, un joueur doit payer $4$ €.<br> Il lance ensuite un dé équilibré à six faces${sp()}:<br>`
    this.enonce +=
      "$\\quad\\bullet\\quad$ s'il obtient $1$, il remporte $12$ € ;<br>"
    this.enonce +=
      "$\\quad\\bullet\\quad$ s'il obtient un nombre pair, il remporte $3$ € ;<br>"
    this.enonce += '$\\quad\\bullet\\quad$ sinon, il ne remporte rien.<br>'
    this.enonce += `En moyenne, le joueur${sp()}:`
    this.correction =
      "Soit $X$ la variable aléatoire qui donne le gain (mise moins ce que l'on gagne).<br>"
    this.correction +=
      "On cherche l'espérance mathématique de cette variable aléatoire.<br>"
    this.correction +=
      `On a${sp()}:<br> $\\quad\\bullet\\quad P(X=12-4)=P(X=8)=\\dfrac16$,<br> $\\quad\\bullet\\quad P(X=3-4)=P(X=-1)=\\dfrac12$ <br> $\\quad\\bullet\\quad P(X=0-4)=P(X=-4)=\\dfrac13$ `
    this.correction +=
      '<br>Donc $E(X)=8\\times \\dfrac{1}{6} +(-1)\\times \\dfrac{3}{6} + (-4)\\times \\dfrac{2}{6}= -\\dfrac{3}{6}=-\\dfrac{1}{2}$<br>'
    this.correction += 'ce qui correspond à une perte de $0,50\\text{ €}$.'
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
