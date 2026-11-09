// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid azer continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { context } from '../../../modules/context'
// import { miseEnEvidence } from '../../../lib/outils/embellissements'

import { colorToLatexOrHTML } from '../../../lib/2d/colorToLatexOrHtml'
import { courbe } from '../../../lib/2d/Courbe'
import { droite } from '../../../lib/2d/droites'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { repere } from '../../../lib/2d/reperes'
import { labelPoint, texteParPosition } from '../../../lib/2d/textes'
import { tracePoint } from '../../../lib/2d/TracePoint'
import { bleuMathalea } from '../../../lib/colors'
import { mathalea2d } from '../../../modules/mathalea2d'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'
import { sp } from '../../../lib/outils/outilString'

export const uuid = 'azer'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Métropole 09/21 : exponentielle'
export const dateDePublication = '08/11/2024'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Stéphane Guyon
 *
 */
export default class MetropoleJuin24Exo4Q1Old extends ExerciceQcmA {
  // Ceci est la fonction qui s'occupe d'écrire l'énoncé, la correction et les réponses
  // Elle factorise le code qui serait dupliqué dans versionAleatoire et versionOriginale
  private appliquerLesValeurs(a: number, b: number): void {
    const r = repere({
      xMin: -8,
      yMin: -8,
      yMax: 20,
      xMax: 4,
      xUnite: 2,
      yUnite: 0.4,
      thickHauteur: 0.1,
      xLabelMin: -5,
      yLabelMin: -5,
      xLabelMax: 1,
      yLabelMax: 20,
      yThickDistance: 5,
      xThickDistance: 1,
      axeXStyle: '->',
      axeYStyle: '->',
      grilleYDistance: 1,
      grilleSecondaire: true,
      grilleSecondaireYDistance: 1,
      grilleSecondaireXDistance: 1,
      grilleSecondaireYMin: 0,
      grilleSecondaireYMax: 1,
      grilleSecondaireXMin: 0,
      grilleSecondaireXMax: 1,
    })
    const A = pointAbstrait(0, 2, 'A')
    const B = pointAbstrait(2, 8, 'B')
    const C = pointAbstrait(-5, -0.64, 'C')
    const o = texteParPosition('$O$', 0.4, -0.4, 0, 'black', 1)
    const tA = tracePoint(A, 'red') // Variable qui trace les points avec une croix
    const tB = tracePoint(B, 'red') // Variable qui trace les points avec une croix
    const tC = tracePoint(C, 'red') // Variable qui trace les points avec une croix
    const lA = labelPoint(A, 'red') // Variable qui trace les nom s A et B
    const lB = labelPoint(B, 'red') // Variable qui trace les nom s A et B
    const lC = labelPoint(C, 'red') // Variable qui trace les nom s A et B
    tA.taille = 5
    tA.epaisseur = 2
    tB.taille = 5
    tB.epaisseur = 2
    tC.taille = 5
    tC.epaisseur = 2
    const droiteAB = droite(A, B)
    droiteAB.color = colorToLatexOrHTML('red')
    droiteAB.epaisseur = 2

    const f = (x: number) => (a * x + b) * Math.exp(x)
    const graphique = mathalea2d(
      {
        xmin: -6,
        xmax: 5,
        ymin: -4,
        ymax: 9,
        pixelsParCm: 30,
        scale: 1,
        center: !context.isHtml,
      },
      [
        courbe(f, {
          repere: r,
          xMin: -5,
          xMax: 8,
          color: bleuMathalea,
          epaisseur: 2,
        }),
        r,
        o,
        tA,
        tB,
        lA,
        lB,
        tC,
        lC,
        droiteAB,
      ],
    )
    this.reponses = [
      '$a = 10$ et $b = 5$',
      '$a = 2,5$ et $b = 0,5$',
      '$a = -1,5$ et $b = 5$',
      '$a = 0$ et $b = 5$',
    ]

    this.enonce = this.sup3
      ? `Le graphique ci-contre donne la représentation graphique $\\mathcal{C}_f$ dans un repère orthogonal <br>
      d'une fonction $f$ définie et dérivable sur $\\mathbb{R}$.<br>
      On notera $f'$ la fonction dérivée de $f$.<br> 
      On donne les points A de coordonnées $(0~;~5)$ et B de coordonnées $(1~;~20)$.<br> 
      Le point C est le point de la courbe $\\mathcal{C}_f$ ayant pour abscisse $-2,5$.<br> La droite (AB) est la tangente à la courbe $\\mathcal{C}_f$ au point A.<br>
       ${graphique}`
      : ''
    this.enonce +=
      'On admet que la fonction $f$ représentée ci-dessus est définie sur $\\R$ par $f(x) = (ax + b)\\mathrm{e}^x$,<br>'
    this.enonce +=
      ` où $a$ et $b$ sont deux nombres réels et que sa courbe coupe l'axe des abscisses <br>en son point de coordonnées $(-0,5~;~ 0)$. <br>On peut affirmer que${sp()}:`
    this.correction = `Graphiquement $f(0) = ${b} \\iff b\\mathrm{e}^0 = ${b} \\iff b = ${b}$ ;<br>
     D'autre part $f$ est dérivable sur $\\mathbb{R}$ et sur cet intervalle${sp()}:<br>
$f'(x) = ${a}\\mathrm{e}^x + (${a}x + ${b})\\mathrm{e}^x = \\mathrm{e}^x(${a}x + ${a} + ${b})$.<br>
Graphiquement, on lit que la pente de la droite $(AB)$, tangente en $0$ à la courbe, vaut $15$. <br>
On en déduit que  $f'(0) = 15$<br>
$a + b = 15$<br>
$\\iff a + 5 = 15$<br>
$\\iff a = 10$<br>`
  }

  // S'occupe de passser les données originales à la fonction appliquerLesValeurs
  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(10, 5) // valeurs originales pour f(x) = {a=3}x-{b=2} avec x={c=-4}
  }

  // s'occupe d'aléatoiriser les valeurs à passer à la fonction appliquerLesValeurs en vérifiant qu'on a bien 3 réponses différentes
  // Pour un qcm à n réponses, il faudrait vérifier que nombreElementsDifferents(this.reponses) < n
  versionAleatoire: () => void = () => {
    const n = 4 // nombre de réponses différentes voulues (on rappelle que la première réponse est la bonne)
    do {
      const a = 10
      const b = 5
      this.appliquerLesValeurs(a, b)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  // Ici il n'y a rien à faire, on appelle juste la version aleatoire (pour un qcm aleatoirisé, c'est le fonctionnement par défaut)
  constructor() {
    super()
    this.options.vertical = true
    this.versionAleatoire()
    this.besoinFormulaire3CaseACocher = ["Avec le préambule de l'énoncé", true]
    this.sup3 = true
  }
}
