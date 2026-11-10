// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 2ac3c continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { arc } from '../../lib/2d/Arc'
import { cercle } from '../../lib/2d/cercle'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { codageSegments } from '../../lib/2d/CodageSegment'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { droite } from '../../lib/2d/droites'
import { mediatrice } from '../../lib/2d/Mediatrice'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { segment, segmentAvecExtremites } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { rotation } from '../../lib/2d/transformations'
import { angleOriente } from '../../lib/2d/utilitairesGeometriques'
import {
  milieu,
  pointIntersectionCC,
  pointSurCercle,
  pointSurDroite,
} from '../../lib/2d/utilitairesPoint'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import type { Valeur } from '../../lib/types'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const titre = 'Identifier une région du plan'
export const interactifReady = true

export const dateDePublication = '10/01/2026'

/**
 * @author Jean-claude Lhote
 */
export const uuid = '2ac3c'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': ['NR'],
}
export default class RegionsDuPlanOld extends Exercice {
  constructor() {
    super()
    this.comment =
      "Cet exercice n'est pas interactif, il s'agit d'un problème de géométrie plane classique à faire sur papier."
    this.nbQuestions = 1
    this.consigne = "Dans cet exercice, l'unité de longueur est le centimètre."
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = [
      'demiplanContenantPoint',
      'exterieurDisque',
      'interieurDisque',
      'annulus',
      'intersectionDeuxDisques',
      'exterieurDeuxDisques',
      'mediatrice',
      'interieurDisqueExterieurAutreDisque',
    ]

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let content = ''
      let objetReponse: Valeur
      let texte = '$M$ est un point de la partie grisée du plan.<br>'
      texte +=
        'Trouve la ou les conditions vérifiées par le point $M$ :<br><br>'
      let texteCorr = ''
      const objetsEnonce: NestedObjetMathalea2dArray = []
      let donneesAleatoires: (number | string)[] = []
      const noms = choisitLettresDifferentes(3, 'M')
      switch (listeTypeDeQuestions[i]) {
        case 'demiplanContenantPoint':
          {
            const cote = choice([-1, 1])
            const xA = randint(-5, -2)
            const yA = randint(-5, -2)
            const xB = randint(2, 5)
            const yB = randint(2, 5)
            const A = pointAbstrait(xA, yA, noms[0], 'left')
            const B = pointAbstrait(xB, yB, noms[1], 'right')
            const labels = labelPoint(A, B)
            const d = mediatrice(A, B)
            const N = milieu(A, B)
            const P = rotation(A, N, 90)
            const dd = droite(N, P)
            const s = segmentAvecExtremites(A, B)
            const ad = codageAngleDroit(P, N, B)
            const egLongueur = codageSegments('//', bleuMathalea, A, N, N, B)
            const P1 = pointSurDroite(dd, 25)
            const P2 = pointSurDroite(dd, -25)
            const poly = polygone(
              P1,
              P2,
              pointAbstrait(cote * 6.5, 6),
              pointAbstrait(cote * 6.5, -6),
            )
            poly.couleurDeRemplissage = colorToLatexOrHTML('lightgray')
            objetsEnonce.push(s, d, ad, egLongueur, poly, labels)
            texteCorr += `Le point $M$ doit être situé dans le demi-plan délimité par la droite $(d)$ et contenant le point $${cote > 0 ? noms[1] : noms[0]}$.<br>`
            texteCorr += `Autrement dit, $M$ doit être plus proche de $${cote > 0 ? noms[1] : noms[0]}$ que de $${cote > 0 ? noms[0] : noms[1]}$, donc $${miseEnEvidence(`M${cote > 0 ? noms[1] : noms[0]} < M${cote > 0 ? noms[0] : noms[1]}`)}$.`
            content = `M${cote > 0 ? noms[1] : noms[0]} %{champ1} M${cote > 0 ? noms[0] : noms[1]}`
            objetReponse = { champ1: { value: '<' } }
            donneesAleatoires = [cote, noms.join(''), xA, yA, xB, yB]
          }
          break
        case 'exterieurDisque':
          {
            const xC = randint(-2, 2)
            const yC = randint(-2, 2)
            const r = randint(20, 35) / 10
            const C = pointAbstrait(xC, yC, noms[0], 'left')
            const c = cercle(C, r)
            const D = pointSurCercle(c, 0, noms[1], 'above')
            const labels = labelPoint(C)
            const centre = tracePoint(C)
            const rayon = segment(C, D)
            const longRayon = placeLatexSurSegment(texNombre(r, 1), D, C, {
              horizontal: true,
              distance: 0.5,
              letterSize: 'scriptsize',
            })
            const poly = polygone(
              pointAbstrait(-6.5, -6.5),
              pointAbstrait(6.5, -6.5),
              pointAbstrait(6.5, 6.5),
              pointAbstrait(-6.5, 6.5),
            )
            poly.couleurDeRemplissage = colorToLatexOrHTML('lightgray')
            c.couleurDeRemplissage = colorToLatexOrHTML('white')
            objetsEnonce.push(poly, c, labels, centre, rayon, longRayon)
            texteCorr += `Le point $M$ doit être situé à l'extérieur du disque de centre $${noms[0]}$ et de rayon $${texNombre(r, 1)}$.<br>
            Autrement dit le point M doit être à plus de $${texNombre(r, 1)}\\text{ cm}$ du point $${noms[0]}$ : $${miseEnEvidence(`M${noms[0]} > ${texNombre(r, 1)}\\text{ cm}`)}$.`
            content = `M${noms[0]} %{champ1} ${texNombre(r, 1)}\\text{ cm}`
            objetReponse = { champ1: { value: '>' } }
            donneesAleatoires = [noms.join(''), xC, yC, r]
          }
          break
        case 'interieurDisque':
          {
            const xC = randint(-2, 2)
            const yC = randint(-2, 2)
            const r = randint(20, 35) / 10
            const C = pointAbstrait(xC, yC, noms[0], 'left')
            const c = cercle(C, r)
            const D = pointSurCercle(c, 0, noms[1], 'above')
            const labels = labelPoint(C)
            const centre = tracePoint(C)
            const rayon = segment(C, D)
            const longRayon = placeLatexSurSegment(texNombre(r, 1), D, C, {
              horizontal: true,
              distance: 0.5,
              letterSize: 'scriptsize',
            })
            c.couleurDeRemplissage = colorToLatexOrHTML('lightgray')
            objetsEnonce.push(c, labels, centre, rayon, longRayon)
            texteCorr += `Le point $M$ doit être situé à l'intérieur du disque de centre $${noms[0]}$ et de rayon $${texNombre(r, 1)}$.<br>
            Autrement dit le point M doit être à moins de $${texNombre(r, 1)}\\text{ cm}$ du point $${noms[0]}$ : $${miseEnEvidence(`M${noms[0]} < ${texNombre(r, 1)}\\text{ cm}`)}$.`
            content = `M${noms[0]} %{champ1} ${texNombre(r, 1)}\\text{ cm}`
            objetReponse = { champ1: { value: '<' } }
            donneesAleatoires = [noms.join(''), xC, yC, r]
          }
          break
        case 'annulus':
          {
            const xC = randint(-1, 1)
            const yC = randint(-1, 1)
            const r1 = randint(15, 25) / 10
            const r2 = randint(35, 45) / 10
            const C = pointAbstrait(xC, yC, noms[0], 'left')
            const c1 = cercle(C, r1)
            const c2 = cercle(C, r2)
            const D1 = pointSurCercle(c1, 0, noms[1], 'above')
            const D2 = pointSurCercle(c2, 60, noms[2], 'above')
            const labels = labelPoint(C)
            const centre = tracePoint(C)
            const rayon1 = segment(C, D1)
            const longRayon1 = placeLatexSurSegment(texNombre(r1, 1), D1, C, {
              horizontal: true,
              distance: 0.5,
              letterSize: 'scriptsize',
            })
            const rayon2 = segment(C, D2)
            const longRayon2 = placeLatexSurSegment(texNombre(r2, 1), C, D2, {
              distance: 0.5,
              letterSize: 'scriptsize',
            })

            c1.couleurDeRemplissage = colorToLatexOrHTML('white')
            c2.couleurDeRemplissage = colorToLatexOrHTML('lightgray')

            objetsEnonce.push(
              c2,
              c1,
              labels,
              centre,
              rayon1,
              longRayon1,
              rayon2,
              longRayon2,
            )
            texteCorr += `Le point $M$ doit être situé dans l'anneau délimité par le disque de centre $${noms[0]}$ et de rayon $${texNombre(r2, 1)}\\text{ cm}$ et le disque de centre $${noms[0]}$ et de rayon $${texNombre(r1, 1)}\\text{ cm}$.<br>
            Autrement dit le point M doit être à une distance comprise entre $${texNombre(r1, 1)}\\text{ cm}$ et $${texNombre(r2, 1)}\\text{ cm}$ du point $${noms[0]}$ : $${miseEnEvidence(`${texNombre(r1, 1)}\\text{ cm} < M${noms[0]} < ${texNombre(r2, 1)}\\text{ cm}`)}$.`
            content = `${texNombre(r1, 1)}\\text{ cm} %{champ1} M${noms[0]} %{champ2} ${texNombre(r2, 1)}\\text{ cm}`
            objetReponse = { champ1: { value: '<' }, champ2: { value: '<' } }
            donneesAleatoires = [noms.join(''), xC, yC, r1, r2]
          }
          break
        case 'intersectionDeuxDisques':
          {
            const xC1 = randint(-2, 0)
            const yC1 = randint(-2, 0)
            const r1 = randint(25, 35) / 10
            const xC2 = randint(0, 2, xC1)
            const yC2 = randint(0, 2, yC1)
            const r2 = randint(25, 35) / 10
            const C1 = pointAbstrait(xC1, yC1, noms[0], 'left')
            const C2 = pointAbstrait(xC2, yC2, noms[1], 'right')
            const c1 = cercle(C1, r1)
            const c2 = cercle(C2, r2)
            const D1 = pointSurCercle(c1, -135, '', 'above')
            const D2 = pointSurCercle(c2, 60, '', 'above')
            const labels = labelPoint(C1, C2)
            const centre1 = tracePoint(C1)
            const centre2 = tracePoint(C2)
            const rayon1 = segment(C1, D1)
            const longRayon1 = placeLatexSurSegment(texNombre(r1, 1), D1, C1, {
              horizontal: true,
              distance: 0.5,
              letterSize: 'scriptsize',
            })
            const rayon2 = segment(C2, D2)
            const longRayon2 = placeLatexSurSegment(texNombre(r2, 1), C2, D2, {
              distance: 0.5,
              letterSize: 'scriptsize',
            })

            c1.couleurDeRemplissage = colorToLatexOrHTML('gray')
            c1.opaciteDeRemplissage = 0.5
            c2.couleurDeRemplissage = colorToLatexOrHTML('gray')
            c2.opaciteDeRemplissage = 0.5
            objetsEnonce.push(
              c1,
              c2,
              labels,
              centre1,
              centre2,
              rayon1,
              longRayon1,
              rayon2,
              longRayon2,
            )
            texte = texte.replace('grisée du plan', 'gris foncé des disques')
            texteCorr += `Le point $M$ doit être situé dans l'intersection des deux disques de centres $${noms[0]}$ et $${noms[1]}$ et de rayons respectifs $${texNombre(r1, 1)}\\text{ cm}$ et $${texNombre(r2, 1)}\\text{ cm}$.<br>
            Autrement dit le point M doit être à une distance inférieure à $${texNombre(r1, 1)}\\text{ cm}$ du point $${noms[0]}$ et à une distance inférieure à $${texNombre(r2, 1)}\\text{ cm}$ du point $${noms[1]}$ : $${miseEnEvidence(`M${noms[0]} < ${texNombre(r1, 1)}\\text{ cm} \\text{ et }M${noms[1]} < ${texNombre(r2, 1)}\\text{ cm}`)}$.`
            donneesAleatoires = [noms.join(''), xC1, yC1, r1, xC2, yC2, r2]
            content = `${texNombre(r1, 1)}\\text{ cm} %{champ1} M${noms[0]} %{champ2} ${texNombre(r2, 1)}\\text{ cm}`
            objetReponse = { champ1: { value: '<' }, champ2: { value: '<' } }
          }
          break
        case 'exterieurDeuxDisques':
          {
            const xC1 = randint(-2, 0)
            const yC1 = randint(-2, 0)
            const r1 = randint(25, 35) / 10
            const xC2 = randint(0, 2, xC1)
            const yC2 = randint(0, 2, yC1)
            const r2 = randint(25, 35) / 10
            const C1 = pointAbstrait(xC1, yC1, noms[0], 'left')
            const C2 = pointAbstrait(xC2, yC2, noms[1], 'right')
            const c1 = cercle(C1, r1)
            const c2 = cercle(C2, r2)
            const D1 = pointSurCercle(c1, -135, '', 'above')
            const D2 = pointSurCercle(c2, 60, '', 'above')
            const labels = labelPoint(C1, C2)
            const centre1 = tracePoint(C1)
            const centre2 = tracePoint(C2)
            const rayon1 = segment(C1, D1)
            const longRayon1 = placeLatexSurSegment(texNombre(r1, 1), D1, C1, {
              horizontal: true,
              distance: 0.5,
              letterSize: 'scriptsize',
            })
            const rayon2 = segment(C2, D2)
            const longRayon2 = placeLatexSurSegment(texNombre(r2, 1), C2, D2, {
              distance: 0.5,
              letterSize: 'scriptsize',
            })

            c1.couleurDeRemplissage = colorToLatexOrHTML('white')
            c2.couleurDeRemplissage = colorToLatexOrHTML('white')
            const M1 = pointIntersectionCC(c1, c2, '', 1)
            const M2 = pointIntersectionCC(c1, c2, '', 2)
            const arc1 = arc(M1, C1, angleOriente(M1, C1, M2))

            const poly1 = polygone(
              pointAbstrait(-6.5, -6.5),
              pointAbstrait(6.5, -6.5),
              pointAbstrait(6.5, 6.5),
              pointAbstrait(-6.5, 6.5),
            )
            poly1.couleurDeRemplissage = colorToLatexOrHTML('gray')
            objetsEnonce.push(
              poly1,
              c1,
              c2,
              arc1,
              labels,
              centre1,
              centre2,
              rayon1,
              longRayon1,
              rayon2,
              longRayon2,
            )
            texteCorr += `Le point $M$ doit être situé à l'extérieur des deux disques de centres $${noms[0]}$ et $${noms[1]}$ et de rayons respectifs $${texNombre(r1, 1)}\\text{ cm}$ et $${texNombre(r2, 1)}\\text{ cm}$.<br>
            Autrement dit le point M doit être à une distance supérieure à $${texNombre(r1, 1)}\\text{ cm}$ du point $${noms[0]}$ et à une distance supérieure à $${texNombre(r2, 1)}\\text{ cm}$ du point $${noms[1]}$ : $${miseEnEvidence(`M${noms[0]} > ${texNombre(r1, 1)}\\text{ cm} \\text{ et }M${noms[1]} > ${texNombre(r2, 1)}\\text{ cm}`)}$.`
            donneesAleatoires = [noms.join(''), xC1, yC1, r1, xC2, yC2, r2]
            content = `M${noms[0]} %{champ1} ${texNombre(r1, 1)}\\text{ cm} \\text{ et }M${noms[1]} %{champ2} ${texNombre(r2, 1)}\\text{ cm}`
            objetReponse = { champ1: { value: '>' }, champ2: { value: '>' } }
          }
          break
        case 'mediatrice':
          {
            const xA = randint(-5, -2)
            const yA = randint(-5, -2)
            const xB = randint(2, 5)
            const yB = randint(2, 5)
            const A = pointAbstrait(xA, yA, noms[0], 'left')
            const B = pointAbstrait(xB, yB, noms[1], 'right')
            const labels = labelPoint(A, B)
            const d = mediatrice(A, B)
            d.epaisseur = 2
            d.color = colorToLatexOrHTML('red')
            const N = milieu(A, B)
            const P = rotation(A, N, 90)
            const s = segmentAvecExtremites(A, B)
            const ad = codageAngleDroit(P, N, B)
            const egLongueur = codageSegments('//', bleuMathalea, A, N, N, B)

            objetsEnonce.push(s, d, ad, egLongueur, labels)
            texte = texte.replace('grisée du plan', 'rouge du plan')
            texteCorr += `Le point $M$ doit être situé sur la médiatrice du segment $[${noms[0]}${noms[1]}]$, c'est-à-dire le lieu des points équidistants de $${noms[0]}$ et $${noms[1]}$ : $${miseEnEvidence(`M${noms[0]} = M${noms[1]}`)}$.`
            content = `M${noms[0]} %{champ1} M${noms[1]}`
            objetReponse = { champ1: { value: '=' } }
            donneesAleatoires = [noms.join(''), xA, yA, xB, yB]
          }
          break
        case 'interieurDisqueExterieurAutreDisque':
          {
            const xC1 = randint(-2, 0)
            const yC1 = randint(-2, 0)
            const r1 = randint(25, 35) / 10
            const xC2 = randint(0, 2, xC1)
            const yC2 = randint(0, 2, yC1)
            const r2 = randint(15, 25) / 10
            const C1 = pointAbstrait(xC1, yC1, noms[0], 'left')
            const C2 = pointAbstrait(xC2, yC2, noms[1], 'right')
            const c1 = cercle(C1, r1)
            const c2 = cercle(C2, r2)
            const D1 = pointSurCercle(c1, -135, '', 'above')
            const D2 = pointSurCercle(c2, 60, '', 'above')
            const labels = labelPoint(C1, C2)
            const centre1 = tracePoint(C1)
            const centre2 = tracePoint(C2)
            const rayon1 = segment(C1, D1)
            const longRayon1 = placeLatexSurSegment(texNombre(r1, 1), D1, C1, {
              horizontal: true,
              distance: 0.5,
              letterSize: 'scriptsize',
            })
            const rayon2 = segment(C2, D2)
            const longRayon2 = placeLatexSurSegment(texNombre(r2, 1), C2, D2, {
              distance: 0.5,
              letterSize: 'scriptsize',
            })

            c1.couleurDeRemplissage = colorToLatexOrHTML('lightgray')
            c2.couleurDeRemplissage = colorToLatexOrHTML('white')
            objetsEnonce.push(
              c1,
              c2,
              labels,
              centre1,
              centre2,
              rayon1,
              longRayon1,
              rayon2,
              longRayon2,
            )
            texteCorr += `Le point $M$ doit être situé à l'intérieur du disque de centre $${noms[0]}$ et de rayon $${texNombre(r1, 1)}\\text{ cm}$ et à l'extérieur du disque de centre $${noms[1]}$ et de rayon $${texNombre(r2, 1)}\\text{ cm}$.<br>
            Autrement dit le point M doit être à une distance inférieure à $${texNombre(r1, 1)}\\text{ cm}$ du point $${noms[0]}$ et à une distance supérieure à $${texNombre(r2, 1)}\\text{ cm}$ du point $${noms[1]}$ : $${miseEnEvidence(`M${noms[0]} < ${texNombre(r1, 1)}\\text{ cm} \\text{ et }M${noms[1]} > ${texNombre(r2, 1)}\\text{ cm}`)}$.`
            donneesAleatoires = [noms.join(''), xC1, yC1, r1, xC2, yC2, r2]
            content = `M${noms[0]} %{champ1} ${texNombre(r1, 1)}\\text{ cm} \\text{ et }M${noms[1]} %{champ2} ${texNombre(r2, 1)}\\text{ cm}`
            objetReponse = { champ1: { value: '<' }, champ2: { value: '>' } }
          }
          break
        default:
          throw new Error(
            `Type de question inconnu : ${listeTypeDeQuestions[i]}`,
          )
      }
      if (context.isHtml && this.interactif) {
        texte += remplisLesBlancs(this, i, content, KeyboardType.clavierCompare)
        handleAnswers(this, i, objetReponse)
      }
      texte += mathalea2d(
        {
          scale: 0.5,
          xmin: -6,
          xmax: 6,
          ymin: -6,
          ymax: 6,
        },
        objetsEnonce,
      )

      if (
        this.questionJamaisPosee(
          i,
          donneesAleatoires.map((x) => String(x)).join(''),
        )
      ) {
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
      }
      cpt++
    }
  }
}
