import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { afficheLongueurSegment } from '../../lib/2d/afficheLongueurSegment'
import { afficheMesureAngle } from '../../lib/2d/AfficheMesureAngle'
import { codageAngle } from '../../lib/2d/angles'
import { cercle } from '../../lib/2d/cercle'
import { cibleRonde, dansLaCibleRonde } from '../../lib/2d/cibles'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { codageSegments } from '../../lib/2d/CodageSegment'
import { droite, droiteParPointEtPerpendiculaire } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../lib/2d/polygones'
import { segmentAvecExtremites } from '../../lib/2d/segmentsVecteurs'
import { latexParPoint } from '../../lib/2d/textes'
import { traceCompas } from '../../lib/2d/traceCompas'
import { rotation, similitude } from '../../lib/2d/transformations'
import { angle, longueur } from '../../lib/2d/utilitairesGeometriques'
import {
  pointAdistance,
  pointIntersectionCC,
  pointIntersectionDD,
  pointIntersectionLC,
} from '../../lib/2d/utilitairesPoint'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { arrondi, range1 } from '../../lib/outils/nombres'
import {
  creerNomDePolygone,
  lettreDepuisChiffre,
} from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import Alea2iep from '../../modules/Alea2iep'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDeModifImportante = '18/01/2025'
// Rémi Angot : Formulaire, affichage de la cible ou non, de la figure à main levée ou non et correction des erreurs

/**
 * publié le 1/12/2020
 * @author Jean-claude Lhote
 */
export default class ConstruireUnTriangleAvecCible extends Exercice {
  classe: number
  typesDeQuestionsDisponibles: (number | string)[]
  constructor() {
    super()
    this.titre = 'Construire un triangle'
    this.nbQuestions = 4
    this.besoinFormulaireCaseACocher = ['Cibles pour la correction']
    this.sup = true
    // this.besoinFormulaire2CaseACocher = ['Figure à main levée dans le texte de l\'énnoncé'] @TODO
    this.sup2 = true
    this.classe = 6
    this.typesDeQuestionsDisponibles = range1(6)
  }

  nouvelleVersion() {
    if (this.classe !== 6) {
      this.typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
        saisie: this.sup3,
        min: 1,
        max: 9,
        melange: 10,
        defaut: 10,
        nbQuestions: this.nbQuestions,
      })
    }
    if (this.nbQuestions === 1) {
      if (this.sup2) {
        this.consigne =
          'Le triangle ci-dessous a été réalisé à main levée, sans respecter les dimensions.<br>Construire ce triangle en respectant les informations indiquées.'
      } else {
        this.consigne = 'Construire le triangle suivant.'
      }
    } else {
      if (this.sup2) {
        this.consigne =
          'Les triangles ci-dessous ont été réalisés à main levée, sans respecter les dimensions.<br>Construire ces triangles en respectant les informations indiquées.<br>'
      } else {
        this.consigne = 'Construire les triangles suivants.'
      }
    }
    let IEP
    let xMin
    let yMax

    let listeDeNomsDePolygones: string[] = []
    const celluleAleaRonde = function (rang: number) {
      const lettre = lettreDepuisChiffre(randint(1, 8))
      const chiffre = Number(randint(1, rang)).toString()
      return lettre + chiffre
    }

    let cible
    let cellule
    let result
    let A
    let B
    let C
    let CC
    let lAB
    let lBC
    let lAC
    let cA
    let cB
    let T
    let TT
    let dBC
    let dAC
    let dAB
    let objetsEnonceml
    let objetsEnonce = []
    let objetsCorrection
    let nom
    let sommets
    let montriangle
    const listeTypeDeQuestions = combinaisonListes(
      this.typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      IEP = new Alea2iep()
      objetsEnonce = []
      objetsEnonceml = []
      objetsCorrection = []
      texte = ''
      texteCorr = ''
      listeDeNomsDePolygones = i % 5 === 0 ? ['PQD'] : listeDeNomsDePolygones
      nom = creerNomDePolygone(3, listeDeNomsDePolygones)
      listeDeNomsDePolygones.push(nom)
      sommets = []
      for (let i = 0; i < 3; i++) sommets.push(nom[i])
      A = pointAbstrait(0, 0, sommets[0], 'left')
      switch (listeTypeDeQuestions[i]) {
        case 1: // triangle quelconque par ses trois longueurs
          lAC = randint(35, 45)
          lBC = arrondi(randint(35, 45, lAC) / 10)
          lAB = arrondi(randint(46, 60) / 10)
          lAC = arrondi(lAC / 10)
          B = pointAdistance(A, lAB, randint(-45, 45), sommets[1])
          B.positionLabel = 'right'
          cA = cercle(A, lAC)
          cB = cercle(B, lBC)
          C = pointIntersectionCC(cA, cB, sommets[2], 1)
          C.positionLabel = 'above'
          CC = pointAbstrait(
            C.x + randint(-5, 5, [-2, -1, 0, 1, 2]) / 10,
            C.y + randint(-5, 5, [-2, -1, 0, 1, 2]) / 10,
            sommets[2],
          )
          cellule = celluleAleaRonde(5)
          result = dansLaCibleRonde(C.x, C.y, 5, 0.3, cellule)
          cible = cibleRonde({
            x: result[0],
            y: result[1],
            rang: 5,
            taille: 0.3,
            num: this.nbQuestions > 1 ? i + 1 : undefined,
          })
          if (this.sup) {
            objetsEnonce.push(
              polygoneAvecNom(A, B)[1],
              cible,
              segmentAvecExtremites(A, B),
            )
            objetsCorrection.push(cible)
          }
          objetsEnonceml.push(
            afficheLongueurSegment(B, A),
            afficheLongueurSegment(C, B, 'black', 1),
            afficheLongueurSegment(A, C, 'black', 1),
          )
          objetsCorrection.push(
            traceCompas(A, C, 30, 'gray', 1, 2),
            traceCompas(B, C, 30, 'gray', 1, 2),
            afficheLongueurSegment(B, A),
            afficheLongueurSegment(C, B),
            afficheLongueurSegment(A, C),
          )
          texteCorr +=
            'Pour cette construction, nous avons utilisé le compas et la règle graduée.<br>'
          if (this.sup) {
            texteCorr += `Le point ${sommets[2]} se trouve dans le secteur ${texteEnCouleurEtGras(cellule)}.<br>`
          }
          xMin = Math.min(0, B.x, C.x, A.x) - 1
          yMax = Math.max(0, B.y, C.y, A.y) + 3
          IEP.recadre(xMin, yMax)
          IEP.triangle3longueurs(nom, lAB, lAC, lBC, { description: true })
          break
        case 2: // triangle ABC rectangle en B dont on connaît AB et BC
          lBC = randint(70, 80) / 10
          lAB = arrondi(randint(46, 60) / 10)
          B = pointAdistance(A, lAB, randint(-45, 45), sommets[1])
          B.positionLabel = 'right'
          cB = cercle(B, lBC)
          dAB = droite(A, B)
          dBC = droiteParPointEtPerpendiculaire(B, dAB)
          C = pointIntersectionLC(dBC, cB, sommets[2], 1)
          C.positionLabel = 'above'
          CC = pointAbstrait(
            C.x + randint(-5, 5, [-2, -1, 0, 1, 2]) / 10,
            C.y + randint(-5, 5, [-2, -1, 0, 1, 2]) / 10,
            sommets[2],
          )
          cellule = celluleAleaRonde(5)
          result = dansLaCibleRonde(C.x, C.y, 5, 0.3, cellule)
          if (Number.isFinite(result[0]) && Number.isFinite(result[1])) {
            cible = cibleRonde({
              x: result[0],
              y: result[1],
              rang: 5,
              taille: 0.3,
            })
          }
          if (this.sup) {
            objetsEnonce.push(
              polygoneAvecNom(A, B)[1],
              segmentAvecExtremites(A, B),
              cible,
            )
            objetsCorrection.push(cible)
          }
          objetsEnonceml.push(
            afficheLongueurSegment(B, A),
            afficheLongueurSegment(C, B, 'black', 1),
            codageAngleDroit(A, B, CC),
          )
          objetsCorrection.push(
            traceCompas(B, C, 30, 'gray', 1, 2),
            codageAngleDroit(A, B, C),
            afficheLongueurSegment(B, A),
            afficheLongueurSegment(C, B),
          )
          texteCorr +=
            "Pour cette construction, nous avons utilisé la règle graduée, l'équerre et le compas.<br>"
          if (this.sup) {
            texteCorr += `Le point ${sommets[2]} se trouve dans le secteur ${texteEnCouleurEtGras(cellule)}.<br>`
          }

          xMin = Math.min(0, B.x, C.x, A.x) - 1
          yMax = Math.max(0, B.y, C.y, A.y) + 3
          IEP.recadre(xMin, yMax)
          IEP.triangleRectangle2Cotes(nom, lAB, lBC, { description: true })
          break
        case 3: // triangle ABC isocèle en A
          lBC = arrondi(randint(35, 45) / 10)
          lAB = arrondi(randint(46, 60) / 10)
          lAC = lAB
          B = pointAdistance(A, lAB, randint(-45, 45), sommets[1])
          B.positionLabel = 'right'
          cA = cercle(A, lAC)
          cB = cercle(B, lBC)
          C = pointIntersectionCC(cA, cB, sommets[2], 1)
          C.positionLabel = 'above'
          CC = pointAbstrait(
            C.x + randint(-5, 5, [-2, -1, 0, 1, 2]) / 10,
            C.y + randint(-5, 5, [-2, -1, 0, 1, 2]) / 10,
            sommets[2],
          )
          cellule = celluleAleaRonde(5)
          result = dansLaCibleRonde(C.x, C.y, 5, 0.3, cellule)
          cible = cibleRonde({
            x: result[0],
            y: result[1],
            rang: 5,
            taille: 0.3,
            num: this.nbQuestions > 1 ? i + 1 : undefined,
          })
          if (this.sup) {
            objetsEnonce.push(
              polygoneAvecNom(A, B)[1],
              segmentAvecExtremites(A, B),
              cible,
            )
            objetsCorrection.push(cible)
          }
          objetsEnonceml.push(
            afficheLongueurSegment(B, A),
            afficheLongueurSegment(C, B, 'black', 1),
            codageSegments('||', 'black', A, B, A, CC),
          )
          objetsCorrection.push(
            traceCompas(A, C, 30, 'gray', 1, 2),
            traceCompas(B, C, 30, 'gray', 1, 2),
            afficheLongueurSegment(B, A),
            afficheLongueurSegment(C, B),
            codageSegments('||', 'black', A, B, A, C),
            afficheLongueurSegment(A, C),
          )
          texteCorr +=
            'Pour cette construction, nous avons utilisé le compas et la règle graduée.<br>'
          if (this.sup) {
            texteCorr += `Le point ${sommets[2]} se trouve dans le secteur ${texteEnCouleurEtGras(cellule)}.<br>`
          }
          xMin = Math.min(0, B.x, C.x, A.x) - 1
          yMax = Math.max(0, B.y, C.y, A.y) + 3
          IEP.recadre(xMin, yMax)
          montriangle = IEP.triangle3longueurs(nom, lAB, lAC, lBC, {
            description: true,
          })
          IEP.segmentCodage(montriangle[0], montriangle[1], { codage: '\\\\' })
          IEP.segmentCodage(montriangle[0], montriangle[2], { codage: '\\\\' })
          break
        case 4: // triangle ABC recatangle isocèle en B
          lAB = arrondi(randint(46, 60) / 10)
          lBC = lAB
          B = pointAdistance(A, lAB, randint(-45, 45), sommets[1])
          B.positionLabel = 'right'
          cB = cercle(B, lBC)
          dAB = droite(A, B)
          dBC = droiteParPointEtPerpendiculaire(B, dAB)
          C = pointIntersectionLC(dBC, cB, sommets[2], 1)
          C.positionLabel = 'above'
          CC = pointAbstrait(
            C.x + randint(-5, 5, [-2, -1, 0, 1, 2]) / 10,
            C.y + randint(-5, 5, [-2, -1, 0, 1, 2]) / 10,
            sommets[2],
          )
          cellule = celluleAleaRonde(5)
          result = dansLaCibleRonde(C.x, C.y, 5, 0.3, cellule)
          cible = cibleRonde({
            x: result[0],
            y: result[1],
            rang: 5,
            taille: 0.3,
            num: this.nbQuestions > 1 ? i + 1 : undefined,
          })
          if (this.sup) {
            objetsEnonce.push(
              polygoneAvecNom(A, B)[1],
              segmentAvecExtremites(A, B),
              cible,
            )
            objetsCorrection.push(cible)
          }
          objetsEnonceml.push(
            afficheLongueurSegment(B, A),
            codageSegments('||', 'black', A, B, B, CC),
            codageAngleDroit(A, B, CC),
          )
          objetsCorrection.push(
            traceCompas(B, C, 30, 'gray', 1, 2),
            codageAngleDroit(A, B, C),
            afficheLongueurSegment(B, A),
            codageSegments('||', 'black', A, B, B, C),
          )
          texteCorr +=
            "Pour cette construction, nous avons utilisé l'équerre et la règle graduée.<br>"
          if (this.sup) {
            texteCorr += `Le point ${sommets[2]} se trouve dans le secteur ${texteEnCouleurEtGras(cellule)}.<br>`
          }
          xMin = Math.min(0, B.x, C.x, A.x) - 1
          yMax = Math.max(0, B.y, C.y, A.y) + 3
          IEP.recadre(xMin, yMax)
          montriangle = IEP.triangleRectangle2Cotes(nom, lAB, lAB, {
            description: true,
          })
          IEP.segmentCodage(montriangle[0], montriangle[1], { codage: '\\\\' })
          IEP.segmentCodage(montriangle[1], montriangle[2], { codage: '\\\\' })
          break
        case 5: // triangle équilatéral
          lAB = arrondi(randint(46, 60) / 10)
          lAC = lAB
          lBC = lAB
          B = pointAdistance(A, lAB, randint(-45, 45), sommets[1])
          B.positionLabel = 'right'
          cA = cercle(A, lAC)
          cB = cercle(B, lBC)
          C = pointIntersectionCC(cA, cB, sommets[2], 1)
          C.positionLabel = 'above'
          CC = pointAbstrait(
            C.x + randint(-5, 5, [-2, -1, 0, 1, 2]) / 10,
            C.y + randint(-5, 5, [-2, -1, 0, 1, 2]) / 10,
            sommets[2],
          )
          cellule = celluleAleaRonde(5)
          result = dansLaCibleRonde(C.x, C.y, 5, 0.3, cellule)
          cible = cibleRonde({
            x: result[0],
            y: result[1],
            rang: 5,
            taille: 0.3,
            num: this.nbQuestions > 1 ? i + 1 : undefined,
          })
          if (this.sup) {
            objetsEnonce.push(
              polygoneAvecNom(A, B)[1],
              segmentAvecExtremites(A, B),
              cible,
            )
            objetsCorrection.push(cible)
          }
          objetsEnonceml.push(
            afficheLongueurSegment(B, A),
            codageSegments('||', 'black', A, B, B, CC, A, CC),
          )
          objetsCorrection.push(
            traceCompas(A, C, 30, 'gray', 1, 2),
            traceCompas(B, C, 30, 'gray', 1, 2),
            afficheLongueurSegment(B, A),
            codageSegments('||', 'black', A, B, B, C, A, C),
          )
          texteCorr +=
            'Pour cette construction, nous avons utilisé le compas et la règle graduée.<br>'
          if (this.sup) {
            texteCorr += `Le point ${sommets[2]} se trouve dans le secteur ${texteEnCouleurEtGras(cellule)}.<br>`
          }
          xMin = Math.min(0, B.x, C.x, A.x) - 1
          yMax = Math.max(0, B.y, C.y, A.y) + 3
          IEP.recadre(xMin, yMax)
          IEP.triangleEquilateral(nom, lAB)
          break
        case 6: // triangle ABC dont on connaît AB et AC et l'angle BAC
          lAB = arrondi(randint(46, 60) / 10)
          lAC = randint(40, 60) / 10
          B = pointAdistance(A, lAB, randint(-45, 45), sommets[1], 'right')
          C = similitude(
            B,
            A,
            randint(8, 24) * 5,
            lAC / lAB,
            sommets[2],
            'above',
          )
          CC = pointAbstrait(
            C.x + randint(-5, 5, [-2, -1, 0, 1, 2]) / 10,
            C.y + randint(-5, 5, [-2, -1, 0, 1, 2]) / 10,
            sommets[2],
          )
          cellule = celluleAleaRonde(5)
          result = dansLaCibleRonde(C.x, C.y, 5, 0.3, cellule)
          cible = cibleRonde({
            x: result[0],
            y: result[1],
            rang: 5,
            taille: 0.3,
            num: this.nbQuestions > 1 ? i + 1 : undefined,
          })
          if (this.sup) {
            objetsEnonce.push(
              polygoneAvecNom(A, B)[1],
              segmentAvecExtremites(A, B),
              cible,
            )
            objetsCorrection.push(cible)
          }
          objetsEnonceml.push(
            codageAngle(B, A, CC, 1.1),
            afficheLongueurSegment(B, A),
            latexParPoint(
              texNombre(Math.round(angle(B, A, C))) + '^{\\circ}',
              similitude(B, A, angle(B, A, C) / 2, 1 / lAB + 0.1),
            ),
            afficheLongueurSegment(A, C, 'black', 1),
          )
          objetsCorrection.push(
            afficheLongueurSegment(B, A),
            afficheMesureAngle(B, A, C, 'black', 1),
            afficheLongueurSegment(A, C, 'black', 1),
          )
          texteCorr +=
            'Pour cette construction, nous avons utilisé le rapporteur et la règle graduée.<br>'
          if (this.sup) {
            texteCorr += `Le point ${sommets[2]} se trouve dans le secteur ${texteEnCouleurEtGras(cellule)}.<br>`
          }
          xMin = Math.min(0, B.x, C.x, A.x) - 1
          yMax = Math.max(0, B.y, C.y, A.y) + 3
          IEP.recadre(xMin, yMax)
          IEP.triangle2longueurs1angle(
            nom,
            lAB,
            lAC,
            Math.round(angle(B, A, C)),
            { description: true },
          )
          break
        case 7: // triangle ABC dont on connait AB et les deux angles adjacents
          lAB = arrondi(randint(46, 60) / 10)
          B = pointAdistance(A, lAB, randint(-45, 45), sommets[1])
          B.positionLabel = 'right'
          dAB = droite(A, B)
          dAC = rotation(dAB, A, randint(8, 14) * 5)
          dBC = rotation(dAB, B, -randint(8, 12) * 5)
          C = pointIntersectionDD(dAC, dBC, sommets[2])
          // If C is boolean throw error
          if (typeof C === 'boolean')
            throw new Error('(AB) et (BC) ne se coupent pas')
          C.positionLabel = 'above'
          CC = pointAbstrait(
            C.x + randint(-5, 5, [-2, -1, 0, 1, 2]) / 10,
            C.y + randint(-5, 5, [-2, -1, 0, 1, 2]) / 10,
            sommets[2],
          )
          cellule = celluleAleaRonde(5)
          result = dansLaCibleRonde(C.x, C.y, 5, 0.3, cellule)
          cible = cibleRonde({
            x: result[0],
            y: result[1],
            rang: 5,
            taille: 0.3,
            num: this.nbQuestions > 1 ? i + 1 : undefined,
          })
          if (this.sup) {
            objetsEnonce.push(
              polygoneAvecNom(A, B)[1],
              segmentAvecExtremites(A, B),
              cible,
            )
            objetsCorrection.push(cible)
          }
          objetsEnonceml.push(
            codageAngle(B, A, CC, 1.1),
            afficheLongueurSegment(B, A),
            latexParPoint(
              texNombre(Math.round(angle(B, A, C))) + '^{\\circ}',
              similitude(B, A, angle(B, A, C) / 2, 1 / lAB + 0.1),
            ),
            codageAngle(A, B, CC, 1.1),
            latexParPoint(
              texNombre(Math.round(angle(A, B, C))) + '^{\\circ}',
              similitude(A, B, -angle(A, B, C) / 2, 1 / lAB + 0.1),
            ),
          )
          objetsCorrection.push(
            afficheLongueurSegment(B, A),
            afficheMesureAngle(B, A, C, 'black', 1),
            afficheMesureAngle(A, B, C, 'black', 1),
          )
          texteCorr +=
            'Pour cette construction, nous avons utilisé le rapporteur.<br>'
          if (this.sup) {
            texteCorr += `Le point ${sommets[2]} se trouve dans le secteur ${texteEnCouleurEtGras(cellule)}.<br>`
          }
          xMin = Math.min(0, B.x, C.x, A.x) - 1
          yMax = Math.max(0, B.y, C.y, A.y) + 3
          IEP.recadre(xMin, yMax)
          IEP.triangle1longueur2angles(
            sommets,
            lAB,
            Math.round(angle(B, A, C)),
            Math.round(angle(A, B, C)),
          )
          break
        case 8: // triangle ABC rectangle en B dont on connaît AB et l'hypoténuse AC
          lAC = randint(70, 80) / 10
          lAB = arrondi(randint(46, 60) / 10)
          B = pointAdistance(A, lAB, randint(-45, 45), sommets[1])
          B.positionLabel = 'right'
          cA = cercle(A, lAC)
          dAB = droite(A, B)
          dBC = droiteParPointEtPerpendiculaire(B, dAB)
          C = pointIntersectionLC(dBC, cA, sommets[2], 1)
          C.positionLabel = 'above'
          CC = pointAbstrait(
            C.x + randint(-5, 5, [-2, -1, 0, 1, 2]) / 10,
            C.y + randint(-5, 5, [-2, -1, 0, 1, 2]) / 10,
            sommets[2],
          )
          cellule = celluleAleaRonde(5)
          result = dansLaCibleRonde(C.x, C.y, 5, 0.3, cellule)
          cible = cibleRonde({
            x: result[0],
            y: result[1],
            rang: 5,
            taille: 0.3,
            num: this.nbQuestions > 1 ? i + 1 : undefined,
          })
          if (this.sup) {
            objetsEnonce.push(
              polygoneAvecNom(A, B)[1],
              segmentAvecExtremites(A, B),
              cible,
            )
            objetsCorrection.push(cible)
          }
          objetsEnonceml.push(
            afficheLongueurSegment(B, A),
            afficheLongueurSegment(A, C, 'black', 1),
            codageAngleDroit(A, B, CC),
          )
          objetsCorrection.push(
            traceCompas(A, C, 30, 'gray', 1, 2),
            codageAngleDroit(A, B, C),
            afficheLongueurSegment(B, A),
            afficheLongueurSegment(A, C),
          )
          texteCorr +=
            "Pour cette construction, nous avons utilisé la règle graduée, l'équerre et le compas.<br>"
          if (this.sup) {
            texteCorr += `Le point ${sommets[2]} se trouve dans le secteur ${texteEnCouleurEtGras(cellule)}.<br>`
          }
          xMin = Math.min(0, B.x, C.x, A.x) - 1
          yMax = Math.max(0, B.y, C.y, A.y) + 3
          IEP.recadre(xMin, yMax)
          IEP.triangleRectangleCoteHypotenuse(nom, lAB, lAC, {
            description: true,
          })
          break
        case 9: // triangle ABC dont ont connait AB un angle adjacent et l'angle opposé
        default:
          lAB = arrondi(randint(46, 60) / 10)
          B = pointAdistance(A, lAB, randint(-45, 45), sommets[1])
          B.positionLabel = 'right'
          dAB = droite(A, B)
          dAC = rotation(dAB, A, randint(8, 14) * 5)
          dBC = rotation(dAB, B, -randint(8, 12) * 5)
          C = pointIntersectionDD(dAC, dBC, sommets[2])
          if (typeof C === 'boolean')
            throw new Error('(AB) et (BC) ne se coupent pas')
          lAC = longueur(A, C)
          C.positionLabel = 'above'
          CC = pointAbstrait(
            C.x + randint(-5, 5, [-2, -1, 0, 1, 2]) / 10,
            C.y + randint(-5, 5, [-2, -1, 0, 1, 2]) / 10,
            sommets[2],
          )
          cellule = celluleAleaRonde(5)
          result = dansLaCibleRonde(C.x, C.y, 5, 0.3, cellule)
          cible = cibleRonde({
            x: result[0],
            y: result[1],
            rang: 5,
            taille: 0.3,
            num: this.nbQuestions > 1 ? i + 1 : undefined,
          })
          if (this.sup) {
            objetsEnonce.push(
              polygoneAvecNom(A, B)[1],
              segmentAvecExtremites(A, B),
              cible,
            )
            objetsCorrection.push(cible)
          }
          objetsEnonceml.push(
            codageAngle(B, A, CC, 1.1),
            afficheLongueurSegment(B, A),
            latexParPoint(
              texNombre(Math.round(angle(B, A, C))) + '^{\\circ}',
              similitude(B, A, angle(B, A, C) / 2, 1 / lAB + 0.1),
            ),
            codageAngle(A, CC, B, 1.1),
            latexParPoint(
              texNombre(Math.round(angle(A, C, B))) + '^{\\circ}',
              similitude(A, CC, angle(A, CC, B) / 2, 1 / lAC + 0.1),
            ),
          )
          objetsCorrection.push(
            afficheLongueurSegment(B, A),
            afficheMesureAngle(B, A, C, 'black', 1),
            afficheMesureAngle(A, B, C, 'black', 1),
            afficheMesureAngle(A, C, B, 'black', 1),
          )
          texteCorr += `Pour cette construction, il a fallu calculer l'angle $\\widehat{${sommets[0] + sommets[1] + sommets[2]}}$.<br>$\\widehat{${sommets[0] + sommets[1] + sommets[2]}}=180-\\widehat{${sommets[1] + sommets[0] + sommets[2]}}-\\widehat{${sommets[0] + sommets[2] + sommets[1]}}=180-${Math.round(angle(B, A, C))}-${Math.round(angle(B, C, A))}=${Math.round(angle(A, B, C))}$.<br>Nous avons utilisé le rapporteur pour effectuer cette construction.<br>`
          if (this.sup) {
            texteCorr += `Le point ${sommets[2]} se trouve dans le secteur ${texteEnCouleurEtGras(cellule)}.<br>`
          }
          xMin = Math.min(0, B.x, C.x, A.x) - 1
          yMax = Math.max(0, B.y, C.y, A.y) + 3
          IEP.recadre(xMin, yMax)
          IEP.triangle1longueur2angles(
            nom,
            lAB,
            Math.round(angle(B, A, C)),
            Math.round(angle(C, B, A)),
            { description: true },
          )
      }
      if (B === undefined) {
        throw new Error('B est undefined')
      }
      if (C === undefined) {
        throw new Error('C est undefined')
      }
      if (CC === undefined) {
        throw new Error('CC est undefined')
      }
      T = polygoneAvecNom(A, B, C)
      TT = polygoneAvecNom(A, B, CC)
      objetsEnonceml.push(TT[0], TT[1])
      objetsCorrection.push(T[0], T[1])
      texte += mathalea2d(
        Object.assign({}, fixeBordures(objetsEnonceml), {
          pixelsParCm: 30,
          scale: 1,
          vraieGrandeur: true,
          mainlevee: true,
          amplitude: context.isHtml ? 0.3 : 1,
        }),
        objetsEnonceml,
      )
      if (this.sup) {
        texte += mathalea2d(
          Object.assign(
            {},
            fixeBordures(objetsEnonce.filter((el) => el !== undefined)),
            {
              pixelsParCm: 30,
              scale: 1,
              vraieGrandeur: true,
              mainlevee: false,
            },
          ),
          objetsEnonce.filter((el) => el !== undefined),
        )
      }
      texteCorr += mathalea2d(
        Object.assign(
          {},
          fixeBordures(objetsCorrection.filter((el) => el !== undefined)),
          {
            pixelsParCm: 30,
            scale: 1,
            vraieGrandeur: true,
            mainlevee: false,
            display: 'block' as const,
          },
        ),
        objetsCorrection.filter((el) => el !== undefined),
      )
      texteCorr += IEP.htmlBouton(this.numeroExercice, i)
      if (this.listeQuestions.indexOf(texte) === -1) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
