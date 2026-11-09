// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 89dc7 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { premierAvec } from '../../../lib/outils/primalite'
import { fraction } from '../../../modules/fractions'
import { randint } from '../../../modules/outils'
import ExerciceQcmA from '../../ExerciceQcmA'
import { sp } from '../../../lib/outils/outilString'

export const uuid = '89dc7'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Polynésie 06/2024 : équa. diff.'
export const dateDePublication = '28/10/2024'
/**
 * Ceci est un exo construit à partir d'une question de qcm de Bac.
 * Il utilise la classe ExerciceQcmA qui définit les contours de l'exo (avec une version aléatoire : voir la méthode aleatoire ci-dessous)
 * Ce moule à exo dispose d'une méthode qcmCamExport qui permet de récupérer le JSON de la question et de la reponse pour qcmCam hérité de ExerciceQcm.
 * Il est interactif et dispose d'un export AMC d'office
 */
/**
 *
 * @author Stéphane Guyon
 *
 */
export default class PolynesieJuin2024Ex2Q1Old extends ExerciceQcmA {
  versionOriginale: () => void = () => {
    this.enonce =
      `La solution $f$ de l'équation différentielle $y^{\\prime}=-3y+7$ telle que $f(0) =1$ est la fonction définie sur $\\R$ par${sp()}:<br>`
    this.correction = `L'équation différentielle $y' = -3y$ a pour solutions les fonctions $x \\longmapsto f(x) = K \\mathrm{e}^{-3x}$, avec $K \\in \\R$.<br>
    La fonction $x \\longmapsto \\alpha$, avec $\\alpha \\in \\R$ est solution de l'équation différentielle $y' = -3y+7$ si et seulement si $y' = 0 = -3\\alpha+7 \\iff 3\\alpha = 7 \\iff \\alpha = \\dfrac73$.<br>
    On sait qu'alors les solutions de l'équation différentielle $y' = -3y+7$ sont les fonctions $x \\longmapsto K \\mathrm{e}^{-3x}+\\dfrac73$.<br>
    En particulier la fonction $f$ solution telle que $f(0) = 1  \\iff K +\\dfrac73 = 1 \\iff K = -\\dfrac43$.<br>
    La seule solution est donc la fonction définie par $f(x) = -\\dfrac43\\mathrm{e}^{-3x}+\\dfrac73$`
    this.reponses = [
      '$f(x) = -\\dfrac43\\mathrm{e}^{-3x}+\\dfrac73$',
      '$f(x) = \\mathrm{e}^{-3x}$',
      '$f(x) = -\\dfrac{10}{3}\\mathrm{e}^{-3x}-\\dfrac73$',
      '$f(x) = \\mathrm{e}^{-3x}+\\dfrac73$',
    ]
  }

  versionAleatoire = () => {
    const a = randint(-5, 5, [1, 0, -1])
    const b = premierAvec(Math.abs(a), [], false) * choice([-1, 1])
    const c = randint(1, 3) * choice([-1, 1])
    const alpha = fraction(b, -a).simplifie()
    const K = alpha.oppose().ajouteEntier(c).simplifie().texFSD
    const fauxK = alpha.ajouteEntier(c).oppose().simplifie().texFSD
    const texAlpha = alpha.ecritureAlgebrique
    const texMoinsAlpha = alpha.oppose().ecritureAlgebrique
    this.enonce = `La solution $f$ de l'équation différentielle $y^{\\prime}=${String(a)}y${ecritureAlgebrique(b)}$ telle que $f(0) =${String(c)}$ est la fonction définie sur $\\R$ par${sp()}:<br>`
    this.correction = `L'équation différentielle $y' = ${String(a)}y$ a pour solutions les fonctions $x \\longmapsto f(x) = K \\mathrm{e}^{${String(a)}x}$, avec $K \\in \\R$.<br>
    La fonction $x \\longmapsto \\alpha$, avec $\\alpha \\in \\R$ est solution de l'équation différentielle $y' = ${String(a)}y ${ecritureAlgebrique(b)}$ si et seulement si $y' = 0 = ${String(a)}\\alpha ${ecritureAlgebrique(b)}\\iff ${String(-a)}\\alpha = ${String(b)} \\iff \\alpha = ${alpha.texFSD}$.<br>
    On sait qu'alors les solutions de l'équation différentielle $y' = ${String(a)}y ${ecritureAlgebrique(b)}$ sont les fonctions $x \\longmapsto K \\mathrm{e}^{${String(a)}x} ${texAlpha}$.<br>
    En particulier la fonction $f$ solution telle que $f(0) = ${String(c)} \\iff K ${texAlpha} = ${String(c)} \\iff K = ${K}$.<br>
    La seule solution est donc la fonction définie par $f(x) = ${miseEnEvidence(`${K} \\mathrm{e}^{${String(a)}x} ${texAlpha}`)}$`
    this.reponses = [
      `$f(x) = ${K} \\mathrm{e}^{${String(a)}x} ${texAlpha}$`,
      `$f(x) = \\mathrm{e}^{${String(a)}x}$`,
      `$f(x) = \\mathrm{e}^{${String(a)}x} ${texAlpha}$`,
      `$f(x) = ${fauxK} \\mathrm{e}^{${String(a)}x} ${texMoinsAlpha}$`,
    ]
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
