import { cibleCarree, dansLaCibleCarree } from '../../lib/2d/cibles'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { droite, droiteParPointEtPerpendiculaire } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait, type PointAbstrait } from '../../lib/2d/PointAbstrait'
import { representant } from '../../lib/2d/representantVecteur'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import {
  homothetie,
  projectionOrtho,
  symetrieAxiale,
  translation,
  translation2Points,
} from '../../lib/2d/transformations'
import { pointSurDroite } from '../../lib/2d/utilitairesPoint'
import { vecteur } from '../../lib/2d/Vecteur'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { enumeration } from '../../lib/outils/ecritures'
import { range1 } from '../../lib/outils/nombres'
import Alea2iep from '../../modules/Alea2iep'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'
export const titre = 'Construire par translation avec cible auto-corrective'

export const dateDePublication = '23/03/2026'

/**
 * @author Jean-claude Lhote (sur une base Guillaume Valmont (4G10-2))
 */
export const uuid = '6a2de'

export const refs = {
  'fr-fr': ['4G10-4'],
  'fr-ch': ['9R1ES4A-3', '9R2ES4A-3', '9R3ES4A-3'],
}

function deuxCiblesSeChevauchent(cibles: ReturnType<typeof cibleCarree>[]) {
  for (let i = 0; i < cibles.length; i++) {
    for (let j = i + 1; j < cibles.length; j++) {
      const c1 = cibles[i]
      const c2 = cibles[j]
      if (Math.abs(c1.x - c2.x) < 1.5 && Math.abs(c1.y - c2.y) < 2.4) {
        return true
      }
    }
  }
  return false
}

function segmente(point: PointAbstrait, image: PointAbstrait) {
  const segmentAA = segment(point, image, 'red')
  segmentAA.styleExtremites = '|->'
  segmentAA.tailleExtremites = 5
  segmentAA.epaisseur = 2
  return segmentAA
}
export default class nomExercice extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireNumerique = [
      'Nombre de points à construire (de 1 à 3)',
      3,
    ]
    this.sup = 3
  }

  nouvelleVersion() {
    let objetsEnonceEtCorr: NestedObjetMathalea2dArray
    let objetsEnonceOnly: NestedObjetMathalea2dArray
    let objetsCorrectionOnly: NestedObjetMathalea2dArray
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const cibles = []
      const pointsAPlacer: PointAbstrait[] = []
      let B: PointAbstrait = pointAbstrait(0, 0)
      let C: PointAbstrait = pointAbstrait(0, 0)
      let A: PointAbstrait = pointAbstrait(0, 0)
      let D: PointAbstrait = pointAbstrait(0, 0)
      let E: PointAbstrait = pointAbstrait(0, 0)
      let lettres: string[] = []
      let compteur = 0
      let anim
      do {
        lettres = choisitLettresDifferentes(5)
        cibles.length = 0
        objetsEnonceOnly = []
        objetsCorrectionOnly = []
        objetsEnonceEtCorr = []

        // Figure initiale
        A = pointAbstrait(0.5, 0.5, lettres[0], 'below')
        const dx = randint(3, 6) * choice([-1, 1])
        const dy = randint(1, 3) * choice([-1, 1])
        B = pointAbstrait(A.x + dx, A.y + dy, lettres[1], 'below')
        C = pointAbstrait(3, randint(2, 4) * choice([-1, 1]))
        D = pointAbstrait(-3, randint(2, 4) * choice([-1, 1]))
        E = pointAbstrait(choice([-5, -6, 5, 6]), 0)
        pointsAPlacer.length = 0
        pointsAPlacer.push(...shuffle([C, D, E]).slice(0, this.sup))
        for (let k = 0; k < pointsAPlacer.length; k++) {
          pointsAPlacer[k].nom = lettres[2 + k]
          pointsAPlacer[k].positionNom = 'below'
        }
        const tracePointsAPlacer = tracePoint(...pointsAPlacer)
        const vecteurAB = representant(vecteur(A, B), A)
        vecteurAB.styleExtremites = '|->'
        const labels = labelPoint(A, B, ...pointsAPlacer)

        objetsEnonceEtCorr.push(labels, tracePointsAPlacer, vecteurAB)

        const images = pointsAPlacer.map((point, index) =>
          translation2Points(point, A, B, `${lettres[2 + index]}'`),
        )

        objetsCorrectionOnly.push(
          ...images.map((image, index) =>
            segmente(pointsAPlacer[index], images[index]),
          ),
        )
        const numerosCibles = shuffle(range1(pointsAPlacer.length * 2))

        for (let k = 0; k < images.length; k++) {
          const cible1x = pointsAPlacer[k].x + dx
          const cible1y = pointsAPlacer[k].y + dy
          const cible2x = pointsAPlacer[k].x - dx
          const cible2y = pointsAPlacer[k].y - dy
          const [x1, y1] = dansLaCibleCarree(
            cible1x,
            cible1y,
            4,
            0.6,
            choice([
              'A1',
              'A2',
              'A3',
              'A4',
              'B1',
              'B2',
              'B3',
              'B4',
              'C1',
              'C2',
              'C3',
              'C4',
              'D1',
              'D2',
              'D3',
              'D4',
            ]),
          )
          const cible1 = cibleCarree({
            x: x1,
            y: y1,
            rang: 4,
            taille: 0.6,
            num: numerosCibles[k],
          })
          const [x2, y2] = dansLaCibleCarree(
            cible2x,
            cible2y,
            4,
            0.6,
            choice([
              'A1',
              'A2',
              'A3',
              'A4',
              'B1',
              'B2',
              'B3',
              'B4',
              'C1',
              'C2',
              'C3',
              'C4',
              'D1',
              'D2',
              'D3',
              'D4',
            ]),
          )
          const cible2 = cibleCarree({
            x: x2,
            y: y2,
            rang: 4,
            taille: 0.6,
            num: numerosCibles[k + pointsAPlacer.length],
          })
          cibles.push(cible1, cible2)
        }

        // Perpendiculaire
        const { xmin, xmax, ymax } = fixeBordures([
          ...objetsEnonceEtCorr,
          ...objetsEnonceOnly,
          ...objetsCorrectionOnly,
          ...cibles,
        ])
        const AB = droite(A, B)
        const perpendiculaire = droiteParPointEtPerpendiculaire(
          A,
          AB,
          '',
          'red',
        )
        const ext1 = pointSurDroite(perpendiculaire, xmin + (xmax - xmin) * 0.1)
        const ext2 = pointSurDroite(perpendiculaire, xmax - (xmax - xmin) * 0.1)
        perpendiculaire.pointilles = 2
        const objets = pointsAPlacer
          .map((point, index) => {
            const d = droite(point, images[index])
            d.color = colorToLatexOrHTML('red')
            d.pointilles = 2

            const pied2 = projectionOrtho(point, perpendiculaire)
            const angleD = codageAngleDroit(
              point.x === pied2.x ? images[index] : point,
              pied2,
              A.x === pied2.x ? translation(A, vecteur(-dy, dx)) : A,
              'red',
            )
            return [d, angleD, pied2]
          })
          .flat()
        objetsCorrectionOnly.push(perpendiculaire, ...objets)

        // Animation
        anim = new Alea2iep()
        anim.equerreZoom(160)
        anim.regleZoom(160)

        anim.recadre(xmin, ymax)
        // Situation initiale
        anim.tempo = 0.001
        anim.couleur = 'black'
        anim.pointCreer(A)
        anim.pointCreer(B)
        anim.pointCreer(C)
        anim.pointCreer(D)
        anim.pointCreer(E)
        anim.traitRapide(A, B)
        // Perpendiculaire
        anim.tempo = 0.5
        anim.couleur = 'red'
        anim.pointilles = true
        anim.equerreMontrer(A)
        anim.equerreRotation(B)
        anim.regleDeplacer(ext1)
        anim.regleMontrer()
        anim.regleRotation(objets[2] as PointAbstrait)
        anim.equerreMasquer()
        anim.crayonDeplacer(ext1)
        anim.crayonMontrer()
        anim.crayonDeplacer(ext2)
        anim.traitRapide(ext1, ext2)
        anim.regleMasquer()
        anim.codageAngleDroit(
          B,
          A,
          objets[objets.length - 1] as PointAbstrait,
          { couleur: 'red' },
        )
        // Parallèles côté droit
        anim.crayonMasquer()
        for (let k = 0; k < pointsAPlacer.length; k++) {
          const sym1 = symetrieAxiale(pointsAPlacer[k], perpendiculaire)
          const sym2 = symetrieAxiale(images[k], perpendiculaire)
          const sym3 = [sym1, sym2, pointsAPlacer[k], images[k]].sort(
            (p1, p2) => p1.x - p2.x,
          )[3]
          const sym4 = [sym1, sym2, pointsAPlacer[k], images[k]].sort(
            (p1, p2) => p1.x - p2.x,
          )[0]
          const symA = homothetie(sym3, sym4, 1.05)
          const symB = homothetie(sym4, sym3, 1.05)
          anim.equerreMontrer(objets[3 * k + 2] as PointAbstrait)
          anim.equerreRotation(
            pointsAPlacer[k].x === objets[3 * k + 2].x
              ? images[k]
              : pointsAPlacer[k],
          )
          anim.regleDeplacer(symB)
          anim.regleMontrer()
          anim.regleRotation(symA)
          anim.equerreMasquer()
          anim.crayonMontrer(symB)
          anim.crayonDeplacer(symA)
          anim.traitRapide(symB, symA)
          anim.regleMasquer()
          anim.codageAngleDroit(
            pointsAPlacer[k].x === objets[3 * k + 2].x
              ? images[k]
              : pointsAPlacer[k],
            objets[3 * k + 2] as PointAbstrait,
            A,
            { couleur: 'red' },
          )
        }

        anim.regleMasquer()
        anim.crayonMasquer()
        anim.compasMontrer(A)
        anim.compasEcarter2Points(A, B)
        for (let k = 0; k < pointsAPlacer.length; k++) {
          anim.compasDeplacer(pointsAPlacer[k])
          anim.compasTracerArcCentrePoint(pointsAPlacer[k], images[k])
        }
        anim.compasMasquer()
        for (let k = 0; k < pointsAPlacer.length; k++) {
          anim.pointCreer(images[k])
        }
        // Énoncé et correction
        compteur++
      } while (deuxCiblesSeChevauchent(cibles) && compteur < 50)

      texte = `Construire l'image ${pointsAPlacer.length > 1 ? 'des' : 'du'} point${pointsAPlacer.length > 1 ? 's' : ''} ${enumeration(pointsAPlacer.map((p) => `$${p.nom}$`))} par la translation qui transforme $${lettres[0]}$ en $${lettres[1]}$.<br>`
      objetsEnonceEtCorr.push(...cibles)
      texte += mathalea2d(
        Object.assign(
          {},
          fixeBordures([...objetsEnonceEtCorr, ...objetsEnonceOnly]),
        ),
        objetsEnonceOnly,
        objetsEnonceEtCorr,
      )
      texteCorr = mathalea2d(
        Object.assign(
          {},
          fixeBordures([...objetsEnonceEtCorr, ...objetsCorrectionOnly]),
        ),
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
