import { miseEnEvidence } from '../../lib/outils/embellissements'
import { afficheMesureAngle } from '../../lib/2d/AfficheMesureAngle'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { afficheLongueurSegment } from '../../lib/2d/afficheLongueurSegment'
import { droite } from '../../lib/2d/droites'
import { segment, segmentAvecExtremites } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { rotation } from '../../lib/2d/transformations'
import { longueur } from '../../lib/2d/utilitairesGeometriques'
import {
  pointIntersectionDD,
  pointSurSegment,
} from '../../lib/2d/utilitairesPoint'
import { arrondi } from '../../lib/outils/nombres'
import { creerNomDePolygone } from '../../lib/outils/outilString'
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

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '04/03/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '11/04/2024'
export const titre =
  'Tracer un triangle dont on connaît une longueur et 2 angles (angles aigus et/ou obtus)'

/**
 * Tracer un triangle dont on connaît une longueur et 2 angles (angles aigus et/ou obtus)
 * @author Mickael Guironnet - Rémi Angot
 */
export const uuid = '73630'

export const refs = {
  'fr-fr': ['6G6A-6'],
  'fr-2016': ['6G23-3'],
  'fr-ch': ['9R1ES2B-7', '9R2ES2B-7', '9R3ES2B-7'],
}
export default class TracerTriangle2Angles extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.besoinFormulaireCaseACocher = [
      "Longueurs données qu'à la fin de l'animation",
    ]
    this.besoinFormulaire2CaseACocher = [
      'Différentes figures de la construction',
    ]
    this.besoinFormulaire3Texte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : Deux angles aigus',
        '2 : Un angle obtus et un angle aigu',
        '3 : Mélange',
      ].join('\n'),
    ]
    this.sup = false
    this.sup2 = false
    this.sup3 = '3' // Type de questions
  }

  nouvelleVersion() {
    let listeDeNomsDePolygones: string[] = []

    const listeTypesDeQuestions = gestionnaireFormulaireTexte({
      min: 1,
      max: 2,
      defaut: 1,
      melange: 3,
      nbQuestions: this.nbQuestions,
      saisie: this.sup3,
    })

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 100;
      cpt++
    ) {
      if (i % 5 === 0) listeDeNomsDePolygones = ['PQD']

      const loAC = randint(40, 80) / 10
      let angBAC, loAB
      if (listeTypesDeQuestions[i] === 1) {
        angBAC = randint(20, 80)
        const borneMax = arrondi(
          (10 * loAC) / Math.cos((angBAC * Math.PI) / 180.0),
          0,
        )
        loAB = randint(Math.min(arrondi(borneMax * 0.8, 0), 40), borneMax) / 10
      } else {
        angBAC = randint(90, 140)
        loAB = randint(40, 70) / 10
      }
      const loBC = Math.sqrt(
        loAB * loAB +
          loAC * loAC -
          2 * loAB * loAC * Math.cos((angBAC * Math.PI) / 180.0),
      )
      const angACB = arrondi(
        (180 *
          Math.acos(
            (loAB * loAB - loBC * loBC - loAC * loAC) / (-2 * loBC * loAC),
          )) /
          Math.PI,
        0,
      )
      let angle1, angle2
      if (randint(0, 1) === 0) {
        angle1 = angBAC
        angle2 = angACB
      } else {
        angle1 = angACB
        angle2 = angBAC
      }

      const p = creerNomDePolygone(3, listeDeNomsDePolygones)
      listeDeNomsDePolygones.push(p)
      texte = `Tracer un triangle $${p}$ tel que $${p[0] + p[1]}=${texNombre(loAC)}\\text{ cm}$, $\\widehat{${
        p[1] + p[0] + p[2]
      }}=${angle1}^\\circ$ et $\\widehat{${
        p[0] + p[1] + p[2]
      }}=${angle2}^\\circ$.`
      texte += `<br> Mesurer $${p[0] + p[2]}$,  $${p[1] + p[2]}$ et $\\widehat{${p[0] + p[2] + p[1]}}$.`

      // on construit le segment
      const A0 = pointAbstrait(0, 0, p[0], 'left')
      const B0 = pointAbstrait(loAC, 0, p[1], 'right')
      const s0 = segmentAvecExtremites(A0, B0)
      const t0 = afficheLongueurSegment(B0, A0)

      // on construit l'angle à gauche
      const A1 = pointAbstrait(B0.x + 4, 0, p[0], 'left')
      const B1 = pointAbstrait(A1.x + loAC, 0, p[1], 'right')
      const s1 = segment(A1, B1)
      s1.styleExtremites = '-|'
      const c1 = rotation(B1, A1, angle1)
      const C1 = pointSurSegment(c1, A1, -3)
      const s1g = segment(A1, C1)
      const t1g = afficheMesureAngle(B1, A1, C1)

      // on construit l'angle à droite
      const A2 = pointAbstrait(B1.x + 4, 0, p[0], 'left')
      const B2 = pointAbstrait(A2.x + loAC, 0, p[1], 'right')
      const s2 = segment(A2, B2)
      const c2g = rotation(B2, A2, angle1)
      const C2g = pointSurSegment(c2g, A2, -3)
      const s2g = segment(A2, C2g)
      const c2d = rotation(A2, B2, -angle2)
      const C2d = pointSurSegment(c2d, B2, -3)
      const t2d = afficheMesureAngle(A2, B2, C2d)
      const s2d = segment(B2, C2d)

      // on construit le triangle
      const A3 = pointAbstrait(B2.x + 4, 0, p[0], 'left')
      const B3 = pointAbstrait(A3.x + loAC, 0, p[1], 'right')

      const s3 = segment(A3, B3)
      const c3g = rotation(B3, A3, angle1)
      const C3g = pointSurSegment(c3g, A3, -3)
      const c3d = rotation(A3, B3, -angle2)
      const C3d = pointSurSegment(c3d, B3, -3)
      const t3g = afficheMesureAngle(B3, A3, C3g)
      const t3d = afficheMesureAngle(A3, B3, C3d)
      const d1 = droite(A3, C3g)
      const d2 = droite(B3, C3d)
      const C = pointIntersectionDD(d1, d2, p[2])
      const l = labelPoint(A0, B0, A1, B1, A2, B2, C, A3, B3, C)

      texteCorr = ''
      if (this.sup2) {
        texteCorr += 'Voici les étapes de la construction : <br>'
        texteCorr += mathalea2d(
          {
            xmin: -1,
            xmax: Math.max(C.x, B3.x) + 1,
            ymin: -1,
            ymax: C.y + 1,
            scale: 2.5 / loAC,
          },
          s0,
          s1,
          s1g,
          s2,
          s2g,
          s2d,
          s3,
          segment(A3, C),
          segment(B3, C),
          t0,
          t1g,
          t2d,
          t3g,
          t3d,
          l,
        )
        texteCorr += '<br><br>'
      }
      if (!this.sup) {
        texteCorr += `$${p[0] + p[2]}\\approx${miseEnEvidence(texNombre(longueur(A3, C, 1)))}\\text{ cm}$, $${p[1] + p[2]}\\approx${miseEnEvidence(texNombre(longueur(B3, C, 1)))}\\text{ cm}$`
        texteCorr += ` et $\\widehat{${
          p[1] + p[2] + p[0]
        }}=${miseEnEvidence(180 - angle1 - angle2)}^\\circ$.`
      }
      if (context.isHtml) {
        const anim = new Alea2iep()
        anim.triangle1longueur2angles(p, loAC, angle1, angle2, {
          description: true,
          mesure: true,
        }) // description et longueur
        texteCorr += anim.htmlBouton(this.numeroExercice ?? 0, i)
      }

      if (
        this.questionJamaisPosee(
          i,
          angle1 < angle2 ? angle1 : angle2,
          angle1 > angle2 ? angle1 : angle2,
        )
      ) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
