import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'bced5'
export const refs = {
  'fr-fr': ['TSP3-10'],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Calculer l'espérance d'une variable aléatoire (QCM Bac)"
export const dateDePublication = '05/11/2024'
export const dateDeModifImportante = '08/11/2026'
/**
 * Ceci est un exo construit à partir d'une question de qcm de Bac.
 * Il utilise la classe ExerciceQcmA qui définit les contours de l'exo avec une version originale et une version aléatoire.
 * Ce moule à exo dispose d'une méthode qcmCamExport qui permet de récupérer le JSON de la question et de la reponse pour qcmCam.
 * Il est interactif et dispose d'un export AMC d'office
 */
/**
 *
 * @author Stéphane Guyon
 *
 */
export default class SujetZero2024Ex5Q5 extends ExerciceQcmA {
  /** Texte d'une proposition à partir du gain algébrique (positif : gain, négatif : perte). */
  private texteGain(gain: number): string {
    return gain > 0
      ? `gagne $${texNombre(gain, 2)}$ €`
      : `perd $${texNombre(-gain, 2)}$ €`
  }

  /**
   * Écrit l'énoncé, la correction et les réponses.
   * @param mise somme payée pour participer
   * @param gainUn gain si le dé donne 1
   * @param gainPair gain si le dé donne un nombre pair
   * @param distracteurs gains algébriques des mauvaises réponses (tirés si absents)
   */
  private appliquerLesValeurs(
    mise: number,
    gainUn: number,
    gainPair: number,
    distracteurs?: number[],
  ): void {
    const num = gainUn - mise + 3 * (gainPair - mise) + 2 * -mise
    const esperance = num / 6
    const gainBrut = (gainUn + 3 * gainPair) / 6
    const candidats =
      distracteurs ??
      shuffle([
        -esperance,
        gainBrut,
        esperance + 1,
        esperance - 1,
        esperance + 2,
      ])
    const autres: number[] = []
    for (const c of candidats) {
      if (
        c !== 0 &&
        c !== esperance &&
        !autres.includes(c) &&
        autres.length < 3
      ) {
        autres.push(c)
      }
    }
    this.reponses = [esperance, ...autres].map((g) => this.texteGain(g))

    this.enonce = `Pour participer à un jeu, un joueur doit payer $${mise}$ €.<br> Il lance ensuite un dé équilibré à six faces${sp()}:<br>`
    this.enonce += `$\\quad\\bullet\\quad$ s'il obtient $1$, il remporte $${gainUn}$ € ;<br>`
    this.enonce += `$\\quad\\bullet\\quad$ s'il obtient un nombre pair, il remporte $${gainPair}$ € ;<br>`
    this.enonce += '$\\quad\\bullet\\quad$ sinon, il ne remporte rien.<br>'
    this.enonce += `En moyenne, le joueur${sp()}:`

    this.correction =
      "Soit $X$ la variable aléatoire qui donne le gain (ce que l'on remporte moins la mise).<br>"
    this.correction +=
      "On cherche l'espérance mathématique de cette variable aléatoire.<br>"
    this.correction += `On a${sp()}:<br> $\\quad\\bullet\\quad P(X=${gainUn}-${mise})=P(X=${gainUn - mise})=\\dfrac16$,<br> $\\quad\\bullet\\quad P(X=${gainPair}-${mise})=P(X=${gainPair - mise})=\\dfrac12$ <br> $\\quad\\bullet\\quad P(X=0-${mise})=P(X=${-mise})=\\dfrac13$ `
    const terme = (v: number): string => (v < 0 ? `(${v})` : `${v}`)
    this.correction += `<br>Donc $E(X)=${terme(gainUn - mise)}\\times \\dfrac{1}{6} +${terme(gainPair - mise)}\\times \\dfrac{3}{6} + ${terme(-mise)}\\times \\dfrac{2}{6}=\\dfrac{${num}}{6}=${texNombre(esperance, 2)}$<br>`
    this.correction += `ce qui correspond à ${esperance > 0 ? 'un gain' : 'une perte'} de $${texNombre(Math.abs(esperance), 2)}\\text{ €}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(4, 12, 3, [3.5, -3, -1.5])
  }

  versionAleatoire: () => void = () => {
    let mise: number
    let gainUn: number
    let gainPair: number
    do {
      mise = randint(2, 8)
      gainUn = choice([6, 12, 18, 24])
      gainPair = randint(2, 6)
    } while (gainUn + 3 * gainPair === 6 * mise) // espérance nulle exclue
    this.appliquerLesValeurs(mise, gainUn, gainPair)
  }

  constructor() {
    super()
    this.options.vertical = true
    this.nbQuestionsModifiable = false
    this.versionAleatoire()
  }
}
