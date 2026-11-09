// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 3ca11 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { colorToLatexOrHTML } from '../../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { integrale } from '../../../lib/2d/Integrale'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygone } from '../../../lib/2d/polygones'
import { repere } from '../../../lib/2d/reperes'
import { bleuMathalea } from '../../../lib/colors'
import { Spline } from '../../../lib/mathFonctions/Spline'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = '3ca11'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Polynésie 06/2024 : graphique'
export const dateDePublication = '28/10/2024'
/**
 * Ceci est un exo construit à partir d'une question de qcm de Bac.
 * Il utilise la classe ExerciceQcm qui définit les contours de l'exo (sans version aléatoire)
 * Ce moule à exo dispose d'une méthode qcmCamExport qui permet de récupérer le JSON de la question et de la reponse pour qcmCam.
 * Il est interactif et dispose d'un export AMC d'office
 * @author Jean-claude Lhote
 */

export default class PolynesieJuin2024Ex2Q2Old extends ExerciceQcm {
  versionOriginale: () => void = () => {
    this.reponses = [
      '$5 \\leqslant I \\leqslant 10$',
      '$0 \\leqslant I \\leqslant 4$',
      '$1 \\leqslant I \\leqslant 5$',
      '$10 \\leqslant I \\leqslant 15$',
    ]
    let texte =
      "La courbe d'une fonction $f$ définie sur $[~0~;~+\\infty~[$ est donnée ci-dessous.:<br>"
    const leRepere = repere({ xMin: 0, yMin: 0, xMax: 6, yMax: 4 })
    const maSpline = new Spline([
      { x: 0, y: 0, deriveeGauche: 6, deriveeDroit: 6, isVisible: false },
      { x: 1, y: 3, deriveeGauche: 1, deriveeDroit: 1, isVisible: false },
      { x: 2, y: 3, deriveeGauche: -0.5, deriveeDroit: -0.5, isVisible: false },
      { x: 3, y: 2, deriveeGauche: -1, deriveeDroit: -1, isVisible: false },
      { x: 4, y: 1, deriveeGauche: -0.5, deriveeDroit: -0.5, isVisible: false },
      {
        x: 5,
        y: 0.5,
        deriveeGauche: -0.25,
        deriveeDroit: -0.25,
        isVisible: false,
      },
      {
        x: 6,
        y: 0.3,
        deriveeGauche: -0.1,
        deriveeDroit: -0.1,
        isVisible: false,
      },
    ])
    const nuage = [
      pointAbstrait(1, 0),
      pointAbstrait(1, 3),
      pointAbstrait(2, 3),
      pointAbstrait(2, 2),
      pointAbstrait(3, 2),
      pointAbstrait(3, 0),
    ]
    const nuage2 = [
      pointAbstrait(1, 0),
      pointAbstrait(1, 4),
      pointAbstrait(2, 4),
      pointAbstrait(2, 3),
      pointAbstrait(3, 3),
      pointAbstrait(3, 2),
      pointAbstrait(4, 2),
      pointAbstrait(4, 1),
      pointAbstrait(5, 1),
      pointAbstrait(5, 0),
    ]
    const zoneGrise = integrale(maSpline.fonction, {
      repere: leRepere,
      a: 1,
      b: 5,
      couleurDeRemplissage: 'gray',
      color: 'none',
      opacite: 0.5,
      hachures: -1,
    })
    const polygone1 = polygone(...nuage)
    const polygone2 = polygone(nuage2, bleuMathalea)
    polygone2.epaisseur = 2
    polygone1.hachures = 'north east lines'
    polygone1.couleurDesHachures = colorToLatexOrHTML('black')
    polygone1.couleurDeRemplissage = colorToLatexOrHTML('gray')
    const objets = [maSpline.courbe({ color: 'red', epaisseur: 2 }), leRepere]
    const objetsCorr = [
      maSpline.courbe({ color: 'red', epaisseur: 2 }),
      leRepere,
      zoneGrise,
      polygone1,
      polygone2,
    ]

    texte += mathalea2d(
      Object.assign({ pixelsParCm: 40, scale: 2 }, fixeBordures(objets)),
      objets,
    )
    texte +=
      `Un encadrement de l'intégrale $I = \\displaystyle\\int_1^5 f(x) \\:\\text{d}x$ est${sp()}:<br>`
    this.enonce = texte
    this.correction = `${mathalea2d(Object.assign({ pixelsParCm: 40, scale: 2 }, fixeBordures(objetsCorr)), objetsCorr)}Le dessin est clair${sp()}: la fonction est positive sur l'intervalle $[~1~;~5~]$.<br>
    L'intégrale est (en unités d'aire) la mesure de la surface limitée par la représentation graphique de $f$, l'axe des abscisses et les droites d'équations $x = 1$ et $x = 5$.<br>
La surface grise contient les $5$ carreaux hachurés et est inscrite dans le polygone de $10$ unités en bleu.<br>
Le bon encadrement est${sp()}: $${miseEnEvidence('5 \\leqslant I \\leqslant 10')}$.`
  }

  constructor() {
    super()
    this.versionOriginale()
  }
}
