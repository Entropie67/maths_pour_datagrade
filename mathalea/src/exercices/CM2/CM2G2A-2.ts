import { angle } from 'apigeom/src/elements/calculus/Coords'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { codageSegment } from '../../lib/2d/CodageSegment'
import { droite, droiteParPointEtPerpendiculaire } from '../../lib/2d/droites'
import { grille, seyes } from '../../lib/2d/Grille'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { labelPoint, latexParPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { homothetie, rotation } from '../../lib/2d/transformations'
import {
  milieu,
  pointIntersectionDD,
  pointSurDroite,
} from '../../lib/2d/utilitairesPoint'
import { vide2d } from '../../lib/2d/Vide2d'
import { bleuMathalea } from '../../lib/colors'
import { shuffle } from '../../lib/outils/arrayOutils'
import { lettreDepuisChiffre, numAlpha } from '../../lib/outils/outilString'
import Alea2iep from '../../modules/Alea2iep'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Tracer des perpendiculaires'
export const interactifReady = false
export const dateDePublication = '09/10/2022'
/**
 * Fonction générale pour construire des perpendiculairs
 * @author Mickael Guironnet
 */

export const uuid = 'df825'

export const refs = {
  'fr-fr': ['CM2G2A-2'],
  'fr-2016': ['6G11-1'],
  'fr-ch': ['9R1ES1B-3', '9R2ES1B-3', '9R3ES1B-3', 'PRQES01A-7', 'PRQES04A-5'],
}
export default class constructionPerpendiculaires extends Exercice {
  //
  constructor() {
    super()

    this.nbQuestions = 1

    this.sup = 1
    this.sup2 = '1'
    this.spacing = context.isHtml ? 2 : 1
    this.besoinFormulaireNumerique = [
      'Type de cahier',
      3,
      ' 1 : Cahier à petits carreaux\n 2 : Cahier à gros carreaux (Seyes)\n 3 : Feuille blanche',
    ]
    this.besoinFormulaire2Texte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : Orthocentre (intérieur du triangle)',
        '2 : Orthocentre (extérieur du triangle)',
        '3 : Centre du cercle circonscrit  (intérieur du triangle)',
        '4 : Centre du cercle circonscrit  (extérieur du triangle)',
        '5 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    let listeTypeDeQuestions = []
    listeTypeDeQuestions = gestionnaireFormulaireTexte({
      max: 4,
      defaut: 1,
      melange: 5,
      listeOfCase: [
        'OrthoInterieur',
        'OrthoExterieur',
        'CircoInterieur',
        'CircoExterieur',
        'Mélange',
      ],
      nbQuestions: this.nbQuestions,
      saisie: this.sup2,
    })
    for (
      let i = 0, typesDeQuestions, cpt = 0;
      i < this.nbQuestions && cpt < 50;
      cpt++
    ) {
      typesDeQuestions = listeTypeDeQuestions[i]
      const anim = new Alea2iep()
      const objetsEnonce = []
      const objetsCorrection = []
      const indLettre = randint(1, 15)
      const A = pointAbstrait(
        0,
        0,
        lettreDepuisChiffre(indLettre),
        'above left',
      )
      let B = pointAbstrait(
        20,
        randint(-4, 0, [-1, 0, 1]),
        lettreDepuisChiffre(indLettre + 1),
        'above right',
      )

      let ang1, ang2, ang3
      switch (typesDeQuestions) {
        case 'OrthoInterieur':
        case 'CircoInterieur': {
          // triangle avec des angles aigus
          ang1 = randint(30, 80)
          ang2 = randint(30, 80)
          ang3 = 180 - ang1 - ang2
          let k = 0
          while (ang3 > 90 && k < 30) {
            const r = randint(1, 10)
            if (ang1 + r < 90) {
              ang1 = ang1 + r
              ang3 = ang3 - r
            } else if (ang2 + r < 90) {
              ang2 = ang2 + r
              ang3 = ang3 - r
            }
            k++
          }
          break
        }
        case 'OrthoExterieur':
        case 'CircoExterieur':
        default: {
          // triangle avec un angle obtus
          ang1 = 90 + randint(10, 30)
          ang2 = randint(30, 50)
          ang3 = 180 - ang1 - ang2
          const angle = shuffle([ang1, ang2])
          ang1 = angle[0]
          ang2 = angle[1]
          B.x = 10
          break
        }
      }
      const dAB = droite(A, B)
      const C1 = rotation(B, A, ang1)
      const C2 = rotation(A, B, -1 * ang2)
      const CC = pointIntersectionDD(droite(A, C1), droite(B, C2))
      let C = pointAbstrait(
        Math.floor(CC.x),
        Math.floor(CC.y),
        lettreDepuisChiffre(indLettre + 2),
        'above left',
      )

      const ag1 = angle(B, A, C)
      const ag2 = angle(C, B, A)
      const ag3 = angle(A, C, B)

      if (
        (typesDeQuestions === 'OrthoInterieur' ||
          typesDeQuestions === 'CircoInterieur') &&
        (ag1 > 85 || ag2 > 85 || ag3 > 85)
      ) {
        continue
      }

      const dAC = droite(A, C)
      const dBC = droite(B, C)
      let hC, hB, hA, ortho
      switch (typesDeQuestions) {
        case 'OrthoInterieur':
        case 'OrthoExterieur':
          hC = droiteParPointEtPerpendiculaire(C, dAB, '', bleuMathalea)
          hB = droiteParPointEtPerpendiculaire(B, dAC, '', 'green')
          hA = droiteParPointEtPerpendiculaire(A, dBC, '', 'red')
          ortho = pointIntersectionDD(hC, hB)
          break
        case 'CircoInterieur':
        case 'CircoExterieur':
        default:
          hC = droiteParPointEtPerpendiculaire(
            milieu(A, B),
            dAB,
            '',
            bleuMathalea,
          )
          hB = droiteParPointEtPerpendiculaire(milieu(A, C), dAC, '', 'green')
          hA = droiteParPointEtPerpendiculaire(milieu(B, C), dBC, '', 'red')
          ortho = pointIntersectionDD(hC, hB)
          break
      }

      const Xmin = Math.floor(Math.min(A.x, B.x, C.x, ortho.x) - 1)
      const Xmax = Math.ceil(Math.max(A.x, B.x, C.x, ortho.x) + 1)
      const Ymin = Math.floor(Math.min(A.y, B.y, C.y, ortho.y) - 1)
      const Ymax = Math.ceil(Math.max(A.y, B.y, C.y, ortho.y) + 1)
      context.fenetreMathalea2d = [Xmin, Ymin, Xmax, Ymax]

      let pHc = pointIntersectionDD(
        droite(pointAbstrait(Xmin, Ymin), pointAbstrait(Xmax, Ymin)),
        hC,
        '(d_1)',
        'above left',
      )
      if (pHc && pHc.x >= Xmin && pHc.x <= Xmax) {
        // intersection avec le cadran du bas
        // pHc.x - Xmin > Xmax - pHc.x ? pHc.x = pHc.x - 0.5 : pHc.x = pHc.x + 0.5
        pHc.y = pHc.y + 0.5
      } else {
        // pas d'intersection
        pHc = pointSurDroite(hC, Xmin, '(d_1)', 'above left')
        // pHc.x = pHc.x - 1
      }
      let pHb = pointIntersectionDD(
        droite(pointAbstrait(Xmin, Ymin), pointAbstrait(Xmin, Ymax)),
        hB,
        '(d_2)',
        'below right',
      )
      if (pHb && pHb.y <= Ymax && pHb.y >= Ymin) {
        // intersection avec le cadran de gauche
        pHb.x = pHb.x + 0.5
      } else {
        pHb = pointIntersectionDD(
          droite(pointAbstrait(Xmin, Ymax), pointAbstrait(Xmax, Ymax)),
          hB,
          '(d_2)',
          'below left',
        )
        if (pHb && pHb.x <= Xmax && pHb.x >= Xmin) {
          // intersection avec le cadran d'en haut
          pHb.y = pHb.y - 0.5
        }
      }
      let pHa = pointIntersectionDD(
        droite(pointAbstrait(Xmax, Ymin), pointAbstrait(Xmax, Ymax)),
        hA,
        '(d_3)',
        'above left',
      )
      if (pHa && pHa.y <= Ymax && pHa.y >= Ymin) {
        // intersection avec le cadran de droite
        pHa.x = pHa.x - 0.5
      } else {
        pHa = pointIntersectionDD(
          droite(pointAbstrait(Xmin, Ymax), pointAbstrait(Xmax, Ymax)),
          hA,
          '(d_3)',
          'below right',
        )
        if (pHa && pHa.x <= Xmax && pHa.x >= Xmin) {
          // intersection avec le cadran d'en haut
          pHa.y = pHa.y - 0.5
        }
      }
      const T = tracePoint(A, B, C)
      T.tailleTikz = 0.3

      objetsCorrection.push(T, labelPoint(A, B, C), dAB, dAC, dBC, hA, hB, hC)
      objetsCorrection.push(
        latexParPoint(pHc.nom, pHc, bleuMathalea, 20, 12, '', 8),
      )
      objetsCorrection.push(latexParPoint(pHb.nom, pHb, 'green', 20, 12, '', 8))
      objetsCorrection.push(latexParPoint(pHa.nom, pHa, 'red', 20, 12, '', 8))
      // objetsCorrection.push(latexParCoordonnees (pHc.nom.substring(1, pHc.nom.length - 1), pHc.x, pHc.y, bleuMathalea, 50, 20, '',8))
      if (
        typesDeQuestions === 'OrthoInterieur' ||
        typesDeQuestions === 'OrthoExterieur'
      ) {
        objetsCorrection.push(
          codageAngleDroit(B, pointIntersectionDD(hC, dAB), C),
          codageAngleDroit(C, pointIntersectionDD(hA, dBC), A),
          codageAngleDroit(B, pointIntersectionDD(hB, dAC), C),
        )
      } else {
        objetsCorrection.push(
          codageSegment(B, milieu(B, C), '|||'),
          codageSegment(milieu(B, C), C, '|||'),
          codageSegment(A, milieu(A, C), '||'),
          codageSegment(milieu(A, C), C, '||'),
          codageSegment(B, milieu(A, B), '|'),
          codageSegment(milieu(A, B), A, '|'),
          codageAngleDroit(B, milieu(A, B), ortho),
          codageAngleDroit(C, milieu(B, C), ortho),
          codageAngleDroit(C, milieu(A, C), ortho),
        )
      }
      objetsEnonce.push(T, labelPoint(A, B, C))
      let correction = ''
      let enonce = ''
      let questind = 0
      if (context.isHtml)
        enonce += numAlpha(questind++) + ' Reproduire la figure ci-dessous.<br>'
      if (
        typesDeQuestions === 'OrthoInterieur' ||
        typesDeQuestions === 'OrthoExterieur'
      ) {
        enonce +=
          numAlpha(questind++) +
          `Tracer les droites $(${A.nom}${B.nom})$, $(${A.nom}${C.nom})$ et $(${B.nom}${C.nom})$.<br>`
        enonce +=
          numAlpha(questind++) +
          `Tracer la droite $(d_1)$ perpendiculaire à $(${A.nom}${B.nom})$ passant par $${C.nom}$.<br>`
        enonce +=
          numAlpha(questind++) +
          `Tracer la droite $(d_2)$ perpendiculaire à $(${A.nom}${C.nom})$ passant par $${B.nom}$.<br>`
        enonce +=
          numAlpha(questind++) +
          `Tracer la droite $(d_3)$ perpendiculaire à $(${B.nom}${C.nom})$ passant par $${A.nom}$.<br>`
        // enonce +=
        //   numAlpha(questind++) +
        //   'Tracer le point d\'intersection des droites $(d_1)$, $(d_2)$ et $(d_3)$.<br>'
      } else {
        enonce +=
          numAlpha(questind++) +
          `Tracer les droites $(${A.nom}${B.nom})$, $(${A.nom}${C.nom})$ et $(${B.nom}${C.nom})$.<br>`
        enonce +=
          numAlpha(questind++) + `Placer le milieu de $[${A.nom}${B.nom}]$.<br>`
        enonce +=
          numAlpha(questind++) +
          `Tracer la droite $(d_1)$ perpendiculaire à $(${A.nom}${B.nom})$ passant par le milieu de $[${A.nom}${B.nom}]$.<br>`
        enonce +=
          numAlpha(questind++) + `Placer le milieu de $[${A.nom}${C.nom}]$.<br>`
        enonce +=
          numAlpha(questind++) +
          `Tracer la droite $(d_2)$ perpendiculaire à $(${A.nom}${C.nom})$ passant par le milieu de $[${A.nom}${C.nom}]$.<br>`
        enonce +=
          numAlpha(questind++) + `Placer le milieu de $[${B.nom}${C.nom}]$.<br>`
        enonce +=
          numAlpha(questind++) +
          `Tracer la droite $(d_3)$ perpendiculaire à $(${B.nom}${C.nom})$ passant par le milieu de $[${B.nom}${C.nom}]$.<br>`
        // enonce +=
        //   numAlpha(questind++) +
        //   'Tracer le point d\'intersection des droites $(d_1)$, $(d_2)$ et $(d_3)$.<br>'
      }
      anim.taille((Xmax - Xmin + 5) * 30, (Ymax - Ymin + 5) * 30)
      anim.recadre(Xmin - 3, Ymax)
      B = homothetie(A, B, 0.5, 'B', 'above right')
      C = homothetie(A, C, 0.5, 'C', 'above right')
      pHc = homothetie(A, pHc, 0.5)
      pHb = homothetie(A, pHb, 0.5)
      pHa = homothetie(A, pHa, 0.5)
      ortho = homothetie(A, ortho, 0.5)
      anim.pointsCreer(A, B, C)
      anim.regleModifierLongueur(20)
      anim.equerreZoom(200)
      anim.regleDroite(A, B, { couleur: bleuMathalea })
      anim.regleDroite(A, C, { couleur: bleuMathalea })
      anim.regleDroite(B, C, { couleur: bleuMathalea })
      anim.regleMasquer()
      if (
        typesDeQuestions === 'OrthoInterieur' ||
        typesDeQuestions === 'OrthoExterieur'
      ) {
        anim.perpendiculaireRegleEquerreDroitePoint(droite(A, B), C)
        anim.textePosition('$(d_1)$', pHc.x, pHc.y)
        anim.perpendiculaireRegleEquerreDroitePoint(droite(A, C), B)
        anim.textePosition('$(d_2)$', pHb.x, pHb.y)
        anim.perpendiculaireRegleEquerreDroitePoint(droite(B, C), A)
        anim.textePosition('$(d_3)$', pHa.x, pHa.y)
      } else {
        anim.perpendiculaireRegleEquerreDroitePoint(droite(A, B), milieu(A, B))
        anim.textePosition('$(d_1)$', pHc.x, pHc.y)
        anim.perpendiculaireRegleEquerreDroitePoint(droite(A, C), milieu(A, C))
        anim.textePosition('$(d_2)$', pHb.x, pHb.y)
        anim.perpendiculaireRegleEquerreDroitePoint(droite(B, C), milieu(B, C))
        anim.textePosition('$(d_3)$', pHa.x, pHa.y)
      }
      anim.pointCreer(ortho)
      let g, sc, carreaux
      if (this.sup < 3) g = grille(Xmin, Ymin, Xmax, Ymax, 'gray', 0.7)
      else g = vide2d()
      if (parseInt(this.sup) === 2) {
        sc = 0.8
        carreaux = seyes(Xmin, Ymin, Xmax, Ymax)
      } else {
        sc = 0.5
        carreaux = vide2d()
      }
      objetsEnonce.push(g, carreaux)
      objetsCorrection.push(g, carreaux)
      const ppc = 20
      enonce +=
        '<br>' +
        mathalea2d(
          {
            xmin: Xmin,
            ymin: Ymin,
            xmax: Xmax,
            ymax: Ymax,
            pixelsParCm: ppc,
            scale: sc,
          },
          objetsEnonce,
        )
      correction += mathalea2d(
        {
          xmin: Xmin,
          ymin: Ymin,
          xmax: Xmax,
          ymax: Ymax,
          pixelsParCm: ppc,
          scale: sc,
        },
        objetsCorrection,
      )

      /****************************************************/
      correction += anim.htmlBouton(this.numeroExercice ?? 0, i)
      if (context.isHtml)
        correction +=
          "<br><br>Remarque : les droites $(d_1)$, $(d_2)$ et $(d_3)$ ont un seul point d'intersection. On dit qu'elles sont concourantes."
      if (this.questionJamaisPosee(i, A.x, A.y, B.x, B.y)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = enonce
        this.listeCorrections[i] = correction
        i++
      }
    }

    listeQuestionsToContenu(this)
  }
}
