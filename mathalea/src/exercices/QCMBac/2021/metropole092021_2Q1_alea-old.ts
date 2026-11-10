// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid zert continuent d'afficher les mêmes
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
import { ecritureParentheseSiMoins } from '../../../lib/outils/ecritures'
import { texNombre } from '../../../lib/outils/texNombre'
import { mathalea2d } from '../../../modules/mathalea2d'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'
import { sp } from '../../../lib/outils/outilString'

export const uuid = 'zert'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Métropole 09/21 : étude de dérivée'
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
      xMin: -5,
      yMin: -5,
      yMax: 20,
      xMax: 2,
      xUnite: 1,
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
    const yA = 5
    const yB = 20
    const A = pointAbstrait(0, 2, 'A')
    const B = pointAbstrait(1, 8, 'B')
    const C = pointAbstrait(-2.5, -0.64, 'C')
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
        xmin: -5,
        xmax: 2,
        ymin: -2,
        ymax: 9,
        pixelsParCm: 30,
        scale: 1,
        center: !context.isHtml,
      },
      [
        courbe(f, {
          repere: r,
          xMin: -5,
          xMax: 0.6,
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
      "$f'(0) = 15$",
      "$f'(-0,5) = 0$",
      "si $x \\in ]- \\infty~;~-0,5[$, alors $f'(x) < 0$",
      "La fonction dérivée $f'$ ne change pas de signe sur $\\mathbb{R}.$",
    ]

    this.enonce = this.sup3
      ? `Le graphique ci-contre donne la représentation graphique $\\mathcal{C}_f$ dans un repère orthogonal d'une fonction $f$ définie et dérivable sur $\\mathbb{R}$.<br>
      On notera $f'$ la fonction dérivée de $f$.<br> 
      On donne les points A de coordonnées $(0~;~5)$ et B de coordonnées $(1~;~20)$.<br> 
      Le point C est le point de la courbe $\\mathcal{C}_f$ ayant pour abscisse $-2,5$.<br> La droite (AB) est la tangente à la courbe $\\mathcal{C}_f$ au point A.<br>
      ${graphique}`
      : ''
    this.enonce += `On peut affirmer que${sp()}:`
    this.correction = `On calcule $f'(0)=\\dfrac{y_B-y_A}{x_B-x_A}= \\dfrac{${yB}-${ecritureParentheseSiMoins(yA)}}{1-0}= ${texNombre(yB - yA)}$`
  }

  // S'occupe de passser les données originales à la fonction appliquerLesValeurs
  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(10, -5) // valeurs originales pour f(x) = {a=3}x-{b=2} avec x={c=-4}
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
