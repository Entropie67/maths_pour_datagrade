import { codageAngle } from '../../lib/2d/angles'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { codageSegments } from '../../lib/2d/CodageSegment'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { nommePolygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { triangle2points2angles } from '../../lib/2d/triangles'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Déterminer la valeur d'un angle en utilisant la somme des angles dans un triangle"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDeModifImportante = '06/04/2025'
/* Modif du 23/08/2023 par EE :
Passage en interactif
Figure facultative pour chaque question
Figure systématique dans la correction de chaque question
Mise en couleur de la réponse finale
Uniformisation de chaque question dans sa forme
Passage d'un paramètre facile/difficile à un paramètre reprenant exhaustivement chaque type de question
Correction de quelques coquilles
*/

/**
 * Déterminer la valeur d'un angle dans un triangle.
 *
 * Correction avec détails ou pas. 13 cas différents
 * * On connaît 2 angles sur 3.
 * * Dans un triangle rectangle, on connaît un angle aigu.
 * * Dans un triangle isocèle, on connaît un angle à la base.
 * * Dans un triangle isocèle, on connaît l'angle au sommet principal.
 * * Quelle est la mesure d'un angle aigu dans un triangle rectangle qui a 2 angles égaux ?
 * * Dans un triangle rectangle, un angle aigu mesure le double de l'autre.
 * * Dans un triangle rectangle, un angle aigu mesure le quart de l'autre.
 * * Dans un triangle rectangle, un angle aigu mesure 5 fois l'autre.
 * * Un triangle a 3 angles égaux.
 * * Dans un triangle rectangle, un angle mesure le tiers de l'autre.
 * @author Jean-claude Lhote
 * Ajout de schémas aux questions "faciles" par Guillaume Valmont le 04/03/2023

 */
export const uuid = 'dc8c9'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': ['NR'],
}
const troisiemeAngle = function (a1: number, a2: number) {
  if (a1 + a2 <= 180) {
    return 180 - (a1 + a2)
  } else {
    return -1
  }
}
export default class ExerciceAnglesTrianglesOld extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Situations différentes',
      [
        'Nombres séparés par des tirets  :',
        '1 : Triangle quelconque avec deux angles aigus connus',
        '2 : Triangle rectangle avec un angle aigu connu',
        '3 : Triangle isocèle avec un angle à la base connu',
        '4 : Triangle rectangle isocèle',
        '5 : Triangle équilatéral',
        "6 : Triangle rectangle avec un angle aigu double de l'autre (*)",
        "7 : Triangle rectangle avec un angle aigu quart de l'autre (*)",
        "8 : Triangle rectangle avec un angle aigu quintuple de l'autre (*)",
        "9 : Triangle rectangle avec un angle aigu tiers de l'autre (*)",
        "10 : Triangle rectangle avec un angle aigu deux tiers de l'autre (*)",
        "11 : Triangle isocèle avec un angle aigu double de l'autre (*)",
        "12 : Triangle isocèle avec l'angle au sommet principal connu (*)",
        '13 : Mélange',
        '14: Triangle quelconque avec un angle obtus et un angle aigu connus',
        '(*) : Question plus difficile',
      ].join('\n'),
    ]
    this.besoinFormulaire2CaseACocher = ['Ajouter un schéma aux questions']
    this.besoinFormulaire3CaseACocher = [
      "Dans l'ordre des situations différentes",
    ]
    this.besoinFormulaire4Texte = [
      'Précision des angles',
      [
        'Nombres séparés par des tirets  :',
        '1 : angles définis au degré près',
        '2 : angles multiples de 5°',
        '3 : angles multiples de 10°',
      ].join('\n'),
    ]
    this.sup = '1-2-3-4-5'
    this.sup2 = false
    this.sup3 = true
    this.sup4 = '1'
    this.spacingCorr = context.isHtml ? 2 : 1.5
    this.spacing = 2
    this.nbQuestions = 5
    this.correctionDetailleeDisponible = true
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 14,
      melange: 13,
      defaut: 13,
      nbQuestions: this.nbQuestions,
      shuffle: !this.sup3,
    })
    const listePrecision = gestionnaireFormulaireTexte({
      saisie: this.sup4,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 1,
      nbQuestions: this.nbQuestions,
      // shuffle: !this.sup3,
    })
    let lettre1, lettre2, lettre3, s1, s2, s3, angle1, angle2
    let indiceSetReponse = 0
    for (
      let i = 0, texte, texteCorr, texteCorrFinal, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const objetsEnonce = []
      const objetsCorrection = []
      let reponseInteractive: number[] = []
      const nomAngles = []
      let choixAngle = shuffle([0, 1, 2]) // Cas général de devoir trouver trois angles
      lettre1 = randint(1, 26) // aleatoirisation du nom des points
      lettre2 = randint(1, 26, [lettre1])
      s1 = lettreDepuisChiffre(lettre1)
      s2 = lettreDepuisChiffre(lettre2)
      lettre3 = randint(1, 24, [lettre1, lettre2])
      s3 = lettreDepuisChiffre(lettre3)
      const A = pointAbstrait(randint(0, 2), 0, s1)
      const B =
        listeTypeDeQuestions[i] === 8
          ? pointAbstrait(randint(1, 4), randint(4, 6), s2)
          : pointAbstrait(randint(1, 5), randint(8, 10), s2)
      let triangle, C, angleA, angleB, angleC
      texteCorrFinal = ''
      texteCorr = ''

      switch (listeTypeDeQuestions[i]) {
        case 1: // triangle quelconque 2 angles connus et aigus
          choixAngle = [0]
          nomAngles.push(s2 + s3 + s1)
          do {
            angle1 = randint(20, 40)
            angle2 = randint(20, 100)
          } while (angle1 + angle2 < 60)
          if (listePrecision[i] === 2) {
            angle1 = 5 * Math.round(angle1 / 5)
            angle2 = 5 * Math.round(angle2 / 5)
          } else if (listePrecision[i] === 3) {
            angle1 = 10 * Math.round(angle1 / 10)
            angle2 = 10 * Math.round(angle2 / 10)
          }
          texte = `$${s1 + s2 + s3}$ est un triangle quelconque. L'angle $\\widehat{${s1 + s2 + s3}}$ mesure $${angle1}^\\circ$ et l'angle $\\widehat{${s2 + s1 + s3}}$ mesure $${angle2}^\\circ$.<br>Quelle est la mesure de l'angle $\\widehat{${s2 + s3 + s1}}$ ?`
          triangle = triangle2points2angles(A, B, angle2, angle1)
          C = triangle.listePoints[2]
          C.nom = s3
          objetsEnonce.push(triangle, nommePolygone(triangle))
          objetsCorrection.push(triangle, nommePolygone(triangle))
          angleA = codageAngle(
            B,
            A,
            angle2,
            1,
            '',
            bleuMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          angleB = codageAngle(
            A,
            B,
            -angle1,
            1,
            '',
            bleuMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          objetsEnonce.push(angleA, angleB)
          angleA = codageAngle(
            B,
            A,
            angle2,
            0.7,
            '',
            bleuMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          angleB = codageAngle(
            A,
            B,
            -angle1,
            0.7,
            '',
            bleuMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          angleC = codageAngle(
            A,
            C,
            180 - angle2 - angle1,
            1,
            '',
            orangeMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          objetsCorrection.push(angleA, angleB, angleC)
          if (this.correctionDetaillee) {
            texteCorr +=
              'Dans un triangle, la somme des angles est égale à $180^\\circ$.<br>'
            texteCorr += `D'où : $\\widehat{${s1 + s2 + s3}} + \\widehat{${s2 + s3 + s1}} + \\widehat{${s2 + s1 + s3}}=180^\\circ$.<br>`
            texteCorr += `D'où : $\\widehat{${s2 + s3 + s1}}=180- \\left(\\widehat{${s1 + s2 + s3}} + \\widehat{${s2 + s1 + s3}}\\right)$.<br>D'où : `
          }
          texteCorr += `$\\widehat{${s2 + s3 + s1}}= 180^\\circ-\\left(${angle1}^\\circ+${angle2}^\\circ\\right)=180^\\circ-${angle1 + angle2}^\\circ=${troisiemeAngle(angle1, angle2)}^\\circ$.<br>`
          texteCorr += `L'angle $${miseEnEvidence('\\widehat{' + s2 + s3 + s1 + '}', 'black')}$ mesure $${miseEnEvidence(troisiemeAngle(angle1, angle2))}^\\circ$.`
          reponseInteractive = [troisiemeAngle(angle1, angle2)]
          break
        case 14: // triangle quelconque 2 angles connus dont un obtus
          choixAngle = [0]
          nomAngles.push(s2 + s3 + s1)
          angle1 = randint(20, 40)
          angle2 = randint(95, 180 - angle1 - 20)
          if (listePrecision[i] === 2) {
            angle1 = 5 * Math.round(angle1 / 5)
            angle2 = 5 * Math.round(angle2 / 5)
          } else if (listePrecision[i] === 3) {
            angle1 = 10 * Math.round(angle1 / 10)
            angle2 = 10 * Math.round(angle2 / 10)
          }
          texte = `$${s1 + s2 + s3}$ est un triangle quelconque. L'angle $\\widehat{${s1 + s2 + s3}}$ mesure $${angle1}^\\circ$ et l'angle $\\widehat{${s2 + s1 + s3}}$ mesure $${angle2}^\\circ$.<br>Quelle est la mesure de l'angle $\\widehat{${s2 + s3 + s1}}$ ?`
          triangle = triangle2points2angles(A, B, angle2, angle1)
          C = triangle.listePoints[2]
          C.nom = s3
          objetsEnonce.push(triangle, nommePolygone(triangle))
          objetsCorrection.push(triangle, nommePolygone(triangle))
          angleA = codageAngle(
            B,
            A,
            angle2,
            1,
            '',
            bleuMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          angleB = codageAngle(
            A,
            B,
            -angle1,
            1,
            '',
            bleuMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          objetsEnonce.push(angleA, angleB)
          angleA = codageAngle(
            B,
            A,
            angle2,
            0.7,
            '',
            bleuMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          angleB = codageAngle(
            A,
            B,
            -angle1,
            0.7,
            '',
            bleuMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          angleC = codageAngle(
            A,
            C,
            180 - angle2 - angle1,
            1,
            '',
            orangeMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          objetsCorrection.push(angleA, angleB, angleC)
          if (this.correctionDetaillee) {
            texteCorr +=
              'Dans un triangle, la somme des angles est égale à $180^\\circ$.<br>'
            texteCorr += `D'où : $\\widehat{${s1 + s2 + s3}} + \\widehat{${s2 + s3 + s1}} + \\widehat{${s2 + s1 + s3}}=180^\\circ$.<br>`
            texteCorr += `D'où : $\\widehat{${s2 + s3 + s1}}=180- \\left(\\widehat{${s1 + s2 + s3}} + \\widehat{${s2 + s1 + s3}}\\right)$.<br>D'où : `
          }
          texteCorr += `$\\widehat{${s2 + s3 + s1}}= 180^\\circ-\\left(${angle1}^\\circ+${angle2}^\\circ\\right)=180^\\circ-${angle1 + angle2}^\\circ=${troisiemeAngle(angle1, angle2)}^\\circ$.<br>`
          texteCorr += `L'angle $${miseEnEvidence('\\widehat{' + s2 + s3 + s1 + '}', 'black')}$ mesure $${miseEnEvidence(troisiemeAngle(angle1, angle2))}^\\circ$.`
          reponseInteractive = [troisiemeAngle(angle1, angle2)]
          break
        case 2: // Triangle rectangle Un angle aigu connu
          choixAngle = [0]
          nomAngles.push(s2 + s3 + s1)
          angle1 = 90
          angle2 = randint(20, 70)
          if (listePrecision[i] === 2) {
            angle2 = 5 * Math.round(angle2 / 5)
          } else if (listePrecision[i] === 3) {
            angle2 = 10 * Math.round(angle2 / 10)
          }
          texte = `$${s1 + s2 + s3}$ est un triangle rectangle en $${s2}$ et l'angle $\\widehat{${s2 + s1 + s3}}$ mesure $${angle2}^\\circ$.<br>Quelle est la mesure de l'angle $\\widehat{${s2 + s3 + s1}}$ ?`
          triangle = triangle2points2angles(A, B, angle2, angle1)
          C = triangle.listePoints[2]
          C.nom = s3
          objetsEnonce.push(triangle, nommePolygone(triangle))
          objetsCorrection.push(triangle, nommePolygone(triangle))
          angleA = codageAngle(
            B,
            A,
            C,
            1,
            '',
            bleuMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          angleB = codageAngleDroit(A, B, C, bleuMathalea, 1, 1.5)
          objetsEnonce.push(angleA, angleB)
          angleA = codageAngle(
            B,
            A,
            C,
            1,
            '',
            bleuMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          angleC = codageAngle(
            A,
            C,
            B,
            1,
            '',
            orangeMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          objetsCorrection.push(angleA, angleB, angleC)
          if (this.correctionDetaillee) {
            texteCorr += `Le triangle $${s1 + s2 + s3}$ étant rectangle en $${s2}$, les angles $\\widehat{${s2 + s1 + s3}}$ et $\\widehat{${s2 + s3 + s1}}$ sont complémentaires (leur somme est égale à $90^\\circ$).<br>`
            texteCorr += `D'où : $\\widehat{${s2 + s3 + s1}}+ \\widehat{${s2 + s1 + s3}}=90^\\circ$<br>D'où : `
          }
          texteCorr += `$\\widehat{${s2 + s3 + s1}}=90^\\circ-${angle2}^\\circ=${90 - angle2}^\\circ$<br>`
          texteCorr += `L'angle $${miseEnEvidence('\\widehat{' + s2 + s3 + s1 + '}', 'black')}$ mesure $${miseEnEvidence(90 - angle2)}^\\circ$.`
          reponseInteractive = [90 - angle2]
          break
        case 12: // triangle isocèle, angle au sommet principal connu
          choixAngle = [0]
          nomAngles.push(s2 + s3 + s1)
          angle1 = 2 * randint(15, 75)
          if (listePrecision[i] === 2) {
            angle1 = 10 * Math.round(angle1 / 10)
          } else if (listePrecision[i] === 3) {
            angle1 = 20 * Math.round(angle1 / 20)
          }
          angle2 = (180 - angle1) / 2
          texte = `$${s1 + s2 + s3}$ est un triangle isocèle en $${s2}$. L'angle $\\widehat{${s1 + s2 + s3}}$ mesure $${angle1}^\\circ$.<br>Quelle est la mesure de l'angle $\\widehat{${s2 + s3 + s1}}$ ?`
          triangle = triangle2points2angles(A, B, angle2, angle1)
          C = triangle.listePoints[2]
          C.nom = s3
          objetsEnonce.push(
            triangle,
            nommePolygone(triangle),
            codageSegments(
              '||',
              bleuMathalea,
              segment(triangle.listePoints[1], triangle.listePoints[2]),
              segment(triangle.listePoints[1], triangle.listePoints[0]),
              2,
            ),
          )
          objetsCorrection.push(
            triangle,
            nommePolygone(triangle),
            codageSegments(
              '||',
              bleuMathalea,
              segment(triangle.listePoints[1], triangle.listePoints[2]),
              segment(triangle.listePoints[1], triangle.listePoints[0]),
              2,
            ),
          )
          angleB = codageAngle(
            A,
            B,
            -angle1,
            1,
            '',
            bleuMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          angleB.echelleMark = 2
          objetsEnonce.push(angleB)
          angleA = codageAngle(
            B,
            A,
            angle2,
            1,
            '',
            orangeMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          angleA.angleArrondi = 1
          angleB = codageAngle(
            A,
            B,
            -angle1,
            1,
            '',
            bleuMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          angleC = codageAngle(
            A,
            C,
            180 - angle2 - angle1,
            1,
            '',
            orangeMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          angleC.angleArrondi = 1
          objetsCorrection.push(angleA, angleB, angleC)
          if (this.correctionDetaillee) {
            texteCorr +=
              "Les angles à la base d'un triangle isocèle sont de même mesure.<br>"
            texteCorr += `D'où : $\\widehat{${s2 + s1 + s3}}=\\widehat{${s2 + s3 + s1}}$.<br>`
            texteCorr +=
              'Or, dans un triangle, la somme des angles est égale à $180^\\circ$.<br>'
            texteCorr += `D'où : $\\widehat{${s1 + s2 + s3}}+ \\widehat{${s2 + s3 + s1}}+ \\widehat{${s2 + s1 + s3}}=180^\\circ$.<br>`
            texteCorr += `D'où : $\\widehat{${s1 + s2 + s3}}+2\\times  \\widehat{${s2 + s3 + s1}}=180^\\circ$.<br>`
            texteCorr += `Soit  $${angle1}^\\circ+2\\times  \\widehat{${s2 + s3 + s1}}=180^\\circ$.<br>`
            texteCorr += `D'où $2\\times  \\widehat{${s2 + s3 + s1}}=180^\\circ-${angle1}^\\circ$.<br>D'où `
          }
          texteCorr += `$\\widehat{${s2 + s3 + s1}}=\\left(180^\\circ-${angle1}^\\circ\\right)\\div  2=${180 - angle1}^\\circ\\div  2=${texNombre((180 - angle1) / 2)}^\\circ$<br>`
          texteCorr += `L'angle $${miseEnEvidence('\\widehat{' + s2 + s3 + s1 + '}', 'black')}$ mesure $${miseEnEvidence(texNombre((180 - angle1) / 2))}^\\circ$.`
          reponseInteractive = [arrondi((180 - angle1) / 2, 1)]
          break
        case 3: // triangle isocèle, angle à la base connu
          choixAngle = [0]
          nomAngles.push(s2 + s3 + s1)
          angle2 = randint(30, 60, [90])
          if (listePrecision[i] === 2) {
            angle2 = 5 * Math.round(angle2 / 5)
          } else if (listePrecision[i] === 3) {
            angle2 = 10 * Math.round(angle2 / 10)
          }
          angle1 = angle2
          texte = `$${s1 + s2 + s3}$ est un triangle isocèle en $${s3}$. L'angle $\\widehat{${s1 + s2 + s3}}$ mesure $${angle1}^\\circ$.<br>Quelle est la mesure de l'angle $\\widehat{${s2 + s3 + s1}}$ ?`
          triangle = triangle2points2angles(A, B, angle2, angle1)
          C = triangle.listePoints[2]
          C.nom = s3
          objetsEnonce.push(
            triangle,
            nommePolygone(triangle),
            codageSegments(
              '||',
              bleuMathalea,
              segment(triangle.listePoints[1], triangle.listePoints[2]),
              segment(triangle.listePoints[2], triangle.listePoints[0]),
              2,
            ),
          )
          objetsCorrection.push(
            triangle,
            nommePolygone(triangle),
            codageSegments(
              '||',
              bleuMathalea,
              segment(triangle.listePoints[1], triangle.listePoints[2]),
              segment(triangle.listePoints[2], triangle.listePoints[0]),
              2,
            ),
          )
          angleB = codageAngle(
            A,
            B,
            -angle1,
            1,
            '',
            bleuMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          angleB.echelleMark = 2
          objetsEnonce.push(angleB)
          angleA = codageAngle(
            B,
            A,
            angle2,
            1,
            '',
            bleuMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          angleB = codageAngle(
            A,
            B,
            -angle1,
            1,
            '',
            bleuMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          angleC = codageAngle(
            A,
            C,
            180 - angle2 - angle1,
            1,
            '',
            orangeMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          objetsCorrection.push(angleA, angleB, angleC)
          if (this.correctionDetaillee) {
            texteCorr +=
              "Les deux angles à la base d'un triangle isocèle sont égaux.<br>"
            texteCorr += `Donc $\\widehat{${s1 + s2 + s3}}=\\widehat{${s2 + s1 + s3}}=${angle2}^\\circ$.<br>`
            texteCorr +=
              "Or, dans un triangle, la somme des angles est égale à $180^\\circ$.<br>D'où : "
          }
          texteCorr += `$\\widehat{${s2 + s3 + s1}}=180^\\circ-2\\times ${angle2}^\\circ=180^\\circ-${2 * angle2}^\\circ=${180 - 2 * angle2}^\\circ$.<br>`
          texteCorr += `L'angle $${miseEnEvidence('\\widehat{' + s2 + s3 + s1 + '}', 'black')}$ mesure $${miseEnEvidence(180 - 2 * angle2)}^\\circ$.`
          reponseInteractive = [180 - 2 * angle2]
          break
        case 4: // cas non aléatoire triangle rectangle isocèle
          choixAngle = [0]
          nomAngles.push(s1 + s3 + s2)
          texte = `$${s1 + s2 + s3}$ est un triangle rectangle en $${s1}$ et $\\widehat{${s1 + s3 + s2}}=\\widehat{${s1 + s2 + s3}}$.<br>Quelle est la mesure de l'angle $\\widehat{${s1 + s3 + s2}}$ ?`
          angle1 = 45
          angle2 = 90
          triangle = triangle2points2angles(A, B, angle2, angle1)
          C = triangle.listePoints[2]
          C.nom = s3
          objetsEnonce.push(triangle, nommePolygone(triangle))
          objetsCorrection.push(triangle, nommePolygone(triangle))
          angleA = codageAngleDroit(B, A, C, bleuMathalea, 1, 1.5)
          angleA.echelleMark = 2
          angleB = codageAngle(A, B, C, 1, '|', bleuMathalea, 2)
          angleB.echelleMark = 2
          angleC = codageAngle(A, C, B, 1, '|', bleuMathalea, 2)
          angleC.echelleMark = 2
          objetsEnonce.push(angleA, angleB, angleC)
          angleB = codageAngle(
            A,
            B,
            -angle1,
            0.8,
            '',
            orangeMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          angleC = codageAngle(
            A,
            C,
            angle1,
            0.8,
            '',
            orangeMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          angleB.angleArrondi = 0
          angleC.angleArrondi = 0
          objetsCorrection.push(angleA, angleB, angleC)
          texteCorr += `$\\widehat{${s1 + s3 + s2}}=\\widehat{${s1 + s2 + s3}}$.<br>`
          if (this.correctionDetaillee) {
            texteCorr +=
              'Or, dans un triangle, la somme des angles est égale à $180^\\circ$.<br>'
            texteCorr += `D'où : $2 \\times  \\widehat{${s1 + s3 + s2}} + 90^\\circ=180^\\circ$.<br>`
            texteCorr += `D'où : $2 \\times  \\widehat{${s1 + s3 + s2}}=180^\\circ-90^\\circ=90^\\circ$.<br>`
          } else {
            texteCorr += `D'où : $2 \\times  \\widehat{${s1 + s3 + s2}} + 90^\\circ=180^\\circ$.<br>`
          }
          texteCorr += `D'où : $\\widehat{${s1 + s3 + s2}}=90^\\circ \\div  2=45^\\circ$.<br>`
          texteCorr += `L'angle $${miseEnEvidence('\\widehat{' + s1 + s3 + s2 + '}', 'black')}$ mesure $${miseEnEvidence('45')}^\\circ$.`
          reponseInteractive = [45]
          break
        case 6: // cas non aléatoire triangle rectangle 30,60,90
          choixAngle = shuffle([0, 1])
          nomAngles.push(s1 + s3 + s2, s1 + s2 + s3)
          texte = `$${s1 + s2 + s3}$ est un triangle rectangle en $${s1}$. L'angle $\\widehat{${s1 + s2 + s3}}$ mesure le double de l'angle $\\widehat{${s1 + s3 + s2}}$.<br>`
          texte += `Quelles sont les mesures respectives des angles $\\widehat{${nomAngles[choixAngle[0]]}}$ et $\\widehat{${nomAngles[choixAngle[1]]}}$ ?`
          angle1 = 60
          angle2 = 90
          triangle = triangle2points2angles(A, B, angle2, angle1)
          C = triangle.listePoints[2]
          C.nom = s3
          objetsEnonce.push(triangle, nommePolygone(triangle))
          objetsCorrection.push(triangle, nommePolygone(triangle))
          angleA = codageAngleDroit(B, A, C, bleuMathalea, 1, 1.5)
          angleA.echelleMark = 2
          angleB = codageAngle(A, B, C, 1, '||', bleuMathalea, 2)
          angleB.echelleMark = 2
          angleC = codageAngle(A, C, B, 1, '|', bleuMathalea, 1.5)
          angleC.echelleMark = 2
          objetsEnonce.push(angleA, angleB, angleC)
          angleB = codageAngle(
            A,
            B,
            -angle1,
            0.8,
            '',
            orangeMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          angleC = codageAngle(
            A,
            C,
            angle2,
            0.8,
            '',
            orangeMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          angleB.angleArrondi = 0
          angleC.angleArrondi = 0
          objetsCorrection.push(angleA, angleB, angleC)
          texteCorr += `$\\widehat{${s1 + s2 + s3}}=2\\times \\widehat{${s1 + s3 + s2}}$.<br>`
          if (this.correctionDetaillee) {
            texteCorr += `De plus, le triangle $${s1 + s2 + s3}$ étant rectangle en $${s1}$, les angles $\\widehat{${s1 + s3 + s2}}$ et $\\widehat{${s1 + s2 + s3}}$ sont complémentaires (leur somme est égale à $90^\\circ$).<br>`
            texteCorr += `D'où : $2 \\times  \\widehat{${s1 + s3 + s2}} + \\widehat{${s1 + s3 + s2}}=90^\\circ$.<br>`
            texteCorr += `D'où :  $3 \\times  \\widehat{${s1 + s3 + s2}}=90^\\circ$.<br>`
          }
          texteCorr += `D'où : $\\widehat{${s1 + s3 + s2}}=90^\\circ \\div  3=30^\\circ$.<br>`
          texteCorr += `$\\widehat{${s1 + s2 + s3}}=2\\times \\widehat{${s1 + s3 + s2}}=2\\times  30^\\circ=60^\\circ$<br>`
          texteCorr += `L'angle $${miseEnEvidence('\\widehat{' + s1 + s3 + s2 + '}', 'black')}$ mesure $${miseEnEvidence('30')}^\\circ$ et l'angle $${miseEnEvidence('\\widehat{' + s1 + s2 + s3 + '}', 'black')}$ mesure $${miseEnEvidence('60')}^\\circ$.`
          reponseInteractive = [30, 60]
          break
        case 7: // cas non aléatoires triangle rectangle 18,72,90
          choixAngle = shuffle([0, 1])
          nomAngles.push(s1 + s3 + s2, s1 + s2 + s3)
          texte = `$${s1 + s2 + s3}$ est un triangle rectangle en $${s1}$. L'angle $\\widehat{${s1 + s2 + s3}}$ mesure le quart de l'angle $\\widehat{${s1 + s3 + s2}}$.<br>`
          texte += `Quelles sont les mesures respectives des angles $\\widehat{${nomAngles[choixAngle[0]]}}$ et $\\widehat{${nomAngles[choixAngle[1]]}}$ ?`
          angle1 = 18
          angle2 = 90
          triangle = triangle2points2angles(A, B, angle2, angle1)
          C = triangle.listePoints[2]
          C.nom = s3
          objetsEnonce.push(triangle, nommePolygone(triangle))
          objetsCorrection.push(triangle, nommePolygone(triangle))
          angleA = codageAngleDroit(B, A, C, bleuMathalea, 1, 1.5)
          angleA.echelleMark = 2
          angleB = codageAngle(A, B, C, 1, '|', bleuMathalea, 2)
          angleB.echelleMark = 2
          angleC = codageAngle(A, C, B, 1, '||||', bleuMathalea, 1.5)
          angleC.echelleMark = 2
          objetsEnonce.push(angleA, angleB, angleC)
          angleB = codageAngle(
            A,
            B,
            -angle1,
            0.8,
            '',
            orangeMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          angleC = codageAngle(
            A,
            C,
            180 - angle2 - angle1,
            0.8,
            '',
            orangeMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          angleB.angleArrondi = 1
          angleC.angleArrondi = 1
          objetsCorrection.push(angleA, angleB, angleC)
          texteCorr += `Comme $\\widehat{${s1 + s2 + s3}}=\\dfrac{\\widehat{${s1 + s3 + s2}}}{4}$, on en déduit que $\\widehat{${s1 + s3 + s2}}=4\\times \\widehat{${s1 + s2 + s3}}$.<br>`
          if (this.correctionDetaillee) {
            texteCorr += `De plus, le triangle $${s1 + s2 + s3}$ étant rectangle en $${s1}$, les angles $\\widehat{${s1 + s3 + s2}}$ et $\\widehat{${s1 + s2 + s3}}$ sont complémentaires (leur somme est égale à $90^\\circ$).<br>`
            texteCorr += `D'où : $4 \\times  \\widehat{${s1 + s2 + s3}} + \\widehat{${s1 + s2 + s3}}=90^\\circ$.<br>D'où `
            texteCorr += ` $5 \\times  \\widehat{${s1 + s2 + s3}}=90^\\circ$.<br>D'où `
          }
          texteCorr += `$\\widehat{${s1 + s2 + s3}}=90^\\circ \\div  5=18^\\circ$.<br>`
          texteCorr += `$\\widehat{${s1 + s3 + s2}}=4\\times \\widehat{${s1 + s2 + s3}}=4\\times  18^\\circ=72^\\circ$.<br>`
          texteCorr += `L'angle $${miseEnEvidence('\\widehat{' + s1 + s3 + s2 + '}', 'black')}$ mesure $${miseEnEvidence('72')}^\\circ$ et l'angle $${miseEnEvidence('\\widehat{' + s1 + s2 + s3 + '}', 'black')}$ mesure $${miseEnEvidence('18')}^\\circ$.`
          reponseInteractive = [72, 18]
          break
        case 8: // cas non aléatoires triangle rectangle 15,75,90
          choixAngle = shuffle([0, 1])
          nomAngles.push(s1 + s3 + s2, s1 + s2 + s3)
          texte = `$${s1 + s2 + s3}$ est un triangle rectangle en $${s1}$. L'angle $\\widehat{${s1 + s2 + s3}}$ est cinq fois plus grand que l'angle $\\widehat{${s1 + s3 + s2}}$.<br>`
          texte += `Quelles sont les mesures respectives des angles $\\widehat{${nomAngles[choixAngle[0]]}}$ et $\\widehat{${nomAngles[choixAngle[1]]}}$ ?`
          angle1 = 75
          angle2 = 90
          triangle = triangle2points2angles(A, B, angle2, angle1)
          C = triangle.listePoints[2]
          C.nom = s3
          objetsEnonce.push(triangle, nommePolygone(triangle))
          objetsCorrection.push(triangle, nommePolygone(triangle))
          angleA = codageAngleDroit(B, A, C, bleuMathalea, 1, 1.5)
          angleA.echelleMark = 2
          angleB = codageAngle(A, B, C, 1, '|||||', bleuMathalea, 2)
          angleB.echelleMark = 2
          angleC = codageAngle(A, C, B, 1, '|', bleuMathalea, 2)
          angleC.echelleMark = 2
          objetsEnonce.push(angleA, angleB, angleC)
          angleB = codageAngle(
            A,
            B,
            -angle1,
            0.8,
            '',
            orangeMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          angleC = codageAngle(
            A,
            C,
            180 - angle2 - angle1,
            0.8,
            '',
            orangeMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          angleB.angleArrondi = 1
          angleC.angleArrondi = 1
          objetsCorrection.push(angleA, angleB, angleC)
          texteCorr += `$\\widehat{${s1 + s2 + s3}}=5\\times \\widehat{${s1 + s3 + s2}}$.<br>`
          if (this.correctionDetaillee) {
            texteCorr += `De plus, le triangle $${s1 + s2 + s3}$ étant rectangle en $${s1}$, les angles $\\widehat{${s1 + s3 + s2}}$ et $\\widehat{${s1 + s2 + s3}}$ sont complémentaires (leur somme est égale à $90^\\circ$).<br>`
            texteCorr += `D'où : $5 \\times  \\widehat{${s1 + s3 + s2}} + \\widehat{${s1 + s3 + s2}}=90^\\circ$.<br>`
            texteCorr += `D'où : $6 \\times  \\widehat{${s1 + s3 + s2}}=90^\\circ$.<br>`
          } else
            texteCorr += `D'où : $5 \\times  \\widehat{${s1 + s3 + s2}} + \\widehat{${s1 + s3 + s2}}=90^\\circ$.<br>`
          texteCorr += `D'où : $\\widehat{${s1 + s3 + s2}}=90^\\circ \\div  6=15^\\circ$<br>`
          texteCorr += `$\\widehat{${s1 + s2 + s3}}=5\\times \\widehat{${s1 + s3 + s2}}=5\\times  15^\\circ=75^\\circ$<br>`
          texteCorr += `L'angle $${miseEnEvidence('\\widehat{' + s1 + s3 + s2 + '}', 'black')}$ mesure $${miseEnEvidence('15')}^\\circ$ et l'angle $${miseEnEvidence('\\widehat{' + s1 + s2 + s3 + '}', 'black')}$ mesure $${miseEnEvidence('75')}^\\circ$.`
          reponseInteractive = [15, 75]
          break
        case 5: // cas non aléatoire triangle équilatéral
          choixAngle = [0]
          nomAngles.push(s1 + s2 + s3)
          texte = `$${s1 + s2 + s3}$ est un triangle dont les trois angles sont égaux. Quelle est la mesure de chacun de ces angles ?`
          triangle = triangle2points2angles(A, B, 60, 60)
          C = triangle.listePoints[2]
          C.nom = s3
          angleA = codageAngle(B, A, 60, 1, '|', bleuMathalea, 2)
          angleA.echelleMark = 2
          angleB = codageAngle(A, B, -60, 1, '|', bleuMathalea, 2)
          angleB.echelleMark = 2
          angleC = codageAngle(A, C, 60, 1, '|', bleuMathalea, 2)
          angleC.echelleMark = 2
          objetsEnonce.push(
            triangle,
            angleA,
            angleB,
            angleC,
            nommePolygone(triangle),
          )
          angleA = codageAngle(
            B,
            A,
            60,
            0.8,
            '',
            orangeMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          angleB = codageAngle(
            A,
            B,
            -60,
            0.8,
            '',
            orangeMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          angleC = codageAngle(
            A,
            C,
            60,
            0.8,
            '',
            orangeMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          objetsCorrection.push(
            triangle,
            angleA,
            angleB,
            angleC,
            nommePolygone(triangle),
          )
          texteCorr += `Comme le triangle $${s1 + s2 + s3}$ a trois angles égaux, $\\widehat{${s1 + s2 + s3}}=\\widehat{${s1 + s3 + s2}}=\\widehat{${s2 + s1 + s3}}$<br>`
          if (this.correctionDetaillee) {
            texteCorr +=
              'Or, dans un triangle, la somme des angles est égale à $180^\\circ$.<br>'
            texteCorr += `D'où $3\\times \\widehat{${s1 + s2 + s3}}=180^\\circ$.<br>`
          }
          texteCorr += `D'où : $\\widehat{${s1 + s2 + s3}}=180^\\circ\\div  3=60^\\circ$.<br>`
          texteCorr += `On a donc $${miseEnEvidence('\\widehat{' + s1 + s2 + s3 + '}', 'black')}=${miseEnEvidence('\\widehat{' + s1 + s3 + s2 + '}', 'black')}=${miseEnEvidence('\\widehat{' + s2 + s1 + s3 + '}', 'black')}=${miseEnEvidence('60')}^\\circ$.<br>`
          texteCorr += `Le triangle $${s1 + s2 + s3}$ est un triangle équilatéral.`
          reponseInteractive = [60]
          break
        case 9: // cas non aléatoire triangle rectangle 22.5, 67.5,90
          choixAngle = shuffle([0, 1])
          nomAngles.push(s1 + s3 + s2, s1 + s2 + s3)
          texte = `$${s1 + s2 + s3}$ est un triangle rectangle en $${s1}$. L'angle $\\widehat{${s1 + s2 + s3}}$ mesure le tiers de l'angle $\\widehat{${s1 + s3 + s2}}$.<br>`
          texte += `Quelles sont les mesures respectives des angles $\\widehat{${nomAngles[choixAngle[0]]}}$ et $\\widehat{${nomAngles[choixAngle[1]]}}$ ?`
          angle1 = 22.5
          angle2 = 90
          triangle = triangle2points2angles(A, B, angle2, angle1)
          C = triangle.listePoints[2]
          C.nom = s3
          objetsEnonce.push(triangle, nommePolygone(triangle))
          objetsCorrection.push(triangle, nommePolygone(triangle))
          angleA = codageAngleDroit(B, A, C, bleuMathalea, 1, 1.5)
          angleA.echelleMark = 2
          angleB = codageAngle(A, B, C, 1, '|', bleuMathalea, 2)
          angleB.echelleMark = 2
          angleC = codageAngle(A, C, B, 1, '|||', bleuMathalea, 2)
          angleC.echelleMark = 2
          objetsEnonce.push(angleA, angleB, angleC)
          angleB = codageAngle(
            A,
            B,
            -angle1,
            0.8,
            '',
            orangeMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          angleC = codageAngle(
            A,
            C,
            angle2,
            0.8,
            '',
            orangeMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          angleB.angleArrondi = 1
          angleC.angleArrondi = 1
          objetsCorrection.push(angleA, angleB, angleC)
          texteCorr += `Comme $\\widehat{${s1 + s2 + s3}}=\\dfrac{\\widehat{${s1 + s3 + s2}}}{3}$, on en déduit que $\\widehat{${s1 + s3 + s2}}=3\\times \\widehat{${s1 + s2 + s3}}$.<br>`
          if (this.correctionDetaillee) {
            texteCorr += `De plus, le triangle $${s1 + s2 + s3}$ étant rectangle en $${s1}$, les angles $\\widehat{${s1 + s3 + s2}}$ et $\\widehat{${s1 + s2 + s3}}$ sont complémentaires (leur somme est égale à $90^\\circ$).<br>`
            texteCorr += `D'où : $3 \\times  \\widehat{${s1 + s2 + s3}} + \\widehat{${s1 + s2 + s3}}=90^\\circ$.<br>D'où : `
            texteCorr += ` $4 \\times  \\widehat{${s1 + s2 + s3}}=90^\\circ$.<br>D'où : `
          } else {
            texteCorr += `D'où : $3 \\times  \\widehat{${s1 + s2 + s3}} + \\widehat{${s1 + s2 + s3}}=90^\\circ$.<br>D'où : `
          }
          texteCorr += `$\\widehat{${s1 + s2 + s3}}=90^\\circ \\div  4=22,5^\\circ$.<br>`
          texteCorr += `$\\widehat{${s1 + s3 + s2}}=3\\times \\widehat{${s1 + s2 + s3}}=3\\times  22,5^\\circ=67,5^\\circ$<br>`
          texteCorr += `L'angle $${miseEnEvidence('\\widehat{' + s1 + s3 + s2 + '}', 'black')}$ mesure $${miseEnEvidence('67.5')}^\\circ$ et l'angle $${miseEnEvidence('\\widehat{' + s1 + s2 + s3 + '}', 'black')}$ mesure $${miseEnEvidence('22.5')}^\\circ$.`
          reponseInteractive = [67.5, 22.5]
          break
        case 10: // cas non aléatoire triangle 67.5, 67.5, 45.
          nomAngles.push(s1 + s3 + s2, s1 + s2 + s3, s2 + s1 + s3)
          texte = `$${s1 + s2 + s3}$ est un triangle isocèle en $${s1}$. L'angle $\\widehat{${s2 + s1 + s3}}$ mesure les deux tiers de l'angle $\\widehat{${s1 + s2 + s3}}$.<br>`
          texte += `Quelles sont les mesures respectives des angles $\\widehat{${nomAngles[choixAngle[0]]}}$, $\\widehat{${nomAngles[choixAngle[1]]}}$ et $\\widehat{${nomAngles[choixAngle[2]]}}$ ?`
          angle1 = 67.5
          angle2 = 45
          triangle = triangle2points2angles(A, B, angle2, angle1)
          C = triangle.listePoints[2]
          C.nom = s3
          objetsEnonce.push(
            triangle,
            nommePolygone(triangle),
            codageSegments(
              'XX',
              bleuMathalea,
              segment(triangle.listePoints[0], triangle.listePoints[2]),
              segment(triangle.listePoints[1], triangle.listePoints[0]),
              2,
            ),
          )
          objetsCorrection.push(
            triangle,
            nommePolygone(triangle),
            codageSegments(
              'XX',
              bleuMathalea,
              segment(triangle.listePoints[0], triangle.listePoints[2]),
              segment(triangle.listePoints[1], triangle.listePoints[0]),
              2,
            ),
          )
          angleA = codageAngle(B, A, C, 1, '||', bleuMathalea, 2)
          angleA.echelleMark = 2
          angleB = codageAngle(A, B, C, 1, '|||', bleuMathalea, 2)
          angleB.echelleMark = 2
          objetsEnonce.push(angleA, angleB)
          angleA = codageAngle(
            B,
            A,
            angle2,
            1,
            '',
            orangeMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          angleB = codageAngle(
            A,
            B,
            -angle1,
            0.8,
            '',
            orangeMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          angleC = codageAngle(
            A,
            C,
            180 - angle2 - angle1,
            0.8,
            '',
            orangeMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          angleB.angleArrondi = 1
          angleC.angleArrondi = 1
          objetsCorrection.push(angleA, angleB, angleC)
          texteCorr += `Comme $\\widehat{${s2 + s1 + s3}}=\\dfrac{2\\times  \\widehat{${s1 + s3 + s2}}}{3}$, on en déduit que $\\widehat{${s1 + s3 + s2}}=\\dfrac{3\\times \\widehat{${s2 + s1 + s3}}}{2}$.<br>`
          if (this.correctionDetaillee) {
            texteCorr += `De plus, comme le triangle $${s1 + s2 + s3}$ est isocèle en $${s1}$, $\\widehat{${s1 + s3 + s2}}$ et $\\widehat{${s1 + s2 + s3}}$ sont égaux, alors $\\widehat{${s1 + s2 + s3}}=\\widehat{${s1 + s3 + s2}}=\\dfrac{3\\times \\widehat{${s2 + s1 + s3}}}{2}$.<br>`
            texteCorr +=
              'Or, dans un triangle, la somme des angles est égale à $180^\\circ$.<br>'
            texteCorr += `D'où : $\\widehat{${s1 + s3 + s2}}+\\widehat{${s1 + s2 + s3}}+\\widehat{${s2 + s1 + s3}}=180^\\circ$.<br>`
            texteCorr += `D'où : $\\dfrac{3 \\times  \\widehat{${s2 + s1 + s3}}}{2} + \\dfrac{3 \\times  \\widehat{${s2 + s1 + s3}}}{2} + \\widehat{${s2 + s1 + s3}}=180^\\circ$.<br>`
            texteCorr += `D'où : $\\dfrac{3 \\times  \\widehat{${s2 + s1 + s3}}}{2}\\times  2 + \\widehat{${s2 + s1 + s3}}=180^\\circ$.<br>`
            texteCorr += `D'où : $3 \\times  \\widehat{${s2 + s1 + s3}} + \\widehat{${s2 + s1 + s3}}=180^\\circ$.<br>`
            texteCorr += `D'où : $4 \\times  \\widehat{${s2 + s1 + s3}}=180^\\circ$.<br>D'où : `
          } else {
            texteCorr += `D'où : $\\dfrac{3 \\times  \\widehat{${s2 + s1 + s3}}}{2} + \\dfrac{3 \\times  \\widehat{${s2 + s1 + s3}}}{2} + \\widehat{${s2 + s1 + s3}}=180^\\circ$.<br>`
          }
          texteCorr += `$\\widehat{${s2 + s1 + s3}}=180^\\circ \\div  4=45^\\circ$.<br>`
          texteCorr += `$\\widehat{${s1 + s3 + s2}}=\\widehat{${s1 + s2 + s3}}=\\dfrac{3\\times \\widehat{${s2 + s1 + s3}}}{2}=\\dfrac{3\\times  45^\\circ}{2}=\\dfrac{135^\\circ}{2}=67,5^\\circ$<br>`
          texteCorr += `L'angle $${miseEnEvidence('\\widehat{' + s1 + s3 + s2 + '}', 'black')}$ mesure $${miseEnEvidence('67.5')}^\\circ$, l'angle $${miseEnEvidence('\\widehat{' + s1 + s2 + s3 + '}', 'black')}$ mesure $${miseEnEvidence('67.5')}^\\circ$ et l'angle $${miseEnEvidence('\\widehat{' + s2 + s1 + s3 + '}', 'black')}$ mesure $${miseEnEvidence('45')}^\\circ$.`
          reponseInteractive = [67.5, 67.5, 45]
          break
        case 11: // cas non aléatoire triangle 72, 72, 36.
        default:
          nomAngles.push(s1 + s3 + s2, s1 + s2 + s3, s2 + s1 + s3)
          texte = `$${s1 + s2 + s3}$ est un triangle isocèle en $${s1}$. L'angle $\\widehat{${s1 + s2 + s3}}$ mesure le double de l'angle $\\widehat{${s2 + s1 + s3}}$.<br>`
          texte += `Quelles sont les mesures respectives des angles $\\widehat{${nomAngles[choixAngle[0]]}}$, $\\widehat{${nomAngles[choixAngle[1]]}}$ et $\\widehat{${nomAngles[choixAngle[2]]}}$ ?`
          angle1 = 72
          angle2 = 36
          triangle = triangle2points2angles(A, B, angle2, angle1)
          C = triangle.listePoints[2]
          C.nom = s3
          objetsEnonce.push(
            triangle,
            nommePolygone(triangle),
            codageSegments(
              '|||',
              bleuMathalea,
              segment(triangle.listePoints[0], triangle.listePoints[2]),
              segment(triangle.listePoints[1], triangle.listePoints[0]),
              2,
            ),
          )
          objetsCorrection.push(
            triangle,
            nommePolygone(triangle),
            codageSegments(
              '|||',
              bleuMathalea,
              segment(triangle.listePoints[0], triangle.listePoints[2]),
              segment(triangle.listePoints[1], triangle.listePoints[0]),
              2,
            ),
          )
          angleA = codageAngle(B, A, C, 1, '|', bleuMathalea, 2)
          angleA.echelleMark = 2
          angleB = codageAngle(A, B, C, 1, '||', bleuMathalea, 2)
          angleB.echelleMark = 2
          objetsEnonce.push(angleA, angleB)
          angleA = codageAngle(
            B,
            A,
            angle2,
            1,
            '',
            orangeMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          angleB = codageAngle(
            A,
            B,
            -angle1,
            0.8,
            '',
            orangeMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          angleC = codageAngle(
            A,
            C,
            180 - angle2 - angle1,
            0.8,
            '',
            orangeMathalea,
            2,
            1,
            'none',
            0.2,
            true,
            false,
            '',
            1.2,
          )
          objetsCorrection.push(angleA, angleB, angleC)
          texteCorr += `On a $\\widehat{${s1 + s2 + s3}}=2\\times  \\widehat{${s2 + s1 + s3}}$.<br>`
          if (this.correctionDetaillee) {
            texteCorr += `De plus, comme le triangle $${s1 + s2 + s3}$ est isocèle en $${s1}$, $\\widehat{${s1 + s3 + s2}}$ et $\\widehat{${s1 + s2 + s3}}$ sont égaux, alors $\\widehat{${s1 + s3 + s2}}=\\widehat{${s1 + s2 + s3}}=2\\times \\widehat{${s2 + s1 + s3}}$.<br>`
            texteCorr +=
              'Or, dans un triangle, la somme des angles est égale à $180^\\circ$.<br>'
            texteCorr += `D'où : $\\widehat{${s1 + s3 + s2}}+\\widehat{${s1 + s2 + s3}}+\\widehat{${s2 + s1 + s3}}=180^\\circ$.<br>`
            texteCorr += `D'où : $2 \\times  \\widehat{${s2 + s1 + s3}} + 2 \\times  \\widehat{${s2 + s1 + s3}} + \\widehat{${s2 + s1 + s3}}=180^\\circ$.<br>`
            texteCorr += `D'où : $4 \\times  \\widehat{${s2 + s1 + s3}} + \\widehat{${s2 + s1 + s3}}=180^\\circ$.<br>D'où `
            texteCorr += ` $5 \\times  \\widehat{${s2 + s1 + s3}}=180^\\circ$.<br>D'où `
          } else {
            texteCorr += `D'où : $2 \\times  \\widehat{${s2 + s1 + s3}} + 2 \\times  \\widehat{${s2 + s1 + s3}} + \\widehat{${s2 + s1 + s3}}=180^\\circ$.<br>`
          }
          texteCorr += `$\\widehat{${s2 + s1 + s3}}=180^\\circ \\div  5=36^\\circ$.<br>`
          texteCorr += `$\\widehat{${s1 + s2 + s3}}=\\widehat{${s1 + s3 + s2}}=2\\times \\widehat{${s2 + s1 + s3}}=2\\times  36^\\circ=72^\\circ$<br>`
          texteCorr += `L'angle $${miseEnEvidence('\\widehat{' + s1 + s3 + s2 + '}', 'black')}$ mesure $${miseEnEvidence('72')}^\\circ$, l'angle $${miseEnEvidence('\\widehat{' + s1 + s2 + s3 + '}', 'black')}$ mesure $${miseEnEvidence('72')}^\\circ$ et l'angle $${miseEnEvidence('\\widehat{' + s2 + s1 + s3 + '}', 'black')}$ mesure $${miseEnEvidence('36')}^\\circ$.`
          reponseInteractive = [72, 72, 36]
          break
      }
      // Le code ci-dessous permet de changer de l'ordre des angles dans les questions interactives
      // Cela ne permet pas à un petit malin de noter les réponses et de refaire la question en les remettant à la même place
      const reponsesAMC = [reponseInteractive[choixAngle[0]]]
      handleAnswers(
        this,
        indiceSetReponse,
        { reponse: { value: reponseInteractive[choixAngle[0]] } },
        { formatInteractif: 'mathlive' },
      )
      if (reponseInteractive.length > 1) {
        reponsesAMC.push(reponseInteractive[choixAngle[1]])
        handleAnswers(
          this,
          indiceSetReponse + 1,
          { reponse: { value: reponseInteractive[choixAngle[1]] } },
          { formatInteractif: 'mathlive' },
        )
        if (reponseInteractive.length > 2) {
          reponsesAMC.push(reponseInteractive[choixAngle[2]])
          handleAnswers(
            this,
            indiceSetReponse + 2,
            { reponse: { value: reponseInteractive[choixAngle[2]] } },
            { formatInteractif: 'mathlive' },
          )
        }
      }
      if (this.interactif) {
        texte +=
          '<br>' +
          ajouteChampTexteMathLive(
            this,
            indiceSetReponse,
            KeyboardType.clavierNumbers,
            {
              texteAvant: `$\\widehat{${nomAngles[choixAngle[0]]}} = $`,
              texteApres: '$^\\circ$',
            },
          )
        if (reponseInteractive.length > 1) {
          texte +=
            '<br>' +
            ajouteChampTexteMathLive(
              this,
              indiceSetReponse + 1,
              KeyboardType.clavierNumbers,
              {
                texteAvant: `$\\widehat{${nomAngles[choixAngle[1]]}} = $`,
                texteApres: '$^\\circ$',
              },
            )
          if (reponseInteractive.length > 2) {
            texte +=
              '<br>' +
              ajouteChampTexteMathLive(
                this,
                indiceSetReponse + 2,
                KeyboardType.clavierNumbers,
                {
                  texteAvant: `$\\widehat{${nomAngles[choixAngle[2]]}} = $`,
                  texteApres: '$^\\circ$',
                },
              )
          }
        }
      }
      // Code ci-dessous nécessaire car le nombre de questions interactives n'est pas le même selon le type de questions.
      indiceSetReponse += nomAngles.length

      const nom = nommePolygone(triangle)
      objetsEnonce.push(nom)
      const xmin = Math.min(A.x, B.x, C.x) - 2
      const xmax = Math.max(A.x, B.x, C.x) + 2
      const ymin = Math.min(A.y, B.y, C.y) - 2
      const ymax = Math.max(A.y, B.y, C.y) + 2
      const paramsEnonce = {
        xmin,
        ymin,
        xmax,
        ymax,
        pixelsParCm: 20,
        scale: 0.3,
      }

      if (this.sup2) {
        texte += '<br>' + mathalea2d(paramsEnonce, objetsEnonce)
      } else {
        if (this.correctionDetaillee) {
          texteCorrFinal += context.isHtml ? '<br>' : ''
          texteCorrFinal += mathalea2d(paramsEnonce, objetsEnonce)
        }
      }
      texteCorrFinal += texteCorr
      texteCorrFinal +=
        '<br>' +
        mathalea2d(
          Object.assign(fixeBordures(objetsCorrection), {
            pixelsParCm: 20,
            scale: 0.3,
          }),
          objetsCorrection,
        )

      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce: '',
          enonceAvant: false,
          // options: { multicols: true, barreseparation: true },
          // options: { barreseparation: true, numerotationEnonce: true },
          options: { barreseparation: true },
          propositions: [
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  reponse: {
                    texte:
                      texte +
                      `<br><br>Valeur de $\\widehat{${nomAngles[choixAngle[0]]}}$`,
                    valeur: reponsesAMC[0],
                    param: {
                      digits: 2,
                      decimals: 0,
                      signe: false,
                      approx: 0,
                    },
                  },
                },
              ],
            },
          ],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        if (reponseInteractive.length > 1) {
          this.autoCorrectionAMC[
            i
          ].propositions![0].propositions![0].multicolsBegin = true
          this.autoCorrectionAMC[i].propositions!.push({
            type: 'AMCNum',
            propositions: [
              {
                texte: '',
                multicolsEnd: true,
                statut: '',
                reponse: {
                  texte: `Valeur de $\\widehat{${nomAngles[choixAngle[1]]}}$`,
                  valeur: reponsesAMC[1],
                  param: {
                    digits: 2,
                    decimals: 0,
                    signe: false,
                    approx: 0,
                  },
                },
              },
            ],
          })
        }
        if (reponseInteractive.length > 2) {
          this.autoCorrectionAMC[i].propositions!.push({
            type: 'AMCNum',
            propositions: [
              {
                texte: '',
                multicolsEnd: true,
                statut: '',
                reponse: {
                  texte: `Valeur de $\\widehat{${nomAngles[choixAngle[2]]}}$`,
                  valeur: reponsesAMC[2],
                  param: {
                    digits: 2,
                    decimals: 0,
                    signe: false,
                    approx: 0,
                  },
                },
              },
            ],
          })
        }
      }
      if (this.questionJamaisPosee(i, texte)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorrFinal
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
