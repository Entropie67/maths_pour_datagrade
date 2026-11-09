import { courbe } from '../../lib/2d/Courbe'
import { droiteParPointEtPente } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import RepereBuilder from '../../lib/2d/RepereBuilder'
import { tableauColonneLigne } from '../../lib/2d/tableau'
import { labelPoint, latex2d } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { bleuMathalea } from '../../lib/colors'
import { createList } from '../../lib/format/lists'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { texteItalique, miseEnEvidence, texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { rangeMinMax } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceBrevetA from '../ExerciceBrevetA'
import { sp } from '../../lib/outils/outilString'

export const uuid = '68e607'
export const refs = {
  'fr-fr': ['3F24DNB-1', '3Z1DNB-04'],
  'fr-ch': ['1mF3-12'],
}
export const titre =
  'Préparation DNB : Fonctions, fonction affine, tableur et équation produit-nul'
export const dateDePublication = '17/11/2024'
/**
 * @Author Jean-claude Lhote
 * Cet exerice exploite la nouvelle classe d'exercices que j'ai conçue pour les sujets de brevet
 * Il s'agit d'un exercice de type Brevet Aléatoirisé
 * La méthode privée appliquerLesValeurs permet de générer les valeurs aléatoires et de construire l'énoncé et la correction
 * La méthode versionOriginale permet de générer les valeurs de l'exercice telles qu'elles sont dans le sujet original
 * La méthode versionAleatoire permet de générer des valeurs aléatoires pour l'exercice
 */
export default class Exercice3F24DNB1 extends ExerciceBrevetA {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Sujet original', false]
    this.sup = false
    this.besoinFormulaire2CaseACocher = [
      'Présence possible de nombres négatifs',
      false,
    ]
    this.sup2 = false

    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
    this.introduction = texteItalique(
      "D'après l'exercice $5$ du brevet Nouvelle-Calédonie 2023.",
    )

    this.versionAleatoire()
  }

  private appliquerLesValeurs(
    a: number,
    b: number,
    c: number,
    d: number,
    x0: number,
    x1: number,
    y0: number,
  ) {
    const xSommet = -(c + d) / 2
    const ySommet = (xSommet + c) * (xSommet + d) // c'est forcément un minimum car la on a une fonction en x^2+bx+c
    const xMin = xSommet - 4
    const xMax = xSommet + 4
    const yMin = ySommet - 1
    const yMax = ySommet + 16
    const poly = new Polynome({ coeffs: [c * d, c + d, 1] })
    const rep = new RepereBuilder({ xMin, xMax, yMin, yMax })
      .setLabelX({ xMin, xMax, dx: 1 })
      .setLabelY({ yMin, yMax, dy: 1 })
      .setThickX({ xMin, xMax, dx: 1 })
      .setThickY({ yMin, yMax, dy: 1 })
      .setGrille({ grilleX: { dx: 1 }, grilleY: { dy: 1 } })
      .buildStandard()
    const laCourbe = courbe(poly.fonction, { repere: rep, color: 'red' })
    const dG = droiteParPointEtPente(pointAbstrait(0, b), a, '', bleuMathalea)
    const A = pointAbstrait(x0, a * x0 + b, 'A', 'above left')
    const B = pointAbstrait(x1, a * x1 + b, 'B', 'above left')
    const traces = tracePoint(A, B)
    const labels = labelPoint(A, B)
    const figure = mathalea2d(
      Object.assign({ scale: 0.5 }, fixeBordures([...rep.objets, laCourbe])),
      rep.objets,
      laCourbe,
    )
    const xBar = -A.x
    const yBar = a * xBar + b
    const angleDef = (Math.atan(a) * 180) / Math.PI
    const cosAngleDef = Math.cos((angleDef * Math.PI) / 180)
    const sinAngleDef = Math.sin((angleDef * Math.PI) / 180)
    const xPosDefG = xBar - sinAngleDef
    const yPosDefG = yBar + cosAngleDef
    const defG = latex2d('C_{g}', xPosDefG, yPosDefG, {
      orientation: 0,
      letterSize: 'footnotesize',
      color: bleuMathalea,
      backgroundColor: 'white',
      opacity: 0.8,
    })
    const figureCorr = mathalea2d(
      Object.assign(
        { scale: 0.5 },
        fixeBordures([...rep.objets, laCourbe, defG], { rxmin: 2 }),
      ),
      rep.objets,
      laCourbe,
      dG,
      traces,
      labels,
      defG,
    )
    const tabEnteteLignes1 = ['1', '2']
    const tabEnteteColonnes1 = ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G']
    const tabLignes1 = [
      'x',
      '-3',
      '-2',
      '-1',
      '0',
      '1',
      '2',
      'f(x)',
      poly.fonction(-3),
      poly.fonction(-2),
      '',
      '',
      '',
      '',
    ]

    const tableau1 = tableauColonneLigne(
      tabEnteteColonnes1,
      tabEnteteLignes1,
      tabLignes1,
    )
    const sousListe1 = createList({
      items: [
        `La fonction $f$, dont la représentation graphique est ci-dessous est-elle une fonction affine${sp()}? Justifier votre réponse.<br>${figure}`,
        `À l'aide de ce graphique ci-dessus, compléter, ci-dessous, le tableau de valeurs de la fonction $f$.<br>
      ${tableau1}<br>`,
        `Parmi les trois formules suivantes (issues d'un tableur), l'une correspond à l'expression de la fonction $f$.<br>
        Elle a été saisie dans la cellule B2 puis étendue dans la cellule C2 du tableau ci-dessus.<br>
        $\\def\\arraystretch{1.2}\\begin{array}{|c|c|c|}
        \\hline
        ${
          this.sup
            ? `~~=B1${ecritureAlgebrique(poly.fonction(-3) + 3)}~~&=(B1${ecritureAlgebrique(c)})\\times(B1${ecritureAlgebrique(d)})&~=SOMME(B1${sp()}:${sp()}G1)~`
            : shuffle([
                `~~=B1${ecritureAlgebrique(poly.fonction(-3) + 3)}~~`,
                `=(B1${ecritureAlgebrique(c)})\\times(B1${ecritureAlgebrique(d)})`,
                `~=SOMME(B1${sp()}:${sp()}G1)~`,
              ]).join('&')
        }\\\\
         \\hline
         \\end{array}$<br>
         Noter la bonne formule sur votre copie.`,
      ],
      style: 'alpha',
    })
    const tabEnteteLignes2 = ['1', '2']
    const tabEnteteColonnes2 = ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G']
    const tabLignes2 = [
      'x',
      '-3',
      '-2',
      '-1',
      '0',
      '1',
      '2',
      'f(x)',
      `${poly.fonction(-3)}`,
      `${poly.fonction(-2)}`,
      `${poly.fonction(-1)}`,
      `${poly.fonction(0)}`,
      `${poly.fonction(1)}`,
      `${poly.fonction(2)}`,
    ]
    const tableau2 = tableauColonneLigne(
      tabEnteteColonnes2,
      tabEnteteLignes2,
      tabLignes2,
    )
    const sousListe1Corr = createList({
      items: [
        `La fonction $f$ ${texteEnCouleurEtGras("n'est pas affine")} car une fonction affine est représentée par une droite.`,
        `${
          this.correctionDetaillee
            ? `Le tableau de valeurs peut être rempli par lecture graphique.<br>
        On peut lire les images des nombres $-1$, $0$, $1$ et $2$ sur le graphique de l'énoncé.<br>`
            : ''
        }
        Le tableau de valeurs est le suivant${sp()}:<br>
       ${tableau2}<br>`,
        `La formule correcte est${sp()}: $${miseEnEvidence(`=(B1${ecritureAlgebrique(c)})\\times(B1${ecritureAlgebrique(d)})`)}$.<br>
        ${
          this.correctionDetaillee
            ? `$=B1${ecritureAlgebrique(poly.fonction(-3) + 3)}$ donnerait comme images dans cet ordre${sp()}: $${rangeMinMax(
                -3,
                2,
              )
                .map((x) => x + poly.fonction(-3) + 3)
                .join('$, $')}$<br>
        $~=SOMME(B1${sp()}:${sp()}G1)$ donnerait la somme des valeurs situées au-dessus et vers la droite, soit dans cet ordre${sp()}: $${rangeMinMax(-3, 2).map((el) => rangeMinMax(el, 2).reduce((a, b) => a + b, 0))}$ .`
            : ''
        }`,
      ],
      style: 'alpha',
    })

    const sousListe2 = createList({
      items: [
        `Calculer l'image de $${x0}$ par la fonction $g$.`,
        `Calculer $g(${x1})$.`,
        `Déterminer l'antécédent de $${y0}$ par la fonction $g$.`,
        'Tracer, sur le graphique précédent, la représentation graphique de la fonction $g$.',
      ],
      style: 'alpha',
    })

    const antecedent = new FractionEtendue(y0 - b, a)
    const sousListe2Corr = createList({
      items: [
        `$g(${x0}) = ${a}\\times${ecritureParentheseSiNegatif(x0)}${ecritureAlgebrique(b)} = ${a * x0}${ecritureAlgebrique(b)}=${miseEnEvidence(a * x0 + b)}$ (point $A$).`,
        `$g(${x1}) = ${a}\\times${ecritureParentheseSiNegatif(x1)}${ecritureAlgebrique(b)}= ${a * x1}${ecritureAlgebrique(b)} = ${miseEnEvidence(a * x1 + b)}$ (point $B$).`,
        `On cherche $x$ tel que $g(x) = ${y0}$ et on résout alors $${a}\\times x ${ecritureAlgebrique(b)}= ${y0}$, et on obtient donc 
         ${
           a === 1
             ? `$x =${y0}${ecritureAlgebrique(-b)}= ${texNombre(antecedent.valeurDecimale, 0)}$.`
             : a === -1
               ? `$x=${-y0}${ecritureAlgebrique(b)}= ${texNombre(antecedent.valeurDecimale, 0)}$.`
               : `$x =\\dfrac{${y0}${ecritureAlgebrique(-b)}}{${a}} = ${antecedent.texFraction}` +
                 (antecedent.estIrreductible
                   ? '$.'
                   : `= ${antecedent.simplifie().texFraction}$.`)
         }<br>L'antécédent de $${y0}$ par la fonction $g$ est donc $${miseEnEvidence(antecedent.simplifie().texFraction)}$ et on note${sp()}: $g(${antecedent.simplifie().texFraction})=${y0}$.`,
        `Comme indiqué dans l'énoncé, $g$ est affine et sa représentation graphique est une droite. Cette droite passe par le point $A(${x0};${a * x0 + b})$ et le point $B(${x1};${a * x1 + b})$.<br>
        ${this.correctionDetaillee ? 'En effet, aux questions $2$.a et $2$.b, on a trouvé les coordonnées de ces deux points.<br>' : ''}${figureCorr}`,
      ],
      style: 'alpha',
    })

    const sousListe3 = createList({
      items: [
        `Développer et réduire l'expression $(x${ecritureAlgebrique(c)})(x${ecritureAlgebrique(d)})$.`,
        `Pour quelle(s) valeur(s) de $x$, a-t-on $f(x) = g(x)$${sp()}?`,
      ],
      style: 'alpha',
    })
    const sousListe3Corr = createList({
      items: [
        `$(x${ecritureAlgebrique(c)})(x${ecritureAlgebrique(d)}) = x^2${ecritureAlgebriqueSauf1(c)}x${ecritureAlgebriqueSauf1(d)}x${ecritureAlgebrique((c * d) / Math.abs(d))}\\times ${Math.abs(d)} = ${miseEnEvidence(`x^2${ecritureAlgebriqueSauf1(c + d)}x${ecritureAlgebrique(c * d)}`)}$`,
        `$f(x)= x^2${ecritureAlgebriqueSauf1(c + d)}x${ecritureAlgebrique(c * d)}$<br>
        $g(x)=${rienSi1(a)}x${ecritureAlgebrique(b)}$<br>
        Donc, $f(x)=g(x)$ équivaut à${sp()}: 
        $x^2${ecritureAlgebriqueSauf1(c + d)}x${ecritureAlgebrique(c * d)}=${rienSi1(a)}x${ecritureAlgebrique(b)}$.<br>
        Soit<br>$\\begin{aligned}x^2${ecritureAlgebriqueSauf1(c + d)}x${ecritureAlgebrique(c * d)}${ecritureAlgebriqueSauf1(-a)}x${ecritureAlgebrique(-b)}&=0\\\\
        x^2${ecritureAlgebrique(c * d - b)}&=0~\\text{( on réduit )}\\\\
        (x${ecritureAlgebrique(A.x)})(x${ecritureAlgebrique(-A.x)})&=0~\\text{( on factorise )}\\\\
        \\end{aligned}$<br>
        ${this.correctionDetaillee ? `Un produit est nul si l'un des facteurs est nul, soit${sp()}: $x${ecritureAlgebrique(A.x)}=0$ ou $x${ecritureAlgebrique(-A.x)}=0$.<br>` : ''}
        On en déduit que les solutions de l'équation $f(x) = g(x)$ sont $x=${miseEnEvidence(-A.x)}$ et $x=${miseEnEvidence(A.x)}$.<br>
         ${
           this.correctionDetaillee
             ? `On peut vérifier les solutions trouvées par lecture graphique en procédant ainsi${sp()}:<br>
        On a $f(x) = g(x)$ si la droite représentant la fonction $g$ et la courbe représentant la fonction $f$ ont des points d'intersection.<br>
        Sur le graphique ci-dessus, on voit que les points d'intersection sont le point $A$ et le point de coordonnées $(${-A.x};${a * -A.x + b})$.<br>
        On en déduit que les solutions de l'équation $f(x) = g(x)$ sont $x=${A.x}$ et $x=${-A.x}$.<br>
        Cette méthode est bien sûr approximative et ne remplace pas un calcul exact.`
             : ''
         }`,
      ],
      style: 'alpha',
    })

    const listePrincipale = createList({
      items: [
        sousListe1,
        `On considère la fonction affine $g$ définie par $g(x) = ${rienSi1(a)}x${ecritureAlgebrique(b)}$.${sousListe2}`,
        `L'expression de la fonction $f$ ci-dessus est $f(x) = (x${ecritureAlgebrique(c)})(x${ecritureAlgebrique(d)})$.${sousListe3}.`,
      ],
      style: 'nombres',
    })
    const listePrincipaleCorrection = createList({
      items: [sousListe1Corr, sousListe2Corr, sousListe3Corr],
      style: 'nombres',
    })

    this.enonce = listePrincipale
    this.correction = listePrincipaleCorrection
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(2, 1, 3, -1, -2, 3, 2)
  }

  versionAleatoire: () => void = () => {
    let d: number
    let c: number
    let a: number
    let n: number
    let b: number
    let x0: number
    let x1: number
    let num: number
    let y0: number
    do {
      d = randint(1, 3) * (this.sup2 ? choice([1, -1]) : 1)
      c = randint(1, 4, [d, -d])
      a = c + d
      n = randint(1, 2, [Math.sqrt(Math.abs(c * d))])
      b = c * d + n ** 2
      x0 = choice([n, -n])
      x1 = randint(1, 5, [n, -n]) * (this.sup2 ? choice([1, -1]) : 1)
      num = randint(1, 5, [-b, b]) * (this.sup2 ? choice([1, -1]) : 1)
      y0 = b + num
    } while (Math.abs(a) > 4)
    this.appliquerLesValeurs(a, b, c, d, x0, x1, y0)
  }
}
