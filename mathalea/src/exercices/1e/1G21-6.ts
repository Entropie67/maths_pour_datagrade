import { cercle } from '../../lib/2d/cercle'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { grille } from '../../lib/2d/Grille'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint, latex2d } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { bleuMathalea } from '../../lib/colors'
import { createList } from '../../lib/format/lists'
import {
  all,
  hasZeroMember,
  isEquation,
  isEquivalentEquation,
  stringEquals,
} from '../../lib/interactif/checks'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  ajouteChampTexteMathLive,
  remplisLesBlancs,
} from '../../lib/interactif/questionMathLive'
import { extraireRacineCarree } from '../../lib/outils/calculs'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf0,
  ecritureAlgebriqueSauf1,
  reduireAxPlusByPlusC,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'

import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const interactifReady = true

export const titre = 'Résoudre un problème de synthèse avec produit scalaire'

export const dateDePublication = '14/05/2026'

export const uuid = 'ec621'
export const refs = {
  'fr-fr': ['1G21-6'],
  'fr-ch': [],
}

function texRacineCarree(n: number): string {
  const [facteur, radicande] = extraireRacineCarree(n)
  if (radicande === 1) return String(facteur)
  if (facteur === 1) return `\\sqrt{${radicande}}`
  return `${facteur}\\sqrt{${radicande}}`
}

/**
 * @author Stéphane Guyon
 */
export default class NomExercice extends Exercice {
  constructor() {
    super()
    this.consigne = ''
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      // Huit champs par problème : le problème i occupe les indices 8i à 8i + 7.
      const champ0 = 8 * i
      const xA = randint(3, 6)
      const yI = randint(1, xA - 1)
      const cote = randint(xA + 1, xA + 4)
      let maxi: number = 0
      const xI = xA
      const diametre = randint(2, xA + 3)
      const produitScalaire = cote * yI
      const longueurOICarree = xA ** 2 + yI ** 2
      const longueurOITex = texRacineCarree(longueurOICarree)
      const longueurOH = Number.isInteger(Math.sqrt(longueurOICarree))
        ? new FractionEtendue(
            produitScalaire,
            Math.sqrt(longueurOICarree),
          ).simplifie().texFractionSimplifiee
        : `\\dfrac{${produitScalaire}}{\\sqrt{${longueurOICarree}}}`
      const xH = (produitScalaire * xI) / longueurOICarree
      const yH = (produitScalaire * yI) / longueurOICarree
      const xD = new FractionEtendue(xA, 2).simplifie()
      const yD = new FractionEtendue(xA, 2).simplifie()
      const texteJustifier = this.interactif ? '' : ' Justifier.'

      const rayon = new FractionEtendue(diametre, 2).simplifie()
      const rayonDecimal = diametre / 2
      if (xA > rayonDecimal) {
        maxi = xA + 2
      } else {
        maxi = diametre + 4
      }
      const rayonCarre = new FractionEtendue(diametre ** 2, 4).simplifie()
      const constanteCercle = new FractionEtendue(
        2 * xA ** 2 - diametre ** 2,
        4,
      ).simplifie()
      const pointsPossiblesM = Array.from({ length: 11 }, (_, indice) => {
        const parametre = indice - 5
        const x = -yI * parametre
        const y = cote + xA * parametre
        const valeurCercle =
          4 * (x ** 2 + y ** 2 - xA * x - xA * y) + 2 * xA ** 2 - diametre ** 2
        return { x, y, valeurCercle }
      })
      const pointM =
        pointsPossiblesM.find(({ valeurCercle }) => valeurCercle === 0) ??
        pointsPossiblesM.reduce((meilleurPoint, point) =>
          Math.abs(point.valeurCercle) < Math.abs(meilleurPoint.valeurCercle)
            ? point
            : meilleurPoint,
        )
      const xM = new FractionEtendue(pointM.x, 1).simplifie()
      const yM = new FractionEtendue(pointM.y, 1).simplifie()
      const valeurCercleM = new FractionEtendue(
        4 *
          (xM.valeurDecimale ** 2 +
            yM.valeurDecimale ** 2 -
            xA * xM.valeurDecimale -
            xA * yM.valeurDecimale) +
          2 * xA ** 2 -
          diametre ** 2,
        4,
      ).simplifie()
      const appartientCercle = valeurCercleM.s === 0
      const diviseurEquationDroiteCH = pgcd(xA, yI)
      const aDroiteCH = xA / diviseurEquationDroiteCH
      const bDroiteCH = yI / diviseurEquationDroiteCH
      const cDroiteCH = (-yI * cote) / diviseurEquationDroiteCH
      const valeurDroiteCHM = new FractionEtendue(
        xA * xM.valeurDecimale + yI * yM.valeurDecimale - yI * cote,
        diviseurEquationDroiteCH,
      ).simplifie()
      const appartientDroiteCH = valeurDroiteCHM.s === 0

      const O = pointAbstrait(0, 0, 'O', 'below left')
      const A = pointAbstrait(cote, 0, 'A', 'below right')
      const B = pointAbstrait(cote, cote, 'B', 'above right')
      const C = pointAbstrait(0, cote, 'C', 'above left')
      const I = pointAbstrait(xI, yI, 'I', 'right')
      const H = pointAbstrait(xH, yH, 'H', 'below')
      const D = pointAbstrait(
        xD.valeurDecimale,
        yD.valeurDecimale,
        'D',
        'above',
      )
      let reponse3c = ''
      if (appartientCercle && appartientDroiteCH) {
        reponse3c = 'O'
      } else {
        reponse3c = 'N'
      }
      const borneMin = -2
      const borneMax = maxi
      const objets = [
        grille(borneMin, borneMin, borneMax, borneMax, 'gray', 0.5, 1),
        repere({
          xMin: borneMin,
          xMax: borneMax,
          yMin: borneMin,
          yMax: borneMax,
          xUnite: 1,
          yUnite: 1,
          xLabelListe: [1, cote],
          yLabelListe: [1, cote],
        }),
        segment(0, 0, 1, 0, 'black', '->'),
        segment(0, 0, 0, 1, 'black', '->'),
        segment(O, A, bleuMathalea),
        segment(A, B, bleuMathalea),
        segment(B, C, bleuMathalea),
        segment(C, O, bleuMathalea),
        segment(C, H, bleuMathalea),
        segment(O, I, bleuMathalea),
        codageAngleDroit(C, H, I, bleuMathalea, 0.35),
        cercle(D, rayonDecimal, 'red', 'none', 'none', 1.5),
        tracePoint(A, B, C, I, H, D, 'red'),
        labelPoint(O, A, B, C, I, H, D),
        latex2d('\\vec{\\imath}', 0.5, -0.25, {}),
        latex2d('\\vec{\\jmath}', -0.35, 0.5, {}),
        latex2d(
          '\\varepsilon',
          xD.valeurDecimale + rayonDecimal - 0.3,
          yD.valeurDecimale + rayonDecimal - 0.3,
          {},
        ),
      ]
      const figure = mathalea2d(
        Object.assign({}, fixeBordures(objets), {
          xmin: borneMin,
          ymin: borneMin,
          xmax: borneMax,
          ymax: borneMax,
          pixelsParCm: 25,
          scale: cote <= 5 ? 0.9 : 0.65,
          mainlevee: false,
        }),
        objets,
      )

      const equationDroiteCH = `${reduireAxPlusByPlusC(aDroiteCH, bDroiteCH, cDroiteCH)}=0`
      const equationCercle = `x^2+y^2${ecritureAlgebriqueSauf1(-xA)}x${ecritureAlgebriqueSauf1(-xA)}y${constanteCercle.ecritureAlgebrique}=0`

      const question1 = createList({
        items: [
          'Déterminer les coordonnées des vecteurs $\\overrightarrow{OI}$ et $\\overrightarrow{OC}$.' +
            '<br>' +
            remplisLesBlancs(
              this,
              champ0,
              '\\overrightarrow{OI}\\begin{pmatrix}%{champ1}\\\\%{champ2}\\end{pmatrix}\\quad ;\\quad \\overrightarrow{OC}\\begin{pmatrix}%{champ3}\\\\%{champ4}\\end{pmatrix}',
            ),
          `En déduire le produit scalaire $\\overrightarrow{OI}\\cdot \\overrightarrow{OC}$.${ajouteChampTexteMathLive(this, champ0 + 1, KeyboardType.clavierDeBase, { texteAvant: '<br>$\\overrightarrow{OI}\\cdot \\overrightarrow{OC}=$ ' })}`,
        ],
        style: 'alpha',
      })
      const question2 = createList({
        items: [
          `Exprimer le produit scalaire $\\overrightarrow{OI}\\cdot \\overrightarrow{OC}$ en fonction des longueurs $OH$ et $OI$.<br> ${ajouteChampTexteMathLive(this, champ0 + 2, KeyboardType.clavierMajuscules + '  ' + KeyboardType.clavierFullOperations, { texteAvant: '<br>$\\overrightarrow{OI}\\cdot \\overrightarrow{OC}= $' })}`,
          `Calculer la longueur $OI$.${ajouteChampTexteMathLive(this, champ0 + 3, KeyboardType.equationsTerminale, { texteAvant: '<br>$OI=$ ' })}`,
          `En déduire la longueur $OH$.${ajouteChampTexteMathLive(this, champ0 + 4, KeyboardType.equationsTerminale, { texteAvant: '<br>$OH=$ ' })}`,
        ],
        style: 'alpha',
      })
      const question3 = createList({
        items: [
          `Déterminer une équation cartésienne de la droite $(CH)$.${ajouteChampTexteMathLive(this, champ0 + 5, KeyboardType.lyceeClassique, { texteAvant: `<br>Équation de $(CH)$${sp()}: ` })}`,
          `Déterminer l'équation du cercle $\\varepsilon$ sous forme développée. ${ajouteChampTexteMathLive(this, champ0 + 6, KeyboardType.lyceeClassique, { texteAvant: `<br>Équation développée de $\\varepsilon$${sp()}: ` })}`,
          `Le point $M\\left(${xM.texFractionSimplifiee}\\,;\\,${yM.texFractionSimplifiee}\\right)$ appartient-il à l'intersection du cercle $\\varepsilon$ et de la droite $(CH)$${sp()}?${texteJustifier}.${ajouteChampTexteMathLive(this, champ0 + 7, KeyboardType.vFON, { texteAvant: `<br>Répondre O ou N${sp()}: ` })}`,
        ],
        style: 'alpha',
      })

      const texte =
        `On considère la figure suivante, représentée dans un repère orthonormé $(O;\\,\\vec{\\imath},\\,\\vec{\\jmath})$.<br>${figure}<br><br>
        On dispose des données suivantes${sp()}:` +
        createList({
          items: [
            `Le quadrilatère $OABC$ est un carré de côté $${cote}$ ;`,
            `$A(${cote}\\,;\\,0)$, $B(${cote}\\,;\\,${cote})$, $C(0\\,;\\,${cote})$ et $I(${xI}\\,;\\,${yI})$ ;`,
            'Le point $H$ est le projeté orthogonal du point $C$ sur la droite $(OI)$ ;',
            `On note $\\varepsilon$ le cercle de centre $D\\left(${xD.texFractionSimplifiee}\\,;\\,${yD.texFractionSimplifiee}\\right)$ et de rayon $${rayon.texFractionSimplifiee}$.`,
          ],
          style: 'fleches',
        }) +
        createList({
          items: [question1, question2, question3],
          style: 'nombres',
        })
      const correction1a = `On a $I\\left(${xI};${yI}\\right)$ donc $\\overrightarrow{OI}\\begin{pmatrix}${miseEnEvidence(texNombre(xI, 1))}\\\\${miseEnEvidence(texNombre(yI, 1))}\\end{pmatrix}$.<br>
          De même, on a $C\\left(0;${cote}\\right)$ donc $\\overrightarrow{OC}\\begin{pmatrix}${miseEnEvidence('0')}\\\\${miseEnEvidence(texNombre(cote, 1))}\\end{pmatrix}$.`
      const correction1b = `On sait que dans un repère orthonormé, si on a $\\vec u\\begin{pmatrix}x\\\\y\\end{pmatrix}$ et $\\vec v\\begin{pmatrix}x'\\\\y'\\end{pmatrix}$, on a${sp()}: $\\vec u \\cdot \\vec v=xx' + yy'$.<br>
En conséquence,   $\\overrightarrow{OI}\\cdot \\overrightarrow{OC}=${xI}\\times 0${ecritureAlgebrique(yI)}\\times ${cote}=${miseEnEvidence(`${produitScalaire}`)}$.`
      const correction2a = `Le point $H$ est le projeté orthogonal du point $C$ sur la droite $(OI)$. En utilisant la définition du produit scalaire avec le projeté orthogonal sur la droite $(OI)$, on trouve que${sp()}:<br>
           $\\overrightarrow{OC}\\cdot \\overrightarrow{OI}=\\overrightarrow{OH}\\cdot \\overrightarrow{OI}$.<br>
          Les vecteurs $\\overrightarrow{OH}$ et $\\overrightarrow{OI}$ sont colinéaires et de même sens, donc $\\overrightarrow{OH}\\cdot \\overrightarrow{OI}=${miseEnEvidence('OI\\times OH')}$.<br>`
      const correction2b = `$\\overrightarrow{OI}\\begin{pmatrix}${xI}\\\\${yI}\\end{pmatrix}$, donc $OI=\\sqrt{${xI}^2+${yI}^2}=${miseEnEvidence(longueurOITex)}$.`
      const correction2c =
        `On a montré précédemment que${sp()}:` +
        createList({
          items: [
            `$\\overrightarrow{OI}\\cdot \\overrightarrow{OC}=OH\\times OI$`,
            `$\\overrightarrow{OI}\\cdot \\overrightarrow{OC}=${produitScalaire}$`,
            `$OI=${longueurOITex}$`,
          ],
          style: 'fleches',
        }) +
        `On en déduit que $OH\\times ${longueurOITex}=${produitScalaire}$, d'où $OH=${miseEnEvidence(longueurOH)}$.`
      const correction3a = `Le point $H$ est le projeté orthogonal de $C$ sur $(OI)$, donc les vecteurs $\\overrightarrow{OI}$ et $\\overrightarrow{CH}$ sont orthogonaux.<br>
          Le vecteur $\\overrightarrow{OI}\\begin{pmatrix}${xI}\\\\${yI}\\end{pmatrix}$ est donc un vecteur normal à la droite $(CH)$.<br>
          On sait que si un vecteur $\\vec n\\begin{pmatrix}a\\\\b\\end{pmatrix}$ est un vecteur normal à une droite, alors une équation de cette droite est de la forme $ax+by+c=0$, où $c$ est un nombre réel.<br>
          Une équation de $(CH)$ est donc de la forme $${reduireAxPlusByPlusC(xI, yI, 0)}+c=0$.<br>
          Le point $C(0\\,;\\,${cote})$ appartient à $(CH)$, donc $${xI}\\times 0${ecritureAlgebrique(yI)}\\times ${cote}+c=0$, soit $c=${-yI * cote}$.<br>
          ${diviseurEquationDroiteCH === 1 ? '' : `En divisant par $${diviseurEquationDroiteCH}$, `}
         Une équation cartésienne de la droite $(CH)$ est donc $${miseEnEvidence(equationDroiteCH)}$.`
      const correction3b = `On sait qu'un cercle de centre $I(a;b)$ et de rayon $r$ a pour équation${sp()}: $\\left(x-a\\right)^2+\\left(y-b\\right)^2=r^2$.<br>
          Le cercle $\\varepsilon$ de centre $D\\left(${xD.texFractionSimplifiee}\\,;\\,${yD.texFractionSimplifiee}\\right)$ et de rayon $${rayon.texFractionSimplifiee}$ a donc pour équation${sp()}:<br>
          $\\left(x-${xD.texFractionSimplifiee}\\right)^2+\\left(y-${yD.texFractionSimplifiee}\\right)^2=\\left(${rayon.texFractionSimplifiee}\\right)^2$.<br>
          En développant, on obtient $x^2${ecritureAlgebriqueSauf1(-xA)}x+${xD.produitFraction(xD).texFractionSimplifiee}+y^2${ecritureAlgebriqueSauf1(-xA)}y+${yD.produitFraction(yD).texFractionSimplifiee}-${rayonCarre.texFractionSimplifiee}=0$,<br>
          c'est-à-dire $${miseEnEvidence(equationCercle)}$.`
      const correction3c =
        `Pour vérifier si le point  $M\\left(${xM.texFractionSimplifiee}\\,;\\,${yM.texFractionSimplifiee}\\right)$ appartient à l'intersection de la droite $(CH)$ et du cercle $\\epsilon$, on teste ses coordonénes dans les deux équations${sp()}:<br>
             ` +
        createList({
          items: [
            ` $${aDroiteCH}\\times ${xM.ecritureParentheseSiNegatif}${ecritureAlgebriqueSauf0(bDroiteCH)}\\times ${yM.ecritureParentheseSiNegatif}${ecritureAlgebriqueSauf0(cDroiteCH)}=${valeurDroiteCHM.texFractionSimplifiee}$.<br>
              Donc $M${appartientDroiteCH ? '\\in' : '\\notin'} (CH)$.`,
            `$${xM.texFractionSimplifiee}${yM.ecritureAlgebrique}${ecritureAlgebriqueSauf1(-xA)}\\times ${xM.ecritureParentheseSiNegatif}${ecritureAlgebriqueSauf1(-xA)}\\times ${yM.ecritureParentheseSiNegatif}${constanteCercle.ecritureAlgebrique}=${valeurCercleM.texFractionSimplifiee}$.<br>
              Donc $M${appartientCercle ? '\\in' : '\\notin'} \\varepsilon$.`,
          ],
          style: 'fleches',
        }) +
        `Ainsi, $M\\left(${xM.texFractionSimplifiee}\\,;\\,${yM.texFractionSimplifiee}\\right)${appartientCercle && appartientDroiteCH ? '\\in' : '\\notin'} \\varepsilon\\cap (CH)$, donc la réponse est $${miseEnEvidence(reponse3c)}$.`
      const correction1 = createList({
        items: [correction1a, correction1b],
        style: 'alpha',
      })
      const correction2 = createList({
        items: [correction2a, correction2b, correction2c],
        style: 'alpha',
      })
      const correction3 = createList({
        items: [correction3a, correction3b, correction3c],
        style: 'alpha',
      })

      const texteCorr = createList({
        items: [correction1, correction2, correction3],
        style: 'nombres',
      })

      if (this.questionJamaisPosee(i, xA, yI)) {
        handleAnswers(this, champ0, {
          champ1: { value: texNombre(xI, 1) },
          champ2: { value: texNombre(yI, 1) },
          champ3: { value: '0' },
          champ4: { value: texNombre(cote, 1) },
        })
        handleAnswers(this, champ0 + 1, {
          reponse: { value: produitScalaire },
        })
        handleAnswers(this, champ0 + 2, {
          reponse: { value: 'OI\\times OH' },
        })
        handleAnswers(this, champ0 + 3, {
          reponse: { value: longueurOITex },
        })
        handleAnswers(this, champ0 + 4, {
          reponse: { value: longueurOH },
        })
        handleAnswers(this, champ0 + 5, {
          reponse: {
            value: equationDroiteCH,
            compare: all([
              isEquation(),
              isEquivalentEquation(),
              hasZeroMember(),
            ]),
          },
        })
        handleAnswers(this, champ0 + 6, {
          reponse: {
            value: equationCercle,
            compare: all([
              isEquation(),
              isEquivalentEquation(),
              hasZeroMember(),
            ]),
          },
        })
        handleAnswers(this, champ0 + 7, {
          reponse: {
            value: reponse3c,
            compare: all([stringEquals({ ignoreCase: true, trim: true })]),
          },
        })
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
