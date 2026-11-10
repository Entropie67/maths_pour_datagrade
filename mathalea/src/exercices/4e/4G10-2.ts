import { afficheLongueurSegment } from '../../lib/2d/afficheLongueurSegment'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { droite, droiteParPointEtPerpendiculaire } from '../../lib/2d/droites'
import { pointAbstrait, type PointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../lib/2d/polygones'
import { representant } from '../../lib/2d/representantVecteur'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { translation2Points } from '../../lib/2d/transformations'
import { triangle2points2longueurs } from '../../lib/2d/triangles'
import {
  pointAdistance,
  pointIntersectionDD,
  pointSurDroite,
} from '../../lib/2d/utilitairesPoint'
import { vecteur } from '../../lib/2d/Vecteur'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import Alea2iep from '../../modules/Alea2iep'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'
export const titre = 'Transformer une figure par translation'

export const dateDePublication = '16/05/2022'

/**
 * @author Guillaume Valmont

*/
export const uuid = '6a2dd'

export const refs = {
  'fr-fr': ['4G10-2'],
  'fr-ch': ['9R1ES4A-1', '9R2ES4A-1', '9R3ES4A-1', 'PRQES03A-2'],
}

function segmente(point: PointAbstrait, image: PointAbstrait) {
  const segmentAA = segment(point, image, 'red')
  segmentAA.styleExtremites = '|->'
  segmentAA.pointilles = 2
  segmentAA.tailleExtremites = 5
  return segmentAA
}
export default class nomExercice extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let objetsEnonceEtCorr: NestedObjetMathalea2dArray
    let objetsEnonceOnly: NestedObjetMathalea2dArray
    let objetsCorrectionOnly: NestedObjetMathalea2dArray
    let paramsEnonce
    let paramsCorrection
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      objetsEnonceOnly = []
      objetsCorrectionOnly = []
      objetsEnonceEtCorr = []

      const lettres = choisitLettresDifferentes(5)

      // Figure initiale
      const A = pointAbstrait(0, -8, lettres[0], 'below')
      const B = pointAdistance(
        A,
        randint(30, 60) / 10,
        randint(0, 45),
        lettres[1],
      )
      const C = triangle2points2longueurs(
        A,
        B,
        randint(40, 60) / 10,
        randint(30, 50) / 10,
      ).listePoints[2]
      C.nom = lettres[2]
      const poly = polygoneAvecNom(A, B, C)
      objetsEnonceEtCorr.push(
        poly[0],
        poly[1],
        afficheLongueurSegment(B, A),
        afficheLongueurSegment(A, C),
        afficheLongueurSegment(C, B),
      )

      // Vecteur et image par translation
      const D = pointAbstrait(
        B.x - 1,
        B.y + 7 + randint(-10, 10) / 10,
        lettres[3],
      )
      const E = pointAbstrait(
        B.x - 10,
        B.y + 7 + randint(-20, 20) / 10,
        lettres[4],
      )
      const imageA = translation2Points(A, D, E, `${lettres[0]}'`)
      const imageB = translation2Points(B, D, E, `${lettres[1]}'`)
      const imageC = translation2Points(C, D, E, `${lettres[2]}'`)
      const imagePoly = polygoneAvecNom(imageA, imageB, imageC)
      const de = representant(vecteur(D, E), D)
      de.styleExtremites = '|->'
      de.tailleExtremites = 5
      objetsEnonceEtCorr.push(
        de,
        afficheLongueurSegment(D, E),
        labelPoint(D, E),
      )
      objetsCorrectionOnly.push(imagePoly[0], imagePoly[1])
      objetsCorrectionOnly.push(
        afficheLongueurSegment(imageB, imageA),
        afficheLongueurSegment(imageA, imageC),
        afficheLongueurSegment(imageC, imageB),
      )
      objetsCorrectionOnly.push(
        segmente(A, imageA),
        segmente(B, imageB),
        segmente(C, imageC),
      )
      objetsCorrectionOnly.push(
        afficheLongueurSegment(A, imageA, 'red'),
        afficheLongueurSegment(B, imageB, 'red'),
        afficheLongueurSegment(C, imageC, 'red'),
      )

      // Perpendiculaire
      const min = Math.max(A.x, B.x, C.x, D.x)
      const max = Math.min(imageA.x, imageB.x, imageC.x, E.x)
      const DE = droite(D, E)
      const pied = pointSurDroite(DE, (min + max) / 2)
      const perpendiculaire = droiteParPointEtPerpendiculaire(
        pied,
        DE,
        '',
        'red',
      )
      perpendiculaire.pointilles = 2
      const pied2 = pointSurDroite(perpendiculaire, (min + max) / 2 + 0.1)
      const AA = pointIntersectionDD(droite(A, imageA), perpendiculaire)
      const AA2 = pointSurDroite(perpendiculaire, AA.x - 0.1)
      const BB = pointIntersectionDD(droite(B, imageB), perpendiculaire)
      const CC = pointIntersectionDD(droite(C, imageC), perpendiculaire)
      objetsCorrectionOnly.push(
        perpendiculaire,
        codageAngleDroit(D, pied, pied2, 'red'),
      )
      objetsCorrectionOnly.push(
        codageAngleDroit(A, AA, pied, 'red'),
        codageAngleDroit(B, BB, pied, 'red'),
        codageAngleDroit(C, CC, pied, 'red'),
      )

      // Paramétrage de la fenêtre
      const xmin =
        Math.min(A.x, B.x, C.x, D.x, E.x, imageA.x, imageB.x, imageC.x) - 2
      const xmax =
        Math.max(A.x, B.x, C.x, D.x, E.x, imageA.x, imageB.x, imageC.x) + 2
      const ymin =
        Math.min(A.y, B.y, C.y, D.x, E.x, imageA.y, imageB.y, imageC.y) - 2
      const ymax =
        Math.max(A.y, B.y, C.y, D.x, E.x, imageA.y, imageB.y, imageC.y) + 2
      paramsEnonce = { xmin, ymin, xmax, ymax, pixelsParCm: 20, scale: 1 }
      paramsCorrection = paramsEnonce

      // Animation
      const anim = new Alea2iep()
      anim.recadre(xmin, ymax)
      // Situation initiale
      anim.tempo = 0.001
      anim.couleur = 'black'
      anim.pointCreer(A)
      anim.pointCreer(B)
      anim.pointCreer(C)
      anim.pointCreer(D)
      anim.pointCreer(E)
      anim.traitRapide(D, E)
      anim.traitRapide(A, B)
      anim.traitRapide(A, C)
      anim.traitRapide(B, C)
      // Perpendiculaire
      anim.tempo = 0.5
      anim.couleur = 'red'
      anim.pointilles = true
      anim.equerreMontrer(pied)
      anim.equerreRotation(AA)
      anim.regleDeplacer(pied)
      anim.regleMontrer()
      anim.regleRotation(AA)
      anim.regleDeplacer(pied2)
      anim.equerreMasquer()
      anim.crayonDeplacer(AA2)
      anim.crayonMontrer()
      anim.crayonDeplacer(pied2)
      anim.traitRapide(AA2, pied2)
      anim.codageAngleDroit(D, pied, pied2)
      // Parallèles côté droit
      anim.crayonMasquer()
      anim.equerreMontrer(CC)
      anim.equerreDeplacer(CC)
      anim.crayonMontrer()
      anim.crayonDeplacer(CC)
      anim.crayonDeplacer(C)
      anim.traitRapide(C, CC)
      anim.codageAngleDroit(C, CC, pied)

      anim.crayonMasquer()
      anim.equerreMontrer(BB)
      anim.equerreDeplacer(BB)
      anim.crayonMontrer()
      anim.crayonDeplacer(BB)
      anim.crayonDeplacer(B)
      anim.traitRapide(B, BB)
      anim.codageAngleDroit(B, BB, pied)

      anim.crayonMasquer()
      anim.equerreMontrer(AA)
      anim.equerreDeplacer(AA)
      anim.crayonMontrer()
      anim.crayonDeplacer(AA)
      anim.crayonDeplacer(A)
      anim.traitRapide(A, AA)
      anim.codageAngleDroit(A, AA, pied)
      // Parallèles côté gauche
      anim.equerreMasquer()
      anim.regleProlongerSegment(C, CC, { longueur: 10 })
      anim.regleProlongerSegment(B, BB, { longueur: 10 })
      anim.regleProlongerSegment(A, AA, { longueur: 10 })
      anim.regleMasquer()
      // Compas
      anim.compasMontrer(D)
      anim.compasEcarter2Points(D, E)
      anim.compasTracerArcCentrePoint(C, imageC)
      anim.compasTracerArcCentrePoint(B, imageB)
      anim.compasTracerArcCentrePoint(A, imageA)
      anim.compasMasquer()
      // Tracer image
      anim.couleur = 'black'
      anim.pointilles = false
      anim.pointCreer(imageC)
      anim.pointCreer(imageB)
      anim.pointCreer(imageA)
      anim.regleMontrer()
      anim.regleSegment(imageC, imageB)
      anim.regleSegment(imageB, imageA)
      anim.regleSegment(imageA, imageC)
      anim.regleMasquer()
      anim.crayonMasquer()

      // Énoncé et correction
      texte = `Tracer l'image du triangle $${lettres[0]}${lettres[1]}${lettres[2]}$ par la translation qui transforme $${lettres[3]}$ en $${lettres[4]}$.<br>`
      texte += mathalea2d(paramsEnonce, objetsEnonceOnly, objetsEnonceEtCorr)
      texteCorr = mathalea2d(
        paramsCorrection,
        objetsCorrectionOnly,
        objetsEnonceEtCorr,
      )
      texteCorr += anim.htmlBouton(this.numeroExercice ?? 0, i)
      if (this.questionJamaisPosee(i, B.x, B.y, C.x, C.y)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
